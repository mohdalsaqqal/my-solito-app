// @ts-nocheck
/**
 * Protected admin/CMS route authorization regression tests.
 *
 * These tests verify that auth enforcement is preserved after the Better Auth
 * migration. They are NOT business-logic tests — they check that:
 *   1. Unauthenticated requests are rejected with 401.
 *   2. Authenticated requests with the wrong domain role are rejected with 403.
 *   3. Authenticated requests with the correct role are allowed through.
 *
 * Representative endpoints are chosen to cover each admin domain.
 */
process.env.REQUIRE_PRODUCTION_AUTH = 'false'

import test from 'node:test'
import assert from 'node:assert/strict'
import { auth } from '../../../lib/auth'
import { buildAuthSessionCookieHeader } from '../_lib/auth-session'

// ── GET /api/admin/catalog/brands ─────────────────────────────────────────────
import { GET as catalogBrandsGET } from './catalog/brands/route'

// ── GET /api/admin/cms/site-config ────────────────────────────────────────────
import { GET as siteConfigGET, PUT as siteConfigPUT } from './cms/site-config/route'

// ── GET /api/admin/ops/audit ──────────────────────────────────────────────────
import { GET as opsAuditGET } from './ops/audit/route'

// ── helpers ───────────────────────────────────────────────────────────────────

function makeRequest(url: string, opts?: RequestInit) {
  return new Request(`http://localhost${url}`, {
    method: 'GET',
    headers: {
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
      ...(opts?.headers as Record<string, string> ?? {}),
    },
    ...opts,
  })
}

function sessionCookie(email: string, role: string) {
  return buildAuthSessionCookieHeader({ userId: 'u-1', email, name: 'Test', role: role as never })
}

function withBetterAuth(email: string) {
  const original = auth.api.getSession
  auth.api.getSession = (async () => ({
    user: { id: 'u-1', email, name: 'Test' },
    session: { id: 's-1' },
  })) as typeof auth.api.getSession
  return () => { auth.api.getSession = original }
}

function withNoBetterAuth() {
  const original = auth.api.getSession
  auth.api.getSession = (async () => null) as typeof auth.api.getSession
  return () => { auth.api.getSession = original }
}

// ── catalog domain ────────────────────────────────────────────────────────────

test('GET /api/admin/catalog/brands — 401 when unauthenticated', async () => {
  const restore = withNoBetterAuth()
  try {
    const res = await catalogBrandsGET(makeRequest('/api/admin/catalog/brands'))
    assert.equal(res.status, 401)
  } finally {
    restore()
  }
})

test('GET /api/admin/catalog/brands — 403 when role lacks catalog access', async () => {
  const restore = withNoBetterAuth()
  try {
    // customer role — not an admin panel role at all
    const res = await catalogBrandsGET(
      makeRequest('/api/admin/catalog/brands', {
        headers: { cookie: sessionCookie('user@realcosmetics.local', 'customer'), origin: 'http://localhost', 'sec-fetch-site': 'same-origin' },
      })
    )
    assert.equal(res.status, 403)
  } finally {
    restore()
  }
})

test('GET /api/admin/catalog/brands — 200 when catalog role', async () => {
  const restore = withBetterAuth('catalog@realcosmetics.local')
  try {
    const res = await catalogBrandsGET(makeRequest('/api/admin/catalog/brands'))
    // 200 or 500 (store may not exist in test env) — not 401/403
    assert.ok(res.status !== 401 && res.status !== 403, `expected not 401/403, got ${res.status}`)
  } finally {
    restore()
  }
})

test('GET /api/admin/catalog/brands — 200 when admin role', async () => {
  const restore = withBetterAuth('admin@realcosmetics.local')
  try {
    const res = await catalogBrandsGET(makeRequest('/api/admin/catalog/brands'))
    assert.ok(res.status !== 401 && res.status !== 403, `expected not 401/403, got ${res.status}`)
  } finally {
    restore()
  }
})

// ── marketing/CMS domain ──────────────────────────────────────────────────────

test('GET /api/admin/cms/site-config — 401 when unauthenticated', async () => {
  const restore = withNoBetterAuth()
  try {
    const res = await siteConfigGET(makeRequest('/api/admin/cms/site-config'))
    assert.equal(res.status, 401)
  } finally {
    restore()
  }
})

test('GET /api/admin/cms/site-config — 403 when ops role (no marketing read per matrix is read)', async () => {
  // ops has 'read' on marketing domain — should be allowed for GET
  const restore = withBetterAuth('ops@realcosmetics.local')
  try {
    const res = await siteConfigGET(makeRequest('/api/admin/cms/site-config'))
    assert.ok(res.status !== 401 && res.status !== 403, `ops should have read on marketing, got ${res.status}`)
  } finally {
    restore()
  }
})

test('PUT /api/admin/cms/site-config — 403 when ops role (no full on marketing)', async () => {
  const restore = withBetterAuth('ops@realcosmetics.local')
  try {
    const res = await siteConfigPUT(
      makeRequest('/api/admin/cms/site-config', {
        method: 'PUT',
        body: JSON.stringify({ nameEn: 'Test' }),
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost',
          'sec-fetch-site': 'same-origin',
        },
      })
    )
    assert.equal(res.status, 403)
  } finally {
    restore()
  }
})

test('PUT /api/admin/cms/site-config — allowed when marketing role', async () => {
  const restore = withBetterAuth('marketing@realcosmetics.local')
  try {
    const res = await siteConfigPUT(
      makeRequest('/api/admin/cms/site-config', {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost',
          'sec-fetch-site': 'same-origin',
        },
      })
    )
    assert.ok(res.status !== 401 && res.status !== 403, `marketing should have full on marketing, got ${res.status}`)
  } finally {
    restore()
  }
})

// ── operations domain ─────────────────────────────────────────────────────────

test('GET /api/admin/ops/audit — 401 when unauthenticated', async () => {
  const restore = withNoBetterAuth()
  try {
    const res = await opsAuditGET(makeRequest('/api/admin/ops/audit'))
    assert.equal(res.status, 401)
  } finally {
    restore()
  }
})

test('GET /api/admin/ops/audit — 403 when marketing role (operations: none)', async () => {
  const restore = withBetterAuth('marketing@realcosmetics.local')
  try {
    const res = await opsAuditGET(makeRequest('/api/admin/ops/audit'))
    assert.equal(res.status, 403)
  } finally {
    restore()
  }
})

test('GET /api/admin/ops/audit — 403 when catalog role (operations: none)', async () => {
  const restore = withBetterAuth('catalog@realcosmetics.local')
  try {
    const res = await opsAuditGET(makeRequest('/api/admin/ops/audit'))
    assert.equal(res.status, 403)
  } finally {
    restore()
  }
})

test('GET /api/admin/ops/audit — allowed when ops role', async () => {
  const restore = withBetterAuth('ops@realcosmetics.local')
  try {
    const res = await opsAuditGET(makeRequest('/api/admin/ops/audit'))
    assert.ok(res.status !== 401 && res.status !== 403, `ops should have read on operations, got ${res.status}`)
  } finally {
    restore()
  }
})

test('GET /api/admin/ops/audit — allowed when admin role', async () => {
  const restore = withBetterAuth('admin@realcosmetics.local')
  try {
    const res = await opsAuditGET(makeRequest('/api/admin/ops/audit'))
    assert.ok(res.status !== 401 && res.status !== 403, `admin should have full on operations, got ${res.status}`)
  } finally {
    restore()
  }
})
