import type {
  PaymentProvider,
  PaymentProviderIntent,
  PaymentProviderIntentInput,
} from '@real/providers/contracts'

function expiresAt(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

function buildIntent(input: PaymentProviderIntentInput): PaymentProviderIntent {
  const common = {
    id: `mock-pay-${input.idempotencyKey}`,
    method: input.method,
    amount: input.amount,
    currency: input.currency,
  }

  if (input.method === 'online_card') {
    return {
      ...common,
      provider: 'mock',
      status: 'requires_action',
      paymentUrl: `/checkout/mock-payment?intent=${encodeURIComponent(common.id)}`,
      clientToken: `mock-client-${input.orderId}`,
      expiresAt: expiresAt(15),
      settlement: {
        settlementId: `mock-settlement-${input.idempotencyKey}`,
        provider: 'mock',
        status: 'pending',
        amount: input.amount,
        currency: input.currency,
        rawReference: 'online_card',
      },
    }
  }

  return {
    ...common,
    provider: input.method === 'cod' ? 'cod' : 'mock',
    status: input.method === 'cod' || input.method === 'pay_at_branch' ? 'not_required' : 'authorized',
    settlement: {
      settlementId: `mock-settlement-${input.idempotencyKey}`,
      provider: 'mock',
      status: input.method === 'card_on_delivery' ? 'authorized' : 'not_started',
      amount: input.amount,
      currency: input.currency,
      rawReference: input.method,
    },
  }
}

export const mockPaymentAdapter: PaymentProvider = {
  async createIntent(input, context) {
    void context

    return {
      ok: true,
      data: buildIntent(input),
    }
  },

  async getIntent(intentId, context) {
    void context

    return {
      ok: true,
      data: {
        id: intentId,
        provider: 'mock',
        method: 'online_card',
        status: 'authorized',
        amount: 0,
        currency: 'USD',
      },
    }
  },

  async handleWebhook(input, context) {
    void context

    try {
      const payload = JSON.parse(input.rawBody) as {
        orderId?: string
        order_id?: string
        intentId?: string
        id?: string
        amount?: number
        currency?: string
        status?: string
        settlementId?: string
        settlement_id?: string
      }
      const orderId = payload.orderId ?? payload.order_id
      const intentId = payload.intentId ?? payload.id ?? payload.settlementId ?? payload.settlement_id
      const status = payload.status === 'failed' ? 'failed' : payload.status === 'authorized' ? 'authorized' : 'captured'

      return {
        ok: true,
        data: {
          orderId,
          intentId,
          settlement: orderId && intentId
            ? {
                settlementId: payload.settlementId ?? payload.settlement_id ?? intentId,
                provider: 'mock',
                status,
                amount: typeof payload.amount === 'number' ? payload.amount : 0,
                currency: typeof payload.currency === 'string' ? payload.currency : 'USD',
                capturedAt: status === 'captured' ? new Date().toISOString() : undefined,
                rawReference: 'mock-webhook',
              }
            : undefined,
        },
      }
    } catch {
      return {
        ok: false,
        error: {
          code: 'MOCK_PAYMENT_WEBHOOK_INVALID',
          message: 'Invalid payment webhook payload.',
        },
      }
    }
  },

  async health(context) {
    return {
      ok: true,
      data: {
        configured: true,
        provider: `mock-payment:${context.tenantId}`,
      },
    }
  },
}
