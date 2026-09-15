import { test, expect } from '../fixtures/mfe.fixture';
import { votingFirmDetailsSectionTestData as data } from '../fixtures/mfeTestData';

// Confirmed live: the section's status label can lag several seconds behind
// the actual persisted state right after a save resolves (same class of
// delay as the "Form saved" toast's own auto-dismiss timing elsewhere in
// this project) - use a generous timeout on every status assertion instead
// of the config default.
const STATUS_TIMEOUT = 20_000;

test.describe('BFR Canvas App - MFE Report Detail - Voting Firm Details Section', () => {
  test.describe.configure({ mode: 'serial' });
  // MFE reports load noticeably slower than Statistics V2's - confirmed
  // live via a full-page loading overlay that stayed up 30+ seconds after
  // the shell rendered. The first test in this file absorbs that entire
  // wait as part of the worker fixture's setup, so it needs more headroom
  // than the project's global 150s test timeout.
  test.setTimeout(300_000);

  test('selecting "Other" reveals Details of other services; deselecting removes it, preserving its value', async ({
    votingFirmDetailsSection: section,
  }) => {
    await section.deselectMultiSelectOption(section.servicesProvidedButton, 'Other');
    await expect(section.detailsOfOtherServicesInput).toBeHidden();

    await section.selectMultiSelectOption(section.servicesProvidedButton, 'Other');
    await expect(section.detailsOfOtherServicesInput).toBeVisible();
    await expect(section.detailsOfOtherServicesInput).toHaveValue(data.detailsOfOtherServices, {
      timeout: STATUS_TIMEOUT,
    });
  });

  test('with "Other" selected, an empty Details of other services leaves the section "In progress"', async ({
    votingFirmDetailsSection: section,
  }) => {
    await section.fillField(section.detailsOfOtherServicesInput, '');
    await section.save();

    await expect(section.saveSuccessAlert).toHaveText('Form Saved: Voting firm details', { timeout: STATUS_TIMEOUT });
    await expect(section.statusRow).toContainText('In progress', { timeout: STATUS_TIMEOUT });
  });

  test('filling Details of other services reaches "Completed"', async ({ votingFirmDetailsSection: section }) => {
    await section.fillField(section.detailsOfOtherServicesInput, data.detailsOfOtherServices);
    await section.save();

    await expect(section.saveSuccessAlert).toHaveText('Form Saved: Voting firm details', { timeout: STATUS_TIMEOUT });
    await expect(section.statusRow).toContainText('Completed', { timeout: STATUS_TIMEOUT });
  });

  test('leaving every field empty marks the section "New"', async ({ votingFirmDetailsSection: section }) => {
    await section.fillField(section.legalEntityLegalNameInput, '');
    await section.fillField(section.registrationIdInput, '');
    await section.fillField(section.vatNumberInput, '');
    await section.fillField(section.detailsOfOtherServicesInput, '');
    await section.fillField(section.dateOfEstablishmentInput, '');
    await section.fillField(section.dateOfJoiningBdoInput, '');
    await section.fillField(section.authorisedRepresentativeInput, '');
    await section.fillField(section.addressLine1Input, '');
    await section.fillField(section.addressLine2Input, '');
    await section.fillField(section.cityInput, '');
    await section.fillField(section.stateProvinceInput, '');
    await section.fillField(section.countryInput, '');
    await section.fillField(section.zipInput, '');
    await section.clearMultiSelect(section.servicesProvidedButton);
    await section.clearMultiSelect(section.legalFormButton);
    await section.clearMultiSelect(section.territoriesButton);
    await section.save();

    await expect(section.saveSuccessAlert).toHaveText('Form Saved: Voting firm details', { timeout: STATUS_TIMEOUT });
    await expect(section.statusRow).toContainText('New', { timeout: STATUS_TIMEOUT });
  });

  test('only Legal Entity Legal Name empty still shows "New", even with every other field filled', async ({
    votingFirmDetailsSection: section,
  }) => {
    await section.selectMultiSelectOption(section.legalFormButton, data.legalForm);
    for (const territory of data.territories) {
      await section.selectMultiSelectOption(section.territoriesButton, territory);
    }
    for (const service of data.servicesProvided) {
      await section.selectMultiSelectOption(section.servicesProvidedButton, service);
    }
    await section.fillField(section.detailsOfOtherServicesInput, data.detailsOfOtherServices);
    await section.fillField(section.registrationIdInput, data.registrationId);
    await section.fillField(section.vatNumberInput, data.vatNumber);
    await section.fillField(section.dateOfEstablishmentInput, data.dateOfEstablishment);
    await section.fillField(section.dateOfJoiningBdoInput, data.dateOfJoiningBdo);
    await section.fillField(section.authorisedRepresentativeInput, data.authorisedRepresentative);
    await section.fillField(section.addressLine1Input, data.addressLine1);
    await section.fillField(section.addressLine2Input, data.addressLine2);
    await section.fillField(section.cityInput, data.city);
    await section.fillField(section.stateProvinceInput, data.stateProvince);
    await section.fillField(section.countryInput, data.country);
    await section.fillField(section.zipInput, data.zip);
    // Legal Entity Legal Name deliberately left empty from the previous test.
    await section.save();

    await expect(section.saveSuccessAlert).toHaveText('Form Saved: Voting firm details', { timeout: STATUS_TIMEOUT });
    await expect(section.statusRow).toContainText('New', { timeout: STATUS_TIMEOUT });
  });

  test('filling Legal Entity Legal Name but leaving another field empty shows "In progress", not "New"', async ({
    votingFirmDetailsSection: section,
  }) => {
    await section.fillField(section.legalEntityLegalNameInput, data.legalEntityLegalName);
    await section.fillField(section.zipInput, '');
    await section.save();

    await expect(section.saveSuccessAlert).toHaveText('Form Saved: Voting firm details', { timeout: STATUS_TIMEOUT });
    await expect(section.statusRow).toContainText('In progress', { timeout: STATUS_TIMEOUT });
  });

  test('filling every field reaches "Completed"', async ({ votingFirmDetailsSection: section }) => {
    await section.fillField(section.zipInput, data.zip);
    await section.save();

    await expect(section.saveSuccessAlert).toHaveText('Form Saved: Voting firm details', { timeout: STATUS_TIMEOUT });
    await expect(section.statusRow).toContainText('Completed', { timeout: STATUS_TIMEOUT });
  });
});
