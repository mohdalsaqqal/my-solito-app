import test from 'node:test'
import assert from 'node:assert/strict'
import { auth } from '../../../lib/auth'
import {
  buildCookieHeaderFromBetterAuthSetCookie,
  resolveNormalizedSessionFromHeaders,
  resolveNormalizedSessionFromRequest,
} from './auth-session-adapter.service'
import { buildAuthSessionCookieHeader } from '../../../app/api/_lib/auth-session'

test('resolveNormalizedSessionFromHeaders maps Better Auth identity into the repo session shape', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: {
      id: 'marketing-1',
      email: 'marketing@realcosmetics.local',
      name: 'Marketing Manager',
    },
    session: {
      id: 'session-1',
    },
  })) as typeof auth.api.getSession

  try {
    const result = await resolveNormalizedSessionFromHeaders(new Headers())

    assert.ok(result)
    assert.equal(result.userId, 'marketing-1')
    assert.equal(result.role, 'marketing')
    assert.equal(result.name, 'Marketing Manager')
  } finally {
    auth.api.getSession = original
  }
})

test('resolveNormalizedSessionFromRequest falls back to legacy cookies when Better Auth session is unavailable', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession

  try {
    const cookie = buildAuthSessionCookieHeader({
      userId: 'legacy-2',
      email: 'legacy@example.com',
      name: 'Legacy User',
      role: 'customer',
    })
    const request = new Request('http://localhost/api/account/overview', {
      headers: {
        cookie,
      },
    })

    const result = await resolveNormalizedSessionFromRequest(request)

    assert.ok(result)
    assert.equal(result.userId, 'legacy-2')
    assert.equal(result.role, 'customer')
  } finally {
    auth.api.getSession = original
  }
})

test('buildCookieHeaderFromBetterAuthSetCookie converts Set-Cookie into a request cookie header', async () => {
  const headers = await buildCookieHeaderFromBetterAuthSetCookie(
    'better-auth.session_token=abc123; Path=/; HttpOnly',
    new Headers({ origin: 'http://localhost:3000' }),
  )

  assert.equal(headers.get('cookie'), 'better-auth.session_token=abc123')
  assert.equal(headers.get('origin'), 'http://localhost:3000')
})
