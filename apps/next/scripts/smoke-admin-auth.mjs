#!/usr/bin/env node
/**
 * Admin auth/session smoke test.
 *
 * Verifies full admin auth pipeline using real route handlers:
 *   Login → Session cookie → Session resolution → Admin RBAC
 *
 * Uses Better Auth mock (same approach as route.test.ts) so no
 * Postgres dependency. Tests actual route handlers, not stubs.
 *
 * Usage: node --import tsx scripts/smoke-admin-auth.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { auth } from '../lib/auth.js'

import { GET as sessionGET } from '../app/api/auth/session/route.js'
import { POST as loginPOST } from '../app/api/auth/login/route.js'
import { GET as catalogBrandsGET } from '../app/api/admin/catalog/brands/route.js'
import { GET as siteConfigGET } from '../app/api/admin/cms/site-config/route.js'
import { GET as opsAuditGET } from '../app/api/admin/ops/audit/route.js'

process.env.NODE_ENV = 'test'
process.env.REQUIRE_PRODUCTION_AUTH = 'false'
process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret-32-characters-minimum'
process.env.AUTH_SESSION_SECRET = 'test-auth-session-secret-32-characters-minimum'

const ADMIN_EMAIL = 'admin@realcosmetics.local'
const ADMIN_PASSWORD = 'admin'

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function toWebRequest(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined
  const url = `http://localhost${req.url || '/'}`
  const headers = new Headers(req.headers)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!headers.has('origin')) headers.set('origin', 'http://localhost')
    if (!headers.has('sec-fetch-site')) headers.set('sec-fetch-site', 'same-origin')
  }
  return new Request(url, {
    method: req.method,
    headers,
    body: body && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
  })
}

const ROUTE_MAP = {
  'GET:/api/auth/session': sessionGET,
  'POST:/api/auth/login': loginPOST,
  'GET:/api/admin/catalog/brands': catalogBrandsGET,
  'GET:/api/admin/cms/site-config': siteConfigGET,
  'GET:/api/admin/ops/audit': opsAuditGET,
}

function createServer() {
  return http.createServer(async (req, res) => {
    const key = `${req.method}:${req.url}`
    const handler = ROUTE_MAP[key]
    if (!handler) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }
    const webReq = await toWebRequest(req)
    const webRes = await handler(webReq)
    res.statusCode = webRes.status
    webRes.headers.forEach((v, k) => res.setHeader(k, v))
    res.end(await webRes.text())
  })
}

function httpRequest(server, method, path, opts = {}) {
  return new Promise((resolve, reject) => {
    const { request } = http
    const req = request(`http://localhost:${server.address().port}${path}`, {
      method,
      headers: opts.headers || {},
    })
    req.on('response', resolve)
    req.on('error', reject)
    req.end(opts.body || undefined)
  })
}

async function readBody(res) {
  return new Promise((resolve) => {
    let data = ''
    res.on('data', (chunk) => (data += chunk))
    res.on('end', () => resolve(JSON.parse(data)))
  })
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

// ── Better Auth mocks ────────────────────────────────────────────────────────

const ADMIN_SESSION = {
  user: { id: 'admin-uid', email: ADMIN_EMAIL, name: 'Admin', emailVerified: true },
  session: { id: 'sess-admin' },
}

const CUSTOMER_SESSION = {
  user: { id: 'cust-uid', email: 'user@realcosmetics.local', name: 'Customer', emailVerified: true },
  session: { id: 'sess-cust' },
}

function installMocks() {
  const orig = {
    signInEmail: auth.api.signInEmail,
    getSession: auth.api.getSession,
  }

  auth.api.signInEmail = async ({ body }) => {
    if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
      return new Response(null, {
        status: 200,
        headers: { 'Set-Cookie': 'better-auth.session_token=admin-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800' },
      })
    }
    return new Response(null, { status: 401 })
  }

  auth.api.getSession = async ({ headers }) => {
    const cookie = headers?.get?.('cookie') ?? ''
    if (cookie.includes('better-auth.session_token=admin-token')) return ADMIN_SESSION
    if (cookie.includes('better-auth.session_token=customer-token')) return CUSTOMER_SESSION
    return null
  }

  return () => {
    auth.api.signInEmail = orig.signInEmail
    auth.api.getSession = orig.getSession
  }
}

// ── smoke tests ──────────────────────────────────────────────────────────────

test('SMOKE: admin login → session cookie → session resolution', async (t) => {
  const server = createServer()
  await listen(server)
  const restore = installMocks()

  try {
    // Step 1: Login as admin
    const loginRes = await httpRequest(server, 'POST', '/api/auth/login', {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })
    assert.equal(loginRes.statusCode, 200, `login status: ${loginRes.statusCode}`)
    const loginBody = await readBody(loginRes)
    assert.equal(loginBody.success, true)
    assert.equal(loginBody.data.email, ADMIN_EMAIL)
    assert.equal(loginBody.data.role, 'admin')

    const setCookie = loginRes.headers['set-cookie']?.[0] ?? ''
    assert.ok(setCookie.includes('HttpOnly'), 'cookie HttpOnly')
    assert.ok(setCookie.includes('SameSite=Lax'), 'cookie SameSite')
    assert.ok(setCookie.includes('Max-Age=604800'), 'cookie Max-Age')

    // Step 2: Resolve session from cookie
    const sessionCookie = setCookie.split(';')[0] // extract key=value
    const sessionRes = await httpRequest(server, 'GET', '/api/auth/session', {
      headers: { cookie: sessionCookie },
    })
    assert.equal(sessionRes.statusCode, 200)
    const sessionBody = await readBody(sessionRes)
    assert.equal(sessionBody.data.email, ADMIN_EMAIL)
    assert.equal(sessionBody.data.role, 'admin')

    console.log('  [PASS] Login → cookie → session resolution')
  } finally {
    restore()
    server.close()
  }
})

test('SMOKE: admin role accesses all 3 admin domains', async (t) => {
  const server = createServer()
  await listen(server)
  const restore = installMocks()

  try {
    const headers = { cookie: 'better-auth.session_token=admin-token' }

    for (const path of ['/api/admin/catalog/brands', '/api/admin/cms/site-config', '/api/admin/ops/audit']) {
      const res = await httpRequest(server, 'GET', path, { headers })
      assert.notEqual(res.statusCode, 401, `${path}: admin must not get 401`)
      assert.notEqual(res.statusCode, 403, `${path}: admin must not get 403`)
    }
    console.log('  [PASS] Admin accesses catalog, CMS, ops — all allowed')
  } finally {
    restore()
    server.close()
  }
})

test('SMOKE: customer role denied admin access', async (t) => {
  const server = createServer()
  await listen(server)
  const restore = installMocks()

  try {
    const headers = { cookie: 'better-auth.session_token=customer-token' }

    const res = await httpRequest(server, 'GET', '/api/admin/catalog/brands', { headers })
    assert.equal(res.statusCode, 403, `customer on admin: expected 403, got ${res.statusCode}`)
    console.log('  [PASS] Customer blocked from admin → 403')
  } finally {
    restore()
    server.close()
  }
})

test('SMOKE: unauthenticated denied admin access', async (t) => {
  const server = createServer()
  await listen(server)
  const restore = installMocks()

  try {
    const res = await httpRequest(server, 'GET', '/api/admin/ops/audit')
    assert.equal(res.statusCode, 401, `unauthenticated: expected 401, got ${res.statusCode}`)
    console.log('  [PASS] Unauthenticated blocked → 401')
  } finally {
    restore()
    server.close()
  }
})

test('SMOKE: cross-domain RBAC — ops reads all, customer denied', async (t) => {
  const server = createServer()
  await listen(server)
  const restore = installMocks()
  const originalGetSession = auth.api.getSession

  // Extend mock: keep admin + customer from installMocks, add ops
  auth.api.getSession = async ({ headers }) => {
    const cookie = headers?.get?.('cookie') ?? ''
    if (cookie.includes('better-auth.session_token=ops-token')) {
      return {
        user: { id: 'ops-uid', email: 'ops@realcosmetics.local', name: 'Ops', emailVerified: true },
        session: { id: 'sess-ops' },
      }
    }
    if (cookie.includes('better-auth.session_token=admin-token')) return ADMIN_SESSION
    if (cookie.includes('better-auth.session_token=customer-token')) return CUSTOMER_SESSION
    return null
  }

  try {
    const opsHeaders = { cookie: 'better-auth.session_token=ops-token' }

    // ops has 'read' on catalog (RBAC line 66) — allowed GET (required=read)
    const catalogRes = await httpRequest(server, 'GET', '/api/admin/catalog/brands', { headers: opsHeaders })
    assert.notEqual(catalogRes.statusCode, 401, 'ops on catalog: read allowed, must not get 401')
    assert.notEqual(catalogRes.statusCode, 403, 'ops on catalog: read allowed, must not get 403')

    // ops has 'full' on operations (RBAC line 72)
    const opsRes = await httpRequest(server, 'GET', '/api/admin/ops/audit', { headers: opsHeaders })
    assert.notEqual(opsRes.statusCode, 401, 'ops on ops audit: full allowed, must not get 401')
    assert.notEqual(opsRes.statusCode, 403, 'ops on ops audit: full allowed, must not get 403')

    // customer role — not an admin panel role → 403 on admin domain
    const custHeaders = { cookie: 'better-auth.session_token=customer-token' }
    const custRes = await httpRequest(server, 'GET', '/api/admin/ops/audit', { headers: custHeaders })
    assert.equal(custRes.statusCode, 403, `customer on ops audit: expected 403, got ${custRes.statusCode}`)

    console.log('  [PASS] RBAC: ops reads catalog+ops, customer denied ops')
  } finally {
    auth.api.getSession = originalGetSession
    restore()
    server.close()
  }
})
