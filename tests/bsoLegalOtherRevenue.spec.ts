import { test, expect } from './fixtures/reportDetail.fixture';
import { bsoLegalOtherRevenueSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - BSO, Legal and Other Revenue Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('5.5 BSO total sums 5.1 through 5.4', async ({ bsoLegalOtherRevenueSection }) => {
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.bsoAccountingInput,
      data.bsoAccounting
    );
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.payrollAndHrInput,
      data.payrollAndHr
    );
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.globalComplianceInput,
      data.globalCompliance
    );
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.businessAdvisoryInput,
      data.businessAdvisory
    );

    const bsoTotal = await bsoLegalOtherRevenueSection.getBsoTotalValue();
    expect(bsoTotal).toBe(data.expectedBsoTotal);
  });

  test('5.6 Legal total and 5.7 Other total are directly editable, not computed', async ({
    bsoLegalOtherRevenueSection,
  }) => {
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.legalTotalInput,
      data.legalTotal
    );
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.otherTotalInput,
      data.otherTotal
    );

    await expect(bsoLegalOtherRevenueSection.legalTotalInput).toHaveValue(data.legalTotal);
    await expect(bsoLegalOtherRevenueSection.otherTotalInput).toHaveValue(data.otherTotal);
  });

  test('5.8 Other revenue description is optional for completeness', async ({
    bsoLegalOtherRevenueSection,
  }) => {
    // Confirmed live: Power Apps only enables Save when a field's typed
    // value actually differs from what's currently persisted - retyping an
    // unchanged value leaves Save disabled. Nudging 5.7 to a different
    // valid value guarantees Save is enabled on a rerun, even if 5.1-5.7
    // already hold these exact values from a previous run.
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.otherTotalInput,
      String(Number(data.otherTotal) + 1)
    );
    await bsoLegalOtherRevenueSection.save();

    await expect(bsoLegalOtherRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: BSO, legal and other revenue'
    );
    await expect(bsoLegalOtherRevenueSection.statusRow).toContainText('Completed');
  });

  test('5.8 caps input at 250 characters', async ({ bsoLegalOtherRevenueSection }) => {
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.otherRevenueDescriptionInput,
      data.otherRevenueDescriptionOverLimitAttempt
    );

    const value = await bsoLegalOtherRevenueSection.otherRevenueDescriptionInput.inputValue();
    expect(value).toBe(data.otherRevenueDescriptionMaxLength);
    expect(value.length).toBe(250);

    // Restore the empty state the rest of this file's tests depend on.
    await bsoLegalOtherRevenueSection.fillField(bsoLegalOtherRevenueSection.otherRevenueDescriptionInput, '');
  });

  test('numeric fields cap input at 14 digits', async ({ bsoLegalOtherRevenueSection }) => {
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.bsoAccountingInput,
      data.overLimitAttempt
    );

    const value = await bsoLegalOtherRevenueSection.bsoAccountingInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(14);

    // Restore the valid value the rest of this file's tests depend on.
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.bsoAccountingInput,
      data.bsoAccounting
    );
  });

  test('one empty field marks the section "In progress"', async ({
    bsoLegalOtherRevenueSection,
  }, testInfo) => {
    await bsoLegalOtherRevenueSection.fillField(bsoLegalOtherRevenueSection.bsoAccountingInput, '');
    await bsoLegalOtherRevenueSection.save();

    await expect(bsoLegalOtherRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: BSO, legal and other revenue'
    );
    await expect(bsoLegalOtherRevenueSection.statusRow).toContainText('In progress');

    const statusText = await bsoLegalOtherRevenueSection.getStatusText();
    console.log(`BSO, legal and other revenue status with 5.1 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every numeric field marks the section "Completed"', async ({
    bsoLegalOtherRevenueSection,
  }, testInfo) => {
    await bsoLegalOtherRevenueSection.fillField(
      bsoLegalOtherRevenueSection.bsoAccountingInput,
      data.bsoAccounting
    );
    await bsoLegalOtherRevenueSection.save();

    await expect(bsoLegalOtherRevenueSection.saveSuccessAlert).toHaveText(
      'Form saved: BSO, legal and other revenue'
    );
    await expect(bsoLegalOtherRevenueSection.statusRow).toContainText('Completed');

    const statusText = await bsoLegalOtherRevenueSection.getStatusText();
    console.log(`BSO, legal and other revenue status with all fields filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
