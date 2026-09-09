import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ReportsPage } from './ReportsPage';
import { GeneralSection } from './sections/GeneralSection';
import { AuditAssuranceSection } from './sections/AuditAssuranceSection';
import { TaxRevenueSection } from './sections/TaxRevenueSection';
import { AdvisoryRevenueSection } from './sections/AdvisoryRevenueSection';
import { BsoLegalOtherRevenueSection } from './sections/BsoLegalOtherRevenueSection';
import { SectorRevenueSection } from './sections/SectorRevenueSection';
import { SustainabilityRevenueSection } from './sections/SustainabilityRevenueSection';
import { RevenueSummarySection } from './sections/RevenueSummarySection';

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

  get generalSection(): GeneralSection {
    return new GeneralSection(this.page);
  }

  get auditAssuranceSection(): AuditAssuranceSection {
    return new AuditAssuranceSection(this.page);
  }

  get taxRevenueSection(): TaxRevenueSection {
    return new TaxRevenueSection(this.page);
  }

  get advisoryRevenueSection(): AdvisoryRevenueSection {
    return new AdvisoryRevenueSection(this.page);
  }

  get bsoLegalOtherRevenueSection(): BsoLegalOtherRevenueSection {
    return new BsoLegalOtherRevenueSection(this.page);
  }

  get sectorRevenueSection(): SectorRevenueSection {
    return new SectorRevenueSection(this.page);
  }

  get sustainabilityRevenueSection(): SustainabilityRevenueSection {
    return new SustainabilityRevenueSection(this.page);
  }

  get revenueSummarySection(): RevenueSummarySection {
    return new RevenueSummarySection(this.page);
  }

  async waitForLoad(): Promise<void> {
    await this.formStatus.waitFor({ state: 'visible', timeout: 150_000 });
    // The status text can render before the screen's action buttons finish
    // wiring up; wait for Back too so a click right after waitForLoad()
    // can't land during that gap and get silently swallowed by the app.
    await this.backButton.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async goBack(): Promise<ReportsPage> {
    const reportsPage = new ReportsPage(this.page);
    await this.backButton.click();

    // Guards against the same kind of swallowed click: if "All Reports"
    // hasn't shown up soon, the first click likely didn't register - retry
    // once before letting it fail for real.
    try {
      await reportsPage.pageHeading.waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      await this.backButton.click();
      await reportsPage.waitForLoad();
    }

    return reportsPage;
  }
}
