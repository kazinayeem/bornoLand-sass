import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Maximum time one test can run for. */
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  /* Run tests sequentially to avoid database race conditions */
  fullyParallel: false,
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/reports/playwright-html", open: "never" }],
    ["json", { outputFile: "tests/reports/results.json" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.WEB_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "Desktop Chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "Mobile Chromium",
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "pnpm --filter @bornoland/api dev",
      url: "http://localhost:4000/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @bornoland/web dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
