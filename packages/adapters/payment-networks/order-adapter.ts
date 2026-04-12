import {
  OrderProvider,
  PaymentInitiationInput,
  PaymentInitiationResult,
  PaymentSettlementRecord,
  Order,
} from '@real/providers/contracts'
import { ProviderResult } from '@real/providers/contracts/types'
import { NetworksClient } from './client'

/**
 * Creates an OrderProvider that delegates payment operations to Networks.
 *
 * Note: This adapter ONLY handles payment initiation and confirmation.
 * Order CRUD (list, get, updateStatus, place) should come from a separate adapter
 * (e.g., Odoo ERP for orders, or a dedicated order adapter).
 *
 * For now, this adapter wraps another OrderProvider for non-payment operations.
 */
export function createNetworksOrderAdapter(
  networks: NetworksClient,
  delegate: OrderProvider  // the adapter that handles list/get/updateStatus/place
): OrderProvider {
  return {
    // Delegate non-payment operations
    async list() {
      return delegate.list()
    },
    async get(id: string) {
      return delegate.get(id)
    },
    async updateStatus(id: string, status) {
      return delegate.updateStatus(id, status)
    },
    async place(input) {
      const result = await delegate.place?.(input)
      return result ?? { ok: false, error: { code: 'PLACE_NOT_SUPPORTED', message: 'Place order not supported by delegate' } }
    },

    // Payment: use Networks gateway
    async initiatePayment(input: PaymentInitiationInput) {
      try {
        const response = await networks.initiatePayment({
          orderId: input.orderId,
          amount: input.amount,
          currency: input.currency,
          returnUrl: input.returnUrl,
        })

        if (!response.success) {
          return {
            ok: false,
            error: {
              code: response.error_code ?? 'PAYMENT_INIT_FAILED',
              message: response.error_message ?? 'Failed to initiate payment with Networks',
            },
          }
        }

        return {
          ok: true,
          data: {
            sessionId: response.payment_id,
            provider: 'payment_gateway' as const,
            status: response.status,
            paymentUrl: response.payment_url,
            clientToken: response.client_token,
            expiresAt: response.expires_at,
          },
        }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'NETWORKS_INITIATE_FAILED',
            message: err instanceof Error ? err.message : 'Failed to initiate payment with Networks',
          },
        }
      }
    },

    async confirmPaymentSettlement(orderId: string, settlement: PaymentSettlementRecord) {
      try {
        const response = await networks.capturePayment(settlement.settlementId, {
          amount: settlement.amount,
          currency: settlement.currency,
        })

        if (!response.success) {
          return {
            ok: false,
            error: {
              code: response.error_code ?? 'PAYMENT_CAPTURE_FAILED',
              message: response.error_message ?? 'Failed to capture payment',
            },
          }
        }

        // Update order status via delegate
        const orderResult = await delegate.updateStatus(orderId, 'placed')
        if (!orderResult.ok) {
          return orderResult
        }

        return {
          ok: true,
          data: {
            ...orderResult.data,
            paymentSettlement: {
              settlementId: response.settlement_id,
              provider: 'payment_gateway' as const,
              status: response.status === 'captured' ? 'captured' : response.status === 'failed' ? 'failed' : 'pending',
              amount: response.amount,
              currency: response.currency,
              capturedAt: response.captured_at,
              rawReference: response.reference,
            },
          },
        }
      } catch (err) {
        return {
          ok: false,
          error: {
            code: 'NETWORKS_SETTLEMENT_FAILED',
            message: err instanceof Error ? err.message : 'Failed to confirm payment settlement',
          },
        }
      }
    },
  }
}
