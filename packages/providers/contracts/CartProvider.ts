import { ProviderResult } from './types'

export type CartItem = {
  productId: string
  quantity: number
}

export type CartAdjustment = {
  kind: 'promotion' | 'coupon' | 'loyalty' | 'referral'
  code?: string
  label: string
  amount: number
}

export type CartPricingSummary = {
  subtotal: number
  discountTotal: number
  deliveryFee: number
  taxTotal: number
  finalTotal: number
  currency: string
  adjustments: CartAdjustment[]
}

export type Cart = {
  items: CartItem[]
  updatedAt: string
}

export type CartQuoteInput = {
  fulfillment: {
    mode: 'delivery' | 'pickup'
  }
  couponCode?: string
  referralCode?: string
  referralToken?: string
}

export type CartQuote = {
  quoteId: string
  expiresAt: string
  cart: Cart
  pricing: CartPricingSummary
}

export interface CartProvider {
  get(): Promise<ProviderResult<Cart>>
  add(productId: string, quantity: number): Promise<ProviderResult<Cart>>
  remove(productId: string): Promise<ProviderResult<Cart>>
  quote?(input: CartQuoteInput): Promise<ProviderResult<CartQuote>>
}
