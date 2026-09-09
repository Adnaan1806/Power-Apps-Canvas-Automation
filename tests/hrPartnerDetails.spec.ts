import { test, expect } from './fixtures/reportDetail.fixture';
import { hrPartnerDetailsSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - HR Partner Details Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('each category\'s female partners count is validated against its partners count', async ({
    hrPartnerDetailsSection,
  }) => {
    const pairs = hrPartnerDetailsSection.categoryPairs;

    for (const [index, pair] of pairs.entries()) {
      const values = data.categories[index];

      await hrPartnerDetailsSection.fillField(pair.partnersInput, values.partners);
      await hrPartnerDetailsSection.fillField(pair.femaleInput, values.femaleOverLimit);
      await expect(pair.error, `${pair.name} female-exceeds-partners error`).toBeVisible();

      // Leaves this pair at its valid values - also the state the later
      // "filling every required field marks Completed" test depends on.
      await hrPartnerDetailsSection.fillField(pair.femaleInput, values.female);
      await expect(pair.error, `${pair.name} error clears once valid`).toBeHidden();
    }
  });

  test('numeric fields cap typed input at 12 characters', async ({ hrPartnerDetailsSection }) => {
    await hrPartnerDetailsSection.fillField(
      hrPartnerDetailsSection.aaPartnersInput,
      data.overLimitAttempt
    );

    const value = await hrPartnerDetailsSection.aaPartnersInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(12);

    // Restore the valid value the rest of this file's tests depend on -
    // the 12-digit value just typed is a real, save-able-looking value at
    // the DOM level, but the next test proves it actually isn't.
    await hrPartnerDetailsSection.fillField(
      hrPartnerDetailsSection.aaPartnersInput,
      data.categories[0].partners
    );
  });

  test('saving with a female-exceeds-partners error active marks the section "Validation error"', async ({
    hrPartnerDetailsSection,
  }, testInfo) => {
    const [aaPair] = hrPartnerDetailsSection.categoryPairs;
    const [aaValues] = data.categories;

    await hrPartnerDetailsSection.fillField(aaPair.femaleInput, aaValues.femaleOverLimit);
    await expect(aaPair.error).toBeVisible();

    await hrPartnerDetailsSection.save();

    await expect(hrPartnerDetailsSection.saveSuccessAlert).toHaveText('Form saved: HR partner details');
    await expect(hrPartnerDetailsSection.statusRow).toContainText('Validation error');

    const statusText = await hrPartnerDetailsSection.getStatusText();
    console.log(`HR partner details status with 9.2 exceeding 9.1: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });

    // Restore the valid value the rest of this file's tests depend on.
    await hrPartnerDetailsSection.fillField(aaPair.femaleInput, aaValues.female);
    await expect(aaPair.error).toBeHidden();
  });

  test('9.13 caps input at 250 characters', async ({ hrPartnerDetailsSection }) => {
    await hrPartnerDetailsSection.fillField(
      hrPartnerDetailsSection.otherPartnersExplanationInput,
      data.explanationOverLimitAttempt
    );

    const value = await hrPartnerDetailsSection.otherPartnersExplanationInput.inputValue();
    expect(value).toBe(data.explanationMaxLength);
    expect(value.length).toBe(250);

    // Restore the empty state the rest of this file's tests depend on.
    await hrPartnerDetailsSection.fillField(hrPartnerDetailsSection.otherPartnersExplanationInput, '');
  });

  test('one empty required field marks the section "In progress"', async ({
    hrPartnerDetailsSection,
  }, testInfo) => {
    await hrPartnerDetailsSection.fillField(hrPartnerDetailsSection.taxPartnersInput, '');
    await hrPartnerDetailsSection.save();

    await expect(hrPartnerDetailsSection.saveSuccessAlert).toHaveText('Form saved: HR partner details');
    await expect(hrPartnerDetailsSection.statusRow).toContainText('In progress');

    const statusText = await hrPartnerDetailsSection.getStatusText();
    console.log(`HR partner details status with 9.3 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every required field marks the section "Completed"', async ({
    hrPartnerDetailsSection,
  }, testInfo) => {
    const pairs = hrPartnerDetailsSection.categoryPairs;
    for (const [index, pair] of pairs.entries()) {
      const values = data.categories[index];
      await hrPartnerDetailsSection.fillField(pair.partnersInput, values.partners);
      await hrPartnerDetailsSection.fillField(pair.femaleInput, values.female);
    }

    await hrPartnerDetailsSection.save();

    await expect(hrPartnerDetailsSection.saveSuccessAlert).toHaveText('Form saved: HR partner details');
    await expect(hrPartnerDetailsSection.statusRow).toContainText('Completed');

    const statusText = await hrPartnerDetailsSection.getStatusText();
    console.log(`HR partner details status with every required field filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
