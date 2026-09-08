import { test, expect } from './fixtures/reportDetail.fixture';
import { taxRevenueSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - Tax Revenue Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('3.11 Total sums all ten fields', async ({ taxRevenueSection }) => {
    await taxRevenueSection.fillField(taxRevenueSection.complianceInput, data.compliance);
    await taxRevenueSection.fillField(
      taxRevenueSection.corporateInternationalTaxInput,
      data.corporateInternationalTax
    );
    await taxRevenueSection.fillField(
      taxRevenueSection.taxAssuranceAndRiskManagementInput,
      data.taxAssuranceAndRiskManagement
    );
    await taxRevenueSection.fillField(taxRevenueSection.transferPricingInput, data.transferPricing);
    await taxRevenueSection.fillField(taxRevenueSection.indirectTaxInput, data.indirectTax);
    await taxRevenueSection.fillField(taxRevenueSection.employerServicesInput, data.employerServices);
    await taxRevenueSection.fillField(
      taxRevenueSection.privateClientsServicesInput,
      data.privateClientsServices
    );
    await taxRevenueSection.fillField(taxRevenueSection.maTaxServicesInput, data.maTaxServices);
    await taxRevenueSection.fillField(
      taxRevenueSection.rdCreditsAndIncentivesInput,
      data.rdCreditsAndIncentives
    );
    await taxRevenueSection.fillField(taxRevenueSection.otherTaxServicesInput, data.otherTaxServices);

    const total = await taxRevenueSection.getTotalValue();
    expect(total).toBe(data.expectedTotal);
  });

  test('numeric fields cap input at 14 digits', async ({ taxRevenueSection }) => {
    await taxRevenueSection.fillField(taxRevenueSection.complianceInput, data.overLimitAttempt);

    const value = await taxRevenueSection.complianceInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(14);

    // Restore the valid value the rest of this file's tests depend on.
    await taxRevenueSection.fillField(taxRevenueSection.complianceInput, data.compliance);
  });

  test('one empty field marks the section "In progress"', async ({ taxRevenueSection }, testInfo) => {
    await taxRevenueSection.fillField(taxRevenueSection.complianceInput, '');
    await taxRevenueSection.save();

    await expect(taxRevenueSection.saveSuccessAlert).toHaveText('Form saved: Tax revenue');
    await expect(taxRevenueSection.statusRow).toContainText('In progress');

    const statusText = await taxRevenueSection.getStatusText();
    console.log(`Tax revenue status with 3.1 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every field marks the section "Completed"', async ({ taxRevenueSection }, testInfo) => {
    await taxRevenueSection.fillField(taxRevenueSection.complianceInput, data.compliance);
    await taxRevenueSection.save();

    await expect(taxRevenueSection.saveSuccessAlert).toHaveText('Form saved: Tax revenue');
    await expect(taxRevenueSection.statusRow).toContainText('Completed');

    const statusText = await taxRevenueSection.getStatusText();
    console.log(`Tax revenue status with all fields filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
