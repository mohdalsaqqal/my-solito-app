import { createHash } from 'node:crypto'

type QuoteHashLine = {
  productId: string
  quantity: number
  baseUnitPrice: number
  currency: string
}

type BuildCartHashInput = {
  items: QuoteHashLine[]
  fulfillmentMode: 'delivery' | 'pickup'
  branchId?: string
  shippingBaseline: number
  couponCode?: string
  referralCode?: string
}

export function normalizeCouponCode(code?: string) {
  return (code ?? '').trim().toLowerCase()
}

export function normalizeReferralCode(code?: string) {
  return (code ?? '').trim().toUpperCase()
}

export function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function hasSingleCurrency(items: QuoteHashLine[]) {
  const first = items[0]?.currency
  if (!first) return true
  return items.every((item) => item.currency === first)
}

export function buildCartHash(input: BuildCartHashInput) {
  const normalizedLines = [...input.items]
    .map((line) => ({
      productId: line.productId,
      quantity: Math.max(0, Math.floor(line.quantity)),
      baseUnitPrice: round2(line.baseUnitPrice),
      currency: line.currency,
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId))

  const canonical = {
    items: normalizedLines,
    fulfillmentMode: input.fulfillmentMode,
    branchId: input.branchId ?? '',
    shippingBaseline: round2(input.shippingBaseline),
    couponCode: normalizeCouponCode(input.couponCode),
    referralCode: normalizeReferralCode(input.referralCode),
  }

  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
}

export function quoteExpiresAt(nowIso: string, ttlMs: number) {
  return new Date(new Date(nowIso).getTime() + ttlMs).toISOString()
}

export function isQuoteExpired(expiresAtIso: string, nowIso: string) {
  return new Date(expiresAtIso).getTime() <= new Date(nowIso).getTime()
}
