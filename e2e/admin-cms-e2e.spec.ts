import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'
const ADMIN = { email: 'admin@realcosmetics.local', password: 'admin' }

test.describe('Storefront', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto(`${BASE}/en`)
    await expect(page.locator('text=REAL').first()).toBeVisible({ timeout: 10000 })
  })

  test('account page redirects to login', async ({ page }) => {
    await page.goto(`${BASE}/en/account`)
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin API', () => {
  test('health endpoint returns 200', async ({ request: api }) => {
    const res = await api.get(`${BASE}/api/health`)
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.components.runtime.status).toBe('healthy')
  })

  test('admin login returns session', async ({ request: api }) => {
    const res = await api.post(`${BASE}/api/auth/login`, {
      data: { email: ADMIN.email, password: ADMIN.password },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.role).toBe('admin')
  })

  test('admin users list requires auth', async ({ request: api }) => {
    // Login first
    await api.post(`${BASE}/api/auth/login`, {
      data: { email: ADMIN.email, password: ADMIN.password },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })
    const res = await api.get(`${BASE}/api/admin/users`, {
      headers: { origin: BASE, 'x-rc-trusted-request': 'functional-storefront-trusted-request' },
    })
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data.length).toBeGreaterThan(0)
  })

  test('admin catalog brands returns list', async ({ request: api }) => {
    await api.post(`${BASE}/api/auth/login`, {
      data: { email: ADMIN.email, password: ADMIN.password },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })
    const res = await api.get(`${BASE}/api/admin/catalog/brands`, {
      headers: { origin: BASE, 'x-rc-trusted-request': 'functional-storefront-trusted-request' },
    })
    expect(res.status()).toBe(200)
  })

  test('privilege escalation blocked (support cannot create admin)', async ({ playwright }) => {
    const ts = Date.now()
    const adminCtx = await playwright.request.newContext()
    // Login as admin
    await adminCtx.post(`${BASE}/api/auth/login`, {
      data: { email: ADMIN.email, password: ADMIN.password },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })
    // Create support user with unique email
    const createRes = await adminCtx.post(`${BASE}/api/admin/users`, {
      data: { name: 'E2E Support', email: `e2e-support-${ts}@test.local`, password: 'testtest12', role: 'support' },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })
    expect(createRes.status()).toBe(201)

    // Login as support in a SEPARATE context
    const supportCtx = await playwright.request.newContext()
    await supportCtx.post(`${BASE}/api/auth/login`, {
      data: { email: `e2e-support-${ts}@test.local`, password: 'testtest12' },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })

    // Support tries to create admin → must 403
    const escalateRes = await supportCtx.post(`${BASE}/api/admin/users`, {
      data: { name: 'Evil', email: `e2e-evil-${ts}@test.local`, password: 'testtest1234', role: 'admin' },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })
    expect(escalateRes.status()).toBe(403)

    await adminCtx.dispose()
    await supportCtx.dispose()
  })
})
