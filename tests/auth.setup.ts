import { test as setup } from '@playwright/test';
import { APP_URL, AUTH_STATE_PATH, BFR_USERNAME, BFR_PASSWORD } from '../config/app.config';

/**
 * Power Platform apps sit behind Microsoft Entra ID login. When
 * BFR_USERNAME / BFR_PASSWORD are set (see .env.example), this fills the
 * email + password screens automatically. Either way, the step after that
 * still waits for the app to load - covering an MFA/"stay signed in?"
 * prompt that needs a human, or a fully manual login when no credentials
 * are configured. The resulting session is cached to AUTH_STATE_PATH and
 * reused by every spec via playwright.config.ts's storageState.
 *
 * Run it headed (required for any manual step, e.g. MFA):
 *   npx playwright test --headed --project=setup
 */
setup('authenticate to Power Apps', async ({ page }) => {
  await page.goto(APP_URL);

  if (BFR_USERNAME && BFR_PASSWORD) {
    await page.getByRole('textbox', { name: /email, phone, or skype/i }).fill(BFR_USERNAME);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByRole('textbox', { name: /enter the password/i }).fill(BFR_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // "Stay signed in?" prompt - only shown when no MFA/other challenge intervenes.
    // Generous timeout: the redirect after submitting the password can be slow.
    const staySignedIn = page.getByRole('button', { name: 'Yes' });
    await staySignedIn.click({ timeout: 30_000 }).catch(() => {
      // Didn't appear - an MFA/other challenge is showing instead, or a human
      // already clicked past it. Either way, fall through to waitForURL below.
    });
  }

  // Covers both the automated-fill and fully-manual paths: waits out any
  // MFA/approval challenge until the SPA lands back on the play URL.
  await page.waitForURL(/apps\.powerapps\.com\/play/, { timeout: 5 * 60 * 1000 });
  await page.locator('iframe[name="fullscreen-app-host"]').waitFor({ timeout: 60_000 });

  await page.context().storageState({ path: AUTH_STATE_PATH });
});
