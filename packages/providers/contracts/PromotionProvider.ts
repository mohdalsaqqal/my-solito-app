import { ProviderResult } from './types'

export type PromotionCondition =
  | { type: 'min_cart_total'; amount: number }
  | { type: 'brand_in'; brands: string[] }
  | { type: 'coupon_required'; code?: string }

export type PromotionReward =
  | { type: 'percent_off'; value: number }
  | { type: 'fixed_amount_off'; value: number }
  | { type: 'free_shipping'; value: true }

export type Promotion = {
  id: string
  code?: string
  name: {
    en: string
    ar: string
  }
  isActive: boolean
  startAt: string
  endAt: string
  priority: number
  conditions: PromotionCondition[]
  rewards: PromotionReward[]
}

export type AppliedPromotion = {
  id: string
  code?: string
  name: string
  rewardType: 'percent_off' | 'fixed_amount_off' | 'free_shipping'
  discountAmount: number
  shippingDiscountAmount: number
}

export type QuoteTotals = {
  baseSubtotal: number
  discountTotal: number
  shipping: number
  finalTotal: number
  subtotal: number
  discount: number
  total: number
  currency: string
  appliedPromotion?: AppliedPromotion
}

export type PricingQuote = {
  id: string
  userId?: string
  cartHash: string
  quote: {
    totals: QuoteTotals
    couponCode?: string
    fulfillmentMode: 'delivery' | 'pickup'
    branchId?: string
    shippingBaseline: number
    cartHash: string
  }
  expiresAt: string
  createdAt: string
}

export interface PromotionProvider {
  listAll(): Promise<ProviderResult<Promotion[]>>
  listActive(atIso?: string): Promise<ProviderResult<Promotion[]>>
  create(input: Promotion): Promise<ProviderResult<Promotion>>
  update(
    id: string,
    input: Partial<{
      code?: string
      name: Promotion['name']
      isActive: boolean
      startAt: string
      endAt: string
      priority: number
      conditions: PromotionCondition[]
      rewards: PromotionReward[]
    }>
  ): Promise<ProviderResult<Promotion>>
  delete(id: string): Promise<ProviderResult<{ id: string; deleted: true }>>
  createQuote(input: {
    userId?: string
    cartHash: string
    quote: PricingQuote['quote']
    expiresAt: string
  }): Promise<ProviderResult<PricingQuote>>
  getQuote(id: string): Promise<ProviderResult<PricingQuote | null>>
  invalidateExpiredQuotes(nowIso?: string): Promise<ProviderResult<{ removed: number }>>
}
