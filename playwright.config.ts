import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,

  // Prevents accidentally committing a test.only() that would skip everything else on CI
  forbidOnly: !!process.env.CI,

  // Retry once locally and twice on CI — handles transient Firefox NS_ERROR_ABORT errors
  retries: process.env.CI ? 2 : 1,

  // Limit to 1 worker on CI to avoid race conditions; use all cores locally
  workers: process.env.CI ? 1 : undefined,

  // Three reporters run simultaneously after every test run:
  //   html  → playwright-report/index.html  (open with: npx playwright show-report)
  //   list  → live output in the terminal
  //   json  → test-results.json  (machine-readable, useful for CI dashboards)
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
  ],

  use: {
    // Firefox sometimes aborts navigation under parallel load — 30 s gives it enough time
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
