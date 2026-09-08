import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "4. Advisory revenue" section.
 * Reached via ReportDetailPage.advisoryRevenueSection after expanding the
 * section.
 *
 * A hybrid of the other two revenue sections: two chained auto-computed
 * totals (4.6 feeds into 4.14) plus one optional free-text comment field
 * (4.13) that isn't required for completeness even when 4.12 has a value
 * (confirmed live).
 */
export class AdvisoryRevenueSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('4. Advisory revenue', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get maInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.1 M&A', exact: true });
  }

  get transactionServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.2 Transaction services', exact: true });
  }

  get valuationsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.3 Valuations', exact: true });
  }

  get restructuringInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.4 Restructuring', exact: true });
  }

  get otherInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.5 Other', exact: true });
  }

  /** Read-only, auto-computed as the sum of 4.1 through 4.5. */
  get dealAdvisoryTotalInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.6 Deal advisory total', exact: true });
  }

  get riskAdvisoryServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.7 Risk advisory services', exact: true });
  }

  get digitalInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.8 Digital', exact: true });
  }

  get forensicsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.9 Forensics', exact: true });
  }

  get cybersecurityInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.10 Cybersecurity', exact: true });
  }

  get managementConsultingInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.11 Management consulting', exact: true });
  }

  get otherRevenueInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '4.12 Other revenue', exact: true });
  }

  /**
   * Confirmed live: this field's accessible name is "SAdvisory" - a
   * leftover internal control name, not the visible "4.13 Other revenue
   * description" label - and the read-only 4.14 Total field shares that
   * same broken name. Both are located structurally via their visible
   * label's sibling instead of by accessible name, same fix as
   * AuditAssuranceSection's "SAA"-named fields.
   */
  get otherRevenueDescriptionInput(): Locator {
    return this.fieldInput('4.13 Other revenue description');
  }

  /** Read-only, auto-computed as 4.6 (the subtotal) + 4.7 through 4.12. */
  get totalInput(): Locator {
    return this.fieldInput('4.14 Total');
  }

  /**
   * Scoped to this section's own component, not the whole page: confirmed
   * live that once multiple sections are expanded at once (which happens
   * across a full test run - nothing collapses a section once another
   * file's tests have expanded it), each renders its own identically-named
   * "Save" button, causing a strict-mode violation on an unscoped lookup.
   *
   * Two earlier attempts at scoping this were wrong and hung every save()
   * call: `following-sibling` (the header and Save button aren't DOM
   * siblings at all) and an `ancestor` search for a "container_msw6rx"
   * class (that class is reused at many unrelated nesting depths, not
   * one-per-section - the nearest match from the header was a near-empty
   * wrapper containing no buttons). What actually works, confirmed live
   * by tagging and cross-checking the resolved element: the `following::`
   * XPath axis, which walks the whole document in rendering order rather
   * than nesting - the first "Save"-labelled button after this section's
   * header is reliably this section's own, since the next one belongs to
   * the following section.
   */
  get saveButton(): Locator {
    return this.header.locator('xpath=following::button[normalize-space(.)="Save"][1]');
  }

  /** Lives outside the canvas iframe, in the Power Apps player chrome. */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  private fieldInput(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('textbox');
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.maInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.maInput.waitFor({ state: 'visible', timeout: 15_000 });
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
