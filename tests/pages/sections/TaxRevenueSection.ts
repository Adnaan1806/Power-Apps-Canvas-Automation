import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "3. Tax revenue" section. Reached
 * via ReportDetailPage.taxRevenueSection after expanding the section.
 *
 * Flatter than "2. Audit and assurance revenue" - ten plain numeric fields
 * plus a read-only auto-summed total, no conditional fields and no
 * cross-field validation rules (confirmed live).
 */
export class TaxRevenueSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('3. Tax revenue', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get complianceInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.1 Compliance', exact: true });
  }

  get corporateInternationalTaxInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.2 Corporate international tax', exact: true });
  }

  // Visible label has a typo ("andrisk", no space) but the accessible name
  // (matched here) is correctly spaced - confirmed live.
  get taxAssuranceAndRiskManagementInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '3.3 Tax assurance and risk management',
      exact: true,
    });
  }

  get transferPricingInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.4 Transfer pricing', exact: true });
  }

  get indirectTaxInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.5 Indirect tax', exact: true });
  }

  get employerServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.6 Employer services', exact: true });
  }

  get privateClientsServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.7 Private clients services', exact: true });
  }

  get maTaxServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.8 M&A tax services', exact: true });
  }

  get rdCreditsAndIncentivesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.9 R&D credits and incentives', exact: true });
  }

  get otherTaxServicesInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '3.10 Other tax services', exact: true });
  }

  /** Read-only, auto-computed as the sum of all ten fields above. */
  get totalInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Tax total', exact: true });
  }

  get saveButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Save', exact: true });
  }

  /** Lives outside the canvas iframe, in the Power Apps player chrome. */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.complianceInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.complianceInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Types into a field and blurs - Save stays disabled until blur, same as GeneralSection. */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
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
