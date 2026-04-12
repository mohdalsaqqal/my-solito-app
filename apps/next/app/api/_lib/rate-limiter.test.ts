import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildRateLimitKey,
  MemoryRateLimitStore,
  RateLimiter,
  buildRateLimitHeaders,
} from './rate-limiter'

test('buildRateLimitKey prefers explicit actor identity when present', () => {
  const request = new Request('http://internal.local/api/auth/login', {
    headers: {
      'x-forwarded-for': '203.0.113.10',
      'user-agent': 'test-agent',
    },
  })

  assert.equal(buildRateLimitKey(request, { actorId: 'u-123' }), 'actor:u-123')
})

test('buildRateLimitKey falls back to request fingerprint when proxy IP headers are missing', () => {
  const request = new Request('http://internal.local/api/auth/login', {
    headers: {
      'user-agent': 'agent-a',
      'accept-language': 'en-US',
      'sec-fetch-site': 'same-origin',
    },
  })

  const key = buildRateLimitKey(request)
  assert.match(key, /^fingerprint:/)
})

test('MemoryRateLimitStore tracks counts inside a window', async () => {
  const store = new MemoryRateLimitStore()
  const key = 'ip:127.0.0.1'
  const first = await store.consume(key, 60_000)
  assert.equal(first.count, 1)
  const second = await store.consume(key, 60_000)
  assert.equal(second.count, 2)
})

test('RateLimiter enforces the configured limit', async () => {
  const limiter = new RateLimiter({
    windowMs: 60_000,
    maxRequests: 1,
    prefix: `test-${Date.now()}`,
  })

  const key = 'ip:127.0.0.1'
  const first = await limiter.consume(key)
  assert.equal(first.allowed, true)
  const second = await limiter.consume(key)
  assert.equal(second.allowed, false)
  assert.match(buildRateLimitHeaders(second)['Retry-After'] ?? '', /^[0-9]+$/)
})
