import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildRateLimitKey,
  MemoryRateLimitStore,
  RateLimiter,
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

test('RateLimiter accepts an injected store and prunes expired entries', () => {
  const limiter = new RateLimiter(
    {
      windowMs: 1,
      maxRequests: 1,
      prefix: 'test',
    },
    new MemoryRateLimitStore(),
  )

  const key = 'ip:127.0.0.1'
  const first = limiter.consume(key)
  assert.equal(first.allowed, true)
  const second = limiter.consume(key)
  assert.equal(second.allowed, false)
  assert.ok(limiter.prune() >= 0)
})
