/**
 * Playwright E2E Configuration for D&D VTT
 *
 * Tests run against a REAL server with REAL database and REAL LLM APIs.
 * No mocks. The server is started/stopped by Playwright's webServer config.
 */

import { defineConfig, devices } from '@playwright/test';

const SERVER_PORT = 3344;
const CLIENT_PORT = 3345;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Tests share game state, run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Single worker — shared server state
  reporter: 'html',
  timeout: 60_000, // 60s per test — LLM responses can be slow
  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: `http://localhost:${CLIENT_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 
   * Server lifecycle:
   * - Locally: Run `npm run dev` from the dnd-vtt root first, then run E2E tests.
   * - CI: Set CI=true and the servers will be started automatically.
   *
   * Uses reuseExistingServer:true so tests work against an already-running dev server.
   */
  webServer: [
    {
      command: 'cd .. && npm run dev:server',
      port: SERVER_PORT,
      reuseExistingServer: true,
      timeout: 30_000,
      env: { PORT: String(SERVER_PORT), NODE_ENV: 'test' },
    },
    {
      command: 'cd .. && npm run dev:client',
      port: CLIENT_PORT,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
