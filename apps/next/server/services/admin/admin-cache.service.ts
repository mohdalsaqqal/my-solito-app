import { revalidatePath, revalidateTag } from 'next/cache'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { AdminCacheAction, AdminCacheAuditEntry } from '@real/app/lib/types'
import type { AuthRole } from '@real/providers/contracts'
import { ServiceError } from '../_lib/service-error'

type CacheActor = {
  userId: string
  email: string
  role: AuthRole
}

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
  revalidate_home_shop: ['home', 'shop', 'products:list', 'catalog:categories', 'catalog:brands'],
  revalidate_all_public: [
    'home',
    'shop',
    'sales',
    'search',
    'cart',
    'checkout',
    'products:list',
    'catalog:categories',
    'catalog:brands',
  ],
  revalidate_account_surfaces: ['account', 'orders', 'users'],
  revalidate_admin_surfaces: ['admin', 'pharmacist'],
  full_stack_flush: [
    'home',
    'shop',
    'sales',
    'search',
    'cart',
    'checkout',
    'account',
    'orders',
    'users',
    'admin',
    'pharmacist',
    'products:list',
    'catalog:categories',
    'catalog:brands',
  ],
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

async function purgeCdn(action: AdminCacheAction, paths: string[], tags: string[], actor: CacheActor) {
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

export async function getAdminCacheAudit() {
  return readAuditEntries()
}

export async function runAdminCacheAction(actor: CacheActor, payload: CachePayload) {
  if (!validateAction(payload.action)) {
    throw new ServiceError('ADMIN_CACHE_ACTION_INVALID', 'A valid cache action is required.', 400)
  }

  if ((payload.confirmation ?? '').trim().toUpperCase() !== 'FLUSH') {
    throw new ServiceError('ADMIN_CACHE_CONFIRMATION_INVALID', 'Type FLUSH to confirm this operation.', 400)
  }

  const entries = await readAuditEntries()
  const latestByUser = entries
    .filter((entry) => entry.executedBy.userId === actor.userId)
    .sort((a, b) => +new Date(b.executedAt) - +new Date(a.executedAt))[0]

  if (latestByUser) {
    const elapsedSeconds = Math.floor((Date.now() - +new Date(latestByUser.executedAt)) / 1000)
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      throw new ServiceError(
        'ADMIN_CACHE_COOLDOWN_ACTIVE',
        `Please wait ${COOLDOWN_SECONDS - elapsedSeconds}s before running another flush.`,
        429,
      )
    }
  }

  const action = payload.action
  const paths = actionPaths[action]
  const tags = actionTags[action]

  for (const routePath of paths) {
    revalidatePath(routePath)
  }

  for (const tag of tags) {
    revalidateTag(tag, 'max')
  }

  const cdn = await purgeCdn(action, paths, tags, actor)

  const created: AdminCacheAuditEntry = {
    id: `cache-${Date.now()}`,
    action,
    executedAt: new Date().toISOString(),
    executedBy: actor,
    revalidatedPaths: paths,
    revalidatedTags: tags,
    cdn,
    cooldownSeconds: COOLDOWN_SECONDS,
  }

  const nextEntries = [created, ...entries].slice(0, MAX_AUDIT_ENTRIES)
  await writeAuditEntries(nextEntries)

  return created
}
