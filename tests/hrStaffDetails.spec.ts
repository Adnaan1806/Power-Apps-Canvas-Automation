import { test, expect } from './fixtures/reportDetail.fixture';
import { hrStaffDetailsSectionTestData as data } from './fixtures/testData';

/** Formats a numeric string into the app's own space-grouped display convention, e.g. "370000" -> "370 000". */
function formatThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

test.describe('BFR Canvas App - Report Detail - HR Staff Details Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('10.4 A&A prof staff total sums 10.1-10.3, and 10.5 is validated against it', async ({
    hrStaffDetailsSection,
  }) => {
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaSeniorManagersInput, data.aaSeniorManagers);
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaManagersInput, data.aaManagers);
    await hrStaffDetailsSection.fillField(
      hrStaffDetailsSection.aaAuditorsAnalystsInput,
      data.aaAuditorsAnalysts
    );

    // toHaveText auto-retries in case 10.4's own recompute lags briefly
    // behind its three inputs settling (same stale-total risk as every
    // other section's auto-computed total).
    await expect(hrStaffDetailsSection.aaProfStaffTotalDisplay).toHaveText(
      formatThousands(data.expectedAaTotal)
    );

    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaFemaleProfStaffInput, data.aaFemaleOverLimit);
    await expect(hrStaffDetailsSection.aaFemaleProfStaffError).toBeVisible();

    // Leaves 10.5 at its valid value - also the state the later "filling
    // every required field marks Completed" test depends on.
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaFemaleProfStaffInput, data.aaFemale);
    await expect(hrStaffDetailsSection.aaFemaleProfStaffError).toBeHidden();
  });

  test('each simple category\'s female count is validated against its own staff count', async ({
    hrStaffDetailsSection,
  }) => {
    const pairs = hrStaffDetailsSection.simpleCategoryPairs;

    for (const [index, pair] of pairs.entries()) {
      const values = data.categories[index];

      await hrStaffDetailsSection.fillField(pair.staffInput, values.staff);
      await hrStaffDetailsSection.fillField(pair.femaleInput, values.femaleOverLimit);
      await expect(pair.error, `${pair.name} female-exceeds-staff error`).toBeVisible();

      // Leaves this pair at its valid values - also the state the later
      // "filling every required field marks Completed" test depends on.
      await hrStaffDetailsSection.fillField(pair.femaleInput, values.female);
      await expect(pair.error, `${pair.name} error clears once valid`).toBeHidden();
    }
  });

  test('numeric fields cap typed input at 13 characters', async ({ hrStaffDetailsSection }) => {
    await hrStaffDetailsSection.fillField(
      hrStaffDetailsSection.taxProfStaffInput,
      data.overLimitAttempt
    );

    const value = await hrStaffDetailsSection.taxProfStaffInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(13);

    // Restore the valid value the rest of this file's tests depend on -
    // the 13-digit value just typed is a real, save-able-looking value at
    // the DOM level, but the next test proves it actually isn't.
    await hrStaffDetailsSection.fillField(
      hrStaffDetailsSection.taxProfStaffInput,
      data.categories[0].staff
    );
  });

  test('saving with a female-exceeds-staff error active marks the section "Validation error"', async ({
    hrStaffDetailsSection,
  }, testInfo) => {
    const [taxPair] = hrStaffDetailsSection.simpleCategoryPairs;
    const [taxValues] = data.categories;

    await hrStaffDetailsSection.fillField(taxPair.femaleInput, taxValues.femaleOverLimit);
    await expect(taxPair.error).toBeVisible();

    await hrStaffDetailsSection.save();

    await expect(hrStaffDetailsSection.saveSuccessAlert).toHaveText('Form saved: HR staff details');
    await expect(hrStaffDetailsSection.statusRow).toContainText('Validation error');

    const statusText = await hrStaffDetailsSection.getStatusText();
    console.log(`HR staff details status with 10.7 exceeding 10.6: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });

    // Restore the valid value the rest of this file's tests depend on.
    await hrStaffDetailsSection.fillField(taxPair.femaleInput, taxValues.female);
    await expect(taxPair.error).toBeHidden();
  });

  test('10.16 caps input at 250 characters', async ({ hrStaffDetailsSection }) => {
    await hrStaffDetailsSection.fillField(
      hrStaffDetailsSection.otherProfStaffExplanationInput,
      data.explanationOverLimitAttempt
    );

    const value = await hrStaffDetailsSection.otherProfStaffExplanationInput.inputValue();
    expect(value).toBe(data.explanationMaxLength);
    expect(value.length).toBe(250);

    // Restore the empty state the rest of this file's tests depend on.
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.otherProfStaffExplanationInput, '');
  });

  test('one empty required field marks the section "In progress"', async ({
    hrStaffDetailsSection,
  }, testInfo) => {
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.overheadStaffInput, '');
    await hrStaffDetailsSection.save();

    await expect(hrStaffDetailsSection.saveSuccessAlert).toHaveText('Form saved: HR staff details');
    await expect(hrStaffDetailsSection.statusRow).toContainText('In progress');

    const statusText = await hrStaffDetailsSection.getStatusText();
    console.log(`HR staff details status with 10.17 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every required field marks the section "Completed"', async ({
    hrStaffDetailsSection,
  }, testInfo) => {
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaSeniorManagersInput, data.aaSeniorManagers);
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaManagersInput, data.aaManagers);
    await hrStaffDetailsSection.fillField(
      hrStaffDetailsSection.aaAuditorsAnalystsInput,
      data.aaAuditorsAnalysts
    );
    await hrStaffDetailsSection.fillField(hrStaffDetailsSection.aaFemaleProfStaffInput, data.aaFemale);

    const pairs = hrStaffDetailsSection.simpleCategoryPairs;
    for (const [index, pair] of pairs.entries()) {
      const values = data.categories[index];
      await hrStaffDetailsSection.fillField(pair.staffInput, values.staff);
      await hrStaffDetailsSection.fillField(pair.femaleInput, values.female);
    }

    await hrStaffDetailsSection.save();

    await expect(hrStaffDetailsSection.saveSuccessAlert).toHaveText('Form saved: HR staff details');
    await expect(hrStaffDetailsSection.statusRow).toContainText('Completed');

    const statusText = await hrStaffDetailsSection.getStatusText();
    console.log(`HR staff details status with every required field filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
