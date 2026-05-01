import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orderProvider, paymentProvider } from '@real/providers'
import { processCustomPaymentWebhook } from './custom-payment-webhook.service'

test('processCustomPaymentWebhook records provider settlement on matching order', async () => {
  const originalHandleWebhook = paymentProvider.handleWebhook
  const originalConfirmPaymentSettlement = orderProvider.confirmPaymentSettlement
  let recordedOrderId: string | undefined

  paymentProvider.handleWebhook = async () => ({
    ok: true,
    data: {
      orderId: 'ord-123',
      intentId: 'intent-123',
      settlement: {
        settlementId: 'settle-123',
        provider: 'payment_gateway',
        status: 'captured',
        amount: 19,
        currency: 'USD',
      },
    },
  })
  orderProvider.confirmPaymentSettlement = async (orderId, settlement) => {
    recordedOrderId = orderId
    return {
      ok: true,
      data: {
        id: orderId,
        status: 'placed',
        total: settlement.amount,
        currency: settlement.currency,
        createdAt: new Date().toISOString(),
        paymentSettlement: settlement,
      },
    }
  }

  try {
    const result = await processCustomPaymentWebhook(
      new Request('http://localhost/api/payments/custom/webhook', {
        method: 'POST',
        body: JSON.stringify({ orderId: 'ord-123' }),
      }),
    )

    assert.deepEqual(result, {
      kind: 'ok',
      orderId: 'ord-123',
      intentId: 'intent-123',
      settlementRecorded: true,
    })
    assert.equal(recordedOrderId, 'ord-123')
  } finally {
    paymentProvider.handleWebhook = originalHandleWebhook
    orderProvider.confirmPaymentSettlement = originalConfirmPaymentSettlement
  }
})

test('processCustomPaymentWebhook surfaces provider errors', async () => {
  const originalHandleWebhook = paymentProvider.handleWebhook
  paymentProvider.handleWebhook = async () => ({
    ok: false,
    error: {
      code: 'PAYMENT_WEBHOOK_INVALID',
      message: 'Invalid signature.',
    },
  })

  try {
    const result = await processCustomPaymentWebhook(
      new Request('http://localhost/api/payments/custom/webhook', {
        method: 'POST',
        body: '{}',
      }),
    )

    assert.deepEqual(result, {
      kind: 'webhook-error',
      message: 'Invalid signature.',
    })
  } finally {
    paymentProvider.handleWebhook = originalHandleWebhook
  }
})
