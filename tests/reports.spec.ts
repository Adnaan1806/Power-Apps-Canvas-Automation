import { test, expect } from './fixtures/pages.fixture';

test.describe('BFR Canvas App - Home', () => {
  test('home screen loads with welcome banner and My tasks gallery', async ({ homePage }) => {
    await expect(homePage.welcomeHeading).toBeVisible();
    await expect(homePage.myTasksHeading).toBeVisible();
    await expect(homePage.myTasksGallery.getByRole('listitem').first()).toBeVisible();
  });
});

test.describe('BFR Canvas App - Reports', () => {
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
