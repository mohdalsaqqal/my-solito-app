import { cartProvider, productProvider, promotionProvider } from '@real/providers'
import type { PricingQuote } from '@real/providers/contracts'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { DEFAULT_STORE_ID, validateReferralRequest } from '@real/app/lib/referral/referral-schema'
import type { ReferralProfile, ReferralProgramSettings } from '@real/app/lib/referral/referral-types'
import { buildCartHash, hasSingleCurrency, isQuoteExpired, normalizeCouponCode, quoteExpiresAt } from './pricing-quote'
import { getReferralProfileByCode, readReferralProgramSettings } from '../referral'
import { ServiceError } from '../_lib/service-error'
import { resolveNormalizedSessionFromRequest } from '../auth'

export type CheckoutQuoteRequest = {
  items?: Array<{ productId?: string; quantity?: number }>
  fulfillment?: {
    mode?: 'delivery' | 'pickup'
    branchId?: string
  }
  couponCode?: string
  referralCode?: string
}

const QUOTE_TTL_MS = 5 * 60 * 1000

function toSafeItems(payloadItems: CheckoutQuoteRequest['items']) {
  return (payloadItems ?? [])
    .filter((item) => typeof item?.productId === 'string' && typeof item?.quantity === 'number' && (item?.quantity ?? 0) > 0)
    .map((item) => ({ productId: item.productId as string, quantity: item.quantity as number }))
}

function buildReferralPricing(input: {
  subtotal: number
  program: ReferralProgramSettings
  profile: ReferralProfile
}) {
  const followerReward = input.program.policy.followerReward
  const influencerReward = input.program.policy.influencerReward

  const followerDiscountAmount =
    followerReward.type === 'percentage_discount'
      ? Math.round((input.subtotal * (followerReward.value / 100)) * 100) / 100
      : followerReward.type === 'fixed_discount'
        ? Math.min(input.subtotal, followerReward.value)
        : 0

  const influencerRewardValue =
    influencerReward.type === 'commission_percentage'
      ? Math.round((input.subtotal * (influencerReward.value / 100)) * 100) / 100
      : influencerReward.type === 'fixed_amount_per_order'
        ? influencerReward.value
        : 0

  return {
    code: input.profile.code,
    profileId: input.profile.id,
    actorType: input.profile.actorType,
    followerRewardType: followerReward.type,
    followerRewardValue: followerReward.value,
    followerDiscountAmount,
    influencerRewardType: influencerReward.type,
    influencerRewardValue,
  }
}

export async function createCheckoutQuote(request: Request) {
  const session = await resolveNormalizedSessionFromRequest(request)
  const body = ((await request.json().catch(() => ({}))) ?? {}) as CheckoutQuoteRequest

  const fulfillmentMode = body.fulfillment?.mode === 'pickup' ? 'pickup' : 'delivery'
  const branchId = body.fulfillment?.branchId
  const shippingBaseline = fulfillmentMode === 'delivery' ? 5 : 0
  const couponCode = normalizeCouponCode(body.couponCode)
  const referralCode = (body.referralCode ?? '').trim().toUpperCase()

  const cartResult = await cartProvider.get()
  if (!cartResult.ok) {
    throw new ServiceError(cartResult.error.code, cartResult.error.message, 500)
  }

  const productsResult = await productProvider.list()
  if (!productsResult.ok) {
    throw new ServiceError(productsResult.error.code, productsResult.error.message, 500)
  }

  const fallbackItems = toSafeItems(body.items)
  const effectiveItems = cartResult.data.items.length > 0 ? cartResult.data.items : fallbackItems
  if (effectiveItems.length === 0) {
    throw new ServiceError('CHECKOUT_QUOTE_EMPTY_CART', 'Cannot create quote for empty cart.', 400)
  }

  const pricedLines = effectiveItems.flatMap((line) => {
    const product = productsResult.data.find((item) => item.id === line.productId)
    if (!product) return []
    return [{
      id: product.id,
      productId: product.id,
      quantity: line.quantity,
      price: product.price,
      currency: product.currency,
      brand: product.brand,
    }]
  })

  if (pricedLines.length === 0) {
    throw new ServiceError('CHECKOUT_QUOTE_NO_VALID_LINES', 'No valid quote lines found.', 400)
  }

  const hashLines = pricedLines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    baseUnitPrice: line.price,
    currency: line.currency,
  }))

  if (!hasSingleCurrency(hashLines)) {
    console.warn('[checkout-quote]', { event: 'currency_mismatch', lineCount: hashLines.length })
    throw new ServiceError('CHECKOUT_CURRENCY_MISMATCH', 'Mixed currencies are not supported in checkout.', 400)
  }

  const promotionsResult = await promotionProvider.listActive()
  if (!promotionsResult.ok) {
    throw new ServiceError(promotionsResult.error.code, promotionsResult.error.message, 500)
  }

  const nowIso = new Date().toISOString()
  const promoTotals = passThroughPricingService.getCartTotals(pricedLines, {
    shipping: shippingBaseline,
    promotions: promotionsResult.data,
    couponCode,
    nowIso,
  })

  let referralQuoteMeta: PricingQuote['quote']['referral'] | undefined
  let totals = promoTotals

  if (referralCode) {
    const program = await readReferralProgramSettings(DEFAULT_STORE_ID)
    const profile = await getReferralProfileByCode(referralCode, DEFAULT_STORE_ID)
    const validation = validateReferralRequest({
      request: {
        code: referralCode,
        cartSubtotal: promoTotals.baseSubtotal,
        currency: promoTotals.currency,
      },
      program,
      profile,
    })

    if (!validation.eligible || !profile) {
      throw new ServiceError(validation.reasonCode ?? 'REFERRAL_INVALID', 'Referral code is not eligible.', 400)
    }

    referralQuoteMeta = buildReferralPricing({
      subtotal: promoTotals.baseSubtotal,
      program,
      profile,
    })

    totals = {
      ...promoTotals,
      discountTotal: Math.round((promoTotals.discountTotal + referralQuoteMeta.followerDiscountAmount) * 100) / 100,
      discount: Math.round((promoTotals.discount + referralQuoteMeta.followerDiscountAmount) * 100) / 100,
      finalTotal: Math.max(
        0,
        Math.round((promoTotals.finalTotal - referralQuoteMeta.followerDiscountAmount) * 100) / 100,
      ),
      total: Math.max(
        0,
        Math.round((promoTotals.total - referralQuoteMeta.followerDiscountAmount) * 100) / 100,
      ),
    }
  }

  const cartHash = buildCartHash({
    items: hashLines,
    fulfillmentMode,
    branchId,
    shippingBaseline,
    couponCode,
    referralCode,
  })

  const expiresAt = quoteExpiresAt(nowIso, QUOTE_TTL_MS)
  if (isQuoteExpired(expiresAt, nowIso)) {
    console.warn('[checkout-quote]', { event: 'quote_expired_before_issue', expiresAt, nowIso })
    throw new ServiceError('CHECKOUT_QUOTE_EXPIRED', 'Quote expired. Please refresh checkout.', 400)
  }

  const quoteResult = await promotionProvider.createQuote({
    userId: session?.userId,
    cartHash,
    quote: {
      totals,
      couponCode: couponCode || undefined,
      fulfillmentMode,
      branchId,
      shippingBaseline,
      cartHash,
      referral: referralQuoteMeta,
    },
    expiresAt,
  })

  if (!quoteResult.ok) {
    console.warn('[checkout-quote]', { event: 'quote_create_failed', code: quoteResult.error.code })
    throw new ServiceError(quoteResult.error.code, quoteResult.error.message, 500)
  }

  console.info('[checkout-quote]', {
    event: 'quote_create_success',
    quoteId: quoteResult.data.id,
    userId: session?.userId ?? null,
    expiresAt: quoteResult.data.expiresAt,
  })

  return {
    quoteId: quoteResult.data.id,
    expiresAt: quoteResult.data.expiresAt,
    totals: quoteResult.data.quote.totals,
    referral: quoteResult.data.quote.referral,
  }
}
