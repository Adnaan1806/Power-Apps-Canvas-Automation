import { test as base } from '@playwright/test';
import { APP_URL, AUTH_STATE_PATH } from '../../config/app.config';
import { HomePage } from '../pages/HomePage';
import { ReportDetailPage } from '../pages/ReportDetailPage';
import { GeneralSection } from '../pages/sections/GeneralSection';
import { AuditAssuranceSection } from '../pages/sections/AuditAssuranceSection';
import { TaxRevenueSection } from '../pages/sections/TaxRevenueSection';
import { AdvisoryRevenueSection } from '../pages/sections/AdvisoryRevenueSection';
import { BsoLegalOtherRevenueSection } from '../pages/sections/BsoLegalOtherRevenueSection';
import { SectorRevenueSection } from '../pages/sections/SectorRevenueSection';
import { SustainabilityRevenueSection } from '../pages/sections/SustainabilityRevenueSection';
import { RevenueSummarySection } from '../pages/sections/RevenueSummarySection';
import { HrPartnerDetailsSection } from '../pages/sections/HrPartnerDetailsSection';
import { HrStaffDetailsSection } from '../pages/sections/HrStaffDetailsSection';
import { HrSummarySection } from '../pages/sections/HrSummarySection';

const REPORT_NAME = 'Austria 2026';
const REPORT_DUE_DATE = '30 Jun 2025';

type WorkerFixtures = {
  reportDetail: ReportDetailPage;
  generalSection: GeneralSection;
  auditAssuranceSection: AuditAssuranceSection;
  taxRevenueSection: TaxRevenueSection;
  advisoryRevenueSection: AdvisoryRevenueSection;
  bsoLegalOtherRevenueSection: BsoLegalOtherRevenueSection;
  sectorRevenueSection: SectorRevenueSection;
  sustainabilityRevenueSection: SustainabilityRevenueSection;
  revenueSummarySection: RevenueSummarySection;
  hrPartnerDetailsSection: HrPartnerDetailsSection;
  hrStaffDetailsSection: HrStaffDetailsSection;
  hrSummarySection: HrSummarySection;
};

/**
 * Navigates Home > Reports > search > open "Austria 2026" > expand General
 * exactly once per worker (same one-load-per-file pattern as `homePage` in
 * pages.fixture.ts). All tests in a file using this fixture share that
 * single already-open section instead of re-navigating from scratch each
 * time - which also sidesteps the app's unsaved-changes guard blocking
 * repeated nav-bar clicks away from an edited-but-unsaved section.
 *
 * Only safe for tests on this one section; a test needing a different
 * report/section should navigate there itself via `reportDetail`.
 */
export const test = base.extend<{}, WorkerFixtures>({
  reportDetail: [
    async ({ browser }, use) => {
      const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
      const page = await context.newPage();

      await page.goto(APP_URL);
      const homePage = new HomePage(page);
      await homePage.waitForLoad();

      const reports = await homePage.openReports();
      await reports.searchFor(REPORT_NAME);
      const detail = await reports.openReportDetails(REPORT_NAME, { dueDate: REPORT_DUE_DATE });

      await use(detail);

      await context.close();
    },
    { scope: 'worker' },
  ],

  generalSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.generalSection.expand();
      await use(reportDetail.generalSection);
    },
    { scope: 'worker' },
  ],

  auditAssuranceSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.auditAssuranceSection.expand();
      await use(reportDetail.auditAssuranceSection);
    },
    { scope: 'worker' },
  ],

  taxRevenueSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.taxRevenueSection.expand();
      await use(reportDetail.taxRevenueSection);
    },
    { scope: 'worker' },
  ],

  advisoryRevenueSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.advisoryRevenueSection.expand();
      await use(reportDetail.advisoryRevenueSection);
    },
    { scope: 'worker' },
  ],

  bsoLegalOtherRevenueSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.bsoLegalOtherRevenueSection.expand();
      await use(reportDetail.bsoLegalOtherRevenueSection);
    },
    { scope: 'worker' },
  ],

  sectorRevenueSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.sectorRevenueSection.expand();
      await use(reportDetail.sectorRevenueSection);
    },
    { scope: 'worker' },
  ],

  sustainabilityRevenueSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.sustainabilityRevenueSection.expand();
      await use(reportDetail.sustainabilityRevenueSection);
    },
    { scope: 'worker' },
  ],

  revenueSummarySection: [
    async ({ reportDetail }, use) => {
      await reportDetail.revenueSummarySection.expand();
      await use(reportDetail.revenueSummarySection);
    },
    { scope: 'worker' },
  ],

  hrPartnerDetailsSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.hrPartnerDetailsSection.expand();
      await use(reportDetail.hrPartnerDetailsSection);
    },
    { scope: 'worker' },
  ],

  hrStaffDetailsSection: [
    async ({ reportDetail }, use) => {
      await reportDetail.hrStaffDetailsSection.expand();
      await use(reportDetail.hrStaffDetailsSection);
    },
    { scope: 'worker' },
  ],

  hrSummarySection: [
    async ({ reportDetail }, use) => {
      await reportDetail.hrSummarySection.expand();
      await use(reportDetail.hrSummarySection);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
