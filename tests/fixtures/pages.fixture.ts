import { test as base } from '@playwright/test';
import { APP_URL } from '../../config/app.config';
import { HomePage } from '../pages/HomePage';

type PageFixtures = {
  homePage: HomePage;
};

/**
 * Extends the base Playwright test with a ready-to-use HomePage: navigates
 * to the app (reusing the cached auth session) and waits for it to load
 * before handing control to the test.
 */
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await page.goto(APP_URL);
    const homePage = new HomePage(page);
    await homePage.waitForLoad();
    await use(homePage);
  },
});

export { expect } from '@playwright/test';
