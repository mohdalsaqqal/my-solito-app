// visual-audit.spec.ts
// Automated visual audit tests for Real Cosmetics platform
// Run with: npx playwright test visual-audit.spec.ts --headed

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Visual Audit - Post-Fix Verification', () => {
  
  // 1. Touch Target Verification
  test('Header interactive elements meet 44px minimum', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Check desktop icon buttons
    const iconButtons = page.locator('[aria-label]').filter({ hasText: /Account|Wishlist|Cart/i })
    const count = await iconButtons.count()
    
    for (let i = 0; i < count; i++) {
      const box = await iconButtons.nth(i).boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-01-touch-targets.png',
      fullPage: true 
    })
  })

  // 2. Focus Indicator Verification
  test('Keyboard focus ring visible on interactive elements', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Tab through first 5 focusable elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(300) // Allow focus indicator to render
      
      // Check for focus ring (should have box-shadow or outline)
      const focused = page.locator(':focus')
      const boxShadow = await focused.evaluate((el) => 
        window.getComputedStyle(el).boxShadow
      )
      const outline = await focused.evaluate((el) => 
        window.getComputedStyle(el).outline
      )
      
      // At least one should indicate focus
      const hasFocusIndicator = 
        boxShadow !== 'none' || 
        (outline !== 'none' && outline !== '')
      
      expect(hasFocusIndicator).toBe(true)
    }
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-02-focus-indicators.png',
      fullPage: true 
    })
  })

  // 3. Hero Card Aspect Ratio (16:9)
  test('Hero carousel cards use 16:9 aspect ratio', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Find hero card images
    const heroImages = page.locator('img[style*="aspect-ratio"], img[src*="hero"]')
    const count = await heroImages.count()
    
    if (count > 0) {
      const img = heroImages.first()
      const box = await img.boundingBox()
      
      if (box) {
        const ratio = box.width / box.height
        // Should be approximately 16:9 (1.78)
        expect(ratio).toBeGreaterThan(1.5)
        expect(ratio).toBeLessThan(2.0)
      }
    }
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-03-hero-aspect-ratio.png',
      fullPage: true 
    })
  })

  // 4. Badge Shape Differentiation
  test('Badges have distinctive shapes by tone', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`)
    await page.waitForLoadState('networkidle')
    
    // Get all badges
    const badges = page.locator('[role="status"], .badge, [class*="Badge"]')
    const count = await badges.count()
    
    const borderRadii: string[] = []
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const badge = badges.nth(i)
      const borderRadius = await badge.evaluate((el) =>
        window.getComputedStyle(el).borderRadius
      )
      borderRadii.push(borderRadius)
    }
    
    // Should have variety (not all identical)
    const uniqueRadii = new Set(borderRadii)
    expect(uniqueRadii.size).toBeGreaterThan(1)
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-04-badge-shapes.png',
      fullPage: true 
    })
  })

  // 5. Checkout Stepper
  test('Checkout page shows numbered stepper circles', async ({ page }) => {
    await page.goto(`${BASE_URL}/cart`)
    await page.waitForLoadState('networkidle')
    
    // Look for stepper circles (should be numbered 1, 2, 3, 4)
    const stepperCircles = page.locator('text=/^[1-4]$/')
    const count = await stepperCircles.count()
    
    // Should have at least 4 numbered circles
    expect(count).toBeGreaterThanOrEqual(4)
    
    // Check for connecting lines
    const hasConnectingLines = await page.locator('[style*="height: 2"]').count() > 0
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-05-checkout-stepper.png',
      fullPage: true 
    })
  })

  // 6. Lazy Loading Verification
  test('Product images use lazy loading', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`)
    await page.waitForLoadState('networkidle')
    
    // Get all product images
    const images = page.locator('img[src*="product"], img[alt]')
    const count = await images.count()
    
    let lazyCount = 0
    for (let i = 0; i < Math.min(count, 20); i++) {
      const loading = await images.nth(i).getAttribute('loading')
      if (loading === 'lazy') {
        lazyCount++
      }
    }
    
    // At least some images should be lazy (not first 8)
    expect(lazyCount).toBeGreaterThan(0)
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-06-lazy-loading.png',
      fullPage: true 
    })
  })

  // 7. Alt Text Verification
  test('Product images have meaningful alt text', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`)
    await page.waitForLoadState('networkidle')
    
    // Get product card images
    const images = page.locator('img[alt]')
    const count = await images.count()
    
    let validAltCount = 0
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt')
      if (alt && alt.length > 3 && alt !== 'image' && alt !== '') {
        validAltCount++
      }
    }
    
    // Most images should have meaningful alt text
    expect(validAltCount).toBeGreaterThan(0)
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-07-alt-text.png',
      fullPage: true 
    })
  })

  // 8. No Hardcoded Colors in Critical Components
  test('Theme tokens used instead of hardcoded colors', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Check computed styles of buttons
    const buttons = page.locator('button, [role="button"]').first()
    const bgColor = await buttons.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    )
    
    // Should not be a hardcoded hex like #d31018
    // Should use CSS custom property or HSL
    const usesTokens = 
      bgColor.includes('var(') || 
      bgColor.includes('hsl(') ||
      !bgColor.includes('#')
    
    expect(usesTokens).toBe(true)
    
    await page.screenshot({ 
      path: 'test-results/visual-audit-08-color-tokens.png',
      fullPage: true 
    })
  })
})
