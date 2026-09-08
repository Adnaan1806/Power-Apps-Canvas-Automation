import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "2. Audit and assurance revenue"
 * section. Reached via ReportDetailPage.auditAssuranceSection after
 * expanding the section.
 */
export class AuditAssuranceSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('2. Audit and assurance revenue', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get relatedServiceEngagementsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '2.1 Related service engagements' });
  }

  /**
   * Confirmed live: this field's accessible name is "SAA" - a leftover
   * internal control name, not the visible "2.2 Audits" label - and the
   * read-only 2.7 Total field shares that same broken name. Both are
   * located structurally via their visible label's sibling instead of by
   * accessible name, since name-based lookup can't tell them apart.
   */
  get auditsInput(): Locator {
    return this.fieldInput('2.2 Audits');
  }

  get pieAuditsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '2.3 Of which audits at Public Interest Entities (PIE)',
    });
  }

  get pieAuditsError(): Locator {
    return this.canvasFrame.getByText('Value can not be greater than Audits value', { exact: true });
  }

  get reviewsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '2.4 Reviews' });
  }

  get otherAssuranceEngagementsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '2.5 Other assurance engagements' });
  }

  get esgAssuranceEngagementsInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '2.6 Of which ESG assurance engagements' });
  }

  get esgAssuranceEngagementsError(): Locator {
    return this.canvasFrame.getByText('Value can not be greater than Other assurance engagements', {
      exact: true,
    });
  }

  /** Read-only, auto-computed as 2.1 + 2.2 + 2.4 + 2.5 (2.3 and 2.6 excluded). */
  get totalInput(): Locator {
    return this.fieldInput('2.7 Total');
  }

  // Accessible name is "SAA" (unselected) / "SAA. Selected: <Yes|No>" once
  // chosen - the same broken-label pattern as the two fields above, but
  // distinguishable here since this is the only "SAA"-named button.
  get eeaButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: /^SAA(\. Selected: .+)?$/ });
  }

  eeaOption(value: 'Yes' | 'No'): Locator {
    return this.canvasFrame.getByRole('option', { name: value, exact: true });
  }

  /** Only rendered when eeaButton's selection is "Yes". */
  get combinedTurnoverInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '2.8.1 Combined turnover from statutory audits',
    });
  }

  get combinedTurnoverError(): Locator {
    return this.canvasFrame.getByText('Value can not be greater than A&A revenue total', { exact: true });
  }

  get saveButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Save', exact: true });
  }

  /** Lives outside the canvas iframe, in the Power Apps player chrome. */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  /**
   * Verified live: getByText(label) resolves to a leaf label div
   * ("appmagic-label-text") that sits 6 real DOM levels below the field's
   * own wrapper (class "appmagic-typed-card") which holds both the label
   * and its input - a single `xpath=..` (confirmed broken live, same as
   * GeneralSection.statusRow's original bug) lands nowhere near the input.
   * Targeting the wrapper's class directly is robust regardless of exact
   * level count.
   */
  private fieldInput(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('textbox');
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.relatedServiceEngagementsInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.relatedServiceEngagementsInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Types into a field and blurs - Save stays disabled until blur, same as GeneralSection. */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
  }

  /**
   * Selects Yes/No for "2.8 Is your firm within the EEA?", if not already
   * selected. Confirmed live: re-clicking an already-selected option
   * deselects it instead of being a no-op (same pattern as
   * GeneralSection.selectCurrency).
   */
  async selectEea(value: 'Yes' | 'No'): Promise<void> {
    await this.eeaButton.click();
    const option = this.eeaOption(value);
    await option.waitFor({ state: 'visible', timeout: 10_000 });
    const alreadySelected = (await option.getAttribute('aria-selected', { timeout: 10_000 })) === 'true';
    if (alreadySelected) {
      await this.page.keyboard.press('Escape');
    } else {
      await option.click();
    }
  }

  async getTotalValue(): Promise<string> {
    return this.totalInput.inputValue();
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
