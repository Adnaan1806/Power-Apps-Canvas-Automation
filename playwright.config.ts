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
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
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
