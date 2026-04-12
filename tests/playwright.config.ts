import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  timeout: 60000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/html-report', open: 'always' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Mobile Safari',
      use: { 
        browserName: 'webkit',
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 3,
        isMobile: true,
      },
    },
  ],
})
