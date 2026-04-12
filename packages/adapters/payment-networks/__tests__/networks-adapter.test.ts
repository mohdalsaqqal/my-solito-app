/**
 * Networks Payment Adapter — Functionality Tests
 *
 * Tests payment initiation, confirmation, webhook handling, and delegate
 * order provider integration with mock HTTP responses.
 * Uses Node.js built-in test runner (node --test).
 *
 * Note: NetworksClient.verifyWebhook uses require('crypto') which is incompatible
 * with ESM. For webhook tests, we replicate the verification logic inline.
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import type { OrderProvider, Order, ProviderResult } from '@real/providers/contracts'

// ─── ESM-compatible webhook verification (replicates client.ts logic) ────────

function verifyWebhook(rawBody: string, signature: string, webhookSecret: string): boolean {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')
  if (signature.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

// ─── Replicate handleNetworksWebhook logic inline (avoids require('crypto')) ──

import type { NetworksWebhookPayload } from '../client.ts'
import { OrderStatus, PaymentSettlementRecord } from '@real/providers/contracts'

type WebhookResult = {
  ok: boolean
  orderId?: string
  newStatus?: OrderStatus
  error?: string
}

async function handleNetworksWebhookInline(
  rawBody: string,
  signature: string,
  webhookSecret: string,
  payload: NetworksWebhookPayload,
  orderProvider: OrderProvider
): Promise<ProviderResult<WebhookResult>> {
  // 1. Verify webhook signature
  if (!verifyWebhook(rawBody, signature, webhookSecret)) {
    return {
      ok: false,
      error: {
        code: 'WEBHOOK_INVALID_SIGNATURE',
        message: 'Webhook signature verification failed',
      },
    }
  }

  // 2. Map event to order status
  const statusMap: Record<string, OrderStatus | undefined> = {
    'payment.captured': 'placed',
    'payment.failed': 'cancelled',
    'payment.refunded': 'cancelled',
    'payment.authorized': 'placed',
  }

  const newStatus = statusMap[payload.event]
  if (!newStatus) {
    return {
      ok: true,
      data: { ok: true, orderId: payload.order_id },
    }
  }

  // 3. Update order status
  const result = await orderProvider.updateStatus(payload.order_id, newStatus)
  if (!result.ok) {
    return {
      ok: false,
      error: {
        code: 'WEBHOOK_ORDER_UPDATE_FAILED',
        message: `Failed to update order ${payload.order_id}: ${result.error.message}`,
      },
    }
  }

  // 4. Record payment settlement for captured payments
  if (payload.event === 'payment.captured') {
    const settlement: PaymentSettlementRecord = {
      settlementId: payload.reference,
      provider: 'payment_gateway',
      status: 'captured',
      amount: payload.amount,
      currency: payload.currency,
      capturedAt: payload.timestamp,
      rawReference: payload.reference,
    }

    await orderProvider.confirmPaymentSettlement?.(payload.order_id, settlement)
  }

  return {
    ok: true,
    data: {
      ok: true,
      orderId: payload.order_id,
      newStatus,
    },
  }
}

// ─── Mock NetworksClient for order adapter tests ─────────────────────────────

type MockNetworksResponse = {
  success: boolean
  payment_id?: string
  status?: string
  payment_url?: string
  client_token?: string
  expires_at?: string
  error_code?: string
  error_message?: string
  settlement_id?: string
  amount?: number
  currency?: string
  captured_at?: string
  reference?: string
}

class MockNetworksClient {
  private responses: Map<string, MockNetworksResponse> = new Map()
  private errors: Map<string, Error> = new Map()

  setResponse(path: string, data: MockNetworksResponse) {
    this.responses.set(path, data)
  }

  setError(path: string, error: Error) {
    this.errors.set(path, error)
  }

  async initiatePayment(params: {
    orderId: string
    amount: number
    currency: string
    returnUrl?: string
    customerEmail?: string
    customerPhone?: string
    description?: string
  }): Promise<MockNetworksResponse> {
    const path = '/v1/payments/initiate'
    const error = this.errors.get(path)
    if (error) throw error
    const data = this.responses.get(path)
    if (!data) {
      throw new Error(`No mock for ${path}`)
    }
    return data
  }

  async capturePayment(paymentId: string, params: { amount: number; currency: string }): Promise<MockNetworksResponse> {
    const path = `/v1/payments/${paymentId}/capture`
    const error = this.errors.get(path)
    if (error) throw error
    const data = this.responses.get(path)
    if (!data) {
      throw new Error(`No mock for ${path}`)
    }
    return data
  }

  async getPaymentStatus(paymentId: string) {
    return { payment_id: paymentId, status: 'captured' }
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    return verifyWebhook(rawBody, signature, 'test_webhook_secret')
  }
}

// ─── Import the actual order adapter ─────────────────────────────────────────

import { createNetworksOrderAdapter } from '../order-adapter.ts'

// ─── Mock Order Provider ─────────────────────────────────────────────────────

function createMockOrderProvider(overrides?: Partial<OrderProvider>): OrderProvider {
  const mockOrder: Order = {
    id: 'ord_001',
    status: 'placed',
    total: 150,
    currency: 'SAR',
    createdAt: '2026-04-05T10:00:00Z',
  }

  return {
    async list(): Promise<ProviderResult<Order[]>> {
      return overrides?.list?.() ?? { ok: true, data: [mockOrder] }
    },
    async get(id: string): Promise<ProviderResult<Order>> {
      if (overrides?.get) return overrides.get(id)
      return { ok: true, data: { ...mockOrder, id } }
    },
    async updateStatus(id: string, status: string): Promise<ProviderResult<Order>> {
      if (overrides?.updateStatus) return overrides.updateStatus(id, status as any)
      return { ok: true, data: { ...mockOrder, id, status: status as any } }
    },
    async place(input: any): Promise<ProviderResult<Order>> {
      if (overrides?.place) return overrides.place(input)
      return { ok: true, data: { ...mockOrder, id: 'ord_new' } }
    },
    async confirmPaymentSettlement(orderId: string, settlement: any): Promise<ProviderResult<Order>> {
      if (overrides?.confirmPaymentSettlement) return overrides.confirmPaymentSettlement(orderId, settlement)
      return { ok: true, data: { ...mockOrder, id: orderId, paymentSettlement: settlement } }
    },
    async initiatePayment(input: any): Promise<ProviderResult<any>> {
      if (overrides?.initiatePayment) return overrides.initiatePayment(input)
      return { ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented' } }
    },
    ...overrides,
  }
}

// ─── Payment Initiation Tests ────────────────────────────────────────────────

describe('Networks Order Adapter — initiatePayment', () => {
  it('returns correct PaymentInitiationResult shape on success', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/initiate', {
      success: true,
      payment_id: 'pay_test_123',
      status: 'pending',
      payment_url: 'https://checkout.networks.test/pay/pay_test_123',
      client_token: 'tok_abc123',
      expires_at: '2026-04-05T11:00:00Z',
    })

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.initiatePayment!({
      orderId: 'ord_001',
      amount: 150,
      currency: 'SAR',
      returnUrl: 'https://example.com/return',
    })

    assert.ok(result.ok)
    const data = (result as any).data
    assert.equal(data.sessionId, 'pay_test_123')
    assert.equal(data.provider, 'payment_gateway')
    assert.equal(data.status, 'pending')
    assert.equal(data.paymentUrl, 'https://checkout.networks.test/pay/pay_test_123')
    assert.equal(data.clientToken, 'tok_abc123')
    assert.equal(data.expiresAt, '2026-04-05T11:00:00Z')
  })

  it('returns ProviderResult failure when Networks returns success:false', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/initiate', {
      success: false,
      payment_id: '',
      status: 'failed',
      error_code: 'INSUFFICIENT_FUNDS',
      error_message: 'The payment method has insufficient funds.',
    })

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.initiatePayment!({
      orderId: 'ord_001',
      amount: 1000,
      currency: 'SAR',
    })

    assert.ok(!result.ok)
    if (!result.ok) {
      assert.equal(result.error.code, 'INSUFFICIENT_FUNDS')
      assert.equal(result.error.message, 'The payment method has insufficient funds.')
    }
  })

  it('returns ProviderResult failure on network error', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setError('/v1/payments/initiate', new Error('Connection refused'))

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.initiatePayment!({
      orderId: 'ord_001',
      amount: 100,
      currency: 'SAR',
    })

    assert.ok(!result.ok)
    if (!result.ok) {
      assert.equal(result.error.code, 'NETWORKS_INITIATE_FAILED')
    }
  })

  it('passes returnUrl to Networks API', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/initiate', {
      success: true,
      payment_id: 'pay_test_123',
      status: 'pending',
      payment_url: 'https://checkout.networks.test/pay/pay_test_123',
    })

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.initiatePayment!({
      orderId: 'ord_001',
      amount: 150,
      currency: 'SAR',
      returnUrl: 'https://shop.example.com/callback',
    })

    assert.ok(result.ok)
    assert.equal((result as any).data.sessionId, 'pay_test_123')
  })
})

// ─── Payment Settlement Tests ────────────────────────────────────────────────

describe('Networks Order Adapter — confirmPaymentSettlement', () => {
  it('captures payment and updates order status', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/pay_test_123/capture', {
      success: true,
      settlement_id: 'settle_456',
      status: 'captured',
      amount: 150,
      currency: 'SAR',
      captured_at: '2026-04-05T10:30:00Z',
      reference: 'ref_789',
    })

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.confirmPaymentSettlement!('ord_001', {
      settlementId: 'pay_test_123',
      provider: 'payment_gateway',
      status: 'authorized',
      amount: 150,
      currency: 'SAR',
    })

    assert.ok(result.ok)
    const data = (result as any).data
    assert.equal(data.paymentSettlement.settlementId, 'settle_456')
    assert.equal(data.paymentSettlement.status, 'captured')
    assert.equal(data.paymentSettlement.amount, 150)
    assert.equal(data.paymentSettlement.currency, 'SAR')
    assert.equal(data.paymentSettlement.capturedAt, '2026-04-05T10:30:00Z')
    assert.equal(data.paymentSettlement.rawReference, 'ref_789')
  })

  it('updates order status to placed via delegate', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/pay_test_123/capture', {
      success: true,
      settlement_id: 'settle_456',
      status: 'captured',
      amount: 150,
      currency: 'SAR',
      captured_at: '2026-04-05T10:30:00Z',
      reference: 'ref_789',
    })

    let updateStatusCalled = false
    let capturedStatus: string | undefined

    const delegate = createMockOrderProvider({
      async updateStatus(id: string, status: string) {
        updateStatusCalled = true
        capturedStatus = status
        return { ok: true, data: { id, status: status as any, total: 150, currency: 'SAR', createdAt: '2026-04-05T10:00:00Z' } }
      },
    })

    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    await adapter.confirmPaymentSettlement!('ord_001', {
      settlementId: 'pay_test_123',
      provider: 'payment_gateway',
      status: 'authorized',
      amount: 150,
      currency: 'SAR',
    })

    assert.equal(updateStatusCalled, true)
    assert.equal(capturedStatus, 'placed')
  })

  it('returns failure when Networks capture fails', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/pay_expired/capture', {
      success: false,
      settlement_id: '',
      status: 'failed',
      error_code: 'CAPTURE_ERROR',
      error_message: 'Payment authorization expired.',
      amount: 150,
      currency: 'SAR',
      reference: '',
    })

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.confirmPaymentSettlement!('ord_001', {
      settlementId: 'pay_expired',
      provider: 'payment_gateway',
      status: 'authorized',
      amount: 150,
      currency: 'SAR',
    })

    assert.ok(!result.ok)
    if (!result.ok) {
      assert.equal(result.error.code, 'CAPTURE_ERROR')
    }
  })

  it('returns failure when delegate updateStatus fails', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setResponse('/v1/payments/pay_test_123/capture', {
      success: true,
      settlement_id: 'settle_456',
      status: 'captured',
      amount: 150,
      currency: 'SAR',
      captured_at: '2026-04-05T10:30:00Z',
      reference: 'ref_789',
    })

    const delegate = createMockOrderProvider({
      async updateStatus() {
        return { ok: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order does not exist' } }
      },
    })
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.confirmPaymentSettlement!('ord_missing', {
      settlementId: 'pay_test_123',
      provider: 'payment_gateway',
      status: 'authorized',
      amount: 150,
      currency: 'SAR',
    })

    assert.ok(!result.ok)
    if (!result.ok) {
      assert.equal(result.error.code, 'ORDER_NOT_FOUND')
    }
  })

  it('returns failure on network error during capture', async () => {
    const mockClient = new MockNetworksClient()
    mockClient.setError('/v1/payments/pay_test_123/capture', new Error('Network timeout'))

    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.confirmPaymentSettlement!('ord_001', {
      settlementId: 'pay_test_123',
      provider: 'payment_gateway',
      status: 'authorized',
      amount: 150,
      currency: 'SAR',
    })

    assert.ok(!result.ok)
    if (!result.ok) {
      assert.equal(result.error.code, 'NETWORKS_SETTLEMENT_FAILED')
    }
  })
})

// ─── Delegate Order Provider Tests ───────────────────────────────────────────

describe('Networks Order Adapter — Delegate Operations', () => {
  it('delegates list() to the wrapped provider', async () => {
    const mockClient = new MockNetworksClient()
    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.list()
    assert.ok(result.ok)
    assert.equal(result.data.length, 1)
  })

  it('delegates get() to the wrapped provider', async () => {
    const mockClient = new MockNetworksClient()
    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.get('ord_001')
    assert.ok(result.ok)
    assert.equal((result as any).data.id, 'ord_001')
  })

  it('delegates updateStatus() to the wrapped provider', async () => {
    const mockClient = new MockNetworksClient()
    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.updateStatus('ord_001', 'shipped')
    assert.ok(result.ok)
    assert.equal((result as any).data.status, 'shipped')
  })

  it('delegates place() to the wrapped provider', async () => {
    const mockClient = new MockNetworksClient()
    const delegate = createMockOrderProvider()
    const adapter = createNetworksOrderAdapter(mockClient as any, delegate)

    const result = await adapter.place!({
      pricingQuoteId: 'quote_001',
      fulfillment: {
        mode: 'delivery',
        paymentMethod: 'cod',
      },
    })

    assert.ok(result.ok)
  })
})

// ─── Webhook Handler Tests ───────────────────────────────────────────────────

describe('Networks Webhook Handler', () => {
  const webhookSecret = 'test_webhook_secret'

  function signPayload(rawBody: string): string {
    return crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  }

  describe('signature verification', () => {
    it('rejects webhook with invalid signature', async () => {
      const delegate = createMockOrderProvider()
      const rawBody = JSON.stringify({
        event: 'payment.captured',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'captured',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      })

      const result = await handleNetworksWebhookInline(
        rawBody,
        'invalid_signature',
        webhookSecret,
        JSON.parse(rawBody),
        delegate
      )

      assert.ok(!result.ok)
      if (!result.ok) {
        assert.equal(result.error.code, 'WEBHOOK_INVALID_SIGNATURE')
      }
    })

    it('rejects webhook with empty signature', async () => {
      const delegate = createMockOrderProvider()
      const rawBody = JSON.stringify({ event: 'payment.captured', order_id: 'ord_001' })

      const result = await handleNetworksWebhookInline(
        rawBody,
        '',
        webhookSecret,
        JSON.parse(rawBody),
        delegate
      )

      assert.ok(!result.ok)
    })

    it('accepts webhook with valid signature', async () => {
      const delegate = createMockOrderProvider()
      const rawBody = JSON.stringify({
        event: 'payment.captured',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'captured',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      })
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(
        rawBody,
        signature,
        webhookSecret,
        JSON.parse(rawBody),
        delegate
      )

      assert.ok(result.ok)
    })
  })

  describe('event-to-status mapping', () => {
    it('maps payment.captured to placed status', async () => {
      let capturedStatus: string | undefined
      const delegate = createMockOrderProvider({
        async updateStatus(id: string, status: string) {
          capturedStatus = status
          return { ok: true, data: { id, status: status as any, total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.captured',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'captured',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.ok(result.ok)
      assert.equal((result as any).data.newStatus, 'placed')
      assert.equal(capturedStatus, 'placed')
    })

    it('maps payment.failed to cancelled status', async () => {
      let capturedStatus: string | undefined
      const delegate = createMockOrderProvider({
        async updateStatus(id: string, status: string) {
          capturedStatus = status
          return { ok: true, data: { id, status: status as any, total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.failed',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'failed',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.ok(result.ok)
      assert.equal((result as any).data.newStatus, 'cancelled')
      assert.equal(capturedStatus, 'cancelled')
    })

    it('maps payment.refunded to cancelled status', async () => {
      let capturedStatus: string | undefined
      const delegate = createMockOrderProvider({
        async updateStatus(id: string, status: string) {
          capturedStatus = status
          return { ok: true, data: { id, status: status as any, total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.refunded',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'refunded',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.ok(result.ok)
      assert.equal((result as any).data.newStatus, 'cancelled')
    })

    it('maps payment.authorized to placed status', async () => {
      let capturedStatus: string | undefined
      const delegate = createMockOrderProvider({
        async updateStatus(id: string, status: string) {
          capturedStatus = status
          return { ok: true, data: { id, status: status as any, total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.authorized',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'authorized',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.ok(result.ok)
      assert.equal((result as any).data.newStatus, 'placed')
    })
  })

  describe('settlement recording', () => {
    it('records settlement for payment.captured events', async () => {
      let settlementRecord: any
      const delegate = createMockOrderProvider({
        async updateStatus() {
          return { ok: true, data: { id: 'ord_001', status: 'placed', total: 150, currency: 'SAR', createdAt: 'now' } }
        },
        async confirmPaymentSettlement(orderId: string, settlement: any) {
          settlementRecord = settlement
          return { ok: true, data: { id: orderId, status: 'placed', total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.captured',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'captured',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.ok(settlementRecord !== undefined)
      assert.equal(settlementRecord.settlementId, 'ref_789')
      assert.equal(settlementRecord.provider, 'payment_gateway')
      assert.equal(settlementRecord.status, 'captured')
      assert.equal(settlementRecord.amount, 150)
      assert.equal(settlementRecord.currency, 'SAR')
      assert.equal(settlementRecord.capturedAt, '2026-04-05T10:30:00Z')
    })

    it('does NOT record settlement for payment.failed events', async () => {
      let settlementCalled = false
      const delegate = createMockOrderProvider({
        async updateStatus() {
          return { ok: true, data: { id: 'ord_001', status: 'cancelled', total: 150, currency: 'SAR', createdAt: 'now' } }
        },
        async confirmPaymentSettlement() {
          settlementCalled = true
          return { ok: true, data: { id: 'ord_001', status: 'cancelled', total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.failed',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'failed',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.equal(settlementCalled, false)
    })
  })

  describe('unknown event handling', () => {
    it('handles unknown webhook events gracefully without error', async () => {
      let updateStatusCalled = false
      const delegate = createMockOrderProvider({
        async updateStatus() {
          updateStatusCalled = true
          return { ok: true, data: { id: 'ord_001', status: 'placed', total: 150, currency: 'SAR', createdAt: 'now' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.disputed' as any,
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'disputed',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      // Unknown events should return ok but not update status
      assert.ok(result.ok)
      assert.equal(updateStatusCalled, false)
      // orderId should still be returned
      assert.equal((result as any).data.orderId, 'ord_001')
    })
  })

  describe('error propagation', () => {
    it('returns failure when orderProvider.updateStatus fails', async () => {
      const delegate = createMockOrderProvider({
        async updateStatus() {
          return { ok: false, error: { code: 'DB_ERROR', message: 'Database connection failed' } }
        },
      })

      const payload: NetworksWebhookPayload = {
        event: 'payment.captured',
        payment_id: 'pay_123',
        order_id: 'ord_001',
        amount: 150,
        currency: 'SAR',
        status: 'captured',
        reference: 'ref_789',
        timestamp: '2026-04-05T10:30:00Z',
      }
      const rawBody = JSON.stringify(payload)
      const signature = signPayload(rawBody)

      const result = await handleNetworksWebhookInline(rawBody, signature, webhookSecret, payload, delegate)

      assert.ok(!result.ok)
      if (!result.ok) {
        assert.equal(result.error.code, 'WEBHOOK_ORDER_UPDATE_FAILED')
        assert.ok(result.error.message.includes('ord_001'))
      }
    })
  })
})
