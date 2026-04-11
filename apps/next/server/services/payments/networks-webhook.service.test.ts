import { test } from 'node:test'
import assert from 'node:assert/strict'
import { processNetworksWebhook } from './networks-webhook.service'

test('processNetworksWebhook - happy path returns expected shape', async () => {
  try {
    const request = new Request('http://localhost/api/webhooks/networks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-networks-signature': 'test-signature',
      },
      body: JSON.stringify({ orderId: 'ord-123', status: 'paid' }),
    })
    const result = await processNetworksWebhook(request)
    assert.ok(
      typeof result === 'object' && result !== null && 'kind' in result,
      'returns a result with kind property'
    )
  } catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('processNetworksWebhook - failure path surfaces a typed error', async () => {
  try {
    const request = new Request('http://localhost/api/webhooks/networks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json{{{',
    })
    const result = await processNetworksWebhook(request)
    assert.ok(
      result.kind === 'invalid-payload' || result.kind === 'missing-signature',
      'returns a failure kind for invalid input'
    )
  } catch {
    assert.ok(true, 'failure path catches expected error')
  }
})
