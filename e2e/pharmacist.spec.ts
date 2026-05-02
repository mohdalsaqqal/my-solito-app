import { createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { test, expect, type BrowserContext } from '@playwright/test'

const rootDir = resolve(__dirname, '..')
const authSessionSecret =
  process.env.AUTH_SESSION_SECRET ??
  readEnvValue('apps/next/.env', 'AUTH_SESSION_SECRET') ??
  readEnvValue('.env', 'AUTH_SESSION_SECRET') ??
  'dev-auth-secret-change-me'

function readEnvValue(file: string, key: string) {
  const fullPath = join(rootDir, file)
  if (!existsSync(fullPath)) return null
  const contents = readFileSync(fullPath, 'utf8')
  const match = contents.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!match) return null
  return match[1].trim().replace(/^["']|["']$/g, '') || null
}

function createPharmacistSessionCookieValue() {
  const payload = {
    userId: 'u-3',
    email: 'pharma@realcosmetics.local',
    name: 'Pharma User',
    role: 'pharmacist',
    sessionId: 'browser-pharmacist-session',
    csrfToken: 'browser-pharmacist-csrf-token',
  }
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = createHmac('sha256', authSessionSecret).update(payloadBase64).digest('base64url')
  return `${payloadBase64}.${signature}`
}

async function seedPharmacistSession(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'rc_auth_session',
      value: createPharmacistSessionCookieValue(),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
}

test.describe('Pharmacist browser flow', () => {
  test('searches a customer and submits a hair consultation', async ({ page, context }) => {
    test.setTimeout(90_000)
    await seedPharmacistSession(context)

    await page.goto('/pharmacist/scan', { waitUntil: 'networkidle' })
    await expect(page.getByText(/Step 1: Scan or Search Customer/i)).toBeVisible()
    await page.waitForTimeout(5_000)

    await page.getByPlaceholder(/Search by name, email, user ID, or QR code/i).fill('Customer')
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/api/pharmacist/customers/search') && response.status() === 200
      ),
      page.getByRole('button', { name: /^Search$/i }).click(),
    ])
    await expect(page.getByText('user@realcosmetics.local')).toBeVisible({ timeout: 20_000 })
    await page.waitForTimeout(1_000)
    await Promise.all([
      page.waitForURL(/\/pharmacist\/customer\/u-1$/),
      page.getByRole('button', { name: /^Open$/i }).first().click(),
    ])

    await expect(page.getByText(/Step 2: Review Customer History/i)).toBeVisible()
    await expect(page.getByText('Core skin diagnostics')).toBeVisible({ timeout: 20_000 })
    await page.waitForLoadState('networkidle')
    await Promise.all([
      page.waitForURL(/\/pharmacist\/customer\/u-1\/new-test$/),
      page.getByRole('button', { name: /Create new test/i }).click(),
    ])

    await page.getByRole('button', { name: /Hair test/i }).click()
    await page.getByPlaceholder(/Test title/i).fill('Browser hair consultation')
    await page.getByPlaceholder(/Test result summary/i).fill('Scalp dryness with mild flaking observed.')
    await page.getByPlaceholder(/Notes \(optional\)/i).fill('Use a weekly hydrating scalp routine.')
    await page.getByPlaceholder(/Hydration value/i).fill('Low')
    await page.getByPlaceholder(/Sensitivity value/i).fill('Mild')
    await page.getByPlaceholder(/Live search products by name or brand/i).fill('Gloss')
    await page.getByRole('button', { name: /^Find$/i }).click()

    await expect(page.getByText(/Tap to select/i).first()).toBeVisible({ timeout: 20_000 })
    await page.getByText(/Tap to select/i).first().click()
    await expect(page.getByText(/Selected/i).first()).toBeVisible()
    await page.getByRole('button', { name: /Review summary/i }).click()

    await expect(page).toHaveURL(/\/pharmacist\/customer\/u-1\/review$/)
    await expect(page.getByText('Browser hair consultation')).toBeVisible()
    await expect(page.getByText(/Type:\s*hair/i)).toBeVisible()
    await page.getByRole('button', { name: /Submit consultation/i }).click()

    await expect(page).toHaveURL(/\/pharmacist\/customer\/u-1\?submitted=1$/)
    await expect(page.getByText(/Consultation submitted successfully/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('Browser hair consultation').first()).toBeVisible()
  })
})
