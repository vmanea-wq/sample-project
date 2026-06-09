import { defineConfig, devices } from '@playwright/test'

const host = '127.0.0.1'
const port = 4173
const baseURL = `http://${host}:${port}`
const skipWebServer = !!process.env.PLAYWRIGHT_SKIP_WEBSERVER

export default defineConfig({
  testDir: 'qa/e2e/specs',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'qa/reports/playwright-html', open: 'never' }],
    ['json', { outputFile: 'qa/reports/playwright-results.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(skipWebServer
    ? {}
    : {
        webServer: {
          command: `npm run build && npx vite preview --host ${host} --port ${port}`,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      }),
})
