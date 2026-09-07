import { test as base } from '@playwright/test';
import { APP_URL, AUTH_STATE_PATH } from '../../config/app.config';
import { HomePage } from '../pages/HomePage';

type WorkerFixtures = {
  homePage: HomePage;
};

/**
 * homePage is worker-scoped: one browser context/page is created per
 * worker, navigated to the app exactly once, and reused by every test in
 * this file - skipping the ~30-60s cold app load on every single test.
 * Playwright already runs all tests of one spec file on a single worker;
 * pair this with test.describe.configure({ mode: 'serial' }) in the spec
 * so they also run in a fixed order, since each test now picks up from
 * wherever the previous one left the app.
 *
 * Only safe for read-only/navigation tests. A test that mutates data (e.g.
 * submits a report) should use its own isolated page instead, so it can't
 * leak state into - or inherit broken state from - its neighbours.
 */
export const test = base.extend<{}, WorkerFixtures>({
  homePage: [
    async ({ browser }, use) => {
      // Manually-created contexts don't inherit the project's `use` block,
      // so storageState has to be passed explicitly here.
      const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
      const page = await context.newPage();

      await page.goto(APP_URL);
      const homePage = new HomePage(page);
      await homePage.waitForLoad();

      await use(homePage);

      await context.close();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
