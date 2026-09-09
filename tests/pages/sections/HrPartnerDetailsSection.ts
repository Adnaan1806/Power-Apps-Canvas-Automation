import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "9. HR partner details" section.
 * Reached via ReportDetailPage.hrPartnerDetailsSection after expanding the
 * section.
 *
 * Twelve plain numeric fields in six category pairs (partners / female
 * partners), each pair independently validated (female <= partners, no
 * auto-computed total anywhere in the section), plus one optional free-text
 * comment field (9.13) - same pattern as 4.13/5.8/8.13. Every field shares
 * the same broken, generic accessible name ("SHRPartners") - confirmed
 * live for all thirteen fields, including 9.13 - so every getter below
 * locates via its visible label's structural typed-card ancestor, same
 * technique as AuditAssuranceSection.fieldInput.
 *
 * Validation error wording confirmed live for A&A, Tax and BSO ("Number of
 * X female partners must not be greater than number of X partners.");
 * trusted for Advisory, Legal and Other given the exact structural/naming
 * symmetry across all six pairs.
 *
 * Numeric fields' HTML maxlength (12) is misleading - confirmed live that a
 * 12-digit value can still fail at Save time with a Dataverse-level error
 * ("Value must be between 0 and 100000000000") if it exceeds that numeric
 * ceiling, which is itself a 12-digit number. Not covered by this file's
 * own tests (descoped), but worth knowing before assuming 12 digits is
 * always safe here.
 */
export class HrPartnerDetailsSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('9. HR partner details', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get aaPartnersInput(): Locator {
    return this.fieldInput('9.1 A&A partners');
  }

  get aaFemalePartnersInput(): Locator {
    return this.fieldInput('9.2 A&A female partners');
  }

  get aaFemalePartnersError(): Locator {
    return this.canvasFrame.getByText(
      'Number of A&A female partners must not be greater than number of A&A partners.',
      { exact: true }
    );
  }

  get taxPartnersInput(): Locator {
    return this.fieldInput('9.3 Tax partners');
  }

  get taxFemalePartnersInput(): Locator {
    return this.fieldInput('9.4 Tax female partners');
  }

  get taxFemalePartnersError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Tax female partners must not be greater than number of Tax partners.',
      { exact: true }
    );
  }

  get advisoryPartnersInput(): Locator {
    return this.fieldInput('9.5 Advisory partners');
  }

  get advisoryFemalePartnersInput(): Locator {
    return this.fieldInput('9.6 Advisory female partners');
  }

  get advisoryFemalePartnersError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Advisory female partners must not be greater than number of Advisory partners.',
      { exact: true }
    );
  }

  get bsoPartnersInput(): Locator {
    return this.fieldInput('9.7 BSO partners');
  }

  get bsoFemalePartnersInput(): Locator {
    return this.fieldInput('9.8 BSO female partners');
  }

  get bsoFemalePartnersError(): Locator {
    return this.canvasFrame.getByText(
      'Number of BSO female partners must not be greater than number of BSO partners.',
      { exact: true }
    );
  }

  get legalPartnersInput(): Locator {
    return this.fieldInput('9.9 Legal partners');
  }

  get legalFemalePartnersInput(): Locator {
    return this.fieldInput('9.10 Legal female partners');
  }

  get legalFemalePartnersError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Legal female partners must not be greater than number of Legal partners.',
      { exact: true }
    );
  }

  get otherPartnersInput(): Locator {
    return this.fieldInput('9.11 Other partners');
  }

  get otherFemalePartnersInput(): Locator {
    return this.fieldInput('9.12 Other female partners');
  }

  get otherFemalePartnersError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Other female partners must not be greater than number of Other partners.',
      { exact: true }
    );
  }

  get otherPartnersExplanationInput(): Locator {
    return this.fieldInput('9.13 Other partners explanation');
  }

  /**
   * Every category pair, for tests that need to loop over all six rather
   * than repeating near-identical assertions per category.
   */
  get categoryPairs(): Array<{ name: string; partnersInput: Locator; femaleInput: Locator; error: Locator }> {
    return [
      { name: 'A&A', partnersInput: this.aaPartnersInput, femaleInput: this.aaFemalePartnersInput, error: this.aaFemalePartnersError },
      { name: 'Tax', partnersInput: this.taxPartnersInput, femaleInput: this.taxFemalePartnersInput, error: this.taxFemalePartnersError },
      { name: 'Advisory', partnersInput: this.advisoryPartnersInput, femaleInput: this.advisoryFemalePartnersInput, error: this.advisoryFemalePartnersError },
      { name: 'BSO', partnersInput: this.bsoPartnersInput, femaleInput: this.bsoFemalePartnersInput, error: this.bsoFemalePartnersError },
      { name: 'Legal', partnersInput: this.legalPartnersInput, femaleInput: this.legalFemalePartnersInput, error: this.legalFemalePartnersError },
      { name: 'Other', partnersInput: this.otherPartnersInput, femaleInput: this.otherFemalePartnersInput, error: this.otherFemalePartnersError },
    ];
  }

  /**
   * Scoped to this section's own component, not the whole page - same
   * `following::` XPath axis as every other section's saveButton (see
   * AuditAssuranceSection.saveButton for the two wrong approaches already
   * ruled out).
   */
  get saveButton(): Locator {
    return this.header.locator('xpath=following::button[normalize-space(.)="Save"][1]');
  }

  /** Lives outside the canvas iframe, in the Power Apps player chrome. */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  /** Same structural lookup as AuditAssuranceSection.fieldInput. */
  private fieldInput(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('textbox');
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.aaPartnersInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.aaPartnersInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Types into a field and blurs - Save stays disabled until blur, same as GeneralSection. */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /** Collapses the status row's whitespace-heavy textContent into a single readable line. */
  async getStatusText(): Promise<string> {
    const raw = await this.statusRow.textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }
}
