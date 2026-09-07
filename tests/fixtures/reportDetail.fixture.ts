import { test as base } from '@playwright/test';
import { APP_URL, AUTH_STATE_PATH } from '../../config/app.config';
import { HomePage } from '../pages/HomePage';
import { ReportDetailPage } from '../pages/ReportDetailPage';
import { GeneralSection } from '../pages/sections/GeneralSection';

const REPORT_NAME = 'Austria 2026';
const REPORT_DUE_DATE = '30 Jun 2025';

type WorkerFixtures = {
  reportDetail: ReportDetailPage;
  generalSection: GeneralSection;
};

/**
 * Navigates Home > Reports > search > open "Austria 2026" > expand General
 * exactly once per worker (same one-load-per-file pattern as `homePage` in
 * pages.fixture.ts). All tests in a file using this fixture share that
 * single already-open section instead of re-navigating from scratch each
 * time - which also sidesteps the app's unsaved-changes guard blocking
 * repeated nav-bar clicks away from an edited-but-unsaved section.
 *
 * Only safe for tests on this one section; a test needing a different
 * report/section should navigate there itself via `reportDetail`.
 */
export const test = base.extend<{}, WorkerFixtures>({
  reportDetail: [
    async ({ browser }, use) => {
      const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
      const page = await context.newPage();

      await page.goto(APP_URL);
      const homePage = new HomePage(page);
      await homePage.waitForLoad();

      const reports = await homePage.openReports();
      await reports.clearStatusFilter();
      await reports.searchFor(REPORT_NAME);
      const detail = await reports.openReportDetails(REPORT_NAME, { dueDate: REPORT_DUE_DATE });

      await use(detail);

      await context.close();
    },
    { scope: 'worker' },
  ],

  generalSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.generalSection.expand();
      await use(reportDetail.generalSection);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
