import { NetworksClient, NetworksWebhookPayload } from './client'
import { ProviderResult } from '@real/providers/contracts/types'
import { OrderProvider, OrderStatus, PaymentSettlementRecord } from '@real/providers/contracts'

export type WebhookResult = {
  ok: boolean
  orderId?: string
  newStatus?: OrderStatus
  error?: string
}

/**
 * Process a Networks payment webhook.
 *
 * The caller (route handler) should:
 * 1. Pass the raw request body and X-Networks-Signature header for verification
 * 2. Call this handler with the parsed payload and an OrderProvider to update
 *
 * Returns a WebhookResult indicating what action was taken.
 */
export async function handleNetworksWebhook(
  networks: NetworksClient,
  rawBody: string,
  signature: string,
  payload: NetworksWebhookPayload,
  orderProvider: OrderProvider
): Promise<ProviderResult<WebhookResult>> {
  // 1. Verify webhook signature
  if (!networks.verifyWebhook(rawBody, signature)) {
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
