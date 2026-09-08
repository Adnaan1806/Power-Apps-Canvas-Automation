import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "1. General" section (Firm,
 * Reporting year, Reporting currency, Due date, Total revenue declared).
 * Reached via ReportDetailPage.generalSection after expanding the section.
 *
 * Locators here assume General is the only expanded section on the page -
 * other sections render their own identically-named "Save" button once
 * expanded, so this would need scoping if used alongside "Expand All".
 */
export class GeneralSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('1. General', { exact: true });
  }

  /**
   * The row containing both the header label and its status badge
   * (New / In progress / Completed / Unsaved changes). Assert on it with
   * Playwright's own `toContainText` rather than reading its text out
   * manually - that's a native, battle-tested auto-retrying assertion
   * instead of a custom parsing layer.
   *
   * Verified live: `getByText('1. General')` resolves to the label control
   * itself (class "appmagic-label..."), six DOM levels below the actual
   * row container (class "appmagic-group") that also holds the status
   * badge - a single `xpath=..` (confirmed broken live) lands one level
   * short. Targeting the row's class directly is more robust than
   * hardcoding that level count.
   */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  // Accessible name switches from "Reporting currency" to
  // "Reporting currency. Selected: <code>" once a value is chosen.
  get reportingCurrencyButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: /^Reporting currency(\. Selected: .+)?$/ });
  }

  /** Collapses the status row's whitespace-heavy textContent into a single readable line, e.g. "1. General Completed". */
  async getStatusText(): Promise<string> {
    const raw = await this.statusRow.textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }

  currencyOption(code: string): Locator {
    return this.canvasFrame.getByRole('option', { name: code, exact: true });
  }

  get totalRevenueInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Total Revenue Declared' });
  }

  get clearTotalRevenueButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Clear value' });
  }

  get saveButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Save', exact: true });
  }

  /** Lives outside the canvas iframe, in the Power Apps player chrome. */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  /**
   * Expands the section, if it isn't already expanded. Section headers
   * toggle on click (same pattern confirmed for the status filter and
   * currency dropdown), so re-clicking an already-expanded section across
   * tests sharing this page would collapse it instead of being a no-op.
   */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.totalRevenueInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.totalRevenueInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /**
   * Selects a currency, if it isn't already selected. Confirmed live:
   * re-clicking an already-selected option deselects it instead of being a
   * no-op, so this checks first rather than always clicking.
   */
  async selectCurrency(code: string): Promise<void> {
    await this.reportingCurrencyButton.click();
    const option = this.currencyOption(code);
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    const alreadySelected = (await option.getAttribute('aria-selected', { timeout: 10_000 })) === 'true';
    if (alreadySelected) {
      await this.page.keyboard.press('Escape');
    } else {
      await option.click();
    }
  }

  /**
   * Types into Total Revenue Declared and blurs. A blur is required:
   * confirmed live that Save stays disabled after typing until the field
   * loses focus.
   */
  async fillTotalRevenue(value: string): Promise<void> {
    await this.totalRevenueInput.click();
    await this.totalRevenueInput.fill('');
    await this.totalRevenueInput.pressSequentially(value);
    await this.totalRevenueInput.blur();
  }

  async clearTotalRevenue(): Promise<void> {
    await this.totalRevenueInput.click();
    const hasClearButton = await this.clearTotalRevenueButton
      .waitFor({ state: 'visible', timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (hasClearButton) {
      await this.clearTotalRevenueButton.click();
    } else {
      // Fallback in case the button never rendered - still guarantees the
      // field ends up empty rather than silently keeping its old value.
      await this.totalRevenueInput.fill('');
    }
    await this.totalRevenueInput.blur();
  }

  async getTotalRevenueValue(): Promise<string> {
    return this.totalRevenueInput.inputValue();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
