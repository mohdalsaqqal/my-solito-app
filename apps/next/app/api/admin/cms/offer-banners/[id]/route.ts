import { cmsProvider } from '@real/providers'
import { AdminOfferBannerRecord, HomeOfferBannerConfig } from '@real/app/lib/types'
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
  imageUrl?: string
  href?: string
  ctaLabel?: { en?: string; ar?: string }
  position?: number
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
  const session = await requireAdminDomainSession(request, 'marketing', 'full')
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
    const list = [...(guarded.home.marketing?.offerBanners ?? [])]
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return fail('ADMIN_OFFER_BANNER_NOT_FOUND', 'Offer banner not found.', 404)

    const current = list[index]
    const updated: HomeOfferBannerConfig = {
      ...current,
      enabled: typeof payload.enabled === 'boolean' ? payload.enabled : current.enabled,
      imageUrl: payload.imageUrl !== undefined ? payload.imageUrl?.trim() || undefined : current.imageUrl,
      href: payload.href?.trim() || current.href,
      ctaLabel: payload.ctaLabel
        ? {
            en: payload.ctaLabel.en?.trim() || current.ctaLabel?.en || '',
            ar: payload.ctaLabel.ar?.trim() || current.ctaLabel?.ar || '',
          }
        : current.ctaLabel,
    }
    list[index] = updated

    let nextList = list
    if (typeof payload.position === 'number') {
      const bounded = Math.max(0, Math.min(list.length - 1, Math.floor(payload.position)))
      nextList = moveToIndex(list, index, bounded)
    }

    const now = new Date().toISOString()
    guarded.state.offerBannersOverride = nextList
    guarded.state.offerBannerMeta[id] = {
      updatedAt: now,
      updatedBy: { userId: guarded.session.userId, email: guarded.session.email },
    }
    pushAudit(guarded.state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: guarded.session.userId, email: guarded.session.email },
      changes: { action: 'offer_banner.update', ctaLabel: updated.ctaLabel?.en ?? '' },
    })
    await writeAdminControlsState(guarded.state)
    return ok(toRecord(updated, guarded.state.offerBannerMeta[id]))
  } catch (cause) {
    return fail(
      'ADMIN_OFFER_BANNER_UPDATE_UNEXPECTED',
      'Unexpected error while updating offer banner.',
      500,
      { scope: 'PATCH /api/admin/cms/offer-banners/[id]', cause }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guarded = await guard(request)
    if ('error' in guarded) return guarded.error

    const { id } = await params
    const list = [...(guarded.home.marketing?.offerBanners ?? [])]
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return fail('ADMIN_OFFER_BANNER_NOT_FOUND', 'Offer banner not found.', 404)

    list.splice(index, 1)
    guarded.state.offerBannersOverride = list
    delete guarded.state.offerBannerMeta[id]
    pushAudit(guarded.state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: guarded.session.userId, email: guarded.session.email },
      changes: { action: 'offer_banner.delete' },
    })
    await writeAdminControlsState(guarded.state)
    return ok({ id, deleted: true as const })
  } catch (cause) {
    return fail(
      'ADMIN_OFFER_BANNER_DELETE_UNEXPECTED',
      'Unexpected error while deleting offer banner.',
      500,
      { scope: 'DELETE /api/admin/cms/offer-banners/[id]', cause }
    )
  }
}
