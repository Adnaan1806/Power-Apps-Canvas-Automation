import { test, expect } from './fixtures/reportDetail.fixture';
import { sectorRevenueSectionTestData as data } from './fixtures/testData';

test.describe('BFR Canvas App - Report Detail - Sector Revenue Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('6.16 Total sums all fifteen fields', async ({ sectorRevenueSection }) => {
    await sectorRevenueSection.fillField(sectorRevenueSection.financialServicesInput, data.financialServices);
    await sectorRevenueSection.fillField(sectorRevenueSection.privateEquityInput, data.privateEquity);
    await sectorRevenueSection.fillField(sectorRevenueSection.naturalResourcesInput, data.naturalResources);
    await sectorRevenueSection.fillField(
      sectorRevenueSection.realEstateConstructionInput,
      data.realEstateConstruction
    );
    await sectorRevenueSection.fillField(sectorRevenueSection.publicSectorInput, data.publicSector);
    await sectorRevenueSection.fillField(sectorRevenueSection.technologyInput, data.technology);
    await sectorRevenueSection.fillField(
      sectorRevenueSection.mediaAndEntertainmentInput,
      data.mediaAndEntertainment
    );
    await sectorRevenueSection.fillField(
      sectorRevenueSection.telecommunicationsInput,
      data.telecommunications
    );
    await sectorRevenueSection.fillField(sectorRevenueSection.consumerBusinessInput, data.consumerBusiness);
    await sectorRevenueSection.fillField(sectorRevenueSection.notForProfitInput, data.notForProfit);
    await sectorRevenueSection.fillField(sectorRevenueSection.manufacturingInput, data.manufacturing);
    await sectorRevenueSection.fillField(
      sectorRevenueSection.professionalServicesInput,
      data.professionalServices
    );
    await sectorRevenueSection.fillField(
      sectorRevenueSection.transportAndLogisticsInput,
      data.transportAndLogistics
    );
    await sectorRevenueSection.fillField(sectorRevenueSection.healthcareInput, data.healthcare);
    await sectorRevenueSection.fillField(sectorRevenueSection.otherInput, data.other);

    const total = await sectorRevenueSection.getTotalValue();
    expect(total).toBe(data.expectedTotal);
  });

  test('numeric fields cap input at 14 digits', async ({ sectorRevenueSection }) => {
    await sectorRevenueSection.fillField(
      sectorRevenueSection.financialServicesInput,
      data.overLimitAttempt
    );

    const value = await sectorRevenueSection.financialServicesInput.inputValue();
    expect(value).toBe(data.maxLengthValue);
    expect(value.length).toBe(14);

    // Restore the valid value the rest of this file's tests depend on.
    await sectorRevenueSection.fillField(
      sectorRevenueSection.financialServicesInput,
      data.financialServices
    );
  });

  test('one empty field marks the section "In progress"', async ({ sectorRevenueSection }, testInfo) => {
    await sectorRevenueSection.fillField(sectorRevenueSection.financialServicesInput, '');
    await sectorRevenueSection.save();

    await expect(sectorRevenueSection.saveSuccessAlert).toHaveText('Form saved: Sector revenue');
    await expect(sectorRevenueSection.statusRow).toContainText('In progress');

    const statusText = await sectorRevenueSection.getStatusText();
    console.log(`Sector revenue status with 6.1 empty: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });

  test('filling every field marks the section "Completed"', async ({ sectorRevenueSection }, testInfo) => {
    await sectorRevenueSection.fillField(
      sectorRevenueSection.financialServicesInput,
      data.financialServices
    );
    await sectorRevenueSection.save();

    await expect(sectorRevenueSection.saveSuccessAlert).toHaveText('Form saved: Sector revenue');
    await expect(sectorRevenueSection.statusRow).toContainText('Completed');

    const statusText = await sectorRevenueSection.getStatusText();
    console.log(`Sector revenue status with all fields filled: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
