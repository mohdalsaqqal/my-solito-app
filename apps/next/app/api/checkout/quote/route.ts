import { cartProvider, productProvider, promotionProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { AUTH_SESSION_COOKIE, parseAuthSessionCookie } from '../../_lib/auth-session'
import { buildCartHash, hasSingleCurrency, isQuoteExpired, normalizeCouponCode, quoteExpiresAt } from '../../_lib/pricing-quote'
import { passThroughPricingService } from '@real/app/lib/pricing'

type CheckoutQuoteRequest = {
  items?: Array<{ productId?: string; quantity?: number }>
  fulfillment?: {
    mode?: 'delivery' | 'pickup'
    branchId?: string
  }
  couponCode?: string
}

const QUOTE_TTL_MS = 5 * 60 * 1000

function readSession(request: Request) {
  const rawCookie = request.headers.get('cookie')
  const cookieValue = rawCookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_SESSION_COOKIE}=`))
    ?.split('=')
    .slice(1)
    .join('=')
  return parseAuthSessionCookie(cookieValue)
}

function toSafeItems(payloadItems: CheckoutQuoteRequest['items']) {
  return (payloadItems ?? [])
    .filter((item) => typeof item?.productId === 'string' && typeof item?.quantity === 'number' && (item?.quantity ?? 0) > 0)
    .map((item) => ({ productId: item.productId as string, quantity: item.quantity as number }))
}

export async function POST(request: Request) {
  try {
    const session = readSession(request)
    const body = ((await request.json().catch(() => ({}))) ?? {}) as CheckoutQuoteRequest

    const fulfillmentMode = body.fulfillment?.mode === 'pickup' ? 'pickup' : 'delivery'
    const branchId = body.fulfillment?.branchId
    const shippingBaseline = fulfillmentMode === 'delivery' ? 5 : 0
    const couponCode = normalizeCouponCode(body.couponCode)

    const cartResult = await cartProvider.get()
    if (!cartResult.ok) {
      return fail(cartResult.error.code, cartResult.error.message, 500)
    }

    const productsResult = await productProvider.list()
    if (!productsResult.ok) {
      return fail(productsResult.error.code, productsResult.error.message, 500)
    }

    const fallbackItems = toSafeItems(body.items)
    const effectiveItems = cartResult.data.items.length > 0 ? cartResult.data.items : fallbackItems
    if (effectiveItems.length === 0) {
      return fail('CHECKOUT_QUOTE_EMPTY_CART', 'Cannot create quote for empty cart.', 400)
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
      return fail('CHECKOUT_QUOTE_NO_VALID_LINES', 'No valid quote lines found.', 400)
    }

    const hashLines = pricedLines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      baseUnitPrice: line.price,
      currency: line.currency,
    }))

    if (!hasSingleCurrency(hashLines)) {
      console.warn('[checkout-quote]', { event: 'currency_mismatch', lineCount: hashLines.length })
      return fail('CHECKOUT_CURRENCY_MISMATCH', 'Mixed currencies are not supported in checkout.', 400)
    }

    const promotionsResult = await promotionProvider.listActive()
    if (!promotionsResult.ok) {
      return fail(promotionsResult.error.code, promotionsResult.error.message, 500)
    }

    const nowIso = new Date().toISOString()
    const totals = passThroughPricingService.getCartTotals(pricedLines, {
      shipping: shippingBaseline,
      promotions: promotionsResult.data,
      couponCode,
      nowIso,
    })

    const cartHash = buildCartHash({
      items: hashLines,
      fulfillmentMode,
      branchId,
      shippingBaseline,
      couponCode,
    })

    const expiresAt = quoteExpiresAt(nowIso, QUOTE_TTL_MS)
    if (isQuoteExpired(expiresAt, nowIso)) {
      console.warn('[checkout-quote]', { event: 'quote_expired_before_issue', expiresAt, nowIso })
      return fail('CHECKOUT_QUOTE_EXPIRED', 'Quote expired. Please refresh checkout.', 400)
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
      },
      expiresAt,
    })

    if (!quoteResult.ok) {
      console.warn('[checkout-quote]', { event: 'quote_create_failed', code: quoteResult.error.code })
      return fail(quoteResult.error.code, quoteResult.error.message, 500)
    }

    console.info('[checkout-quote]', {
      event: 'quote_create_success',
      quoteId: quoteResult.data.id,
      userId: session?.userId ?? null,
      expiresAt: quoteResult.data.expiresAt,
    })

    return ok({
      quoteId: quoteResult.data.id,
      expiresAt: quoteResult.data.expiresAt,
      totals: quoteResult.data.quote.totals,
    })
  } catch (cause) {
    return fail('CHECKOUT_QUOTE_UNEXPECTED', 'Unexpected error while creating checkout quote.', 500, {
      scope: 'POST /api/checkout/quote',
      cause,
    })
  }
}
