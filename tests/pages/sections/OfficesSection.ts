import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "12. Offices" section (the last of
 * the 12 sections). Reached via ReportDetailPage.officesSection after
 * expanding the section.
 *
 * The simplest section in the form: just two fields, no auto-computed
 * totals and no cross-field validation. 12.1 "Number of offices" is
 * required (confirmed live: leaving it empty marks the section "In
 * progress"); 12.2 "Other comments" is optional (a 250-char textarea,
 * same pattern as 4.13/5.8/8.13/9.13/10.16). Both share the same broken
 * generic accessible name ("SOffices") - confirmed live, so both getters
 * use the structural typed-card/label lookup, same technique as
 * AuditAssuranceSection.fieldInput. 12.1 caps at 12 characters (same
 * family as section 9's fields - not re-verified whether a save-time
 * numeric ceiling applies here too, deliberately not tested per the same
 * user direction that descoped that test for sections 9 and 10).
 */
export class OfficesSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('12. Offices', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get numberOfOfficesInput(): Locator {
    return this.fieldInput('12.1 Number of offices');
  }

  get otherCommentsInput(): Locator {
    return this.fieldInput('12.2 Other comments');
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
    const alreadyExpanded = await this.numberOfOfficesInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.numberOfOfficesInput.waitFor({ state: 'visible', timeout: 15_000 });
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
