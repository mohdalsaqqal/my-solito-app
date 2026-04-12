import test from 'node:test'
import assert from 'node:assert/strict'
import { requireTrustedMutationRequest } from './request-auth'

test('requireTrustedMutationRequest blocks cross-site browser mutation requests', () => {
  const request = new Request('http://localhost/api/account/addresses', {
    method: 'POST',
    headers: {
      origin: 'https://evil.example',
      'sec-fetch-site': 'cross-site',
    },
  })

  const result = requireTrustedMutationRequest(request)
  assert.ok(result instanceof Response)
  assert.equal(result.status, 403)
})

test('requireTrustedMutationRequest allows same-origin browser mutations', () => {
  const request = new Request('http://localhost/api/account/addresses', {
    method: 'POST',
    headers: {
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
    },
  })

  const result = requireTrustedMutationRequest(request)
  assert.equal(result, null)
})

test('requireTrustedMutationRequest blocks browser-like mutations without provenance headers', async () => {
  const request = new Request('http://localhost/api/account/addresses', {
    method: 'POST',
  })

  const result = requireTrustedMutationRequest(request)
  assert.ok(result instanceof Response)
  assert.equal(result.status, 403)
  assert.equal((await result.json()).error.code, 'AUTH_UNTRUSTED_REQUEST')
})

test('requireTrustedMutationRequest allows same-origin referer fallback when fetch metadata is present', () => {
  const request = new Request('http://localhost/api/account/addresses', {
    method: 'POST',
    headers: {
      referer: 'http://localhost/account',
      'sec-fetch-site': 'same-origin',
    },
  })

  const result = requireTrustedMutationRequest(request)
  assert.equal(result, null)
})

test('requireTrustedMutationRequest allows bypass header for machine clients', () => {
  const request = new Request('http://localhost/api/payments/networks/webhook', {
    method: 'POST',
    headers: {
      'x-rc-trusted-request': '1',
    },
  })

  const result = requireTrustedMutationRequest(request)
  assert.equal(result, null)
})
