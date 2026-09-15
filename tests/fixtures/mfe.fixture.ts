import { test as base, expect } from '@playwright/test';
import { APP_URL, AUTH_STATE_PATH } from '../../config/app.config';
import { HomePage } from '../pages/HomePage';
import { MfeReportDetailPage } from '../pages/MfeReportDetailPage';
import { VotingFirmDetailsSection } from '../pages/sections/mfe/VotingFirmDetailsSection';
import { votingFirmDetailsSectionTestData } from './mfeTestData';

// Confirmed live: the only MFE report matching an "Austria" search - unique,
// no due-date-style disambiguator needed (unlike Statistics V2's "Austria
// 2026", one of several duplicates by that name).
const REPORT_NAME = 'Austria-Legal11111';

type WorkerFixtures = {
  mfeReportDetail: MfeReportDetailPage;
  votingFirmDetailsSection: VotingFirmDetailsSection;
};

/**
 * Navigates Home > Reports > search > open the MFE report "Austria-Legal11111"
 * exactly once per worker (same one-load-per-file pattern as `reportDetail`
 * in reportDetail.fixture.ts). MFE is a structurally distinct report type
 * from Statistics V2 - shares only the Home/Reports navigation, not the
 * detail-page section structure - so it gets its own fixture file rather
 * than branching the existing one.
 */
export const test = base.extend<{}, WorkerFixtures>({
  mfeReportDetail: [
    async ({ browser }, use) => {
      const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
      const page = await context.newPage();

      await page.goto(APP_URL);
      const homePage = new HomePage(page);
      await homePage.waitForLoad();

      const reports = await homePage.openReports();
      await reports.searchFor(REPORT_NAME);
      await reports.reportRowsByName(REPORT_NAME).first().getByRole('button', { name: 'View item details' }).click();

      const detail = new MfeReportDetailPage(page);
      await detail.waitForLoad();

      await use(detail);

      await context.close();
    },
    { scope: 'worker' },
  ],

  votingFirmDetailsSection: [
    async ({ mfeReportDetail }, use) => {
      const section = mfeReportDetail.votingFirmDetailsSection;
      await section.expand();

      // Confirmed live: the section's fields become visible before the
      // record's real data has finished loading from Dataverse - a test
      // starting right after expand() can act on stale/blank values, and
      // the real load finishing moments later then silently overwrites
      // whatever the test just changed. Wait for a known-populated field to
      // actually hold its real persisted value (a generous timeout, since
      // MFE's richer field set - including option-set-backed dropdowns -
      // can take longer to settle than Statistics V2's simpler sections)
      // before handing the section to any test.
      await expect(section.legalEntityLegalNameInput).toHaveValue(
        votingFirmDetailsSectionTestData.legalEntityLegalName,
        { timeout: 60_000 }
      );
      await expect(section.servicesProvidedButton).toBeVisible({ timeout: 60_000 });

      // Every test in this file assumes the record starts from the fully
      // restored "Completed" baseline (the last test's reset point). If an
      // earlier run of this suite crashed or was stopped before reaching
      // that last test, the live record is left mid-mutation - confirmed
      // live this actually happened once (a prior interrupted run left
      // "Details of other services" blank, section stuck on "In progress").
      // Fail here with a clear, specific message instead of letting the
      // first test fail confusingly deep in an unrelated assertion.
      await expect(section.statusRow, 'Record is not in its expected reset-point state - a previous run likely left it mid-mutation; restore it manually before running this file again').toContainText(
        'Completed',
        { timeout: 60_000 }
      );

      await use(section);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
