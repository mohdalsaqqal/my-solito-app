import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAuthSessionCookieHeader,
  getAuthSessionSecret,
  parseAuthSessionCookie,
  readAuthSessionCookieValue,
} from './auth-session'
import { withEnv } from './security-test-helpers'

const SAMPLE_SESSION = {
  userId: 'u-1',
  email: 'user@realcosmetics.local',
  name: 'User One',
  role: 'customer' as const,
}

test('getAuthSessionSecret requires explicit secret in release-like env', async () => {
  await withEnv(
    {
      AUTH_SESSION_SECRET: undefined,
      NODE_ENV: 'production',
      REQUIRE_PRODUCTION_AUTH: 'true',
    },
    () => {
      assert.equal(getAuthSessionSecret(), null)
    }
  )
})

test('buildAuthSessionCookieHeader includes secure attributes in production mode', async () => {
  await withEnv(
    {
      AUTH_SESSION_SECRET: 'test-secret',
      NODE_ENV: 'production',
      REQUIRE_PRODUCTION_AUTH: 'true',
    },
    () => {
      const cookie = buildAuthSessionCookieHeader(SAMPLE_SESSION)
      assert.match(cookie, /HttpOnly/)
      assert.match(cookie, /SameSite=Lax/)
      assert.match(cookie, /Path=\//)
      assert.match(cookie, /Max-Age=604800/)
      assert.match(cookie, /Secure/)
      assert.equal(cookie.includes(SAMPLE_SESSION.email), false)
      assert.equal(cookie.includes(SAMPLE_SESSION.name), false)
    }
  )
})

test('auth session cookie round-trips through encrypted payload parsing', async () => {
  await withEnv(
    {
      AUTH_SESSION_SECRET: 'test-secret',
      NODE_ENV: 'test',
      REQUIRE_PRODUCTION_AUTH: 'false',
    },
    () => {
      const cookie = buildAuthSessionCookieHeader(SAMPLE_SESSION)
      const cookieValue = readAuthSessionCookieValue(cookie)
      const parsed = parseAuthSessionCookie(cookieValue)

      assert.ok(parsed)
      assert.equal(parsed.userId, SAMPLE_SESSION.userId)
      assert.equal(parsed.email, SAMPLE_SESSION.email)
      assert.equal(parsed.name, SAMPLE_SESSION.name)
      assert.equal(parsed.role, SAMPLE_SESSION.role)
      assert.equal(typeof parsed.sessionId, 'string')
      assert.equal(typeof parsed.csrfToken, 'string')
    }
  )
})
