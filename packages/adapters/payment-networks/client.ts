import { HttpClient } from '../_shared/http-client'
import { createHmac, timingSafeEqual } from 'node:crypto'

export type NetworksConfig = {
  /** Networks API base URL, e.g. https://api.networks.sa */
  baseUrl: string
  /** Merchant API key */
  apiKey: string
  /** Merchant secret key for webhook verification */
  webhookSecret: string
  /** Merchant ID / terminal ID */
  merchantId: string
}

/**
 * Networks Payment Gateway client.
 *
 * Endpoints:
 * POST /v1/payments/initiate   — create payment intent
 * POST /v1/payments/{id}/capture — capture/confirm payment
 * GET  /v1/payments/{id}/status — check payment status
 * POST /v1/webhooks/verify     — verify webhook signature
 */
export class NetworksClient extends HttpClient {
  private webhookSecret: string
  private merchantId: string

  constructor(config: NetworksConfig) {
    super({
      baseUrl: config.baseUrl,
      auth: { type: 'bearer', token: config.apiKey },
    })
    this.webhookSecret = config.webhookSecret
    this.merchantId = config.merchantId
  }

  async initiatePayment(params: {
    orderId: string
    amount: number
    currency: string
    returnUrl?: string
    customerEmail?: string
    customerPhone?: string
    description?: string
  }) {
    return this.post<NetworksPaymentInitResponse>('/v1/payments/initiate', {
      merchant_id: this.merchantId,
      order_id: params.orderId,
      amount: params.amount,
      currency: params.currency,
      return_url: params.returnUrl,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      description: params.description ?? `Order ${params.orderId}`,
    })
  }

  async capturePayment(paymentId: string, params: {
    amount: number
    currency: string
  }) {
    return this.post<NetworksPaymentCaptureResponse>(`/v1/payments/${paymentId}/capture`, {
      merchant_id: this.merchantId,
      amount: params.amount,
      currency: params.currency,
    })
  }

  async getPaymentStatus(paymentId: string) {
    return this.get<NetworksPaymentStatusResponse>(`/v1/payments/${paymentId}/status`)
  }

  /**
   * Verify a webhook payload signature.
   * Networks sends a signature header: X-Networks-Signature
   * The signature is HMAC-SHA256 of the raw body using the webhook secret.
   */
  verifyWebhook(rawBody: string, signature: string): boolean {
    const expected = createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex')
    const signatureBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expected, 'utf8')
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }
    return timingSafeEqual(signatureBuffer, expectedBuffer)
  }
}

// ─── Networks API Response Types ─────────────────────────────────────────────

export type NetworksPaymentInitResponse = {
  success: boolean
  payment_id: string
  status: 'pending' | 'requires_action' | 'ready'
  payment_url?: string        // redirect URL for hosted payment page
  client_token?: string       // token for client-side SDK
  expires_at?: string         // ISO 8601
  error_code?: string
  error_message?: string
}

export type NetworksPaymentCaptureResponse = {
  success: boolean
  settlement_id: string
  status: 'captured' | 'failed' | 'refunded'
  amount: number
  currency: string
  captured_at?: string
  reference: string
  error_code?: string
  error_message?: string
}

export type NetworksPaymentStatusResponse = {
  payment_id: string
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'expired'
  amount: number
  currency: string
  created_at: string
  updated_at: string
  method: 'card' | 'apple_pay' | 'stc_pay' | 'mada'
  reference: string
}

// Webhook payload from Networks
export type NetworksWebhookPayload = {
  event: 'payment.captured' | 'payment.failed' | 'payment.refunded' | 'payment.authorized'
  payment_id: string
  order_id: string
  amount: number
  currency: string
  status: string
  reference: string
  timestamp: string
  metadata?: Record<string, unknown>
}
