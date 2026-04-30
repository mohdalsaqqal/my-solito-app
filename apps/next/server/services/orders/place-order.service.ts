import { accountProvider, cartProvider, cmsProvider, orderProvider, paymentProvider, productProvider, promotionProvider } from '@real/providers'
import type { Order, PaymentProviderIntent } from '@real/providers/contracts'
import { passThroughPricingService } from '@real/app/lib/pricing'
import { buildCartHash, hasSingleCurrency, isQuoteExpired, normalizeCouponCode } from '../checkout/pricing-quote'
import { createReferralLedgerEntry } from '../referral'
import { ServiceError } from '../_lib/service-error'
import { resolveNormalizedSessionFromRequest } from '../auth'
import { createProviderContext } from '../tenant/context'

export type PlaceOrderPayload = {
  items?: Array<{
    productId?: string
    quantity?: number
  }>
  contact?: {
    fullName?: string
    phone?: string
  }
  address?: {
    city?: string
    area?: string
    building?: string
    floor?: string
    apartment?: string
    notes?: string
  }
  addressBook?: {
    saveAsNew?: boolean
    label?: string
  }
  loyalty?: {
    redeemPercent?: number
  }
  fulfillment?: {
    mode?: 'delivery' | 'pickup'
    branchId?: string
  }
  payment?: {
    method?: 'cod' | 'card_on_delivery' | 'online_card' | 'pay_at_branch'
  }
  pricingQuoteId?: string
  couponCode?: string
  referralCode?: string
}

function splitProductName(rawName: string) {
  const parts = rawName.split('-')
  if (parts.length < 2) {
    return {
      brand: rawName.trim(),
      name: rawName.trim(),
    }
  }
  return {
    brand: parts[0]?.trim() || rawName.trim(),
    name: parts.slice(1).join('-').trim() || rawName.trim(),
  }
}

function normalizeAddressValue(value?: string) {
  return (value ?? '').trim().toLowerCase()
}

function isSameAddress(
  left: {
    city: string
    area: string
    building: string
    floor?: string
    apartment?: string
  },
  right: {
    city: string
    area: string
    building: string
    floor?: string
    apartment?: string
  },
) {
  return (
    normalizeAddressValue(left.city) === normalizeAddressValue(right.city) &&
    normalizeAddressValue(left.area) === normalizeAddressValue(right.area) &&
    normalizeAddressValue(left.building) === normalizeAddressValue(right.building) &&
    normalizeAddressValue(left.floor) === normalizeAddressValue(right.floor) &&
    normalizeAddressValue(left.apartment) === normalizeAddressValue(right.apartment)
  )
}

export async function placeOrder(request: Request) {
  const session = await resolveNormalizedSessionFromRequest(request)
  if (!session) {
    throw new ServiceError('ORDER_PLACE_AUTH_REQUIRED', 'Please sign in to place your order.', 401)
  }

  const payload = ((await request.json().catch(() => ({}))) ?? {}) as PlaceOrderPayload
  const pricingQuoteId = payload.pricingQuoteId?.trim()
  if (!pricingQuoteId) {
    console.warn('[checkout-place-order]', { event: 'quote_missing', userId: session.userId })
    throw new ServiceError('CHECKOUT_QUOTE_REQUIRED', 'A valid checkout quote is required before placing order.', 400)
  }

  const cartResult = await cartProvider.get()
  if (!cartResult.ok) {
    throw new ServiceError(cartResult.error.code, cartResult.error.message, 500)
  }

  const payloadItems = (payload.items ?? [])
    .filter((item) => typeof item.productId === 'string' && typeof item.quantity === 'number' && item.quantity > 0)
    .map((item) => ({
      productId: item.productId as string,
      quantity: item.quantity as number,
    }))

  const cartItems = cartResult.data.items
  const effectiveItems = cartItems.length > 0 ? cartItems : payloadItems
  if (effectiveItems.length === 0) {
    throw new ServiceError('ORDER_PLACE_EMPTY_CART', 'Cannot place order with an empty cart.', 400)
  }

  const fullName = payload.contact?.fullName?.trim() ?? ''
  const phone = payload.contact?.phone?.trim() ?? ''
  if (!fullName || !phone) {
    throw new ServiceError('ORDER_PLACE_INVALID_CONTACT', 'Full name and phone are required.', 400)
  }

  const cmsResult = await cmsProvider.getHome()
  const checkoutConfig = cmsResult.ok ? cmsResult.data.identity?.customer?.checkout : undefined
  const loyaltyRules = cmsResult.ok ? cmsResult.data.identity?.customer?.loyalty : undefined
  const deliveryEnabled = checkoutConfig?.fulfillment?.deliveryEnabled !== false
  const pickupEnabled = checkoutConfig?.fulfillment?.branchPickupEnabled !== false
  const fulfillmentMode = payload.fulfillment?.mode ?? (deliveryEnabled ? 'delivery' : 'pickup')

  if (fulfillmentMode === 'delivery' && !deliveryEnabled) {
    throw new ServiceError('ORDER_PLACE_DELIVERY_DISABLED', 'Delivery is currently unavailable.', 400)
  }
  if (fulfillmentMode === 'pickup' && !pickupEnabled) {
    throw new ServiceError('ORDER_PLACE_PICKUP_DISABLED', 'Branch pickup is currently unavailable.', 400)
  }

  if (fulfillmentMode === 'delivery') {
    const city = payload.address?.city?.trim() ?? ''
    const area = payload.address?.area?.trim() ?? ''
    const building = payload.address?.building?.trim() ?? ''
    const saveAsNew = payload.addressBook?.saveAsNew === true
    const requestedLabel = payload.addressBook?.label?.trim() ?? ''
    if (!city || !area || !building) {
      throw new ServiceError('ORDER_PLACE_INVALID_ADDRESS', 'City, area, and building are required for delivery.', 400)
    }

    const addressesResult = await accountProvider.listAddresses(session.userId)
    if (!addressesResult.ok) {
      throw new ServiceError(addressesResult.error.code, addressesResult.error.message, 500)
    }

    const ensureDefaultAddress = async (addressId: string) => {
      const setDefaultResult = await accountProvider.setDefaultAddress(session.userId, addressId)
      if (!setDefaultResult.ok) {
        throw new ServiceError(setDefaultResult.error.code, setDefaultResult.error.message, 500)
      }
    }

    if (saveAsNew) {
      const createAddressResult = await accountProvider.createAddress(session.userId, {
        label:
          requestedLabel || (addressesResult.data.length === 0 ? 'Home' : `Address ${addressesResult.data.length + 1}`),
        city,
        area,
        building,
        floor: payload.address?.floor,
        apartment: payload.address?.apartment,
      })
      if (!createAddressResult.ok) {
        throw new ServiceError(createAddressResult.error.code, createAddressResult.error.message, 500)
      }
      const createdAddress = createAddressResult.data.find((address) =>
        isSameAddress(address, {
          city,
          area,
          building,
          floor: payload.address?.floor,
          apartment: payload.address?.apartment,
        }),
      )
      if (createdAddress) {
        await ensureDefaultAddress(createdAddress.id)
      }
    } else {
      const matchedAddress = addressesResult.data.find((address) =>
        isSameAddress(address, {
          city,
          area,
          building,
          floor: payload.address?.floor,
          apartment: payload.address?.apartment,
        }),
      )

      if (matchedAddress) {
        if (!matchedAddress.isDefault) {
          await ensureDefaultAddress(matchedAddress.id)
        }
      } else {
        const createAddressResult = await accountProvider.createAddress(session.userId, {
          label:
            requestedLabel ||
            (addressesResult.data.length === 0 ? 'Home' : `Address ${addressesResult.data.length + 1}`),
          city,
          area,
          building,
          floor: payload.address?.floor,
          apartment: payload.address?.apartment,
        })
        if (!createAddressResult.ok) {
          throw new ServiceError(createAddressResult.error.code, createAddressResult.error.message, 500)
        }
        const createdAddress = createAddressResult.data.find((address) =>
          isSameAddress(address, {
            city,
            area,
            building,
            floor: payload.address?.floor,
            apartment: payload.address?.apartment,
          }),
        )
        if (createdAddress) {
          await ensureDefaultAddress(createdAddress.id)
        }
      }
    }
  }

  const codEnabled = checkoutConfig?.paymentMethods?.codEnabled !== false
  const cardOnDeliveryEnabled = checkoutConfig?.paymentMethods?.cardOnDeliveryEnabled !== false
  const onlineCardEnabled = checkoutConfig?.paymentMethods?.onlineCardEnabled !== false

  const selectedMethod = payload.payment?.method
  if (!selectedMethod) {
    throw new ServiceError('ORDER_PLACE_PAYMENT_REQUIRED', 'Please select a payment method.', 400)
  }

  if (fulfillmentMode === 'delivery') {
    const allowedDeliveryMethods = new Set<string>()
    if (codEnabled) allowedDeliveryMethods.add('cod')
    if (cardOnDeliveryEnabled) allowedDeliveryMethods.add('card_on_delivery')
    if (onlineCardEnabled) allowedDeliveryMethods.add('online_card')

    if (!allowedDeliveryMethods.has(selectedMethod)) {
      throw new ServiceError('ORDER_PLACE_PAYMENT_NOT_ALLOWED', 'Selected payment method is unavailable for delivery.', 400)
    }
  }

  if (fulfillmentMode === 'pickup') {
    const branchId = payload.fulfillment?.branchId
    if (!branchId) {
      throw new ServiceError('ORDER_PLACE_BRANCH_REQUIRED', 'Please select a pickup branch.', 400)
    }

    const allBranches = checkoutConfig?.branches ?? []
    const selectedBranch = allBranches.find((branch) => branch.id === branchId)
    if (!selectedBranch) {
      throw new ServiceError('ORDER_PLACE_BRANCH_NOT_FOUND', 'Selected pickup branch was not found.', 400)
    }
    if (selectedBranch.stockCount <= 0) {
      throw new ServiceError('ORDER_PLACE_BRANCH_OUT_OF_STOCK', 'Selected pickup branch is out of stock.', 400)
    }

    const allowPayAtBranch = selectedBranch.payAtBranchEnabled !== false
    const allowPayNow = selectedBranch.payNowEnabled !== false
    const pickupAllowedMethods = new Set<string>()
    if (allowPayAtBranch) pickupAllowedMethods.add('pay_at_branch')
    if (allowPayNow && onlineCardEnabled) pickupAllowedMethods.add('online_card')

    if (!pickupAllowedMethods.has(selectedMethod)) {
      throw new ServiceError(
        'ORDER_PLACE_PAYMENT_NOT_ALLOWED',
        'Selected payment method is unavailable for this branch pickup.',
        400,
      )
    }
  }

  const productsResult = await productProvider.list()
  if (!productsResult.ok) {
    throw new ServiceError(productsResult.error.code, productsResult.error.message, 500)
  }

  const couponCode = normalizeCouponCode(payload.couponCode)
  const shippingBaseline = fulfillmentMode === 'delivery' ? 5 : 0
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
    throw new ServiceError('CHECKOUT_QUOTE_NO_VALID_LINES', 'No valid checkout lines found.', 400)
  }

  const hashLines = pricedLines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    baseUnitPrice: line.price,
    currency: line.currency,
  }))

  if (!hasSingleCurrency(hashLines)) {
    console.warn('[checkout-place-order]', { event: 'currency_mismatch', userId: session.userId })
    throw new ServiceError('CHECKOUT_CURRENCY_MISMATCH', 'Mixed currencies are not supported in checkout.', 400)
  }

  const quoteResult = await promotionProvider.getQuote(pricingQuoteId)
  if (!quoteResult.ok) {
    console.warn('[checkout-place-order]', {
      event: 'quote_lookup_failed',
      userId: session.userId,
      code: quoteResult.error.code,
    })
    throw new ServiceError(quoteResult.error.code, quoteResult.error.message, 500)
  }
  const quote = quoteResult.data
  if (!quote) {
    console.warn('[checkout-place-order]', { event: 'quote_not_found', userId: session.userId, pricingQuoteId })
    throw new ServiceError('CHECKOUT_QUOTE_NOT_FOUND', 'Checkout quote not found.', 400)
  }
  if (quote.userId && quote.userId !== session.userId) {
    console.warn('[checkout-place-order]', { event: 'quote_wrong_owner', userId: session.userId, pricingQuoteId })
    throw new ServiceError('CHECKOUT_QUOTE_NOT_FOUND', 'Checkout quote not found.', 400)
  }
  const nowIso = new Date().toISOString()
  if (isQuoteExpired(quote.expiresAt, nowIso)) {
    console.warn('[checkout-place-order]', { event: 'quote_expired', userId: session.userId, pricingQuoteId })
    throw new ServiceError('CHECKOUT_QUOTE_EXPIRED', 'Checkout quote expired. Please refresh checkout.', 400)
  }

  const calculatedHash = buildCartHash({
    items: hashLines,
    fulfillmentMode,
    branchId: fulfillmentMode === 'pickup' ? payload.fulfillment?.branchId : undefined,
    shippingBaseline,
    couponCode,
    referralCode: quote.quote.referral?.code,
  })
  if (calculatedHash !== quote.cartHash) {
    console.warn('[checkout-place-order]', { event: 'quote_mismatch', userId: session.userId, pricingQuoteId })
    throw new ServiceError('CHECKOUT_QUOTE_MISMATCH', 'Checkout quote mismatch. Please refresh checkout.', 400)
  }

  const promotionsResult = await promotionProvider.listActive(nowIso)
  if (!promotionsResult.ok) {
    throw new ServiceError(promotionsResult.error.code, promotionsResult.error.message, 500)
  }

  const promoTotals = passThroughPricingService.getCartTotals(pricedLines, {
    shipping: shippingBaseline,
    promotions: promotionsResult.data,
    couponCode,
    nowIso,
  })
  const subtotal = promoTotals.baseSubtotal

  const loyaltyResult = await accountProvider.applyOrderLoyalty(session.userId, session.role, {
    subtotal,
    currency: productsResult.data[0]?.currency || 'USD',
    redeemPercent: payload.loyalty?.redeemPercent,
    loyaltyRules,
  })
  if (!loyaltyResult.ok) {
    throw new ServiceError(loyaltyResult.error.code, loyaltyResult.error.message, 400)
  }

  const shipping = promoTotals.shipping
  const promoDiscount = promoTotals.discountTotal
  const loyaltyDiscount = loyaltyResult.data.discountValue
  const referralDiscount = quote.quote.referral?.followerDiscountAmount ?? 0
  const discount = promoDiscount + loyaltyDiscount + referralDiscount
  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100)

  if (cartItems.length > 0) {
    for (const line of cartItems) {
      const removed = await cartProvider.remove(line.productId)
      if (!removed.ok) {
        throw new ServiceError(removed.error.code, removed.error.message, 500)
      }
    }
  }

  const summaryItems = effectiveItems.flatMap((line) => {
    const product = productsResult.data.find((item) => item.id === line.productId)
    if (!product) {
      return []
    }
    const resolvedPrice = passThroughPricingService.getProductPrice(product, { quantity: line.quantity })
    const parts = splitProductName(product.name)
    return [{
      productId: product.id,
      brand: parts.brand,
      name: parts.name,
      quantity: line.quantity,
      price: resolvedPrice.unitPrice,
      currency: product.currency,
      imageUrl: product.image,
    }]
  })

  const summary: Order = {
    id: `ord-${session.userId}-${Date.now()}`,
    ownerUserId: session.userId,
    status: 'placed' as const,
    total,
    currency: productsResult.data[0]?.currency || 'USD',
    createdAt: new Date().toISOString(),
    pricing: {
      subtotal: Math.round(subtotal * 100) / 100,
      delivery: shipping,
      discount: Math.round(discount * 100) / 100,
    },
    fulfillment: {
      mode: fulfillmentMode,
      paymentMethod: selectedMethod,
      addressLine:
        fulfillmentMode === 'delivery'
          ? [payload.address?.city, payload.address?.area, payload.address?.building]
              .filter((value) => Boolean(value && value.trim()))
              .join(', ')
          : undefined,
      branchName:
        fulfillmentMode === 'pickup'
          ? checkoutConfig?.branches?.find((branch) => branch.id === payload.fulfillment?.branchId)?.name?.en
          : undefined,
    },
    items: summaryItems,
  }

  const paymentResult = await paymentProvider.createIntent(
    {
      orderId: summary.id,
      customerUserId: session.userId,
      method: selectedMethod,
      amount: summary.total,
      currency: summary.currency,
      returnUrl: `${new URL(request.url).origin}/api/payments/custom/return?orderId=${encodeURIComponent(summary.id)}`,
      cancelUrl: `${new URL(request.url).origin}/api/payments/custom/cancel?orderId=${encodeURIComponent(summary.id)}`,
      idempotencyKey: `${pricingQuoteId}:${session.userId}:${selectedMethod}`,
    },
    createProviderContext({ storeId: 'default' }),
  )
  if (!paymentResult.ok) {
    throw new ServiceError(paymentResult.error.code, paymentResult.error.message, 502)
  }

  const paymentIntent: PaymentProviderIntent = paymentResult.data
  summary.paymentSettlement =
    paymentIntent.settlement ??
    {
      settlementId: paymentIntent.id,
      provider: paymentIntent.provider === 'custom_gateway' ? 'payment_gateway' : 'mock',
      status:
        paymentIntent.status === 'captured'
          ? 'captured'
          : paymentIntent.status === 'authorized'
            ? 'authorized'
            : paymentIntent.status === 'failed' || paymentIntent.status === 'cancelled'
              ? 'failed'
              : paymentIntent.method === 'cod' || paymentIntent.method === 'pay_at_branch'
                ? 'not_started'
                : 'pending',
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      rawReference: paymentIntent.paymentUrl ?? paymentIntent.clientToken ?? paymentIntent.provider,
    }
  summary.paymentAction = {
    status: paymentIntent.status,
    paymentUrl: paymentIntent.paymentUrl,
    clientToken: paymentIntent.clientToken,
    expiresAt: paymentIntent.expiresAt,
  }

  if (!orderProvider.place) {
    throw new ServiceError('ORDER_PLACE_UNSUPPORTED', 'Order placement is not supported by the active provider.', 500)
  }

  if (!summary.fulfillment) {
    throw new ServiceError('ORDER_PLACE_INVALID_FULFILLMENT', 'Order fulfillment details are required.', 500)
  }

  const placedOrderResult = await orderProvider.place({
    pricingQuoteId,
    customerUserId: session.userId,
    fulfillment: summary.fulfillment,
    referralCode: quote.quote.referral?.code,
    order: summary,
  })
  if (!placedOrderResult.ok) {
    throw new ServiceError(placedOrderResult.error.code, placedOrderResult.error.message, 500)
  }
  const placedOrder = placedOrderResult.data

  if (quote.quote.referral) {
    await createReferralLedgerEntry({
      storeId: 'default',
      profileId: quote.quote.referral.profileId,
      referredUserId: session.userId,
      orderId: placedOrder.id,
      code: quote.quote.referral.code,
      status: 'pending',
      currency: placedOrder.currency,
      subtotal: Math.round(subtotal * 100) / 100,
      followerRewardValue: quote.quote.referral.followerDiscountAmount,
      influencerRewardValue: quote.quote.referral.influencerRewardValue,
    })
  }

  return placedOrder
}
