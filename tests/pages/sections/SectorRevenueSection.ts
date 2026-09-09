import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "6. Sector revenue" section.
 * Reached via ReportDetailPage.sectorRevenueSection after expanding the
 * section.
 *
 * Structurally identical to "3. Tax revenue" - fifteen plain numeric
 * fields plus a read-only auto-summed total, no conditional fields and no
 * cross-field validation rules.
 *
 * 6.16's accessible name ("SSRev") used to be unique on the page, but isn't
 * any more: once the report is linked to a prior year, a "Previous year's
 * values" reference block renders alongside this section too, and every
 * field in it reuses this same generic name - confirmed live, a bare
 * `getByRole('textbox', { name: 'SSRev' })` now matches over a dozen
 * elements instead of one. Located structurally via its visible label
 * instead, same technique as AuditAssuranceSection.fieldInput.
 */
export class SectorRevenueSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('6. Sector revenue', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get financialServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.1 Financial services', exact: true });
  }

  get privateEquityInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.2 Private equity', exact: true });
  }

  get naturalResourcesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.3 Natural resources', exact: true });
  }

  get realEstateConstructionInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.4 Real estate construction', exact: true });
  }

  get publicSectorInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.5 Public sector', exact: true });
  }

  get technologyInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.6 Technology', exact: true });
  }

  get mediaAndEntertainmentInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.7 Media and entertainment', exact: true });
  }

  get telecommunicationsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.8 Telecommunications', exact: true });
  }

  get consumerBusinessInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.9 Consumer business', exact: true });
  }

  get notForProfitInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.10 Not for profit', exact: true });
  }

  get manufacturingInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.11 Manufacturing', exact: true });
  }

  get professionalServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.12 Professional services', exact: true });
  }

  get transportAndLogisticsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.13 Transport and logistics', exact: true });
  }

  get healthcareInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.14 Healthcare', exact: true });
  }

  get otherInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '6.15 Other', exact: true });
  }

  /** Read-only, auto-computed as the sum of all fifteen fields above. */
  get totalInput(): Locator {
    return this.canvasFrame
      .getByText('6.16 Total', { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('textbox');
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

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.financialServicesInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.financialServicesInput.waitFor({ state: 'visible', timeout: 15_000 });
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
