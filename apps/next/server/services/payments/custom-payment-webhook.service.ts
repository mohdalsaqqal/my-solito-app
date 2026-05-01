import { orderProvider, paymentProvider } from '@real/providers'
import { createProviderContext } from '../tenant/context'

export type CustomPaymentWebhookServiceResult =
  | { kind: 'not-configured' }
  | { kind: 'webhook-error'; message: string }
  | { kind: 'settlement-error'; message: string }
  | { kind: 'ok'; orderId?: string; intentId?: string; settlementRecorded: boolean }

function headersToRecord(headers: Headers) {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result[key] = value
  })
  return result
}

export async function processCustomPaymentWebhook(request: Request): Promise<CustomPaymentWebhookServiceResult> {
  if (!paymentProvider.handleWebhook) {
    return { kind: 'not-configured' }
  }

  const rawBody = await request.text()
  const result = await paymentProvider.handleWebhook(
    {
      rawBody,
      headers: headersToRecord(request.headers),
    },
    createProviderContext({ storeId: 'default' }),
  )

  if (!result.ok) {
    return {
      kind: 'webhook-error',
      message: result.error.message,
    }
  }

  const { orderId, intentId, settlement } = result.data
  if (orderId && settlement && orderProvider.confirmPaymentSettlement) {
    const settlementResult = await orderProvider.confirmPaymentSettlement(orderId, settlement)
    if (!settlementResult.ok) {
      return {
        kind: 'settlement-error',
        message: settlementResult.error.message,
      }
    }
    return { kind: 'ok', orderId, intentId, settlementRecorded: true }
  }

  return { kind: 'ok', orderId, intentId, settlementRecorded: false }
}
