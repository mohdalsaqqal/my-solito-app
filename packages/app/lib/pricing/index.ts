import { Product } from '../types'
import { Promotion, AppliedPromotion } from '@real/providers/contracts'
import { calculatePromotionTotals, isSingleCurrency, round2 } from './promotion-engine'

export type ResolvedPrice = {
  unitPrice: number
  currency: string
  subtotal?: number
}

export type CartTotals = {
  baseSubtotal: number
  subtotal: number
  discountTotal: number
  discount: number
  shipping: number
  finalTotal: number
  total: number
  currency: string
  appliedPromotion?: AppliedPromotion
}

export interface PricingService {
  getProductPrice(product: Pick<Product, 'price' | 'currency'>, context?: { quantity?: number }): ResolvedPrice
  getCartTotals(
    items: Array<
      Pick<Product, 'price' | 'currency'> & {
        quantity: number
        id?: string
        productId?: string
        brand?: string
      }
    >,
    context?: {
      shipping?: number
      promotions?: Promotion[]
      couponCode?: string
      nowIso?: string
    }
  ): CartTotals
}

export const passThroughPricingService: PricingService = {
  getProductPrice(product, context) {
    const quantity = Math.max(1, context?.quantity ?? 1)
    return {
      unitPrice: product.price,
      currency: product.currency,
      subtotal: product.price * quantity,
    }
  },
  getCartTotals(items, context) {
    if (!isSingleCurrency(items.map((item) => ({
      productId: item.id ?? item.productId ?? '',
      quantity: item.quantity,
      unitPrice: item.price,
      currency: item.currency,
      brand: item.brand,
    })))) {
      throw new Error('CHECKOUT_CURRENCY_MISMATCH')
    }
    const baseSubtotal = round2(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
    const shippingBaseline = round2(Math.max(0, context?.shipping ?? 0))
    const promoResult = calculatePromotionTotals(context?.promotions ?? [], {
      lines: items.map((item) => ({
        productId: item.id ?? item.productId ?? '',
        quantity: item.quantity,
        unitPrice: item.price,
        currency: item.currency,
        brand: item.brand,
      })),
      baseSubtotal,
      shippingBaseline,
      couponCode: context?.couponCode,
      nowIso: context?.nowIso,
    })
    return {
      baseSubtotal: promoResult.baseSubtotal,
      subtotal: promoResult.baseSubtotal,
      discountTotal: promoResult.discountTotal,
      discount: promoResult.discountTotal,
      shipping: promoResult.finalShipping,
      finalTotal: promoResult.finalTotal,
      total: promoResult.finalTotal,
      currency: items[0]?.currency ?? 'USD',
      appliedPromotion: promoResult.appliedPromotion,
    }
  },
}
