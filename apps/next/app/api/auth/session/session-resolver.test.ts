import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthSessionCookieHeader } from '../../_lib/auth-session'
import { withEnv } from '../../_lib/security-test-helpers'
import { resolveAuthSessionFromRequest } from './session-resolver'

test('resolveAuthSessionFromRequest reads the signed cookie session', async () => {
  await withEnv(
    {
      AUTH_SESSION_SECRET: 'test-auth-secret',
      REQUIRE_PRODUCTION_AUTH: 'false',
      NODE_ENV: 'development',
    },
    async () => {
      const setCookie = buildAuthSessionCookieHeader({
        userId: 'user-1',
        email: 'test.user@example.com',
        name: 'Test User',
        role: 'customer',
      })

      const request = new Request('http://localhost/api/auth/session', {
        headers: {
          cookie: setCookie,
        },
      })

      const session = await resolveAuthSessionFromRequest(request)

      assert.ok(session)
      assert.equal(session.userId, 'user-1')
      assert.equal(session.email, 'test.user@example.com')
      assert.equal(session.name, 'Test User')
      assert.equal(session.role, 'customer')
    },
  )
})

test('resolveAuthSessionFromRequest returns null when no auth cookie exists', async () => {
  const request = new Request('http://localhost/api/auth/session')

  assert.equal(await resolveAuthSessionFromRequest(request), null)
})
