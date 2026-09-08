import { test, expect } from './fixtures/reportDetail.fixture';
import { auditAssuranceSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - Audit and Assurance Revenue Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('2.7 Total sums 2.1, 2.2, 2.4 and 2.5 only', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.fillField(
      auditAssuranceSection.relatedServiceEngagementsInput,
      data.relatedServiceEngagements
    );
    await auditAssuranceSection.fillField(auditAssuranceSection.auditsInput, data.audits);
    await auditAssuranceSection.fillField(auditAssuranceSection.reviewsInput, data.reviews);
    await auditAssuranceSection.fillField(
      auditAssuranceSection.otherAssuranceEngagementsInput,
      data.otherAssuranceEngagements
    );

    const total = await auditAssuranceSection.getTotalValue();
    expect(total).toBe(data.expectedTotal);
  });

  test('numeric fields cap input at 14 digits', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.fillField(
      auditAssuranceSection.relatedServiceEngagementsInput,
      data.overLimitAttempt
    );

    const value = await auditAssuranceSection.relatedServiceEngagementsInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(14);

    // Restore the valid value the rest of this file's tests depend on.
    await auditAssuranceSection.fillField(
      auditAssuranceSection.relatedServiceEngagementsInput,
      data.relatedServiceEngagements
    );
  });

  test('selecting "Yes" for 2.8 reveals the 2.8.1 field', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.selectEea('Yes');
    await expect(auditAssuranceSection.combinedTurnoverInput).toBeVisible();
  });

  test('2.8.1 greater than the 2.7 Total shows a validation error', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.fillField(
      auditAssuranceSection.combinedTurnoverInput,
      data.combinedTurnoverOverLimit
    );
    await expect(auditAssuranceSection.combinedTurnoverError).toBeVisible();
  });

  test('selecting "No" for 2.8 hides the 2.8.1 field', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.selectEea('No');
    await expect(auditAssuranceSection.combinedTurnoverInput).toBeHidden();
    await expect(auditAssuranceSection.combinedTurnoverError).toBeHidden();
  });

  test('2.3 greater than 2.2 shows a validation error', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.fillField(auditAssuranceSection.pieAuditsInput, data.pieAuditsOverLimit);
    await expect(auditAssuranceSection.pieAuditsError).toBeVisible();
  });

  test('2.6 greater than 2.5 shows a validation error', async ({ auditAssuranceSection }) => {
    await auditAssuranceSection.fillField(
      auditAssuranceSection.esgAssuranceEngagementsInput,
      data.esgOverLimit
    );
    await expect(auditAssuranceSection.esgAssuranceEngagementsError).toBeVisible();
  });

  test('saving with active validation errors marks the section "Validation error"', async ({
    auditAssuranceSection,
  }, testInfo) => {
    await auditAssuranceSection.save();

    await expect(auditAssuranceSection.saveSuccessAlert).toHaveText('Form saved: Audit and assurance revenue');
    await expect(auditAssuranceSection.statusRow).toContainText('Validation error');

    const statusText = await auditAssuranceSection.getStatusText();
    console.log(`Audit and assurance revenue status while 2.3/2.6 are invalid: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('fixing invalid values but leaving one field empty marks the section "In progress"', async ({
    auditAssuranceSection,
  }, testInfo) => {
    await auditAssuranceSection.fillField(auditAssuranceSection.pieAuditsInput, data.pieAuditsWithinLimit);
    await auditAssuranceSection.fillField(
      auditAssuranceSection.esgAssuranceEngagementsInput,
      data.esgWithinLimit
    );
    await auditAssuranceSection.fillField(auditAssuranceSection.relatedServiceEngagementsInput, '');
    await auditAssuranceSection.save();

    await expect(auditAssuranceSection.saveSuccessAlert).toHaveText('Form saved: Audit and assurance revenue');
    await expect(auditAssuranceSection.statusRow).toContainText('In progress');

    const statusText = await auditAssuranceSection.getStatusText();
    console.log(`Audit and assurance revenue status with 2.1 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every field validly marks the section "Completed"', async ({
    auditAssuranceSection,
  }, testInfo) => {
    await auditAssuranceSection.fillField(
      auditAssuranceSection.relatedServiceEngagementsInput,
      data.relatedServiceEngagements
    );
    await auditAssuranceSection.save();

    await expect(auditAssuranceSection.saveSuccessAlert).toHaveText('Form saved: Audit and assurance revenue');
    await expect(auditAssuranceSection.statusRow).toContainText('Completed');

    const statusText = await auditAssuranceSection.getStatusText();
    console.log(`Audit and assurance revenue status with all fields valid: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
