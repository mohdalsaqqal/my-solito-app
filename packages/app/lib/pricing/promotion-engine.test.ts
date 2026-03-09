// @ts-nocheck
import test from 'node:test'
import assert from 'node:assert/strict'
import { calculatePromotionTotals } from './promotion-engine'

const baseContext = {
  lines: [
    { productId: 'p1', quantity: 2, unitPrice: 25, currency: 'USD', brand: 'dior' },
  ],
  baseSubtotal: 50,
  shippingBaseline: 5,
  couponCode: '',
  nowIso: '2026-03-02T12:00:00.000Z',
}

function promo(overrides = {}) {
  return {
    id: 'promo-1',
    name: { en: 'Promo', ar: 'عرض' },
    isActive: true,
    startAt: '2026-03-01T00:00:00.000Z',
    endAt: '2026-03-10T00:00:00.000Z',
    priority: 1,
    conditions: [],
    rewards: [{ type: 'percent_off', value: 10 }],
    ...overrides,
  }
}

test('applies percent off with round2', () => {
  const result = calculatePromotionTotals([promo()], baseContext)
  assert.equal(result.discountTotal, 5)
  assert.equal(result.finalTotal, 50)
  assert.equal(result.appliedPromotion?.rewardType, 'percent_off')
})

test('applies fixed amount cap', () => {
  const result = calculatePromotionTotals([
    promo({ rewards: [{ type: 'fixed_amount_off', value: 80 }] }),
  ], baseContext)
  assert.equal(result.discountTotal, 50)
  assert.equal(result.finalTotal, 5)
})

test('free shipping affects shipping only', () => {
  const result = calculatePromotionTotals([
    promo({ rewards: [{ type: 'free_shipping', value: true }] }),
  ], baseContext)
  assert.equal(result.subtotalDiscount, 0)
  assert.equal(result.shippingDiscountAmount, 5)
  assert.equal(result.finalShipping, 0)
  assert.equal(result.finalTotal, 50)
})

test('coupon required condition', () => {
  const p = promo({
    code: 'SAVE5',
    conditions: [{ type: 'coupon_required', code: 'SAVE5' }],
    rewards: [{ type: 'fixed_amount_off', value: 5 }],
  })
  const noCoupon = calculatePromotionTotals([p], { ...baseContext, couponCode: '' })
  assert.equal(noCoupon.discountTotal, 0)

  const withCoupon = calculatePromotionTotals([p], { ...baseContext, couponCode: 'save5' })
  assert.equal(withCoupon.discountTotal, 5)
})

test('brand_in condition', () => {
  const p = promo({
    conditions: [{ type: 'brand_in', brands: ['dior'] }],
    rewards: [{ type: 'fixed_amount_off', value: 5 }],
  })
  const result = calculatePromotionTotals([p], baseContext)
  assert.equal(result.discountTotal, 5)
})

test('min cart condition', () => {
  const p = promo({
    conditions: [{ type: 'min_cart_total', amount: 60 }],
    rewards: [{ type: 'fixed_amount_off', value: 5 }],
  })
  const result = calculatePromotionTotals([p], baseContext)
  assert.equal(result.discountTotal, 0)
})

test('picks highest priority only', () => {
  const low = promo({ id: 'low', priority: 1, rewards: [{ type: 'fixed_amount_off', value: 5 }] })
  const high = promo({ id: 'high', priority: 10, rewards: [{ type: 'fixed_amount_off', value: 8 }] })
  const result = calculatePromotionTotals([low, high], baseContext)
  assert.equal(result.discountTotal, 8)
  assert.equal(result.appliedPromotion?.id, 'high')
})
