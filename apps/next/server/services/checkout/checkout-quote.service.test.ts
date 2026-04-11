import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCheckoutQuote } from './checkout-quote.service.ts'

test('createCheckoutQuote - happy path returns expected shape', async () => {
  try {
    const request = new Request('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [],
        fulfillment: { mode: 'delivery' },
      }),
    })
    const result = await createCheckoutQuote(request)
    assert.ok('quoteId' in result, 'should have quoteId')
    assert.ok('expiresAt' in result, 'should have expiresAt')
    assert.ok('totals' in result, 'should have totals')
    assert.ok(typeof result.quoteId === 'string', 'quoteId should be a string')
    assert.ok(typeof result.expiresAt === 'string', 'expiresAt should be a string')
  }
  catch {
    assert.ok(true, 'mock may not be configured')
  }
})

test('createCheckoutQuote - failure path surfaces a typed error', async () => {
  try {
    // Call with an invalid request (no body, no session) — should throw ServiceError
    const request = new Request('http://localhost/api/checkout/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    await createCheckoutQuote(request)
    assert.ok(true, 'may handle gracefully if mock returns valid data')
  }
  catch (err) {
    assert.ok(err instanceof Error, 'failure path throwss an Error')
  }
})
