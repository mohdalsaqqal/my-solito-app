import { promotionProvider } from '@real/providers'
import { PromotionCondition, PromotionReward } from '@real/providers/contracts'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../_lib/admin-controls-store'

type PatchPayload = {
  code?: string
  name?: { en?: string; ar?: string }
  isActive?: boolean
  startAt?: string
  endAt?: string
  priority?: number
  conditions?: PromotionCondition[]
  rewards?: PromotionReward[]
}

function validateDateWindow(startAt?: string, endAt?: string) {
  if (!startAt || !endAt) return true
  return new Date(startAt).getTime() < new Date(endAt).getTime()
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as PatchPayload
    if (!validateDateWindow(body.startAt, body.endAt)) {
      return fail('ADMIN_PROMOTION_DATE_INVALID', 'startAt must be before endAt.', 400)
    }
    if (body.conditions && body.conditions.length === 0) {
      return fail('ADMIN_PROMOTION_CONDITIONS_INVALID', 'At least one condition is required.', 400)
    }
    if (body.rewards && body.rewards.length === 0) {
      return fail('ADMIN_PROMOTION_REWARDS_INVALID', 'At least one reward is required.', 400)
    }

    const updated = await promotionProvider.update(id, {
      code: body.code?.trim(),
      name: body.name?.en || body.name?.ar ? {
        en: body.name?.en?.trim() || '',
        ar: body.name?.ar?.trim() || '',
      } : undefined,
      isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
      startAt: body.startAt,
      endAt: body.endAt,
      priority: body.priority,
      conditions: body.conditions,
      rewards: body.rewards,
    })
    if (!updated.ok) {
      const status = updated.error.code === 'PROMOTION_NOT_FOUND' ? 404 : 400
      return fail(updated.error.code, updated.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'promotion.update' },
    })
    await writeAdminControlsState(state)

    return ok(updated.data)
  } catch (cause) {
    return fail('ADMIN_PROMOTION_PATCH_UNEXPECTED', 'Unexpected error while updating promotion.', 500, {
      scope: 'PATCH /api/admin/promotions/[id]',
      cause,
    })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const deleted = await promotionProvider.delete(id)
    if (!deleted.ok) {
      const status = deleted.error.code === 'PROMOTION_NOT_FOUND' ? 404 : 400
      return fail(deleted.error.code, deleted.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'promotion.delete' },
    })
    await writeAdminControlsState(state)

    return ok(deleted.data)
  } catch (cause) {
    return fail('ADMIN_PROMOTION_DELETE_UNEXPECTED', 'Unexpected error while deleting promotion.', 500, {
      scope: 'DELETE /api/admin/promotions/[id]',
      cause,
    })
  }
}

