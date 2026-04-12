import fs from 'node:fs/promises'
import path from 'node:path'
import {
  CMSHome,
  AuthRole,
  AdminOpsAuditEntry,
  AdminPermissionSet,
} from '@real/app/lib/types'
import type { CMSHome as ProviderCMSHome } from '@real/providers/contracts/CMSProvider'
import { prisma } from '../../../server/lib/prisma'

type Actor = {
  userId: string
  email: string
}

type ToggleOverride = {
  enabled: boolean
  updatedAt: string
  updatedBy: Actor
}

type UserOverride = {
  role?: AuthRole
  status?: 'active' | 'invited' | 'disabled'
  permissions?: AdminPermissionSet
  updatedAt: string
  updatedBy: Actor
}

type BrandSpotlightMeta = {
  updatedAt: string
  updatedBy: Actor
}

type OfferBannerMeta = {
  updatedAt: string
  updatedBy: Actor
}

type AdminControlsState = {
  toggleOverrides: Record<string, ToggleOverride>
  userOverrides: Record<string, UserOverride>
  brandSpotlightsOverride?: NonNullable<NonNullable<CMSHome['marketing']>['brandSpotlights']>
  brandSpotlightMeta: Record<string, BrandSpotlightMeta>
  offerBannersOverride?: NonNullable<NonNullable<CMSHome['marketing']>['offerBanners']>
  offerBannerMeta: Record<string, OfferBannerMeta>
  audits: AdminOpsAuditEntry[]
}

const STORAGE_DIR = path.join(process.cwd(), '.data')
const USER_OVERRIDES_FILE = path.join(STORAGE_DIR, 'admin-user-overrides.json')
const MAX_AUDIT = 80

function initialState(): AdminControlsState {
  return {
    toggleOverrides: {},
    userOverrides: {},
    brandSpotlightMeta: {},
    offerBannerMeta: {},
    audits: [],
  }
}

// User overrides stay in JSON (part of identity system, not yet migrated)
async function readUserOverridesFile(): Promise<Record<string, UserOverride>> {
  try {
    const raw = await fs.readFile(USER_OVERRIDES_FILE, 'utf8')
    return JSON.parse(raw) as Record<string, UserOverride>
  } catch {
    return {}
  }
}

async function writeUserOverridesFile(data: Record<string, UserOverride>) {
  await fs.mkdir(path.dirname(USER_OVERRIDES_FILE), { recursive: true })
  await fs.writeFile(USER_OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf8')
}

export async function readAdminControlsState() {
  try {
    // Read Prisma-backed entities in parallel with JSON user overrides
    const [dbToggles, dbSpotlights, dbOfferBanners, dbAudits, userOverrides] = await Promise.all([
      prisma.cmsToggleOverride.findMany(),
      prisma.cmsBrandSpotlight.findMany({ orderBy: { position: 'asc' } }),
      prisma.cmsOfferBanner.findMany({ orderBy: { position: 'asc' } }),
      prisma.cmsAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: MAX_AUDIT }),
      readUserOverridesFile(),
    ])

    // Map toggles
    const toggleOverrides: Record<string, ToggleOverride> = {}
    for (const t of dbToggles) {
      toggleOverrides[t.id] = {
        enabled: t.enabled,
        updatedAt: t.updatedAt.toISOString(),
        updatedBy: { userId: t.updatedByUserId, email: t.updatedByEmail },
      }
    }

    // Map brand spotlights — stored as full CMS JSON, read back directly
    const brandSpotlightsOverride = dbSpotlights.map((s) => s.spotlightJson as NonNullable<NonNullable<CMSHome['marketing']>['brandSpotlights']>[number])

    const brandSpotlightMeta: Record<string, BrandSpotlightMeta> = {}
    for (const s of dbSpotlights) {
      brandSpotlightMeta[s.id] = {
        updatedAt: s.updatedAt.toISOString(),
        updatedBy: { userId: s.updatedByUserId, email: s.updatedByEmail },
      }
    }

    // Map offer banners — stored as full CMS JSON, read back directly
    const offerBannersOverride = dbOfferBanners.map((b) => b.bannerJson as NonNullable<NonNullable<CMSHome['marketing']>['offerBanners']>[number])

    const offerBannerMeta: Record<string, OfferBannerMeta> = {}
    for (const b of dbOfferBanners) {
      offerBannerMeta[b.id] = {
        updatedAt: b.updatedAt.toISOString(),
        updatedBy: { userId: b.updatedByUserId, email: b.updatedByEmail },
      }
    }

    // Map audit logs
    const audits: AdminOpsAuditEntry[] = dbAudits.map((a) => ({
      id: a.id,
      type: a.type as AdminOpsAuditEntry['type'],
      targetId: a.targetId,
      actor: { userId: a.actorUserId, email: a.actorEmail },
      at: a.createdAt.toISOString(),
      changes: a.changes as Record<string, string>,
    }))

    return {
      toggleOverrides,
      userOverrides,
      brandSpotlightsOverride,
      brandSpotlightMeta,
      offerBannersOverride,
      offerBannerMeta,
      audits,
    }
  } catch (error) {
    console.error('[admin-controls] Failed to read state:', error)
    const fallbackOverrides: Record<string, UserOverride> = {}
    try {
      Object.assign(fallbackOverrides, await readUserOverridesFile())
    } catch { /* silent fallback failure */ }
    return { ...initialState(), userOverrides: fallbackOverrides }
  }
}

export async function writeAdminControlsState(state: AdminControlsState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })

  // Write user overrides to JSON file (identity system, not yet migrated)
  await writeUserOverridesFile(state.userOverrides)

  // Write Prisma-backed entities in a single transaction
  await prisma.$transaction(async (tx) => {
    // Toggles
    await tx.cmsToggleOverride.deleteMany()
    for (const [id, toggle] of Object.entries(state.toggleOverrides)) {
      await tx.cmsToggleOverride.create({
        data: {
          id,
          enabled: toggle.enabled,
          updatedByUserId: toggle.updatedBy.userId,
          updatedByEmail: toggle.updatedBy.email,
        },
      })
    }

    // Brand spotlights
    await tx.cmsBrandSpotlight.deleteMany()
    if (state.brandSpotlightsOverride) {
      for (let i = 0; i < state.brandSpotlightsOverride.length; i++) {
        const s = state.brandSpotlightsOverride[i]
        const meta = state.brandSpotlightMeta[s.id]
        await tx.cmsBrandSpotlight.create({
          data: {
            id: s.id,
            position: i,
            spotlightJson: JSON.parse(JSON.stringify(s)),
            updatedByUserId: meta?.updatedBy.userId ?? 'unknown',
            updatedByEmail: meta?.updatedBy.email ?? 'unknown',
          },
        })
      }
    }

    // Offer banners
    await tx.cmsOfferBanner.deleteMany()
    if (state.offerBannersOverride) {
      for (let i = 0; i < state.offerBannersOverride.length; i++) {
        const b = state.offerBannersOverride[i]
        const meta = state.offerBannerMeta[b.id]
        await tx.cmsOfferBanner.create({
          data: {
            id: b.id,
            position: i,
            bannerJson: JSON.parse(JSON.stringify(b)),
            updatedByUserId: meta?.updatedBy.userId ?? '',
            updatedByEmail: meta?.updatedBy.email ?? '',
          },
        })
      }
    }

    // Audit logs — append only, NEVER delete existing entries
    if (state.audits.length > 0) {
      // Only insert audits that don't already exist in DB (by ID)
      for (const audit of state.audits) {
        await tx.cmsAuditLog.upsert({
          where: { id: audit.id },
          create: {
            id: audit.id,
            type: audit.type,
            targetId: audit.targetId,
            actorUserId: audit.actor.userId,
            actorEmail: audit.actor.email,
            changes: audit.changes,
          },
          update: {}, // Never modify existing audits
        })
      }
    }
  })
}

export function applyAdminControlsToCms(home: CMSHome | ProviderCMSHome, state: AdminControlsState): CMSHome {
  const next = structuredClone({
    storeId: 'default',
    ...home,
  }) as CMSHome
  const toggles = next.identity?.admin?.controlToggles ?? []
  for (const toggle of toggles) {
    const override = state.toggleOverrides[toggle.id]
    if (override) {
      toggle.enabled = override.enabled
    }
  }

  const users = next.identity?.admin?.rolePreview ?? []
  for (const user of users) {
    const override = state.userOverrides[user.id]
    if (override?.role) {
      user.role = override.role
    }
    if (override?.status) {
      user.status = override.status
    }
    if (override?.permissions) {
      user.permissions = {
        ...(user.permissions ?? {
          canManageCmsToggles: false,
          canManageUsers: false,
          canRunCacheOps: false,
        }),
        ...override.permissions,
      }
    }
  }

  if (state.brandSpotlightsOverride) {
    if (!next.marketing) {
      next.marketing = {}
    }
    next.marketing.brandSpotlights = state.brandSpotlightsOverride
  }

  if (state.offerBannersOverride) {
    if (!next.marketing) {
      next.marketing = {}
    }
    next.marketing.offerBanners = state.offerBannersOverride
  }

  return next
}

export function resolveAdminPermissionsForSession(
  home: CMSHome,
  session: { email: string }
): AdminPermissionSet {
  const matchingUser = (home.identity?.admin?.rolePreview ?? []).find(
    (item) => item.email.toLowerCase() === session.email.toLowerCase()
  )
  return (
    matchingUser?.permissions ?? {
      canManageCmsToggles: false,
      canManageUsers: false,
      canRunCacheOps: false,
    }
  )
}

export function pushAudit(
  state: AdminControlsState,
  input: {
    type: AdminOpsAuditEntry['type']
    targetId: string
    actor: Actor
    changes: Record<string, string>
  }
) {
  const entry: AdminOpsAuditEntry = {
    id: `ops-${Date.now()}`,
    type: input.type,
    targetId: input.targetId,
    actor: input.actor,
    at: new Date().toISOString(),
    changes: input.changes,
  }

  state.audits = [entry, ...state.audits].slice(0, MAX_AUDIT)
}
