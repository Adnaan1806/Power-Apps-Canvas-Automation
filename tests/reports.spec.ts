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
  });

  // Leaves the Reports screen (into the detail screen), so it runs last -
  // nothing after it needs a clean Reports state. Defensively clears the
  // status filter first: it persists across screen navigation (unlike
  // search, which resets), so a filter left active by the test above would
  // otherwise silently narrow these results too - confirmed live: searching
  // "Austria" while "Approved" was still selected dropped 10 matches down
  // to 1.

  test('opening a filtered report navigates to its detail screen', async ({ homePage }) => {
    const reports = await homePage.openReports();
    await reports.clearStatusFilter();
    await reports.searchFor('Austria');

    const detail = await reports.openReportDetails('Austria 2026', { dueDate: '30 Jun 2025' });

    await expect(detail.reportTitle).toHaveText('Austria 2026 Statistics Report');
    await expect(detail.formStatus).toContainText('Pending completion by the BFR Champion');
    await expect(detail.submitButton).toBeDisabled();
    await expect(detail.saveAllButton).toBeDisabled();
  });
});
