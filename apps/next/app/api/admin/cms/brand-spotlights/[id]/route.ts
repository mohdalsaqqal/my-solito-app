import { cmsProvider } from '@real/providers'
import { AdminBrandSpotlightRecord, HomeBrandSpotlightConfig } from '@real/app/lib/types'
import { fail, ok } from '../../../../_lib/response'
import { requireAdminDomainSession } from '../../../../_lib/request-auth'
import {
  applyAdminControlsToCms,
  pushAudit,
  readAdminControlsState,
  resolveAdminPermissionsForSession,
  writeAdminControlsState,
} from '../../../../_lib/admin-controls-store'

type UpdatePayload = {
  enabled?: boolean
  bannerTitle?: { en?: string; ar?: string }
  bannerSubtitle?: { en?: string; ar?: string }
  bannerCtaLabel?: { en?: string; ar?: string }
  bannerHref?: string
  bannerImageUrl?: string
  railTitle?: { en?: string; ar?: string }
  query?: HomeBrandSpotlightConfig['query']
  position?: number
}

function normalizeBrandNames(input?: string[]) {
  const selected = input?.map((item) => item.trim()).find(Boolean)
  return selected ? [selected] : []
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

function normalizeLocalized(
  current: { en: string; ar: string },
  input?: { en?: string; ar?: string }
) {
  return {
    en: input?.en?.trim() || current.en,
    ar: input?.ar?.trim() || current.ar,
  }
}

function moveToIndex<T>(arr: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) {
    return arr
  }
  const next = [...arr]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

async function guard(request: Request) {
  const session = requireAdminDomainSession(request, 'marketing', 'full')
  if (session instanceof Response) return { error: session as Response }

  const cmsResult = await cmsProvider.getHome()
  if (!cmsResult.ok) return { error: fail(cmsResult.error.code, cmsResult.error.message, 500) }
  const state = await readAdminControlsState()
  const home = applyAdminControlsToCms(cmsResult.data, state)
  const permissions = resolveAdminPermissionsForSession(home, { email: session.email })
  if (!permissions.canManageCmsToggles) {
    return { error: fail('AUTH_FORBIDDEN', 'Permission denied: manage CMS toggles.', 403) }
  }
  return { session, state, home }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guarded = await guard(request)
    if ('error' in guarded) return guarded.error

    const { id } = await params
    const payload = ((await request.json().catch(() => ({}))) ?? {}) as UpdatePayload
    const list = [...(guarded.home.marketing?.brandSpotlights ?? [])]
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return fail('ADMIN_BRAND_SPOTLIGHT_NOT_FOUND', 'Brand spotlight not found.', 404)

    const current = list[index]
    const nextBrandNames = payload.query
      ? normalizeBrandNames(payload.query.brandNames ?? current.query?.brandNames)
      : current.query?.brandNames

    if (payload.query && (!nextBrandNames || nextBrandNames.length === 0)) {
      return fail(
        'ADMIN_BRAND_SPOTLIGHT_BRAND_REQUIRED',
        'A single selected brand is required for each brand spotlight.',
        400
      )
    }

    const updated: HomeBrandSpotlightConfig = {
      ...current,
      enabled: typeof payload.enabled === 'boolean' ? payload.enabled : current.enabled,
      bannerTitle: normalizeLocalized(current.bannerTitle, payload.bannerTitle),
      bannerSubtitle: payload.bannerSubtitle
        ? normalizeLocalized(current.bannerSubtitle ?? { en: '', ar: '' }, payload.bannerSubtitle)
        : current.bannerSubtitle,
      bannerCtaLabel: payload.bannerCtaLabel
        ? normalizeLocalized(current.bannerCtaLabel ?? { en: '', ar: '' }, payload.bannerCtaLabel)
        : current.bannerCtaLabel,
      bannerHref: payload.bannerHref?.trim() || current.bannerHref,
      bannerImageUrl: payload.bannerImageUrl?.trim() || current.bannerImageUrl,
      railTitle: payload.railTitle ? normalizeLocalized(current.railTitle, payload.railTitle) : current.railTitle,
      query: payload.query
        ? {
            source: payload.query.source ?? current.query?.source ?? 'best_sellers',
            limit: payload.query.limit ?? current.query?.limit ?? 8,
            sortBy: payload.query.sortBy ?? current.query?.sortBy ?? 'price_desc',
            productIds: payload.query.productIds ?? current.query?.productIds,
            brandNames: nextBrandNames,
          }
        : current.query,
    }
    list[index] = updated

    let nextList = list
    if (typeof payload.position === 'number') {
      const bounded = Math.max(0, Math.min(list.length - 1, Math.floor(payload.position)))
      nextList = moveToIndex(list, index, bounded)
    }

    const now = new Date().toISOString()
    guarded.state.brandSpotlightsOverride = nextList
    guarded.state.brandSpotlightMeta[id] = {
      updatedAt: now,
      updatedBy: { userId: guarded.session.userId, email: guarded.session.email },
    }
    pushAudit(guarded.state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: guarded.session.userId, email: guarded.session.email },
      changes: { action: 'update', title: updated.bannerTitle.en },
    })
    await writeAdminControlsState(guarded.state)
    return ok(toRecord(updated, guarded.state.brandSpotlightMeta[id]))
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_SPOTLIGHT_UPDATE_UNEXPECTED',
      'Unexpected error while updating brand spotlight.',
      500,
      { scope: 'PATCH /api/admin/cms/brand-spotlights/[id]', cause }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guarded = await guard(request)
    if ('error' in guarded) return guarded.error

    const { id } = await params
    const list = [...(guarded.home.marketing?.brandSpotlights ?? [])]
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return fail('ADMIN_BRAND_SPOTLIGHT_NOT_FOUND', 'Brand spotlight not found.', 404)

    list.splice(index, 1)
    guarded.state.brandSpotlightsOverride = list
    delete guarded.state.brandSpotlightMeta[id]
    pushAudit(guarded.state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: guarded.session.userId, email: guarded.session.email },
      changes: { action: 'delete' },
    })
    await writeAdminControlsState(guarded.state)
    return ok({ id, deleted: true as const })
  } catch (cause) {
    return fail(
      'ADMIN_BRAND_SPOTLIGHT_DELETE_UNEXPECTED',
      'Unexpected error while deleting brand spotlight.',
      500,
      { scope: 'DELETE /api/admin/cms/brand-spotlights/[id]', cause }
    )
  }
}
