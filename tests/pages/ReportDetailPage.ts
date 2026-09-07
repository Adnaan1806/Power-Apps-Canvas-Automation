import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The report form screen (internal Power Apps screen name "StatsV2") reached
 * from Reports > "View item details". Represents a single report's
 * multi-section data-entry form.
 */
export class ReportDetailPage extends BasePage {
  get reportTitle(): Locator {
    return this.canvasFrame.getByText(/.+ Report$/).first();
  }

  get formStatus(): Locator {
    return this.canvasFrame.getByText(/^Form status:/);
  }

  get backButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Back', exact: true });
  }

  get expandAllButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Expand All' });
  }

  get collapseAllButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Collapse All' });
  }

  get discardChangesButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Discard Changes' });
  }

  get saveAllButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Save All' });
  }

  get submitButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Submit', exact: true });
  }

  /** One of the numbered, collapsible form sections, e.g. "1. General". */
  sectionByName(name: string): Locator {
    return this.canvasFrame.getByText(name, { exact: true });
  }

  async waitForLoad(): Promise<void> {
    await this.formStatus.waitFor({ state: 'visible', timeout: 150_000 });
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
