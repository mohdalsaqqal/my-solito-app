import fs from 'node:fs/promises'
import path from 'node:path'
import {
  CMSHome,
  AuthRole,
  AdminOpsAuditEntry,
  AdminPermissionSet,
} from '@real/app/lib/types'
import type { CMSHome as ProviderCMSHome } from '@real/providers/contracts/CMSProvider'

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
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-controls.json')
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

export async function readAdminControlsState() {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AdminControlsState>
    return {
      toggleOverrides: parsed.toggleOverrides ?? {},
      userOverrides: parsed.userOverrides ?? {},
      brandSpotlightsOverride: parsed.brandSpotlightsOverride,
      brandSpotlightMeta: parsed.brandSpotlightMeta ?? {},
      offerBannersOverride: parsed.offerBannersOverride,
      offerBannerMeta: parsed.offerBannerMeta ?? {},
      audits: parsed.audits ?? [],
    }
  } catch {
    return initialState()
  }
}

export async function writeAdminControlsState(state: AdminControlsState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(state, null, 2), 'utf8')
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
