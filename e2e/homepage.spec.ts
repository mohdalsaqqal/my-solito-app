import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('homepage loads without errors', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/REAL Cosmetics/)
  })

  test('hero section is visible', async ({ page }) => {
    await page.goto('/')
    // Hero banner or carousel should be present
    const hero = page.getByRole('banner').first()
    await expect(hero).toBeVisible({ timeout: 15_000 })
  })

  test('product rails are present', async ({ page }) => {
    await page.goto('/')
    // Product sections should render — look for product cards or rail headings
    const headings = page.getByRole('heading', { level: 2 })
    await expect(headings.first()).toBeVisible({ timeout: 15_000 })
  })

  test('navigation links are clickable', async ({ page }) => {
    await page.goto('/')
    // Nav links should exist — search, cart, shop are common
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    // Search link should be present
    const searchLink = page.getByRole('link', { name: /search/i }).first()
    await expect(searchLink).toBeVisible()
  })

  test('footer is present', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible({ timeout: 15_000 })
  })

  test.skip('skip link navigates to main content', async ({ page }) => {
    await page.goto('/')
    // Skip link exists in layout with class 'skip-link' and href '#main-content'
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    await expect(skipLink).toBeVisible()
    await skipLink.click()
    // Focus should move to main content
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })
})
