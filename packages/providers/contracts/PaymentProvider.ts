import type { OrderPaymentMethod, PaymentSettlementRecord } from './OrderProvider'
import type { ProviderContext, ProviderResult } from './types'

export type PaymentProviderIntentStatus =
  | 'not_required'
  | 'pending'
  | 'requires_action'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'cancelled'

export type PaymentProviderIntentInput = {
  orderId: string
  customerUserId?: string
  method: OrderPaymentMethod
  amount: number
  currency: string
  returnUrl?: string
  cancelUrl?: string
  idempotencyKey: string
}

export type PaymentProviderIntent = {
  id: string
  provider: 'mock' | 'custom_gateway' | 'cod'
  method: OrderPaymentMethod
  status: PaymentProviderIntentStatus
  amount: number
  currency: string
  paymentUrl?: string
  clientToken?: string
  expiresAt?: string
  settlement?: PaymentSettlementRecord
}

export type PaymentProviderWebhookInput = {
  rawBody: string
  headers: Record<string, string>
}

export type PaymentProviderWebhookResult = {
  orderId?: string
  intentId?: string
  settlement?: PaymentSettlementRecord
}

export type PaymentProvider = {
  createIntent(
    input: PaymentProviderIntentInput,
    context: ProviderContext,
  ): Promise<ProviderResult<PaymentProviderIntent>>
  getIntent?(intentId: string, context: ProviderContext): Promise<ProviderResult<PaymentProviderIntent>>
  handleWebhook?(
    input: PaymentProviderWebhookInput,
    context: ProviderContext,
  ): Promise<ProviderResult<PaymentProviderWebhookResult>>
  health?(context: ProviderContext): Promise<ProviderResult<{ configured: boolean; provider: string }>>
}
