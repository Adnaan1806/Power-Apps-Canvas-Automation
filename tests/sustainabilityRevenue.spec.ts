import { test, expect } from './fixtures/reportDetail.fixture';
import { sustainabilityRevenueSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - Sustainability Revenue Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('selecting "Yes" for 7.2 reveals the 7.2.1-7.2.6 fields', async ({ sustainabilityRevenueSection }) => {
    await sustainabilityRevenueSection.selectBreakdown('Yes');
    await expect(sustainabilityRevenueSection.sustainabilityStrategyInput).toBeVisible();
    await expect(sustainabilityRevenueSection.regulatoryReportingAdvisoryInput).toBeVisible();
    await expect(sustainabilityRevenueSection.assuranceInput).toBeVisible();
    await expect(sustainabilityRevenueSection.climateServicesInput).toBeVisible();
    await expect(sustainabilityRevenueSection.sustainableFinanceInput).toBeVisible();
    await expect(sustainabilityRevenueSection.advisoryOtherInput).toBeVisible();
  });

  test('7.2.1 Sustainability strategy caps input at 14 digits', async ({ sustainabilityRevenueSection }) => {
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.sustainabilityStrategyInput,
      data.overLimitAttempt
    );

    const value = await sustainabilityRevenueSection.sustainabilityStrategyInput.inputValue();
    expect(value).toBe(data.breakdownMaxLengthValue);
    expect(value.length).toBe(14);
  });

  // Confirmed live: unlike every other numeric field in this section (and
  // every field in sections 2-6), 7.1 caps at 16 digits - the same cap as
  // General's top-level revenue field - not 14.
  test('7.1 Total sustainability-related revenue caps input at 16 digits', async ({
    sustainabilityRevenueSection,
  }) => {
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.totalRevenueInput,
      data.overLimitAttempt
    );

    const value = await sustainabilityRevenueSection.totalRevenueInput.inputValue();
    expect(value).toBe(data.totalRevenueMaxLengthValue);
    expect(value.length).toBe(16);
  });

  test('7.1 not equal to sum of 7.2.1-7.2.6 shows a validation error', async ({
    sustainabilityRevenueSection,
  }) => {
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.sustainabilityStrategyInput,
      data.sustainabilityStrategy
    );
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.regulatoryReportingAdvisoryInput,
      data.regulatoryReportingAdvisory
    );
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.assuranceInput,
      data.assurance
    );
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.climateServicesInput,
      data.climateServices
    );
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.sustainableFinanceInput,
      data.sustainableFinance
    );
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.advisoryOtherInput,
      data.advisoryOther
    );
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.totalRevenueInput,
      data.totalRevenueMismatched
    );

    await expect(sustainabilityRevenueSection.totalRevenueError).toBeVisible();
  });

  test('saving with the active validation error marks the section "Validation error"', async ({
    sustainabilityRevenueSection,
  }, testInfo) => {
    await sustainabilityRevenueSection.save();

    await expect(sustainabilityRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: Sustainability revenue'
    );
    await expect(sustainabilityRevenueSection.statusRow).toContainText('Validation error');

    const statusText = await sustainabilityRevenueSection.getStatusText();
    console.log(`Sustainability revenue status while 7.1 is mismatched: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('fixing the sum to match 7.1 and saving marks the section "Completed"', async ({
    sustainabilityRevenueSection,
  }, testInfo) => {
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.totalRevenueInput,
      data.totalRevenue
    );
    await expect(sustainabilityRevenueSection.totalRevenueError).toBeHidden();

    await sustainabilityRevenueSection.save();

    await expect(sustainabilityRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: Sustainability revenue'
    );
    await expect(sustainabilityRevenueSection.statusRow).toContainText('Completed');

    const statusText = await sustainabilityRevenueSection.getStatusText();
    console.log(`Sustainability revenue status with a matching breakdown sum: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('selecting "No" for 7.2 hides the 7.2.1-7.2.6 fields', async ({ sustainabilityRevenueSection }) => {
    await sustainabilityRevenueSection.selectBreakdown('No');
    await expect(sustainabilityRevenueSection.sustainabilityStrategyInput).toBeHidden();
    await expect(sustainabilityRevenueSection.regulatoryReportingAdvisoryInput).toBeHidden();
    await expect(sustainabilityRevenueSection.assuranceInput).toBeHidden();
    await expect(sustainabilityRevenueSection.climateServicesInput).toBeHidden();
    await expect(sustainabilityRevenueSection.sustainableFinanceInput).toBeHidden();
    await expect(sustainabilityRevenueSection.advisoryOtherInput).toBeHidden();
    await expect(sustainabilityRevenueSection.totalRevenueError).toBeHidden();
  });

  test('leaving 7.1 empty (with 7.2 "No") marks the section "In progress"', async ({
    sustainabilityRevenueSection,
  }, testInfo) => {
    await sustainabilityRevenueSection.fillField(sustainabilityRevenueSection.totalRevenueInput, '');
    await sustainabilityRevenueSection.save();

    await expect(sustainabilityRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: Sustainability revenue'
    );
    await expect(sustainabilityRevenueSection.statusRow).toContainText('In progress');

    const statusText = await sustainabilityRevenueSection.getStatusText();
    console.log(`Sustainability revenue status with 7.1 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('with 7.2 "No", filling only 7.1 and saving marks the section "Completed"', async ({
    sustainabilityRevenueSection,
  }, testInfo) => {
    await sustainabilityRevenueSection.fillField(
      sustainabilityRevenueSection.totalRevenueInput,
      data.totalRevenueOnly
    );
    await sustainabilityRevenueSection.save();

    await expect(sustainabilityRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: Sustainability revenue'
    );
    await expect(sustainabilityRevenueSection.statusRow).toContainText('Completed');

    const statusText = await sustainabilityRevenueSection.getStatusText();
    console.log(`Sustainability revenue status with only 7.1 filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
