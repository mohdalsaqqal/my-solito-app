import { promotionProvider } from '@real/providers'
import { PromotionCondition, PromotionReward } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../_lib/admin-controls-store'

function validatePromotionsPayload(input: {
  code?: string
  startAt?: string
  endAt?: string
  priority?: number
  conditions?: PromotionCondition[]
  rewards?: PromotionReward[]
}) {
  if (!input.startAt || !input.endAt) return 'startAt and endAt are required.'
  const startAtMs = new Date(input.startAt).getTime()
  const endAtMs = new Date(input.endAt).getTime()
  if (!Number.isFinite(startAtMs) || !Number.isFinite(endAtMs)) {
    return 'startAt and endAt must be valid ISO date-time values.'
  }
  if (startAtMs >= endAtMs) {
    return 'startAt must be before endAt.'
  }
  if (typeof input.priority !== 'number' || Number.isNaN(input.priority)) {
    return 'priority must be a number.'
  }
  if (!Array.isArray(input.conditions) || input.conditions.length === 0) {
    return 'At least one condition is required.'
  }
  for (const condition of input.conditions) {
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
      const promotionCode = input.code?.trim()
      if (!conditionCode && !promotionCode) {
        return 'coupon_required conditions require a coupon code on condition or promotion.'
      }
    }
  }
  if (!Array.isArray(input.rewards) || input.rewards.length === 0) {
    return 'At least one reward is required.'
  }
  if (input.rewards.length !== 1) {
    return 'Exactly one reward is allowed.'
  }
  const reward = input.rewards[0]
  if (reward.type === 'fixed_amount_off') {
    if (!Number.isFinite(reward.value) || reward.value <= 0) {
      return 'fixed_amount_off value must be > 0.'
    }
  } else if (reward.type === 'percent_off') {
    if (!Number.isFinite(reward.value) || reward.value <= 0 || reward.value > 100) {
      return 'percent_off value must be > 0 and <= 100.'
    }
  } else if (reward.type === 'free_shipping') {
    if (reward.value !== true) {
      return 'free_shipping value must be true.'
    }
  }
  return null
}

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const result = await promotionProvider.listAll()
    if (!result.ok) return fail(result.error.code, result.error.message, 500)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_PROMOTION_LIST_UNEXPECTED', 'Unexpected error while loading promotions.', 500, {
      scope: 'GET /api/admin/promotions',
      cause,
    })
  }
}

type CreatePayload = {
  id?: string
  code?: string
  name?: { en?: string; ar?: string }
  isActive?: boolean
  startAt?: string
  endAt?: string
  priority?: number
  conditions?: PromotionCondition[]
  rewards?: PromotionReward[]
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    const id = (body.id ?? '').trim()
    if (!id) return fail('ADMIN_PROMOTION_ID_REQUIRED', 'Promotion id is required.', 400)
    const error = validatePromotionsPayload(body)
    if (error) return fail('ADMIN_PROMOTION_INVALID', error, 400)

    const created = await promotionProvider.create({
      id,
      code: body.code?.trim() || undefined,
      name: {
        en: body.name?.en?.trim() || id,
        ar: body.name?.ar?.trim() || id,
      },
      isActive: body.isActive !== false,
      startAt: body.startAt as string,
      endAt: body.endAt as string,
      priority: typeof body.priority === 'number' ? body.priority : 0,
      conditions: body.conditions as PromotionCondition[],
      rewards: body.rewards as PromotionReward[],
    })
    if (!created.ok) {
      const status = created.error.code === 'PROMOTION_EXISTS' ? 409 : 400
      return fail(created.error.code, created.error.message, status)
    }

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: id,
      actor: { userId: session.userId, email: session.email },
      changes: { action: 'promotion.create' },
    })
    await writeAdminControlsState(state)

    return ok(created.data, 201)
  } catch (cause) {
    return fail('ADMIN_PROMOTION_CREATE_UNEXPECTED', 'Unexpected error while creating promotion.', 500, {
      scope: 'POST /api/admin/promotions',
      cause,
    })
  }
}
