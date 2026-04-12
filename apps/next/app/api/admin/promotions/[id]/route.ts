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
  if (startAt && !Number.isFinite(new Date(startAt).getTime())) return false
  if (endAt && !Number.isFinite(new Date(endAt).getTime())) return false
  if (!startAt || !endAt) return true
  return new Date(startAt).getTime() < new Date(endAt).getTime()
}

function validatePatchPayload(body: PatchPayload) {
  if (!validateDateWindow(body.startAt, body.endAt)) {
    return 'startAt and endAt must be valid ISO values with startAt before endAt.'
  }

  if (body.conditions) {
    if (body.conditions.length === 0) return 'At least one condition is required.'
    for (const condition of body.conditions) {
      if (condition.type === 'min_cart_total') {
        if (!Number.isFinite(condition.amount) || condition.amount <= 0) {
          return 'min_cart_total amount must be > 0.'
        }
        continue
      }
      if (condition.type === 'brand_in') {
        if (!Array.isArray(condition.brands) || condition.brands.length === 0) {
          return 'brand_in must include at least one brand.'
        }
        continue
      }
      if (condition.type === 'coupon_required') {
        const conditionCode = condition.code?.trim()
        const promotionCode = body.code?.trim()
        if (!conditionCode && !promotionCode) {
          return 'coupon_required conditions require a coupon code on condition or promotion.'
        }
      }
    }
  }

  if (body.rewards) {
    if (body.rewards.length !== 1) return 'Exactly one reward is allowed.'
    const reward = body.rewards[0]
    if (reward.type === 'fixed_amount_off') {
      if (!Number.isFinite(reward.value) || reward.value <= 0) {
        return 'fixed_amount_off value must be > 0.'
      }
    } else if (reward.type === 'percent_off') {
      if (!Number.isFinite(reward.value) || reward.value <= 0 || reward.value > 100) {
        return 'percent_off value must be > 0 and <= 100.'
      }
    } else if (reward.type === 'free_shipping' && reward.value !== true) {
      return 'free_shipping value must be true.'
    }
  }

  return null
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as PatchPayload
    const validationError = validatePatchPayload(body)
    if (validationError) {
      return fail('ADMIN_PROMOTION_INVALID', validationError, 400)
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
