import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "5. BSO, legal and other revenue"
 * section. Reached via ReportDetailPage.bsoLegalOtherRevenueSection after
 * expanding the section.
 *
 * Structurally simpler than sections 2-4: only one auto-computed subtotal
 * (5.5, summing 5.1-5.4) - 5.6 "Legal total" and 5.7 "Other total" are
 * directly-entered fields with no sub-items feeding them, and there is no
 * overall grand total combining 5.5+5.6+5.7 (confirmed live). 5.8 is an
 * optional free-text comment field, same pattern as section 4's 4.13.
 *
 * Unlike sections 2 and 4, no field here has a colliding/broken accessible
 * name, so every locator below can match by role name directly - no
 * structural (appmagic-typed-card ancestor) workaround needed.
 */
export class BsoLegalOtherRevenueSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('5. BSO, legal and other revenue', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get bsoAccountingInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: 'BSO - BSO accounting, compliance and outsourcing',
      exact: true,
    });
  }

  // Visible label has a typo ("andHR", no space) but the accessible name
  // (matched here) is correctly spaced - same pattern as section 3's 3.3.
  get payrollAndHrInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '5.2 Payroll and HR services', exact: true });
  }

  get globalComplianceInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '5.3 Global compliance and coordination',
      exact: true,
    });
  }

  get businessAdvisoryInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '5.4 Business advisory / financial planning and analysis (FP&A)',
      exact: true,
    });
  }

  /** Read-only, auto-computed as the sum of 5.1 through 5.4. */
  get bsoTotalInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'BSO total', exact: true });
  }

  /** Directly editable - not computed from any sub-items (confirmed live). */
  get legalTotalInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '5.6 Legal total', exact: true });
  }

  /** Directly editable - not computed from any sub-items (confirmed live). */
  get otherTotalInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '5.7 Other total', exact: true });
  }

  get otherRevenueDescriptionInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: 'BSO - Other revenue description',
      exact: true,
    });
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
    const alreadyExpanded = await this.bsoAccountingInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.bsoAccountingInput.waitFor({ state: 'visible', timeout: 15_000 });
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
