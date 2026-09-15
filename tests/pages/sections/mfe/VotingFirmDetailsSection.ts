import { Locator } from '@playwright/test';
import { BasePage } from '../../BasePage';

/**
 * Fields inside an MFE report detail form's "Voting firm details" section
 * (the first of MFE's 9 sections). Reached via
 * MfeReportDetailPage.votingFirmDetailsSection after expanding the section.
 *
 * Structurally a fixed-field section (unlike MFE's repeating-list
 * sections), with two subgroups: "General information" and "Registered
 * address details". Every one of its 17 fields has a unique, non-broken
 * accessible name - confirmed live, unlike most Statistics V2 sections - so
 * every getter here is a direct role+name lookup, no structural typed-card
 * workaround needed.
 *
 * Confirmed live: the only field that gates "New" vs every other status is
 * Legal Entity Legal Name - if it's empty, the section is always "New" no
 * matter how many other fields are filled. Once it's filled, the section is
 * "In progress" unless every other field is also filled, in which case
 * "Completed". "Details of other services" only exists in the DOM while
 * "Other" is selected in Services provided, and is itself required for
 * "Completed" whenever it's visible.
 */
export class VotingFirmDetailsSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('Voting firm details', { exact: true });
  }

  /** Same row-container pattern as every other section's statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get legalEntityLegalNameInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Legal Entity Legal Name' });
  }

  get registrationIdInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Registration ID' });
  }

  get vatNumberInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'VAT Number' });
  }

  /** Only present in the DOM while "Other" is selected in Services provided. */
  get detailsOfOtherServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Details of other services' });
  }

  get dateOfEstablishmentInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Date of Establishment' });
  }

  get dateOfJoiningBdoInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Date of Joining BDO' });
  }

  get authorisedRepresentativeInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Authorised Representative/Signatory' });
  }

  get addressLine1Input(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Address 1: Street 1' });
  }

  get addressLine2Input(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Address 1: Street 2' });
  }

  get cityInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Address 1: City' });
  }

  get stateProvinceInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Address 1: State/Province' });
  }

  get countryInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Country' });
  }

  get zipInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Address 1: ZIP/Postal Code' });
  }

  /**
   * These 3 multi-select dropdowns' accessible name is NOT reliable: it
   * varies by field and by state, confirmed live - Services provided shows
   * its own label "Services provided" when cleared, Territories shows an
   * empty name, and Legal form shows an entirely different broken name
   * ("Legal Entity Legal Form") rather than its visible label "Legal form".
   * A name-based regex (the first approach tried) worked for the "has a
   * selection" states but broke the moment a field was fully cleared,
   * exactly the same class of broken/inconsistent-accessible-name problem
   * documented for Statistics V2 sections, just worse here (3 different
   * broken names instead of one shared one).
   *
   * The robust fix: each field's underlying Power Apps "DataCard" wrapper
   * has its own STATE-INDEPENDENT `data-control-name` (confirmed live via
   * direct DOM inspection - unlike the button's accessible name, this
   * never changes regardless of what's selected), and scoping down from it
   * finds exactly one `role="button"` element every time. Note this
   * control is a `<div role="button">`, not a real `<button>` tag - a raw
   * `querySelector('button')` silently finds nothing.
   */
  get servicesProvidedButton(): Locator {
    return this.multiSelectButton('Services provided_DataCard4');
  }

  get legalFormButton(): Locator {
    return this.multiSelectButton('Legal Entity Legal Form_DataCard1_1');
  }

  get territoriesButton(): Locator {
    return this.multiSelectButton('DataCard19');
  }

  private multiSelectButton(cardControlName: string): Locator {
    return this.canvasFrame.locator(`[data-control-name="${cardControlName}"]`).getByRole('button');
  }

  /** Same `following::` XPath axis as every other section's saveButton (see GeneralSection.saveButton for the two wrong approaches already ruled out). */
  get saveButton(): Locator {
    return this.header.locator('xpath=following::button[normalize-space(.)="Save"][1]');
  }

  /**
   * Lives outside the canvas iframe, in the Power Apps player chrome.
   * Confirmed live: MFE's toast reads "Form Saved: X" (capital S), unlike
   * Statistics V2's "Form saved: X".
   */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as every other section). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.legalEntityLegalNameInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.legalEntityLegalNameInput.waitFor({ state: 'visible', timeout: 15_000 });
    await this.waitForPreloaderToClear();
  }

  /** Types into a field and blurs - Save stays disabled until blur, same as every other section. */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
    await this.waitForPreloaderToClear();
  }

  /** Selects one option in a multi-select dropdown, if it isn't already selected, then closes the dropdown. */
  async selectMultiSelectOption(button: Locator, optionName: string): Promise<void> {
    await button.click();
    const option = this.canvasFrame.getByRole('option', { name: optionName, exact: true });
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    const alreadySelected = (await option.getAttribute('aria-selected')) === 'true';
    if (!alreadySelected) await option.click();
    await this.closeDropdown();
  }

  /** Deselects one option in a multi-select dropdown, if it's currently selected, then closes the dropdown. */
  async deselectMultiSelectOption(button: Locator, optionName: string): Promise<void> {
    await button.click();
    const option = this.canvasFrame.getByRole('option', { name: optionName, exact: true });
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    const isSelected = (await option.getAttribute('aria-selected')) === 'true';
    if (isSelected) await option.click();
    await this.closeDropdown();
  }

  /** Deselects every currently-selected option in a dropdown, leaving it fully blank. */
  async clearMultiSelect(button: Locator): Promise<void> {
    await button.click();
    const selectedOption = this.canvasFrame.getByRole('option', { selected: true }).first();
    while ((await selectedOption.count()) > 0) {
      await selectedOption.click();
    }
    await this.closeDropdown();
  }

  private async closeDropdown(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.canvasFrame.getByRole('listbox').waitFor({ state: 'hidden', timeout: 15_000 });
    await this.waitForPreloaderToClear();
  }

  /**
   * The same full-page loading overlay MfeReportDetailPage.preloader guards
   * against on initial load - confirmed live it can also reappear mid-test,
   * e.g. right after toggling a conditional field like "Other" back on:
   * the newly re-created "Details of other services" control renders empty
   * first and only picks up its real retained value a moment later, the
   * same rehydration delay as the initial page load just at field scope.
   * A no-op if the overlay isn't currently showing, so safe to call
   * defensively after any interaction that might trigger a recompute.
   */
  private async waitForPreloaderToClear(): Promise<void> {
    await this.canvasFrame
      .locator('[data-control-name^="Preloader"]')
      .first()
      .waitFor({ state: 'hidden', timeout: 150_000 })
      .catch(() => {});
  }

  /**
   * Confirmed live: the first click on Save can silently not register (no
   * toast, button stays enabled) - same class of swallowed-click flakiness
   * as ReportDetailPage.goBack(). Retry once before letting it fail for
   * real, but only if the button is still enabled - a disabled button means
   * the first click actually did save, just without the toast appearing in
   * time.
   */
  async save(): Promise<void> {
    await this.saveButton.click();
    await this.waitForPreloaderToClear();

    const alertAppeared = await this.saveSuccessAlert
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (!alertAppeared && (await this.saveButton.isEnabled().catch(() => false))) {
      await this.saveButton.click();
    }
  }

  /** Collapses the status row's whitespace-heavy textContent into a single readable line. */
  async getStatusText(): Promise<string> {
    const raw = await this.statusRow.textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }
}
