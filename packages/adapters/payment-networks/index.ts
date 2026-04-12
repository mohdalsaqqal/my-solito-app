import { OrderProvider } from '@real/providers/contracts'
import { NetworksClient } from './client'
import { createNetworksOrderAdapter } from './order-adapter'
import { handleNetworksWebhook } from './webhook-handler'

export type NetworksAdapters = {
  orderProvider: OrderProvider
  webhookHandler: typeof handleNetworksWebhook
  client: NetworksClient
}

/**
 * Create Networks payment adapters from environment variables.
 *
 * Required env vars:
 *   NETWORKS_BASE_URL      — e.g. https://api.networks.sa
 *   NETWORKS_API_KEY       — Merchant API key
 *   NETWORKS_WEBHOOK_SECRET — HMAC secret for webhook verification
 *   NETWORKS_MERCHANT_ID   — Merchant/terminal ID
 *
 * Returns null if env vars are not configured.
 */
export function createNetworksAdapters(
  delegateOrderProvider: OrderProvider
): NetworksAdapters | null {
  const baseUrl = process.env.NETWORKS_BASE_URL
  const apiKey = process.env.NETWORKS_API_KEY
  const webhookSecret = process.env.NETWORKS_WEBHOOK_SECRET
  const merchantId = process.env.NETWORKS_MERCHANT_ID

  if (!baseUrl || !apiKey || !webhookSecret || !merchantId) {
    return null
  }

  const client = new NetworksClient({
    baseUrl,
    apiKey,
    webhookSecret,
    merchantId,
  })

  const orderProvider = createNetworksOrderAdapter(client, delegateOrderProvider)

  return {
    orderProvider,
    webhookHandler: handleNetworksWebhook,
    client,
  }
}

export { NetworksClient } from './client'
export { handleNetworksWebhook } from './webhook-handler'
export type {
  NetworksPaymentInitResponse,
  NetworksPaymentCaptureResponse,
  NetworksPaymentStatusResponse,
  NetworksWebhookPayload,
  NetworksConfig,
} from './client'
