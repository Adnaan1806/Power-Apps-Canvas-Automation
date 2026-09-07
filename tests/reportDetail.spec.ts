import { test, expect } from './fixtures/reportDetail.fixture';
import { generalSectionTestData } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - General Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('Total Revenue Declared caps input at 16 digits, then saves successfully', async ({ generalSection }) => {
    await generalSection.fillTotalRevenue(generalSectionTestData.overLimitRevenueAttempt);

    const value = await generalSection.getTotalRevenueValue();
    expect(value).toBe(generalSectionTestData.maxLengthRevenue);
    expect(value.length).toBe(16);

    await generalSection.save();
    await expect(generalSection.saveSuccessAlert).toHaveText('Form saved: General');
  });

  test('removing a field value and saving updates the section status', async ({ generalSection }) => {
    await generalSection.clearTotalRevenue();
    await generalSection.save();

    await expect(generalSection.saveSuccessAlert).toHaveText('Form saved: General');
    await expect(generalSection.statusRow).toContainText('In progress');
  });

  test('filling the field back in and saving marks the section Completed', async ({ generalSection }) => {
    await generalSection.fillTotalRevenue(generalSectionTestData.validRevenue);
    await generalSection.save();

    await expect(generalSection.saveSuccessAlert).toHaveText('Form saved: General');
    await expect(generalSection.statusRow).toContainText('Completed');
  });
});
