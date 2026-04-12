import { handleNetworksPaymentWebhook } from '@real/providers'
import type { NetworksWebhookPayload } from '@real/providers'

export type NetworksWebhookServiceResult =
  | { kind: 'not-configured' }
  | { kind: 'missing-signature' }
  | { kind: 'invalid-payload' }
  | { kind: 'webhook-error'; message: string }
  | { kind: 'ok'; orderId?: string }

export async function processNetworksWebhook(request: Request): Promise<NetworksWebhookServiceResult> {
  const rawBody = await request.text()
  const signature = request.headers.get('x-networks-signature') ?? ''

  if (!signature) {
    return { kind: 'missing-signature' }
  }

  let payload: NetworksWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return { kind: 'invalid-payload' }
  }

  const result = await handleNetworksPaymentWebhook(rawBody, signature, payload)
  if (!result) {
    return { kind: 'not-configured' }
  }

  if (!result.ok) {
    return {
      kind: 'webhook-error',
      message: result.error.message,
    }
  }

  return {
    kind: 'ok',
    orderId: result.data.orderId,
  }
}
