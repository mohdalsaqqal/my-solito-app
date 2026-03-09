import { revalidatePath, revalidateTag } from 'next/cache'
import fs from 'node:fs/promises'
import path from 'node:path'
import { AdminCacheAction, AdminCacheAuditEntry } from '@real/app/lib/types'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'

type CachePayload = {
  action?: AdminCacheAction
  confirmation?: string
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-cache-audit.json')
const MAX_AUDIT_ENTRIES = 40
const COOLDOWN_SECONDS = 30

const actionPaths: Record<AdminCacheAction, string[]> = {
  revalidate_home_shop: ['/', '/shop'],
  revalidate_all_public: ['/', '/shop', '/sales', '/search', '/cart', '/checkout'],
  revalidate_account_surfaces: ['/account', '/orders', '/users'],
  revalidate_admin_surfaces: ['/admin', '/pharmacist'],
  full_stack_flush: ['/', '/shop', '/sales', '/search', '/cart', '/checkout', '/account', '/orders', '/users', '/admin', '/pharmacist'],
}

const actionTags: Record<AdminCacheAction, string[]> = {
  revalidate_home_shop: ['home', 'shop'],
  revalidate_all_public: ['home', 'shop', 'sales', 'search', 'cart', 'checkout'],
  revalidate_account_surfaces: ['account', 'orders', 'users'],
  revalidate_admin_surfaces: ['admin', 'pharmacist'],
  full_stack_flush: ['home', 'shop', 'sales', 'search', 'cart', 'checkout', 'account', 'orders', 'users', 'admin', 'pharmacist'],
}

async function readAuditEntries() {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as AdminCacheAuditEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeAuditEntries(entries: AdminCacheAuditEntry[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(entries, null, 2), 'utf8')
}

function validateAction(action: unknown): action is AdminCacheAction {
  return (
    action === 'revalidate_home_shop' ||
    action === 'revalidate_all_public' ||
    action === 'revalidate_account_surfaces' ||
    action === 'revalidate_admin_surfaces' ||
    action === 'full_stack_flush'
  )
}

async function purgeCdn(action: AdminCacheAction, paths: string[], tags: string[], actor: { userId: string; email: string; role: string }) {
  const purgeUrl = process.env.CDN_PURGE_URL
  const purgeSecret = process.env.CDN_PURGE_SECRET

  if (!purgeUrl) {
    return {
      enabled: false,
      attempted: false,
      success: false,
      message: 'CDN purge webhook is not configured.',
    }
  }

  try {
    const response = await fetch(purgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(purgeSecret ? { Authorization: `Bearer ${purgeSecret}` } : {}),
      },
      body: JSON.stringify({
        action,
        paths,
        tags,
        triggeredBy: actor,
        triggeredAt: new Date().toISOString(),
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        enabled: true,
        attempted: true,
        success: false,
        statusCode: response.status,
        message: `CDN purge responded with status ${response.status}.`,
      }
    }

    return {
      enabled: true,
      attempted: true,
      success: true,
      statusCode: response.status,
      message: 'CDN purge succeeded.',
    }
  } catch (error) {
    return {
      enabled: true,
      attempted: true,
      success: false,
      message: error instanceof Error ? error.message : 'CDN purge failed unexpectedly.',
    }
  }
}

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations')
    if (session instanceof Response) {
      return session
    }

    const entries = await readAuditEntries()
    return ok(entries)
  } catch (cause) {
    return fail('ADMIN_CACHE_AUDIT_UNEXPECTED', 'Unexpected error while loading cache audit.', 500, {
      scope: 'GET /api/admin/cache',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations', 'full')
    if (session instanceof Response) {
      return session
    }

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as CachePayload

    if (!validateAction(payload.action)) {
      return fail('ADMIN_CACHE_ACTION_INVALID', 'A valid cache action is required.', 400)
    }

    if ((payload.confirmation ?? '').trim().toUpperCase() !== 'FLUSH') {
      return fail('ADMIN_CACHE_CONFIRMATION_INVALID', 'Type FLUSH to confirm this operation.', 400)
    }

    const entries = await readAuditEntries()
    const latestByUser = entries
      .filter((entry) => entry.executedBy.userId === session.userId)
      .sort((a, b) => +new Date(b.executedAt) - +new Date(a.executedAt))[0]

    if (latestByUser) {
      const elapsedSeconds = Math.floor((Date.now() - +new Date(latestByUser.executedAt)) / 1000)
      if (elapsedSeconds < COOLDOWN_SECONDS) {
        return fail(
          'ADMIN_CACHE_COOLDOWN_ACTIVE',
          `Please wait ${COOLDOWN_SECONDS - elapsedSeconds}s before running another flush.`,
          429
        )
      }
    }

    const paths = actionPaths[payload.action]
    const tags = actionTags[payload.action]

    for (const routePath of paths) {
      revalidatePath(routePath)
    }

    for (const tag of tags) {
      revalidateTag(tag, 'max')
    }

    const cdnResult = await purgeCdn(payload.action, paths, tags, {
      userId: session.userId,
      email: session.email,
      role: session.role,
    })

    const created: AdminCacheAuditEntry = {
      id: `cache-${Date.now()}`,
      action: payload.action,
      executedAt: new Date().toISOString(),
      executedBy: {
        userId: session.userId,
        email: session.email,
        role: session.role,
      },
      revalidatedPaths: paths,
      revalidatedTags: tags,
      cdn: cdnResult,
      cooldownSeconds: COOLDOWN_SECONDS,
    }

    const nextEntries = [created, ...entries].slice(0, MAX_AUDIT_ENTRIES)
    await writeAuditEntries(nextEntries)

    return ok(created)
  } catch (cause) {
    return fail('ADMIN_CACHE_FLUSH_UNEXPECTED', 'Unexpected error while executing cache flush.', 500, {
      scope: 'POST /api/admin/cache',
      cause,
    })
  }
}
