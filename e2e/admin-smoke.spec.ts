import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('Storefront Smoke', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/en`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('text=REAL').first()).toBeVisible({ timeout: 10000 })
  })

  test('search page loads', async ({ page }) => {
    const response = await page.goto(`${BASE}/en/search`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 })
  })

  test('account page redirects unauth to login', async ({ page }) => {
    await page.goto(`${BASE}/en/account`)
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin Auth Gate', () => {
  test('admin dashboard redirects unauth to login', async ({ page }) => {
    await page.goto(`${BASE}/en/admin/dashboard`)
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 10000 })
  })

  test('admin customers redirects unauth to login', async ({ page }) => {
    await page.goto(`${BASE}/en/admin/customers`)
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 10000 })
  })

  test('admin health redirects unauth to login', async ({ page }) => {
    await page.goto(`${BASE}/en/admin/operations/health`)
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 10000 })
  })

  test('admin settings redirects unauth to login', async ({ page }) => {
    await page.goto(`${BASE}/en/admin/settings`)
    await expect(page.locator('text=Sign In').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('API Health', () => {
  test('health endpoint returns 200 with components', async ({ page }) => {
    const response = await page.request.get(`${BASE}/api/health`)
    expect(response.status()).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.data.components.runtime.status).toBe('healthy')
  })
})
