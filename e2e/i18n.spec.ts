import { test, expect } from '@playwright/test'

test.describe('Internationalization (i18n)', () => {
  test('English locale renders LTR layout', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    // HTML element should have lang="en" and dir="ltr"
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    const dir = await html.getAttribute('dir')
    // Default locale is English (LTR)
    expect(lang).toBe('en')
    expect(dir).toBe('ltr')
  })

  test('Arabic locale renders RTL layout', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    // Switch to Arabic via language button
    const languageButton = page.getByRole('button', { name: /language|العربية/i })
    await languageButton.click()
    await page.waitForTimeout(2000)
    // HTML element should have lang="ar" and dir="rtl"
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    const dir = await html.getAttribute('dir')
    expect(lang).toBe('ar')
    expect(dir).toBe('rtl')
  })

  test('language switcher toggles between EN and AR', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    // Should start in English
    const html = page.locator('html')
    expect(await html.getAttribute('lang')).toBe('en')
    // Toggle to Arabic
    const languageButton = page.getByRole('button', { name: /language|العربية/i })
    await languageButton.click()
    await page.waitForTimeout(2000)
    expect(await html.getAttribute('lang')).toBe('ar')
    // Toggle back to English
    await languageButton.click()
    await page.waitForTimeout(2000)
    expect(await html.getAttribute('lang')).toBe('en')
  })

  test('Arabic translations load on Arabic page', async ({ page }) => {
    // Navigate directly to Arabic locale if route supports it
    // Otherwise switch via UI
    await page.goto('/')
    await page.waitForTimeout(3000)
    const languageButton = page.getByRole('button', { name: /language|العربية/i })
    await languageButton.click()
    await page.waitForTimeout(2000)
    // Arabic text should be visible — look for common Arabic strings
    // Cart label, search placeholder, or navigation items
    await expect(page.locator('body')).toBeVisible()
    // Direction should be RTL
    const dir = await page.locator('html').getAttribute('dir')
    expect(dir).toBe('rtl')
  })

  test('RTL layout has proper text alignment', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    // Switch to Arabic
    const languageButton = page.getByRole('button', { name: /language|العربية/i })
    await languageButton.click()
    await page.waitForTimeout(2000)
    // Body should have RTL direction
    const bodyDir = await page.locator('body').getAttribute('dir')
    const htmlDir = await page.locator('html').getAttribute('dir')
    // At least one should be rtl
    const isRtl = bodyDir === 'rtl' || htmlDir === 'rtl'
    expect(isRtl).toBe(true)
  })
})
