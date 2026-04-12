import { test, expect, type Page } from '@playwright/test'

test.describe('Accessibility', () => {
  test.describe.configure({ mode: 'serial' })

  async function gotoHome(page: Page) {
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes('ERR_ABORTED') && !message.includes('frame was detached')) {
        throw error
      }

      await page.waitForTimeout(1_000)
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 })
    }

    await expect(page.locator('body')).toBeVisible()
    await page
      .locator('main, [role="main"]')
      .first()
      .waitFor({ state: 'attached', timeout: 10_000 })
      .catch(() => undefined)
  }

  test('homepage has proper heading hierarchy', async ({ page }) => {
    await gotoHome(page)
    const h1s = page.getByRole('heading', { level: 1 })
    const h1Count = await h1s.count()
    expect(h1Count).toBeLessThanOrEqual(1)

    const allHeadings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) =>
      els.map((el) => ({ tag: el.tagName, text: el.textContent?.trim() }))
    )

    let prevLevel = 0
    for (const heading of allHeadings) {
      const level = parseInt(heading.tag[1], 10)
      if (prevLevel > 0) {
        expect(level).toBeLessThanOrEqual(prevLevel + 1)
      }
      prevLevel = level
    }
  })

  test('keyboard navigation works on interactive elements', async ({ page }) => {
    await gotoHome(page)
    await page.keyboard.press('Tab')
    const firstFocused = await page.locator(':focus').count()
    expect(firstFocused).toBeGreaterThanOrEqual(1)

    await page.keyboard.press('Tab')
    let secondFocused = await page.locator(':focus').count()
    if (secondFocused < 1) {
      await page.keyboard.press('Tab')
      secondFocused = await page.locator(':focus').count()
    }
    expect(secondFocused).toBeGreaterThanOrEqual(1)
  })

  test('focus is visible on interactive elements', async ({ page }) => {
    await gotoHome(page)
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('ARIA labels present on interactive elements', async ({ page }) => {
    await gotoHome(page)
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    for (let i = 0; i < buttonCount; i += 1) {
      await expect(buttons.nth(i)).toHaveAccessibleName(/.+/)
    }

    const links = page.getByRole('link')
    const linkCount = await links.count()
    for (let i = 0; i < linkCount; i += 1) {
      await expect(links.nth(i)).toHaveAccessibleName(/.+/)
    }
  })

  test('skip link navigates to main content', async ({ page }) => {
    await gotoHome(page)
    const skipLink = page.getByRole('link', { name: /skip to main content/i })
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('Tab')
      if (await skipLink.evaluate((el) => el === document.activeElement).catch(() => false)) {
        break
      }
    }

    if (!(await skipLink.evaluate((el) => el === document.activeElement).catch(() => false))) {
      await skipLink.focus()
    }

    await expect(skipLink).toBeFocused()
    await skipLink.press('Enter')
    await expect(page).toHaveURL(/#main-content$/)
  })

  test('images have alt text', async ({ page }) => {
    await gotoHome(page)
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i += 1) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt !== null).toBe(true)
    }
  })
})
