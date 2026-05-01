import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  PaymentProvider,
  PaymentProviderIntent,
  PaymentProviderIntentStatus,
  PaymentProviderWebhookResult,
  PaymentSettlementStatus,
} from '@real/providers/contracts'

export type CustomPaymentConfig = {
  baseUrl: string
  apiKey: string
  webhookSecret?: string
  providerName?: string
}

type CustomPaymentIntentResponse = {
  id?: string
  sessionId?: string
  status?: string
  paymentUrl?: string
  payment_url?: string
  clientToken?: string
  client_token?: string
  expiresAt?: string
  expires_at?: string
  settlementId?: string
  settlement_id?: string
  rawReference?: string
  reference?: string
}

type CustomPaymentWebhookPayload = {
  event?: string
  type?: string
  orderId?: string
  order_id?: string
  intentId?: string
  intent_id?: string
  id?: string
  sessionId?: string
  session_id?: string
  status?: string
  amount?: number
  currency?: string
  settlementId?: string
  settlement_id?: string
  reference?: string
  rawReference?: string
  capturedAt?: string
  captured_at?: string
}

function normalizeIntentStatus(status?: string): PaymentProviderIntentStatus {
  switch (status) {
    case 'not_required':
    case 'pending':
    case 'requires_action':
    case 'authorized':
    case 'captured':
    case 'failed':
    case 'cancelled':
      return status
    case 'requires_payment':
    case 'requires_redirect':
      return 'requires_action'
    case 'paid':
    case 'succeeded':
      return 'captured'
    default:
      return 'pending'
  }
}

function normalizeSettlementStatus(status: PaymentProviderIntentStatus): PaymentSettlementStatus {
  if (status === 'captured') return 'captured'
  if (status === 'authorized') return 'authorized'
  if (status === 'failed' || status === 'cancelled') return 'failed'
  return 'pending'
}

function normalizeSignature(value: string) {
  return value.trim().replace(/^sha256=/i, '')
}

function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const received = normalizeSignature(signature)

  if (!received || received.length !== expected.length) {
    return false
  }

  try {
    const receivedBuffer = Buffer.from(received, 'hex')
    const expectedBuffer = Buffer.from(expected, 'hex')
    if (receivedBuffer.length !== expectedBuffer.length) {
      return false
    }
    return timingSafeEqual(receivedBuffer, expectedBuffer)
  } catch {
    return false
  }
}

function headerValue(headers: Record<string, string>, key: string) {
  const normalizedKey = key.toLowerCase()
  for (const [headerKey, value] of Object.entries(headers)) {
    if (headerKey.toLowerCase() === normalizedKey) {
      return value
    }
  }
  return undefined
}

function normalizeWebhookPayload(payload: CustomPaymentWebhookPayload): PaymentProviderWebhookResult {
  const status = normalizeIntentStatus(payload.status ?? payload.event ?? payload.type)
  const orderId = payload.orderId ?? payload.order_id
  const intentId = payload.intentId ?? payload.intent_id ?? payload.id ?? payload.sessionId ?? payload.session_id
  const settlementId = payload.settlementId ?? payload.settlement_id ?? payload.reference ?? intentId
  const amount = typeof payload.amount === 'number' ? payload.amount : 0
  const currency = payload.currency ?? 'USD'
  const settlementStatus = normalizeSettlementStatus(status)

  return {
    orderId,
    intentId,
    settlement:
      orderId && settlementId
        ? {
            settlementId,
            provider: 'payment_gateway',
            status: settlementStatus,
            amount,
            currency,
            capturedAt: settlementStatus === 'captured' ? payload.capturedAt ?? payload.captured_at ?? new Date().toISOString() : undefined,
            rawReference: payload.rawReference ?? payload.reference ?? payload.event ?? payload.type ?? 'custom_payment_webhook',
          }
        : undefined,
  }
}

export function createCustomPaymentAdapter(config: CustomPaymentConfig): PaymentProvider {
  const providerName = config.providerName ?? 'custom_gateway'

  return {
    async createIntent(input, context) {
      try {
        const response = await fetch(new URL('/payments/intents', config.baseUrl), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
            'Idempotency-Key': input.idempotencyKey,
          },
          body: JSON.stringify({
            tenantId: context.tenantId,
            storeId: context.storeId,
            orderId: input.orderId,
            customerUserId: input.customerUserId,
            method: input.method,
            amount: input.amount,
            currency: input.currency,
            returnUrl: input.returnUrl,
            cancelUrl: input.cancelUrl,
          }),
        })

        const data = (await response.json().catch(() => ({}))) as CustomPaymentIntentResponse
        if (!response.ok) {
          return {
            ok: false,
            error: {
              code: 'CUSTOM_PAYMENT_INTENT_FAILED',
              message: typeof data.rawReference === 'string' ? data.rawReference : 'Payment gateway rejected intent.',
            },
          }
        }

        const status = normalizeIntentStatus(data.status)
        const intentId = data.id ?? data.sessionId ?? input.idempotencyKey
        const intent: PaymentProviderIntent = {
          id: intentId,
          provider: 'custom_gateway',
          method: input.method,
          status,
          amount: input.amount,
          currency: input.currency,
          paymentUrl: data.paymentUrl ?? data.payment_url,
          clientToken: data.clientToken ?? data.client_token,
          expiresAt: data.expiresAt ?? data.expires_at,
          settlement: {
            settlementId: data.settlementId ?? data.settlement_id ?? intentId,
            provider: 'payment_gateway',
            status: normalizeSettlementStatus(status),
            amount: input.amount,
            currency: input.currency,
            rawReference: data.rawReference ?? data.reference ?? providerName,
          },
        }

        return { ok: true, data: intent }
      } catch (cause) {
        return {
          ok: false,
          error: {
            code: 'CUSTOM_PAYMENT_UNAVAILABLE',
            message: cause instanceof Error ? cause.message : 'Payment gateway is unavailable.',
          },
        }
      }
    },

    async health(context) {
      void context

      return {
        ok: true,
        data: {
          configured: true,
          provider: providerName,
        },
      }
    },

    async handleWebhook(input, context) {
      void context

      if (!config.webhookSecret) {
        return {
          ok: false,
          error: {
            code: 'CUSTOM_PAYMENT_WEBHOOK_SECRET_MISSING',
            message: 'Custom payment webhook secret is not configured.',
          },
        }
      }

      const signature =
        headerValue(input.headers, 'x-custom-payment-signature') ??
        headerValue(input.headers, 'x-payment-signature') ??
        headerValue(input.headers, 'x-signature')

      if (!signature || !verifyWebhookSignature(input.rawBody, signature, config.webhookSecret)) {
        return {
          ok: false,
          error: {
            code: 'CUSTOM_PAYMENT_WEBHOOK_SIGNATURE_INVALID',
            message: 'Invalid custom payment webhook signature.',
          },
        }
      }

      try {
        return {
          ok: true,
          data: normalizeWebhookPayload(JSON.parse(input.rawBody) as CustomPaymentWebhookPayload),
        }
      } catch {
        return {
          ok: false,
          error: {
            code: 'CUSTOM_PAYMENT_WEBHOOK_INVALID',
            message: 'Invalid custom payment webhook payload.',
          },
        }
      }
    },
  }
}

export function createCustomPaymentAdapterFromEnv() {
  const baseUrl = process.env.CUSTOM_PAYMENT_BASE_URL
  const apiKey = process.env.CUSTOM_PAYMENT_API_KEY

  if (!baseUrl || !apiKey) {
    return null
  }

  return createCustomPaymentAdapter({
    baseUrl,
    apiKey,
    webhookSecret: process.env.CUSTOM_PAYMENT_WEBHOOK_SECRET,
    providerName: process.env.CUSTOM_PAYMENT_PROVIDER_NAME,
  })
}
