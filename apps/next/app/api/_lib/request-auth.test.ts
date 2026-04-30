import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAuthSessionCookieHeader } from './auth-session'
import { requireAuthSession, requireAdminDomainSession, requireTrustedMutationRequest } from './request-auth'
import { auth } from '../../../lib/auth'
import { withEnv } from './security-test-helpers'

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

test('requireTrustedMutationRequest rejects bare bypass header without configured secret', () => {
  const request = new Request('http://localhost/api/payments/networks/webhook', {
    method: 'POST',
    headers: {
      'x-rc-trusted-request': '1',
    },
  })

  const result = requireTrustedMutationRequest(request)
  assert.ok(result instanceof Response)
  assert.equal(result.status, 403)
})

test('requireTrustedMutationRequest allows bypass header for machine clients with matching secret', async () => {
  await withEnv(
    {
      TRUSTED_REQUEST_BYPASS_SECRET: 'machine-secret',
    },
    async () => {
      const request = new Request('http://localhost/api/payments/networks/webhook', {
        method: 'POST',
        headers: {
          'x-rc-trusted-request': 'machine-secret',
        },
      })

      const result = requireTrustedMutationRequest(request)
      assert.equal(result, null)
    },
  )
})

test('requireAuthSession prefers Better Auth-backed session resolution', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: {
      id: 'admin-1',
      email: 'admin@realcosmetics.local',
      name: 'Admin User',
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
        const request = new Request('http://localhost/api/admin/i18n/status')
        const result = await requireAuthSession(request)

        assert.ok(!(result instanceof Response))
        assert.equal(result.role, 'admin')
        assert.equal(result.email, 'admin@realcosmetics.local')
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

test('requireAuthSession falls back to legacy cookie when Better Auth session is absent', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession

  try {
    const cookie = buildAuthSessionCookieHeader({
      userId: 'legacy-1',
      email: 'legacy.user@example.com',
      name: 'Legacy User',
      role: 'customer',
    })
    const request = new Request('http://localhost/api/account/referral', {
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
        const result = await requireAuthSession(request)

        assert.ok(!(result instanceof Response))
        assert.equal(result.userId, 'legacy-1')
        assert.equal(result.role, 'customer')
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

test('requireAdminDomainSession keeps 403 permission checks after Better Auth identity resolution', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: {
      id: 'support-1',
      email: 'support@realcosmetics.local',
      name: 'Support User',
      emailVerified: true,
    },
    session: {
      id: 'session-2',
    },
  })) as typeof auth.api.getSession

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'false',
        NODE_ENV: 'development',
      },
      async () => {
        const request = new Request('http://localhost/api/admin/ops/audit')
        const result = await requireAdminDomainSession(request, 'operations')

        assert.ok(result instanceof Response)
        assert.equal(result.status, 403)
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

// ── T035: missing-role and invalid-session edge cases ─────────────────────────

test('requireAuthSession returns 401 when both Better Auth and legacy session are absent', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession

  try {
    const request = new Request('http://localhost/api/account/overview', {
      headers: {
        origin: 'http://localhost',
        'sec-fetch-site': 'same-origin',
      },
    })
    const result = await requireAuthSession(request)

    assert.ok(result instanceof Response)
    assert.equal(result.status, 401)
    assert.equal((await result.json()).error.code, 'AUTH_REQUIRED')
  } finally {
    auth.api.getSession = original
  }
})

test('requireAdminDomainSession returns 401 when no session exists at all', async () => {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession

  try {
    const request = new Request('http://localhost/api/admin/catalog/brands', {
      headers: {
        origin: 'http://localhost',
        'sec-fetch-site': 'same-origin',
      },
    })
    const result = await requireAdminDomainSession(request, 'catalog')

    assert.ok(result instanceof Response)
    assert.equal(result.status, 401)
  } finally {
    auth.api.getSession = original
  }
})

test('requireAdminDomainSession returns 403 when Better Auth resolves an unknown user (defaults to customer role)', async () => {
  const original = auth.api.getSession
  // Unknown email — resolveAppOwnedRoleForUser will fall back to 'customer' in test env
  auth.api.getSession = (async () => ({
    user: {
      id: 'unknown-99',
      email: 'unknown@external.example.com',
      name: 'Unknown User',
      emailVerified: true,
    },
    session: { id: 's-x' },
  })) as typeof auth.api.getSession

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'false',
        NODE_ENV: 'development',
      },
      async () => {
        const request = new Request('http://localhost/api/admin/catalog/brands', {
          headers: {
            origin: 'http://localhost',
            'sec-fetch-site': 'same-origin',
          },
        })
        const result = await requireAdminDomainSession(request, 'catalog')

        assert.ok(result instanceof Response)
        assert.equal(result.status, 403)
      },
    )
  } finally {
    auth.api.getSession = original
  }
})

test('requireAdminDomainSession full check returns 403 when role only has read permission', async () => {
  const original = auth.api.getSession
  // ops has read on catalog, not full
  auth.api.getSession = (async () => ({
    user: {
      id: 'ops-1',
      email: 'ops@realcosmetics.local',
      name: 'Ops User',
      emailVerified: true,
    },
    session: { id: 's-ops' },
  })) as typeof auth.api.getSession

  try {
    await withEnv(
      {
        REQUIRE_PRODUCTION_AUTH: 'false',
        NODE_ENV: 'development',
      },
      async () => {
        const request = new Request('http://localhost/api/admin/catalog/brands', {
          method: 'POST',
          headers: {
            origin: 'http://localhost',
            'sec-fetch-site': 'same-origin',
            'content-type': 'application/json',
          },
          body: '{}',
        })
        const result = await requireAdminDomainSession(request, 'catalog', 'full')

        assert.ok(result instanceof Response)
        assert.equal(result.status, 403)
      },
    )
  } finally {
    auth.api.getSession = original
  }
})
