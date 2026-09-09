import { test, expect } from './fixtures/pages.fixture';

test.describe('BFR Canvas App - Home', () => {
  test.describe.configure({ mode: 'serial' });

  test('home screen loads with welcome banner and My tasks gallery', async ({ homePage }) => {
    await expect(homePage.welcomeHeading).toBeVisible();
    await expect(homePage.myTasksHeading).toBeVisible();
    await expect(homePage.myTasksGallery.getByRole('listitem').first()).toBeVisible();
  });
});

test.describe('BFR Canvas App - Reports', () => {
  test.describe.configure({ mode: 'serial' });

  test('navigating to Reports shows the All Reports screen', async ({ homePage }) => {
    const reports = await homePage.openReports();

    await expect(reports.pageHeading).toBeVisible();
    await expect(reports.searchBox).toBeVisible();
    await expect(reports.statusFilterButton).toBeVisible();
  });

  test('searching "Austria" filters the gallery to only Austria reports', async ({ homePage }) => {
    const reports = await homePage.openReports();

    await reports.searchFor('Austria');

    const rowCount = await reports.getVisibleReportCount();
    expect(rowCount).toBeGreaterThan(0);

    const rows = reports.resultRows;
    for (let i = 0; i < rowCount; i++) {
      await expect(rows.nth(i)).toContainText('Austria');
    }
  });

  test('clearing the search restores the full unfiltered list', async ({ homePage }) => {
    const reports = await homePage.openReports();
    await reports.searchFor('Austria');
    const filteredCount = await reports.getVisibleReportCount();

    await reports.clearSearch();

    await expect(reports.searchBox).toHaveValue('');
    const fullCount = await reports.getVisibleReportCount();
    expect(fullCount).toBeGreaterThan(filteredCount);
  });

  test('a zero-match search shows an empty gallery', async ({ homePage }) => {
    const reports = await homePage.openReports();

    await reports.searchFor('zzzzzznotreal');

    await expect(reports.noResultsMessage).toBeVisible();
    expect(await reports.getVisibleReportCount()).toBe(0);
  });

  test('filtering by status shows only reports with that status', async ({ homePage }) => {
    // openReports() already lands with an empty search box - navigating to
    // Reports resets it (verified live), so there's nothing to clear here.
    const reports = await homePage.openReports();

    await reports.filterByStatus('Approved');

    const rowCount = await reports.getVisibleReportCount();
    expect(rowCount).toBeGreaterThan(0);

    const rows = reports.resultRows;
    for (let i = 0; i < rowCount; i++) {
      await expect(rows.nth(i)).toContainText('Approved');
    }

    // The status filter persists across screen navigation (unlike search,
    // which resets) - confirmed live it's saved against the account, not
    // just this page/session, so it would otherwise leak into every other
    // spec file's own report lookup. Reset it here, since this test is the
    // one that dirtied it - not every downstream consumer's job to guard
    // against it defensively.
    await reports.clearStatusFilter();
  });

  test('opening a filtered report navigates to its detail screen', async ({ homePage }) => {
    const reports = await homePage.openReports();
    await reports.searchFor('Austria');

    const detail = await reports.openReportDetails('Austria 2026', { dueDate: '30 Jun 2025' });

    await expect(detail.reportTitle).toHaveText('Austria 2026 Statistics Report');
    await expect(detail.formStatus).toContainText('Pending completion by the BFR Champion');
    await expect(detail.submitButton).toBeDisabled();
    await expect(detail.saveAllButton).toBeDisabled();
  });
});
