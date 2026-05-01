import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCustomPaymentAdapter } from './index'

test('custom payment adapter validates webhook signature and normalizes settlement', async () => {
  const adapter = createCustomPaymentAdapter({
    baseUrl: 'https://payments.example.com',
    apiKey: 'secret',
    webhookSecret: 'webhook-secret',
  })
  const rawBody = JSON.stringify({
    orderId: 'ord-123',
    intentId: 'intent-123',
    status: 'paid',
    amount: 25,
    currency: 'USD',
    settlementId: 'settle-123',
    capturedAt: '2026-04-28T12:00:00.000Z',
  })
  const signature = createHmac('sha256', 'webhook-secret').update(rawBody).digest('hex')

  const result = await adapter.handleWebhook?.(
    {
      rawBody,
      headers: {
        'x-custom-payment-signature': `sha256=${signature}`,
      },
    },
    { tenantId: 'tenant-1', storeId: 'store-1' },
  )

  assert.equal(result?.ok, true)
  if (!result?.ok) return
  assert.equal(result.data.orderId, 'ord-123')
  assert.equal(result.data.intentId, 'intent-123')
  assert.equal(result.data.settlement?.settlementId, 'settle-123')
  assert.equal(result.data.settlement?.status, 'captured')
  assert.equal(result.data.settlement?.amount, 25)
  assert.equal(result.data.settlement?.currency, 'USD')
})

test('custom payment adapter rejects invalid webhook signature', async () => {
  const adapter = createCustomPaymentAdapter({
    baseUrl: 'https://payments.example.com',
    apiKey: 'secret',
    webhookSecret: 'webhook-secret',
  })

  const result = await adapter.handleWebhook?.(
    {
      rawBody: JSON.stringify({ orderId: 'ord-123' }),
      headers: {
        'x-custom-payment-signature': 'sha256=bad',
      },
    },
    { tenantId: 'tenant-1' },
  )

  assert.equal(result?.ok, false)
  if (result?.ok === false) {
    assert.equal(result.error.code, 'CUSTOM_PAYMENT_WEBHOOK_SIGNATURE_INVALID')
  }
})
