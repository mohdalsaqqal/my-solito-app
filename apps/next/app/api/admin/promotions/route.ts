import { promotionProvider } from '@real/providers'
import { PromotionCondition, PromotionReward } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../_lib/admin-controls-store'

function validatePromotionsPayload(input: {
  startAt?: string
  endAt?: string
  priority?: number
  conditions?: PromotionCondition[]
  rewards?: PromotionReward[]
}) {
  if (!input.startAt || !input.endAt) return 'startAt and endAt are required.'
  if (new Date(input.startAt).getTime() >= new Date(input.endAt).getTime()) {
    return 'startAt must be before endAt.'
  }
  if (!Array.isArray(input.conditions) || input.conditions.length === 0) {
    return 'At least one condition is required.'
  }
  if (!Array.isArray(input.rewards) || input.rewards.length === 0) {
    return 'At least one reward is required.'
  }
  if ((input.rewards[0] as PromotionReward)?.type === 'fixed_amount_off') {
    const value = (input.rewards[0] as { value?: number }).value
    if (typeof value !== 'number' || value <= 0) return 'fixed_amount_off value must be > 0.'
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

