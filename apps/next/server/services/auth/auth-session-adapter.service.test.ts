import test from 'node:test'
import assert from 'node:assert/strict'
import { auth } from '../../../lib/auth'
import { prisma } from '../../lib/prisma'
import { resolveAppOwnedRoleForUser } from './auth-role-resolution.service'
import {
  buildCookieHeaderFromBetterAuthSetCookie,
  isBetterAuthIdentityAllowed,
  resolveNormalizedSessionFromHeaders,
  resolveNormalizedSessionFromRequest,
} from './auth-session-adapter.service'
import { buildAuthSessionCookieHeader } from '../../../app/api/_lib/auth-session'
import { withEnv } from '../../../app/api/_lib/security-test-helpers'

test('resolveNormalizedSessionFromHeaders denies unverified Better Auth identities in release mode', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      emailVerified: false,
    },
    session: {
      id: 'session-unverified',
    },
  })) as typeof auth.api.getSession

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'true',
        NODE_ENV: 'production',
      },
      async () => {
        const result = await resolveNormalizedSessionFromHeaders(new Headers())
        assert.equal(result, null)
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

test('resolveAppOwnedRoleForUser fails closed to customer on Prisma read failure in release mode', async () => {
  const original = auth.api.getSession
  const originalFindUnique = prisma.appAuthRoleMapping.findUnique
  auth.api.getSession = (async () => ({
    user: {
      id: 'admin-1',
      email: 'admin@realcosmetics.local',
      name: 'Admin User',
      emailVerified: true,
    },
    session: {
      id: 'session-admin',
    },
  })) as typeof auth.api.getSession
  prisma.appAuthRoleMapping.findUnique = (async () => {
    throw new Error('db unavailable')
  }) as unknown as typeof prisma.appAuthRoleMapping.findUnique

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'true',
        NODE_ENV: 'production',
      },
      async () => {
        const result = await resolveNormalizedSessionFromHeaders(new Headers())
        assert.ok(result)
        assert.equal(result.role, 'customer')
      },
    )
  } finally {
    auth.api.getSession = original
    prisma.appAuthRoleMapping.findUnique = originalFindUnique
  }
})

test('resolveAppOwnedRoleForUser does not upsert inferred roles in release mode when mapping is missing', async () => {
  const originalFindUnique = prisma.appAuthRoleMapping.findUnique
  const originalUpsert = prisma.appAuthRoleMapping.upsert
  let upsertCalled = false

  prisma.appAuthRoleMapping.findUnique = (async () => null) as unknown as typeof prisma.appAuthRoleMapping.findUnique
  prisma.appAuthRoleMapping.upsert = (async () => {
    upsertCalled = true
    throw new Error('upsert should not be called in release mode')
  }) as unknown as typeof prisma.appAuthRoleMapping.upsert

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'true',
        NODE_ENV: 'production',
      },
      async () => {
        const role = await resolveAppOwnedRoleForUser({
          id: 'admin-1',
          email: 'admin@realcosmetics.local',
        })

        assert.equal(role, 'customer')
        assert.equal(upsertCalled, false)
      },
    )
  } finally {
    prisma.appAuthRoleMapping.findUnique = originalFindUnique
    prisma.appAuthRoleMapping.upsert = originalUpsert
  }
})

test('resolveNormalizedSessionFromHeaders maps Better Auth identity into the repo session shape', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: {
      id: 'marketing-1',
      email: 'marketing@realcosmetics.local',
      name: 'Marketing Manager',
      emailVerified: true,
    },
    session: {
      id: 'session-1',
    },
  })) as typeof auth.api.getSession

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'false',
        NODE_ENV: 'development',
      },
      async () => {
        const result = await resolveNormalizedSessionFromHeaders(new Headers())

        assert.ok(result)
        assert.equal(result.userId, 'marketing-1')
        assert.equal(result.role, 'marketing')
        assert.equal(result.name, 'Marketing Manager')
      },
    )
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

    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'false',
        NODE_ENV: 'development',
      },
      async () => {
        const result = await resolveNormalizedSessionFromRequest(request)

        assert.ok(result)
        assert.equal(result.userId, 'legacy-2')
        assert.equal(result.role, 'customer')
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

test('resolveNormalizedSessionFromRequest rejects legacy cookies in release mode', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession

  try {
    const cookie = buildAuthSessionCookieHeader({
      userId: 'legacy-3',
      email: 'legacy@example.com',
      name: 'Legacy User',
      role: 'admin',
    })
    const request = new Request('http://localhost/api/account/overview', {
      headers: {
        cookie,
      },
    })

    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'true',
        NODE_ENV: 'production',
      },
      async () => {
        const result = await resolveNormalizedSessionFromRequest(request)
        assert.equal(result, null)
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

test('isBetterAuthIdentityAllowed allows unverified users outside release mode', async () => {
  await withEnv(
    {
      REQUIRE_PRODUCTION_AUTH: 'false',
      NODE_ENV: 'development',
    },
    async () => {
      assert.equal(
        isBetterAuthIdentityAllowed({
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          emailVerified: false,
        }),
        true,
      )
    },
  )
})

test('buildCookieHeaderFromBetterAuthSetCookie converts Set-Cookie into a request cookie header', async () => {
  const headers = await buildCookieHeaderFromBetterAuthSetCookie(
    'better-auth.session_token=abc123; Path=/; HttpOnly',
    new Headers({ origin: 'http://localhost:3000' }),
  )

  assert.equal(headers.get('cookie'), 'better-auth.session_token=abc123')
  assert.equal(headers.get('origin'), 'http://localhost:3000')
})
