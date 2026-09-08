import { defineConfig, devices } from '@playwright/test';
import { AUTH_STATE_PATH } from './config/app.config';

export default defineConfig({
  testDir: './tests',
  // Power Apps' own docs note Dataverse-backed views can take 30-60s to
  // populate; each spec reloads the app from scratch, so budget for that
  // plus margin rather than the default 30s.
  timeout: 150_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // One worker for the whole suite: spec files reload the same real,
  // mutating Dataverse-backed app, so running two files' browsers
  // concurrently both slows page loads past the timeout and risks two
  // workers touching the same report data at once.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // Headed locally so you can actually watch the browser; headless in CI
    // where there's no display and nobody's watching anyway.
    headless: !!process.env.CI,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      // Overrides the global 60s test timeout: a human needs real time to
      // type credentials and complete MFA during interactive sign-in.
      timeout: 5 * 60 * 1000,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE_PATH,
      },
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
    },
  ],
});
