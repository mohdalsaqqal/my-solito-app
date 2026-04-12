import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { NetworksClient } from '../client.ts'

function createClient(webhookSecret: string) {
  return new NetworksClient({
    baseUrl: 'https://api.networks.test',
    apiKey: 'test-key',
    webhookSecret,
    merchantId: 'merchant-1',
  })
}

describe('Networks webhook verification', () => {
  const webhookSecret = 'super_secret_key_123'
  const client = createClient(webhookSecret)

  it('accepts a valid HMAC-SHA256 signature', () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      payment_id: 'pay_123',
      order_id: 'ord_456',
    })
    const signature = createHmac('sha256', webhookSecret).update(payload).digest('hex')

    assert.equal(client.verifyWebhook(payload, signature), true)
  })

  it('rejects invalid signatures', () => {
    const payload = JSON.stringify({ event: 'payment.captured' })
    assert.equal(client.verifyWebhook(payload, 'invalid-signature'), false)
  })

  it('rejects tampered bodies', () => {
    const originalBody = JSON.stringify({ event: 'payment.captured', amount: 100 })
    const signature = createHmac('sha256', webhookSecret).update(originalBody).digest('hex')
    const tamperedBody = JSON.stringify({ event: 'payment.captured', amount: 999 })

    assert.equal(client.verifyWebhook(tamperedBody, signature), false)
  })

  it('rejects signatures generated from a different secret', () => {
    const payload = JSON.stringify({ event: 'payment.captured' })
    const signature = createHmac('sha256', 'wrong-secret').update(payload).digest('hex')

    assert.equal(client.verifyWebhook(payload, signature), false)
  })

  it('rejects empty signatures without throwing', () => {
    const payload = JSON.stringify({ event: 'payment.captured' })
    assert.equal(client.verifyWebhook(payload, ''), false)
  })

  it('rejects length-mismatched signatures without throwing', () => {
    const payload = JSON.stringify({ event: 'payment.captured' })
    assert.equal(client.verifyWebhook(payload, 'short'), false)
  })
})

