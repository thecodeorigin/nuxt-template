import type { ConfigOptions } from '@nuxt/test-utils/playwright'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig<ConfigOptions>({
  testDir: '.',
  testMatch: ['tests/**/*.e2e.ts', 'layers/*/tests/**/*.e2e.ts'],
  // Tests share one local Postgres + Redis. Parallel workers race on
  // seeded users and the Vite HMR port (24678 is fixed). One worker
  // keeps each Nuxt fixture isolated and predictable; e2e is short
  // enough that the wall-clock cost is small.
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      // Use dev-mode for the test fixture: a full prod build with
      // nuxt-security's SRI hashing over every chunk takes ~2 minutes,
      // which trips the test fixture's hard-coded 120s setup timeout.
      // Dev mode still applies every same security policy — CSP, CSRF,
      // rate limiter, headers — just without the asset-hashing build
      // step we don't need to exercise here. Production-only build
      // checks live in the Preview workflow's real deploy.
      dev: true,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
