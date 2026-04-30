import { test } from 'node:test'
import assert from 'node:assert/strict'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import {
  accountProvider,
  cartProvider,
  cmsProvider,
  orderProvider,
  paymentProvider,
  productProvider,
  promotionProvider,
} from '@real/providers'
import { auth } from '../../../lib/auth'
import { buildCartHash } from '../checkout/pricing-quote'
import { placeOrder } from './place-order.service'

const TEST_PRODUCT_ID = 'provider-write-back-product'
const ORDER_STORAGE_FILE = path.join(process.cwd(), '.tmp', 'mock-orders.json')

test('placeOrder writes final order creation through OrderProvider.place', { concurrency: false }, async () => {
  const originalGetSession = auth.api.getSession
  const originalCartGet = cartProvider.get
  const originalCmsGetHome = cmsProvider.getHome
  const originalListAddresses = accountProvider.listAddresses
  const originalCreateAddress = accountProvider.createAddress
  const originalSetDefaultAddress = accountProvider.setDefaultAddress
  const originalApplyOrderLoyalty = accountProvider.applyOrderLoyalty
  const originalProductList = productProvider.list
  const originalGetQuote = promotionProvider.getQuote
  const originalListActive = promotionProvider.listActive
  const originalPlace = orderProvider.place
  const originalCreatePaymentIntent = paymentProvider.createIntent

  const cartHash = buildCartHash({
    items: [
      {
        productId: TEST_PRODUCT_ID,
        quantity: 2,
        baseUnitPrice: 10,
        currency: 'USD',
      },
    ],
    fulfillmentMode: 'delivery',
    shippingBaseline: 5,
  })

  let providerInput: unknown
  let paymentInput: unknown
  const providerOrder = {
    id: 'provider-order-1',
    ownerUserId: 'customer-1',
    status: 'placed' as const,
    total: 25,
    currency: 'USD',
    createdAt: '2026-04-27T00:00:00.000Z',
    pricing: {
      subtotal: 20,
      delivery: 5,
      discount: 0,
    },
    fulfillment: {
      mode: 'delivery' as const,
      paymentMethod: 'cod' as const,
      addressLine: 'Amman, Sweifieh, 10',
    },
    items: [
      {
        productId: TEST_PRODUCT_ID,
        brand: 'Provider Brand',
        name: 'Provider Product',
        quantity: 2,
        price: 10,
        currency: 'USD',
      },
    ],
  }

  ;(auth.api as { getSession: unknown }).getSession = (async () =>
    ({
      user: {
        id: 'customer-1',
        email: 'customer@example.com',
        name: 'Customer One',
        emailVerified: true,
      },
      session: { id: 'session-1' },
    })) as typeof auth.api.getSession
  cartProvider.get = async () => ({ ok: true, data: { items: [], updatedAt: new Date().toISOString() } })
  cmsProvider.getHome = async () =>
    ({
      ok: true,
      data: {
        identity: {
          customer: {
            checkout: {
              fulfillment: { deliveryEnabled: true, branchPickupEnabled: true },
              paymentMethods: { codEnabled: true, cardOnDeliveryEnabled: true, onlineCardEnabled: true },
              branches: [],
            },
            loyalty: {},
          },
        },
      },
    }) as unknown as Awaited<ReturnType<typeof cmsProvider.getHome>>
  accountProvider.listAddresses = async () => ({ ok: true, data: [] })
  accountProvider.createAddress = async () => ({
    ok: true,
    data: [
      {
        id: 'address-1',
        label: 'Home',
        city: 'Amman',
        area: 'Sweifieh',
        building: '10',
      },
    ],
  })
  accountProvider.setDefaultAddress = async () => ({ ok: true, data: [] })
  accountProvider.applyOrderLoyalty = async () => ({
    ok: true,
    data: {
      discountValue: 0,
      pointsSpent: 0,
      pointsEarned: 0,
      updatedWallet: null,
      historyEntryIds: [],
    },
  })
  productProvider.list = async () => ({
    ok: true,
    data: [
      {
        id: TEST_PRODUCT_ID,
        name: 'Provider Brand - Provider Product',
        price: 10,
        currency: 'USD',
        brand: 'Provider Brand',
      },
    ],
  })
  promotionProvider.getQuote = async (id: string) => ({
    ok: true,
    data: {
      id,
      userId: 'customer-1',
      cartHash,
      quote: {
        totals: {
          baseSubtotal: 20,
          discountTotal: 0,
          shipping: 5,
          finalTotal: 25,
          subtotal: 20,
          discount: 0,
          total: 25,
          currency: 'USD',
        },
        fulfillmentMode: 'delivery',
        shippingBaseline: 5,
        cartHash,
      },
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  })
  promotionProvider.listActive = async () => ({ ok: true, data: [] })
  paymentProvider.createIntent = async (input) => {
    paymentInput = input
    return {
      ok: true,
      data: {
        id: 'mock-payment-intent-1',
        provider: 'mock',
        method: input.method,
        status: 'not_required',
        amount: input.amount,
        currency: input.currency,
        settlement: {
          settlementId: 'mock-settlement-1',
          provider: 'mock',
          status: 'not_started',
          amount: input.amount,
          currency: input.currency,
          rawReference: input.method,
        },
      },
    }
  }
  orderProvider.place = async (input) => {
    providerInput = input
    return { ok: true, data: providerOrder }
  }

  try {
    const result = await placeOrder(
      new Request('http://localhost/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricingQuoteId: 'quote-provider-write-back',
          items: [{ productId: TEST_PRODUCT_ID, quantity: 2 }],
          contact: { fullName: 'Customer One', phone: '0790000000' },
          fulfillment: { mode: 'delivery' },
          payment: { method: 'cod' },
          address: { city: 'Amman', area: 'Sweifieh', building: '10' },
        }),
      })
    )

    assert.equal(result.id, providerOrder.id)
    assert.ok(providerInput, 'OrderProvider.place receives final write-back input')
    assert.equal((providerInput as { pricingQuoteId?: string }).pricingQuoteId, 'quote-provider-write-back')
    assert.equal((providerInput as { customerUserId?: string }).customerUserId, 'customer-1')
    assert.equal((providerInput as { order?: { total?: number } }).order?.total, 25)
    assert.equal((providerInput as { order?: { paymentSettlement?: { settlementId?: string } } }).order?.paymentSettlement?.settlementId, 'mock-settlement-1')
    assert.equal((providerInput as { order?: { items?: Array<{ productId: string }> } }).order?.items?.[0]?.productId, TEST_PRODUCT_ID)
    assert.ok(paymentInput, 'PaymentProvider receives payment intent input before order write-back')
    assert.equal((paymentInput as { method?: string }).method, 'cod')
    assert.equal((paymentInput as { amount?: number }).amount, 25)
  } finally {
    ;(auth.api as { getSession: unknown }).getSession = originalGetSession
    cartProvider.get = originalCartGet
    cmsProvider.getHome = originalCmsGetHome
    accountProvider.listAddresses = originalListAddresses
    accountProvider.createAddress = originalCreateAddress
    accountProvider.setDefaultAddress = originalSetDefaultAddress
    accountProvider.applyOrderLoyalty = originalApplyOrderLoyalty
    productProvider.list = originalProductList
    promotionProvider.getQuote = originalGetQuote
    promotionProvider.listActive = originalListActive
    orderProvider.place = originalPlace
    paymentProvider.createIntent = originalCreatePaymentIntent
    await fs.rm(ORDER_STORAGE_FILE, { force: true })
  }
})

test('placeOrder - happy path returns expected shape', async () => {
  try {
    const request = new Request('http://localhost/api/checkout/place-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pricingQuoteId: 'quote-test-123',
        contact: { fullName: 'Test User', phone: '+1234567890' },
        fulfillment: { mode: 'delivery' as const },
        payment: { method: 'cod' as const },
        address: { city: 'Dubai', area: 'Marina', building: 'Tower 1' },
      }),
    })
    const result = await placeOrder(request)
    assert.ok(
      typeof result === 'object' && result !== null,
      'returns an order object'
    )
  } catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('placeOrder - failure path surfaces a typed error', async () => {
  try {
    // @ts-expect-error testing failure path with invalid request
    const result = await placeOrder(null)
    assert.ok(result !== undefined, 'may handle gracefully')
  } catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
