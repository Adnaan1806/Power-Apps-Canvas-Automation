import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ReportsPage } from './ReportsPage';
import { VotingFirmDetailsSection } from './sections/mfe/VotingFirmDetailsSection';

/**
 * The report form screen for a Member Firm Essentials (MFE) report, reached
 * from Reports > "View item details". Structurally distinct from the
 * Statistics V2 report handled by ReportDetailPage - MFE has 9 sections
 * split between fixed-field sections and repeating-list sections (Office
 * details, Partners, etc.), none of which resemble Statistics V2's 12
 * sections. Only the page shell (title, status, Back/Expand/Collapse/Save
 * All/Submit) is shared, so this is its own page object rather than a
 * subclass of ReportDetailPage.
 */
export class MfeReportDetailPage extends BasePage {
  get reportTitle(): Locator {
    return this.canvasFrame.getByText(/.+ Report$/).first();
  }

  /** Confirmed live: MFE renders "Form Status:" (capital S), unlike Statistics V2's "Form status:". */
  get formStatus(): Locator {
    return this.canvasFrame.getByText(/^Form Status:/);
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

  get saveAllButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Save All' });
  }

  get submitButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Submit', exact: true });
  }

  get votingFirmDetailsSection(): VotingFirmDetailsSection {
    return new VotingFirmDetailsSection(this.page);
  }

  /**
   * A full-page loading overlay (confirmed live via
   * `data-control-name="Preloader_N"`) that blocks all interaction while the
   * record's real data is still being fetched from Dataverse - it can
   * render well after the shell (status text, action buttons) is already
   * visible, and section status badges are simply absent while it's up
   * (confirmed live: "Form Status: Not active", no badge next to "Voting
   * firm details" at all). Observed taking over 30 seconds to clear for
   * this report - MFE's richer field set (option-set-backed dropdowns,
   * repeating-list sections) appears to load slower than Statistics V2's.
   * `.first()` guards against a strict-mode surprise if more than one
   * happens to match at once.
   */
  get preloader(): Locator {
    return this.canvasFrame.locator('[data-control-name^="Preloader"]').first();
  }

  async waitForLoad(): Promise<void> {
    await this.formStatus.waitFor({ state: 'visible', timeout: 150_000 });
    // Same guard as ReportDetailPage.waitForLoad: the status text can
    // render before the screen's action buttons finish wiring up.
    await this.backButton.waitFor({ state: 'visible', timeout: 15_000 });
    // The real gate: don't consider the page usable until the loading
    // overlay actually clears, however long that takes.
    await this.preloader.waitFor({ state: 'hidden', timeout: 150_000 });
  }

  async goBack(): Promise<ReportsPage> {
    const reportsPage = new ReportsPage(this.page);
    await this.backButton.click();

    try {
      await reportsPage.pageHeading.waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      await this.backButton.click();
      await reportsPage.waitForLoad();
    }

    return reportsPage;
  }
}
