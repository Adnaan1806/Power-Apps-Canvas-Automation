import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "8. Revenue summary" section.
 * Reached via ReportDetailPage.revenueSummarySection after expanding the
 * section.
 *
 * A reconciliation/rollup view, not a data-entry section: every field is
 * read-only except 8.13. 8.1/8.10/8.11/8.13 render as readonly `textbox`
 * controls; 8.2-8.9 render as non-interactive `button` controls mirroring
 * other sections' live totals. Both control types share the same broken,
 * generic accessible name ("SRevSum") - confirmed live, so every getter
 * below (except 8.12, whose name happens to be unique) locates via its
 * visible label's structural typed-card ancestor, same technique as
 * AuditAssuranceSection.fieldInput.
 *
 * 8.10 = 8.2+8.3+8.4+8.5+8.6+8.7 (A&A+Tax+Advisory+BSO+Legal+Other - Sector
 * and Sustainability excluded), and 8.8/8.9/8.10 must all be equal or the
 * section shows "Validation error" (confirmed by the BFR Champion). 8.12 is
 * computed as (8.10 - 8.11) / 8.11 - confirmed live via exact arithmetic
 * match (2422 vs 1827 => 33%), not 8.9 vs 8.11 as the label alone suggests.
 */
export class RevenueSummarySection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('8. Revenue summary', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get reportingYearInput(): Locator {
    return this.fieldInput('8.1 Reporting year');
  }

  get auditAssuranceTotalDisplay(): Locator {
    return this.fieldDisplay('8.2 A&A total');
  }

  get taxTotalDisplay(): Locator {
    return this.fieldDisplay('8.3 Tax total');
  }

  get advisoryTotalDisplay(): Locator {
    return this.fieldDisplay('8.4 Advisory total');
  }

  get bsoTotalDisplay(): Locator {
    return this.fieldDisplay('8.5 BSO total');
  }

  get legalTotalDisplay(): Locator {
    return this.fieldDisplay('8.6 Legal total');
  }

  get otherTotalDisplay(): Locator {
    return this.fieldDisplay('8.7 Other total');
  }

  get sectorTotalDisplay(): Locator {
    return this.fieldDisplay('8.8 Sector total');
  }

  get sectorTotalError(): Locator {
    return this.canvasFrame.getByText('Not equal to Total revenue calculated', { exact: true });
  }

  get totalRevenueDeclaredDisplay(): Locator {
    return this.fieldDisplay('8.9 Total revenue declared');
  }

  /** Read-only, auto-computed as the sum of 8.2 through 8.7. */
  get totalRevenueCalculatedInput(): Locator {
    return this.fieldInput('8.10 Total revenue calculated');
  }

  get totalRevenueCalculatedError(): Locator {
    return this.canvasFrame.getByText('Not equal to total revenue declared in General section (listed above)', {
      exact: true,
    });
  }

  get totalRevenuePreviousYearInput(): Locator {
    return this.fieldInput('8.11 Total revenue previous year');
  }

  /**
   * Unlike every other field in this section, this control's accessible
   * name equals its own visible label - confirmed live it's the only
   * "SRevSum"-free field, so it doesn't need the structural workaround.
   */
  get percentDifferenceInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '8.12 % difference of total revenue from previous year',
      exact: true,
    });
  }

  /** Only rendered when |8.12| exceeds 10%. */
  get explanationInput(): Locator {
    return this.fieldInput('8.13 Explanation of difference if more than 10%');
  }

  get explanationNotProvidedWarning(): Locator {
    return this.canvasFrame.getByText('Explanation of difference is not provided.', { exact: true });
  }

  /** Same structural lookup as AuditAssuranceSection.fieldInput, for this section's readonly textbox fields. */
  private fieldInput(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('textbox');
  }

  /** Same structural lookup, but for this section's non-interactive button-styled total mirrors (8.2-8.9). */
  private fieldDisplay(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('button');
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.reportingYearInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.reportingYearInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Types into 8.13 and blurs - only used for its live warning/cap behavior, since this section has no working Save (see below). */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
  }

  /**
   * Confirmed live: unlike every other section, this section's own Save
   * button stays permanently disabled (its `disabled` binding is tied to
   * the card's viewState.displayMode, not to 8.13's dirty state) - clicking
   * it never actually persists 8.13 or shows a save confirmation, in every
   * combination of states tried (section in error, section reconciled,
   * 8.13 freshly dirty). So there's no working save() to expose here;
   * every other field in this section reflects live cross-section state
   * without needing an explicit save at all.
   */

  /** Collapses the status row's whitespace-heavy textContent into a single readable line. */
  async getStatusText(): Promise<string> {
    const raw = await this.statusRow.textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }
}
