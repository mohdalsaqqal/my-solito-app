/**
 * CMS Admin Controls — canonical read/write service for toggles, spotlights, offer banners, and audit.
 *
 * Owns Prisma-backed admin controls persistence.
 */
import {
  CMSHome,
  AuthRole,
  AdminOpsAuditEntry,
  AdminPermissionSet,
} from '@real/app/lib/types'
import type { CMSHome as ProviderCMSHome } from '@real/providers/contracts/CMSProvider'
import { prisma } from '../../lib/prisma'
import { isReleaseLikeEnvironment } from '../../../app/api/_lib/security-policy'

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
  domainPermissions?: Partial<Record<string, 'none' | 'read' | 'full'>>
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

export type AdminControlsState = {
  toggleOverrides: Record<string, ToggleOverride>
  userOverrides: Record<string, UserOverride>
  brandSpotlightsOverride?: NonNullable<NonNullable<CMSHome['marketing']>['brandSpotlights']>
  brandSpotlightMeta: Record<string, BrandSpotlightMeta>
  offerBannersOverride?: NonNullable<NonNullable<CMSHome['marketing']>['offerBanners']>
  offerBannerMeta: Record<string, OfferBannerMeta>
  audits: AdminOpsAuditEntry[]
}

type DbToggleOverride = {
  id: string
  enabled: boolean
  updatedAt: Date
  updatedByUserId: string
  updatedByEmail: string
}

type DbBrandSpotlight = {
  id: string
  spotlightJson: unknown
  updatedAt: Date
  updatedByUserId: string
  updatedByEmail: string
}

type DbOfferBanner = {
  id: string
  bannerJson: unknown
  updatedAt: Date
  updatedByUserId: string
  updatedByEmail: string
}

type DbAuditLogRow = {
  id: string
  type: string
  targetId: string
  actorUserId: string
  actorEmail: string
  createdAt: Date
  changes: unknown
}

const MAX_AUDIT = 80

function initialAdminControlsState(): AdminControlsState {
  return {
    toggleOverrides: {},
    userOverrides: {},
    brandSpotlightMeta: {},
    offerBannerMeta: {},
    audits: [],
  }
}

async function readUserOverridesFile(): Promise<Record<string, UserOverride>> {
  try {
    const rows = await prisma.adminUserOverride.findMany()
    const result: Record<string, UserOverride> = {}
    for (const row of rows) {
      result[row.id] = {
        role: (row.role as AuthRole) ?? undefined,
        status: (row.status as 'active' | 'invited' | 'disabled') ?? undefined,
        permissions: (row.permissionsJson as AdminPermissionSet) ?? undefined,
        domainPermissions: (row.domainPermissions as Record<string, 'none' | 'read' | 'full'>) ?? undefined,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: { userId: row.id, email: row.updatedByEmail ?? '' },
      }
    }
    return result
  } catch {
    return {}
  }
}

async function writeUserOverridesFile(data: Record<string, UserOverride>) {
  const entries = Object.entries(data)
  if (entries.length === 0) return
  await prisma.$transaction(
    entries.map(([userId, override]) =>
      prisma.adminUserOverride.upsert({
        where: { id: userId },
        create: {
          id: userId,
          role: override.role,
          status: override.status,
          permissionsJson: override.permissions as never,
          domainPermissions: override.domainPermissions as never,
          updatedByEmail: override.updatedBy?.email,
        },
        update: {
          role: override.role,
          status: override.status,
          permissionsJson: override.permissions as never,
          domainPermissions: override.domainPermissions as never,
          updatedByEmail: override.updatedBy?.email,
        },
      })
    )
  )
}

export async function readAdminControlsState(): Promise<AdminControlsState> {
  async function readToggles(): Promise<DbToggleOverride[]> {
    try { return await prisma.cmsToggleOverride.findMany() } catch { return [] }
  }
  async function readSpotlights(): Promise<DbBrandSpotlight[]> {
    try { return await prisma.cmsBrandSpotlight.findMany({ orderBy: { position: 'asc' } }) } catch { return [] }
  }
  async function readBanners(): Promise<DbOfferBanner[]> {
    try { return await prisma.cmsOfferBanner.findMany({ orderBy: { position: 'asc' } }) } catch { return [] }
  }
  async function readAudits(): Promise<DbAuditLogRow[]> {
    try { return await prisma.cmsAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: MAX_AUDIT }) } catch { return [] }
  }

  try {
    const [dbToggles, dbSpotlights, dbOfferBanners, dbAudits, userOverrides] = await Promise.all([
      readToggles(),
      readSpotlights(),
      readBanners(),
      readAudits(),
      readUserOverridesFile(),
    ])

    const toggleOverrides: Record<string, ToggleOverride> = {}
    for (const t of dbToggles) {
      toggleOverrides[t.id] = {
        enabled: t.enabled,
        updatedAt: t.updatedAt.toISOString(),
        updatedBy: { userId: t.updatedByUserId, email: t.updatedByEmail },
      }
    }

    const brandSpotlightsOverride = dbSpotlights.map((s) => s.spotlightJson as NonNullable<NonNullable<CMSHome['marketing']>['brandSpotlights']>[number])

    const brandSpotlightMeta: Record<string, BrandSpotlightMeta> = {}
    for (const s of dbSpotlights) {
      brandSpotlightMeta[s.id] = {
        updatedAt: s.updatedAt.toISOString(),
        updatedBy: { userId: s.updatedByUserId, email: s.updatedByEmail },
      }
    }

    const offerBannersOverride = dbOfferBanners.map((b) => b.bannerJson as NonNullable<NonNullable<CMSHome['marketing']>['offerBanners']>[number])

    const offerBannerMeta: Record<string, OfferBannerMeta> = {}
    for (const b of dbOfferBanners) {
      offerBannerMeta[b.id] = {
        updatedAt: b.updatedAt.toISOString(),
        updatedBy: { userId: b.updatedByUserId, email: b.updatedByEmail },
      }
    }

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
    if (process.env.NODE_ENV === 'production') {
      console.error('[admin-controls] Failed to read state:', error)
    }
    const fallbackOverrides: Record<string, UserOverride> = {}
    try {
      Object.assign(fallbackOverrides, await readUserOverridesFile())
    } catch { /* silent fallback failure */ }
    return { ...initialAdminControlsState(), userOverrides: fallbackOverrides }
  }
}

export async function writeAdminControlsState(state: AdminControlsState): Promise<void> {
  await writeUserOverridesFile(state.userOverrides)

  try {
    await prisma.$transaction(async (tx: any) => {
      await tx.cmsToggleOverride.deleteMany()
      const toggleEntries = Object.entries(state.toggleOverrides)
      if (toggleEntries.length > 0) {
        await tx.cmsToggleOverride.createMany({
          data: toggleEntries.map(([id, toggle]) => ({
            id,
            enabled: toggle.enabled,
            updatedByUserId: toggle.updatedBy.userId,
            updatedByEmail: toggle.updatedBy.email,
          })),
        })
      }

      await tx.cmsBrandSpotlight.deleteMany()
      if (state.brandSpotlightsOverride && state.brandSpotlightsOverride.length > 0) {
        await tx.cmsBrandSpotlight.createMany({
          data: state.brandSpotlightsOverride.map((s, i) => {
            const meta = state.brandSpotlightMeta[s.id]
            return {
              id: s.id,
              position: i,
              spotlightJson: JSON.parse(JSON.stringify(s)),
              updatedByUserId: meta?.updatedBy.userId ?? 'unknown',
              updatedByEmail: meta?.updatedBy.email ?? 'unknown',
            }
          }),
        })
      }

      await tx.cmsOfferBanner.deleteMany()
      if (state.offerBannersOverride && state.offerBannersOverride.length > 0) {
        await tx.cmsOfferBanner.createMany({
          data: state.offerBannersOverride.map((b, i) => {
            const meta = state.offerBannerMeta[b.id]
            return {
              id: b.id,
              position: i,
              bannerJson: JSON.parse(JSON.stringify(b)),
              updatedByUserId: meta?.updatedBy.userId ?? '',
              updatedByEmail: meta?.updatedBy.email ?? '',
            }
          }),
        })
      }

      if (state.audits.length > 0) {
        await tx.cmsAuditLog.createMany({
          data: state.audits.map((audit) => ({
            id: audit.id,
            type: audit.type,
            targetId: audit.targetId,
            actorUserId: audit.actor.userId,
            actorEmail: audit.actor.email,
            changes: audit.changes,
          })),
          skipDuplicates: true,
        })
      }
    })
  } catch (cause) {
    if (isReleaseLikeEnvironment()) {
      throw cause
    }
    if (process.env.PRISMA_CLIENT_LOG === 'error') {
      console.warn('[admin-controls] Prisma write unavailable; kept file-backed dev state only.')
    }
  }
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
