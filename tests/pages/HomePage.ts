import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ReportsPage } from './ReportsPage';

/** The app's landing screen, showing a welcome banner and "My tasks" gallery. */
export class HomePage extends BasePage {
  get welcomeHeading(): Locator {
    return this.canvasFrame.getByText('Welcome to BDO Firm Reporting');
  }

  get myTasksHeading(): Locator {
    return this.canvasFrame.getByText('My tasks', { exact: true });
  }

  get myTasksGallery(): Locator {
    return this.canvasFrame.getByRole('list', { name: 'Gallery' }).first();
  }

  async waitForLoad(): Promise<void> {
    await this.welcomeHeading.waitFor({ state: 'visible', timeout: 150_000 });
  }

  async openReports(): Promise<ReportsPage> {
    await this.reportsNavButton.click();
    const reportsPage = new ReportsPage(this.page);
    await reportsPage.waitForLoad();
    return reportsPage;
  }
}
