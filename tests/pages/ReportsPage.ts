import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ReportDetailPage } from './ReportDetailPage';

/**
 * The "All Reports" screen: a searchable, filterable gallery of report
 * rows. The gallery is rendered as two accessibility "Gallery" lists in the
 * DOM - a 1-item list holding the sticky column headers, and a second list
 * holding the actual data rows - so header vs. data rows are disambiguated
 * by index rather than name.
 */
export class ReportsPage extends BasePage {
  get pageHeading(): Locator {
    return this.canvasFrame.getByText('All Reports', { exact: true });
  }

  get searchBox(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: 'Search for a report' });
  }

  get clearSearchButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Clear value' });
  }

  get statusFilterButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Filter by report status' });
  }

  /** e.g. "Number of items in Gallery: 10 Showing items 1 to 10" */
  get resultsCountLabel(): Locator {
    return this.canvasFrame.getByText(/Number of items in Gallery: \d+/);
  }

  private get galleryLists(): Locator {
    return this.canvasFrame.getByRole('list', { name: 'Gallery' });
  }

  get headerRow(): Locator {
    return this.galleryLists.nth(0);
  }

  get resultRows(): Locator {
    return this.galleryLists.nth(1).getByRole('listitem');
  }

  reportRowsByName(name: string): Locator {
    return this.resultRows.filter({ hasText: name });
  }

  async waitForLoad(): Promise<void> {
    await this.pageHeading.waitFor({ state: 'visible', timeout: 150_000 });
  }

  /**
   * Types into the search box. Power Apps' OnChange typically fires per
   * keystroke, so we type rather than fill to reproduce real user input and
   * let the delegated filter re-run exactly as it would live.
   */
  async searchFor(term: string): Promise<void> {
    await this.searchBox.click();
    await this.searchBox.fill('');
    await this.searchBox.pressSequentially(term);
    await this.resultsCountLabel.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async clearSearch(): Promise<void> {
    await this.clearSearchButton.click();
  }

  async getVisibleReportCount(): Promise<number> {
    return this.resultRows.count();
  }

  /**
   * Opens a report's detail screen via its "View item details" button.
   * When a name matches multiple rows (e.g. duplicate test data), pass
   * `dueDate` to disambiguate, or rely on the default first-match-in-DOM
   * behaviour.
   */
  async openReportDetails(
    reportName: string,
    options?: { dueDate?: string }
  ): Promise<ReportDetailPage> {
    let row = this.reportRowsByName(reportName);
    if (options?.dueDate) {
      row = row.filter({ hasText: options.dueDate });
    }

    await row.first().getByRole('button', { name: 'View item details' }).click();

    const detailPage = new ReportDetailPage(this.page);
    await detailPage.waitForLoad();
    return detailPage;
  }
}
