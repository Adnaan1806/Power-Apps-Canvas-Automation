import { test, expect } from './fixtures/reportDetail.fixture';
import { officesSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - Offices Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('numeric field caps input at 12 characters', async ({ officesSection }) => {
    await officesSection.fillField(officesSection.numberOfOfficesInput, data.overLimitAttempt);

    const value = await officesSection.numberOfOfficesInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(12);

    // Restore the valid value the rest of this file's tests depend on.
    await officesSection.fillField(officesSection.numberOfOfficesInput, data.numberOfOffices);
  });

  test('12.2 caps input at 250 characters', async ({ officesSection }) => {
    await officesSection.fillField(officesSection.otherCommentsInput, data.explanationOverLimitAttempt);

    const value = await officesSection.otherCommentsInput.inputValue();
    expect(value).toBe(data.explanationMaxLength);
    expect(value.length).toBe(250);

    // Restore the empty state the rest of this file's tests depend on.
    await officesSection.fillField(officesSection.otherCommentsInput, '');
  });

  test('filling only 12.2, leaving 12.1 empty, marks the section "In progress"', async ({
    officesSection,
  }, testInfo) => {
    // Confirmed live: unlike every other section (multiple fields, so a
    // partial fill naturally shows "In progress"), this section has only
    // one required field - clearing it alone reverts the section all the
    // way to "New" (not started), since there's nothing left to be
    // "partially" done. Filling the OPTIONAL field while 12.1 stays empty
    // is what actually demonstrates "In progress" here.
    await officesSection.fillField(officesSection.numberOfOfficesInput, '');
    await officesSection.fillField(officesSection.otherCommentsInput, data.otherComments);
    await officesSection.save();

    await expect(officesSection.saveSuccessAlert).toHaveText('Form saved: Offices');
    await expect(officesSection.statusRow).toContainText('In progress');

    const statusText = await officesSection.getStatusText();
    console.log(`Offices status with only 12.2 filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling 12.1 marks the section "Completed"', async ({ officesSection }, testInfo) => {
    await officesSection.fillField(officesSection.numberOfOfficesInput, data.numberOfOffices);
    await officesSection.save();

    await expect(officesSection.saveSuccessAlert).toHaveText('Form saved: Offices');
    await expect(officesSection.statusRow).toContainText('Completed');

    const statusText = await officesSection.getStatusText();
    console.log(`Offices status with 12.1 filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
