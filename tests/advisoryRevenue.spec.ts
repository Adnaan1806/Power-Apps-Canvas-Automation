import { test, expect } from './fixtures/reportDetail.fixture';
import { advisoryRevenueSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - Advisory Revenue Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('4.6 Deal advisory total sums 4.1 through 4.5', async ({ advisoryRevenueSection }) => {
    await advisoryRevenueSection.fillField(advisoryRevenueSection.maInput, data.ma);
    await advisoryRevenueSection.fillField(
      advisoryRevenueSection.transactionServicesInput,
      data.transactionServices
    );
    await advisoryRevenueSection.fillField(advisoryRevenueSection.valuationsInput, data.valuations);
    await advisoryRevenueSection.fillField(advisoryRevenueSection.restructuringInput, data.restructuring);
    await advisoryRevenueSection.fillField(advisoryRevenueSection.otherInput, data.other);

    const dealAdvisoryTotal = await advisoryRevenueSection.getDealAdvisoryTotalValue();
    expect(dealAdvisoryTotal).toBe(data.expectedDealAdvisoryTotal);
  });

  test('4.14 Total sums 4.6 plus 4.7 through 4.12', async ({ advisoryRevenueSection }) => {
    await advisoryRevenueSection.fillField(
      advisoryRevenueSection.riskAdvisoryServicesInput,
      data.riskAdvisoryServices
    );
    await advisoryRevenueSection.fillField(advisoryRevenueSection.digitalInput, data.digital);
    await advisoryRevenueSection.fillField(advisoryRevenueSection.forensicsInput, data.forensics);
    await advisoryRevenueSection.fillField(advisoryRevenueSection.cybersecurityInput, data.cybersecurity);
    await advisoryRevenueSection.fillField(
      advisoryRevenueSection.managementConsultingInput,
      data.managementConsulting
    );
    await advisoryRevenueSection.fillField(advisoryRevenueSection.otherRevenueInput, data.otherRevenue);

    const total = await advisoryRevenueSection.getTotalValue();
    expect(total).toBe(data.expectedTotal);
  });

  test('4.13 Other revenue description is optional for completeness', async ({
    advisoryRevenueSection,
  }) => {
    // Confirmed live: Power Apps only enables Save when a field's typed
    // value actually differs from what's currently persisted - retyping an
    // unchanged value leaves Save disabled. Nudging 4.12 to a different
    // valid value guarantees Save is enabled on a rerun, even if 4.1-4.12
    // already hold these exact values from a previous run.
    await advisoryRevenueSection.fillField(
      advisoryRevenueSection.otherRevenueInput,
      String(Number(data.otherRevenue) + 1)
    );
    await advisoryRevenueSection.save();

    await expect(advisoryRevenueSection.saveSuccessAlert).toHaveText('Form saved: Advisory revenue');
    await expect(advisoryRevenueSection.statusRow).toContainText('Completed');
  });

  test('4.13 caps input at 250 characters', async ({ advisoryRevenueSection }) => {
    await advisoryRevenueSection.fillField(
      advisoryRevenueSection.otherRevenueDescriptionInput,
      data.otherRevenueDescriptionOverLimitAttempt
    );

    const value = await advisoryRevenueSection.otherRevenueDescriptionInput.inputValue();
    expect(value).toBe(data.otherRevenueDescriptionMaxLength);
    expect(value.length).toBe(250);

    // Restore the empty state the rest of this file's tests depend on.
    await advisoryRevenueSection.fillField(advisoryRevenueSection.otherRevenueDescriptionInput, '');
  });

  test('numeric fields cap input at 14 digits', async ({ advisoryRevenueSection }) => {
    await advisoryRevenueSection.fillField(advisoryRevenueSection.maInput, data.overLimitAttempt);

    const value = await advisoryRevenueSection.maInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(14);

    // Restore the valid value the rest of this file's tests depend on.
    await advisoryRevenueSection.fillField(advisoryRevenueSection.maInput, data.ma);
  });

  test('one empty field marks the section "In progress"', async ({ advisoryRevenueSection }, testInfo) => {
    await advisoryRevenueSection.fillField(advisoryRevenueSection.maInput, '');
    await advisoryRevenueSection.save();

    await expect(advisoryRevenueSection.saveSuccessAlert).toHaveText('Form saved: Advisory revenue');
    await expect(advisoryRevenueSection.statusRow).toContainText('In progress');

    const statusText = await advisoryRevenueSection.getStatusText();
    console.log(`Advisory revenue status with 4.1 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every numeric field marks the section "Completed"', async ({
    advisoryRevenueSection,
  }, testInfo) => {
    await advisoryRevenueSection.fillField(advisoryRevenueSection.maInput, data.ma);
    await advisoryRevenueSection.save();

    await expect(advisoryRevenueSection.saveSuccessAlert).toHaveText('Form saved: Advisory revenue');
    await expect(advisoryRevenueSection.statusRow).toContainText('Completed');

    const statusText = await advisoryRevenueSection.getStatusText();
    console.log(`Advisory revenue status with all numeric fields filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
