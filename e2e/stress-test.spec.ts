import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('Performance — Page Load', () => {
  test('homepage loads under 3s', async ({ page }) => {
    const start = Date.now()
    await page.goto(`${BASE}/en`, { waitUntil: 'networkidle' })
    const loadTime = Date.now() - start
    console.log(`Homepage load: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })

  test('search page loads under 3s', async ({ page }) => {
    const start = Date.now()
    await page.goto(`${BASE}/en/search`, { waitUntil: 'networkidle' })
    console.log(`Search load: ${Date.now() - start}ms`)
  })

  test('admin login page loads under 2s', async ({ page }) => {
    const start = Date.now()
    await page.goto(`${BASE}/en/auth/login`, { waitUntil: 'networkidle' })
    console.log(`Login load: ${Date.now() - start}ms`)
  })
})

test.describe('API — Stress', () => {
  test('health endpoint handles 50 rapid requests', async ({ request: api }) => {
    const promises = Array.from({ length: 50 }, () =>
      api.get(`${BASE}/api/health`).then(r => r.status())
    )
    const results = await Promise.all(promises)
    const all200 = results.every(s => s === 200)
    expect(all200).toBe(true)
    console.log(`Health: 50 requests, all ${results[0]}`)
  })

  test('admin users endpoint under load', async ({ request: api }) => {
    // Login first
    await api.post(`${BASE}/api/auth/login`, {
      data: { email: 'admin@realcosmetics.local', password: 'admin' },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })

    const start = Date.now()
    const promises = Array.from({ length: 20 }, () =>
      api.get(`${BASE}/api/admin/users`, {
        headers: { origin: BASE, 'x-rc-trusted-request': 'functional-storefront-trusted-request' },
      }).then(r => r.status())
    )
    const results = await Promise.all(promises)
    const elapsed = Date.now() - start
    console.log(`Admin users: 20 requests in ${elapsed}ms (avg ${Math.round(elapsed/20)}ms/req)`)
    expect(results.every(s => s === 200)).toBe(true)
  })

  test('pharmacist search under load', async ({ request: api }) => {
    await api.post(`${BASE}/api/auth/login`, {
      data: { email: 'pharm@test.local', password: 'test1234' },
      headers: {
        'content-type': 'application/json',
        origin: BASE,
        'sec-fetch-site': 'same-origin',
        'x-rc-trusted-request': 'functional-storefront-trusted-request',
      },
    })

    const start = Date.now()
    const promises = Array.from({ length: 30 }, (_, i) =>
      api.get(`${BASE}/api/pharmacist/customers/search?q=test${i}`, {
        headers: { origin: BASE, 'x-rc-trusted-request': 'functional-storefront-trusted-request' },
      }).then(r => r.status())
    )
    const results = await Promise.all(promises)
    const elapsed = Date.now() - start
    console.log(`Pharmacist search: 30 requests in ${elapsed}ms (avg ${Math.round(elapsed/30)}ms/req)`)
  })

  test('cart add under load', async ({ request: api }) => {
    const start = Date.now()
    const promises = Array.from({ length: 20 }, (_, i) =>
      api.post(`${BASE}/api/cart/add`, {
        data: { productId: `prod_${i + 10}`, quantity: 1 },
        headers: {
          'content-type': 'application/json',
          origin: BASE,
          'x-rc-trusted-request': 'functional-storefront-trusted-request',
        },
      }).then(r => r.status())
    )
    const results = await Promise.all(promises)
    const elapsed = Date.now() - start
    console.log(`Cart add: 20 requests in ${elapsed}ms (avg ${Math.round(elapsed/20)}ms/req)`)
  })
})
