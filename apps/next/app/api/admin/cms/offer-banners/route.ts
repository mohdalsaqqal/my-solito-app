import { cmsProvider } from '@real/providers'
import { AdminOfferBannerRecord, HomeOfferBannerConfig } from '@real/app/lib/types'
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
  imageUrl?: string
  href?: string
  ctaLabel?: { en?: string; ar?: string }
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
  item: HomeOfferBannerConfig,
  meta?: { updatedAt: string; updatedBy: { userId: string; email: string } }
): AdminOfferBannerRecord {
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

    const items = home.marketing?.offerBanners ?? []
    return ok(items.map((item) => toRecord(item, state.offerBannerMeta[item.id])))
  } catch (cause) {
    return fail(
      'ADMIN_OFFER_BANNERS_UNEXPECTED',
      'Unexpected error while loading offer banners.',
      500,
      { scope: 'GET /api/admin/cms/offer-banners', cause }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    const ctaLabel = normalizeLocalized(payload.ctaLabel)

    const cmsResult = await cmsProvider.getHome()
    if (!cmsResult.ok) return fail(cmsResult.error.code, cmsResult.error.message, 500)
    const state = await readAdminControlsState()
    const home = applyAdminControlsToCms(cmsResult.data, state)
    const permissions = resolveAdminPermissionsForSession(home, { email: session.email })
    if (!permissions.canManageCmsToggles) {
      return fail('AUTH_FORBIDDEN', 'Permission denied: manage CMS toggles.', 403)
    }

    const list = [...(home.marketing?.offerBanners ?? [])]
    if (list.length >= 4) {
      return fail('ADMIN_OFFER_BANNER_LIMIT', 'Maximum of 4 offer banners allowed.', 422)
    }

    const id = payload.id?.trim() || `offer-banner-${Date.now()}`
    if (list.some((item) => item.id === id)) {
      return fail('ADMIN_OFFER_BANNER_CONFLICT', 'Offer banner id already exists.', 409)
    }

    const created: HomeOfferBannerConfig = {
      id,
      enabled: payload.enabled ?? true,
      title: normalizeLocalized(undefined),
      imageUrl: payload.imageUrl?.trim() || undefined,
      href: payload.href?.trim() || '/shop',
      ctaLabel,
    }
    list.push(created)

    const now = new Date().toISOString()
    state.offerBannersOverride = list
    state.offerBannerMeta[id] = {
      updatedAt: now,
      updatedBy: { userId: session.userId, email: session.email },
    }
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'offer_banner.create', ctaLabel: ctaLabel.en },
    })
    await writeAdminControlsState(state)
    return ok(toRecord(created, state.offerBannerMeta[id]))
  } catch (cause) {
    return fail(
      'ADMIN_OFFER_BANNER_CREATE_UNEXPECTED',
      'Unexpected error while creating offer banner.',
      500,
      { scope: 'POST /api/admin/cms/offer-banners', cause }
    )
  }
}
