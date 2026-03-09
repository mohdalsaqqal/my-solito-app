import { Promotion, AppliedPromotion } from '@real/providers/contracts'

type PromotionCartLine = {
  productId: string
  quantity: number
  unitPrice: number
  currency: string
  brand?: string
}

type PromotionEvaluationContext = {
  lines: PromotionCartLine[]
  baseSubtotal: number
  shippingBaseline: number
  couponCode?: string
  nowIso?: string
}

type PromotionCalcResult = {
  baseSubtotal: number
  subtotalDiscount: number
  shippingDiscountAmount: number
  finalShipping: number
  discountTotal: number
  finalTotal: number
  appliedPromotion?: AppliedPromotion
}

export function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function normalizeCouponCode(code?: string) {
  return (code ?? '').trim().toLowerCase()
}

export function isSingleCurrency(lines: PromotionCartLine[]) {
  const currency = lines[0]?.currency
  if (!currency) return true
  return lines.every((line) => line.currency === currency)
}

function isPromotionActive(promotion: Promotion, nowIso: string) {
  if (!promotion.isActive) return false
  const now = new Date(nowIso).getTime()
  const start = new Date(promotion.startAt).getTime()
  const end = new Date(promotion.endAt).getTime()
  return Number.isFinite(now) && Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end
}

function matchCondition(condition: Promotion['conditions'][number], context: PromotionEvaluationContext) {
  if (condition.type === 'min_cart_total') {
    return context.baseSubtotal >= Math.max(0, condition.amount)
  }
  if (condition.type === 'brand_in') {
    const allowed = new Set(condition.brands.map((brand) => brand.trim().toLowerCase()).filter(Boolean))
    if (allowed.size === 0) return false
    return context.lines.some((line) => allowed.has((line.brand ?? '').toLowerCase()))
  }
  if (condition.type === 'coupon_required') {
    const requiredCode = normalizeCouponCode(condition.code || undefined)
    const incoming = normalizeCouponCode(context.couponCode)
    const promotionCode = normalizeCouponCode((context as { promotionCode?: string }).promotionCode)
    if (requiredCode) {
      return incoming === requiredCode
    }
    if (promotionCode) {
      return incoming === promotionCode
    }
    return incoming.length > 0
  }
  return false
}

function isEligible(promotion: Promotion, context: PromotionEvaluationContext) {
  const nowIso = context.nowIso ?? new Date().toISOString()
  if (!isPromotionActive(promotion, nowIso)) return false
  const localContext = { ...context, promotionCode: promotion.code }
  return promotion.conditions.every((condition) => matchCondition(condition, localContext))
}

export function pickHighestPriorityPromotion(promotions: Promotion[]) {
  if (promotions.length === 0) return null
  return [...promotions].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    const startDiff = new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    if (startDiff !== 0) return startDiff
    return a.id.localeCompare(b.id)
  })[0] ?? null
}

function applyReward(promotion: Promotion, context: PromotionEvaluationContext): PromotionCalcResult {
  const reward = promotion.rewards[0]
  const baseSubtotal = round2(context.baseSubtotal)
  const shippingBaseline = round2(Math.max(0, context.shippingBaseline))

  if (!reward) {
    return {
      baseSubtotal,
      subtotalDiscount: 0,
      shippingDiscountAmount: 0,
      finalShipping: shippingBaseline,
      discountTotal: 0,
      finalTotal: round2(baseSubtotal + shippingBaseline),
    }
  }

  let subtotalDiscount = 0
  let shippingDiscountAmount = 0
  let rewardType: AppliedPromotion['rewardType']

  if (reward.type === 'percent_off') {
    subtotalDiscount = round2(baseSubtotal * (Math.max(0, reward.value) / 100))
    rewardType = 'percent_off'
  } else if (reward.type === 'fixed_amount_off') {
    subtotalDiscount = round2(Math.min(baseSubtotal, Math.max(0, reward.value)))
    rewardType = 'fixed_amount_off'
  } else {
    shippingDiscountAmount = round2(Math.min(shippingBaseline, shippingBaseline))
    rewardType = 'free_shipping'
  }

  const finalShipping = round2(shippingBaseline - shippingDiscountAmount)
  const discountTotal = round2(subtotalDiscount + shippingDiscountAmount)
  const finalTotal = round2(baseSubtotal - subtotalDiscount + finalShipping)

  return {
    baseSubtotal,
    subtotalDiscount,
    shippingDiscountAmount,
    finalShipping,
    discountTotal,
    finalTotal,
    appliedPromotion: {
      id: promotion.id,
      code: promotion.code,
      name: promotion.name.en,
      rewardType,
      discountAmount: subtotalDiscount,
      shippingDiscountAmount,
    },
  }
}

export function calculatePromotionTotals(
  promotions: Promotion[],
  context: PromotionEvaluationContext
): PromotionCalcResult {
  const eligible = promotions.filter((promotion) => isEligible(promotion, context))
  const selected = pickHighestPriorityPromotion(eligible)
  if (!selected) {
    const baseSubtotal = round2(context.baseSubtotal)
    const shippingBaseline = round2(Math.max(0, context.shippingBaseline))
    return {
      baseSubtotal,
      subtotalDiscount: 0,
      shippingDiscountAmount: 0,
      finalShipping: shippingBaseline,
      discountTotal: 0,
      finalTotal: round2(baseSubtotal + shippingBaseline),
    }
  }

  return applyReward(selected, context)
}
