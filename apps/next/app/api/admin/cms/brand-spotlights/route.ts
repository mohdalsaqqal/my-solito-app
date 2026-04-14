import { cmsProvider } from '@real/providers'
import { AdminBrandSpotlightRecord, HomeBrandSpotlightConfig } from '@real/app/lib/types'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import {
  applyAdminControlsToCms,
  pushAudit,
  readAdminControlsState,
  resolveAdminPermissionsForSession,
  writeAdminControlsState,
} from '../../../_lib/admin-controls-store'

type CreatePayload = {
  id?: string
  enabled?: boolean
  bannerTitle?: { en?: string; ar?: string }
  bannerSubtitle?: { en?: string; ar?: string }
  bannerCtaLabel?: { en?: string; ar?: string }
  bannerHref?: string
  bannerImageUrl?: string
  railTitle?: { en?: string; ar?: string }
  query?: HomeBrandSpotlightConfig['query']
}

function normalizeBrandNames(input?: string[]) {
  const selected = input?.map((item) => item.trim()).find(Boolean)
  return selected ? [selected] : []
}

function normalizeLocalized(
  input: { en?: string; ar?: string } | undefined,
  fallbackEn = '',
  fallbackAr = ''
) {
  return {
    en: input?.en?.trim() || fallbackEn,
    ar: input?.ar?.trim() || fallbackAr,
  }
}

function toRecord(
  item: HomeBrandSpotlightConfig,
  meta?: { updatedAt: string; updatedBy: { userId: string; email: string } }
): AdminBrandSpotlightRecord {
  return {
    ...item,
    updatedAt: meta?.updatedAt ?? null,
    updatedBy: meta?.updatedBy ?? null,
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const cmsResult = await cmsProvider.getHome()
    if (!cmsResult.ok) return fail(cmsResult.error.code, cmsResult.error.message, 500)

    const state = await readAdminControlsState()
    const home = applyAdminControlsToCms(cmsResult.data, state)
    const permissions = resolveAdminPermissionsForSession(home, { email: session.email })
    if (!permissions.canManageCmsToggles) {
      return fail('AUTH_FORBIDDEN', 'Permission denied: manage CMS toggles.', 403)
    }

    const items = home.marketing?.brandSpotlights ?? []
    return ok(items.map((item) => toRecord(item, state.brandSpotlightMeta[item.id])))
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_SPOTLIGHTS_UNEXPECTED',
      'Unexpected error while loading brand spotlights.',
      500,
      { scope: 'GET /api/admin/cms/brand-spotlights', cause }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    const title = normalizeLocalized(payload.bannerTitle)
    const railTitle = normalizeLocalized(payload.railTitle)
    const brandNames = normalizeBrandNames(payload.query?.brandNames)
    if (!title.en || !title.ar || !railTitle.en || !railTitle.ar) {
      return fail(
        'ADMIN_BRAND_SPOTLIGHT_INVALID',
        'bannerTitle and railTitle are required in both EN and AR.',
        400
      )
    }
    if (brandNames.length === 0) {
      return fail(
        'ADMIN_BRAND_SPOTLIGHT_BRAND_REQUIRED',
        'A single selected brand is required for each brand spotlight.',
        400
      )
    }

    const cmsResult = await cmsProvider.getHome()
    if (!cmsResult.ok) return fail(cmsResult.error.code, cmsResult.error.message, 500)
    const state = await readAdminControlsState()
    const home = applyAdminControlsToCms(cmsResult.data, state)
    const permissions = resolveAdminPermissionsForSession(home, { email: session.email })
    if (!permissions.canManageCmsToggles) {
      return fail('AUTH_FORBIDDEN', 'Permission denied: manage CMS toggles.', 403)
    }

    const list = [...(home.marketing?.brandSpotlights ?? [])]
    const id = payload.id?.trim() || `spotlight-${Date.now()}`
    if (list.some((item) => item.id === id)) {
      return fail('ADMIN_BRAND_SPOTLIGHT_CONFLICT', 'Spotlight id already exists.', 409)
    }

    const created: HomeBrandSpotlightConfig = {
      id,
      enabled: payload.enabled ?? true,
      bannerTitle: title,
      bannerSubtitle: normalizeLocalized(payload.bannerSubtitle),
      bannerCtaLabel: normalizeLocalized(payload.bannerCtaLabel),
      bannerHref: payload.bannerHref?.trim() || '/shop',
      bannerImageUrl: payload.bannerImageUrl?.trim() || undefined,
      railTitle,
      query: {
        source: payload.query?.source ?? 'best_sellers',
        limit: payload.query?.limit ?? 8,
        sortBy: payload.query?.sortBy ?? 'price_desc',
        productIds: payload.query?.productIds,
        brandNames,
      },
    }
    list.push(created)

    const now = new Date().toISOString()
    state.brandSpotlightsOverride = list
    state.brandSpotlightMeta[id] = {
      updatedAt: now,
      updatedBy: { userId: session.userId, email: session.email },
    }
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'create', title: created.bannerTitle.en },
    })
    await writeAdminControlsState(state)
    return ok(toRecord(created, state.brandSpotlightMeta[id]))
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_SPOTLIGHT_CREATE_UNEXPECTED',
      'Unexpected error while creating brand spotlight.',
      500,
      { scope: 'POST /api/admin/cms/brand-spotlights', cause }
    )
  }
}
