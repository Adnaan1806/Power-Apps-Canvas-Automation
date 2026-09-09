import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "7. Sustainability revenue" section.
 * Reached via ReportDetailPage.sustainabilityRevenueSection after expanding
 * the section.
 *
 * Structurally closest to section 2: a Yes/No toggle (7.2) gates a block of
 * fields (7.2.1-7.2.6) that only render when "Yes" is selected, with one
 * cross-field validation rule - but simpler, since there's just the one rule
 * and no auto-computed total. 7.1 is a plain directly-editable field, same
 * as section 5's 5.6/5.7 (confirmed live, not computed from 7.2.1-7.2.6).
 */
export class SustainabilityRevenueSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('7. Sustainability revenue', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get totalRevenueInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '7.1 Total sustainability-related revenue',
      exact: true,
    });
  }

  get totalRevenueError(): Locator {
    return this.canvasFrame.getByText('Not equal to sum of breakdown provided', { exact: true });
  }

  // Accessible name is "SustainRev" (unselected) / "SustainRev. Selected:
  // <Yes|No>" once chosen - same broken-label pattern as section 2's SAA
  // toggle, but distinguishable here since this is the only
  // "SustainRev"-named button.
  get breakdownToggle(): Locator {
    return this.canvasFrame.getByRole('button', { name: /^SustainRev(\. Selected: .+)?$/ });
  }

  breakdownOption(value: 'Yes' | 'No'): Locator {
    return this.canvasFrame.getByRole('option', { name: value, exact: true });
  }

  /** Only rendered when breakdownToggle's selection is "Yes". */
  get sustainabilityStrategyInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '7.2.1 Sustainability strategy', exact: true });
  }

  get regulatoryReportingAdvisoryInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '7.2.2 Sustainability regulatory reporting advisory',
      exact: true,
    });
  }

  get assuranceInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '7.2.3 Sustainability assurance', exact: true });
  }

  get climateServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '7.2.4 Climate services', exact: true });
  }

  get sustainableFinanceInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '7.2.5 Sustainable finance', exact: true });
  }

  get advisoryOtherInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '7.2.6 Sustainability advisory - other',
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
    const alreadyExpanded = await this.totalRevenueInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.totalRevenueInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Types into a field and blurs - Save stays disabled until blur, same as GeneralSection. */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
  }

  /**
   * Selects Yes/No for "7.2 Can you give us a breakdown of this revenue?",
   * if not already selected. Confirmed live: re-clicking an already-selected
   * option deselects it instead of being a no-op (same pattern as
   * GeneralSection.selectCurrency).
   */
  async selectBreakdown(value: 'Yes' | 'No'): Promise<void> {
    await this.breakdownToggle.click();
    const option = this.breakdownOption(value);
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    const alreadySelected = (await option.getAttribute('aria-selected', { timeout: 10_000 })) === 'true';
    if (alreadySelected) {
      await this.page.keyboard.press('Escape');
    } else {
      await option.click();
    }
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
