import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.VIDEORC_UI_PORT ?? 3100);

export default defineConfig({
  // One `next start` serves every worker; more than a few starve it.
  expect: { timeout: 15_000 },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  projects: [
    {
      // Playwright's own Chromium: the system Chrome can launch as x64 under
      // Rosetta, which is slow enough to time pages out.
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: [["list"]],
  retries: 0,
  testDir: "./e2e",
  timeout: 120_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm start --hostname 127.0.0.1 --port ${PORT}`,
    // Always this build: a leftover server from an older build serves stale
    // chunks, and every page comes back blank.
    reuseExistingServer: false,
    timeout: 120_000,
    url: `http://127.0.0.1:${PORT}`,
  },
  workers: 2,
});
