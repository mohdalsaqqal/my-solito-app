import { defineConfig, devices } from '@playwright/test'

const shouldManageWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== 'true'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

/**
 * Playwright E2E configuration for REAL Cosmetics Commerce Platform.
 * Targets the Next.js dev server running on localhost:3000.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  outputDir: 'test-results/test-artifacts',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  webServer: shouldManageWebServer
    ? {
        // Keep root-invokable so `yarn e2e:a11y` works from repository root.
        command: 'yarn web:dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stderr: 'pipe',
        stdout: 'pipe',
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
