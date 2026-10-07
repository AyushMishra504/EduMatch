import { defineConfig } from "@playwright/test";

/**
 * E2E runs against the dev server on :3000 (reused if already running) and
 * the local dev Postgres (npm run db:local) — see AGENTS.md. Auth uses the
 * dev-only skip-login button, which never renders in production.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    // Must be `localhost`, not 127.0.0.1: Next dev blocks /_next/* dev
    // resources for the 127.0.0.1 origin, so React never hydrates there.
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
