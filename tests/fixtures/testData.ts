export const generalSectionTestData = {
  currency: 'EUR',
  validRevenue: '12345678901234', // 14 digits, well within the field's cap
  maxLengthRevenue: '1234567890123456', // exactly 16 digits - the field's confirmed limit
  overLimitRevenueAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 16
};

export const taxRevenueSectionTestData = {
  // 3.11 Total = sum of all ten fields (no exclusions, unlike section 2).
  compliance: '10',
  corporateInternationalTax: '20',
  taxAssuranceAndRiskManagement: '30',
  transferPricing: '40',
  indirectTax: '50',
  employerServices: '60',
  privateClientsServices: '70',
  maTaxServices: '80',
  rdCreditsAndIncentives: '90',
  otherTaxServices: '100',
  expectedTotal: '550',
  maxLengthValue: '12345678901234', // exactly 14 digits - this section's confirmed field cap
  overLimitAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 14
};

export const sectorRevenueSectionTestData = {
  // 6.16 Total = sum of all fifteen fields (no exclusions, same pattern as
  // section 3's Tax total).
  financialServices: '10',
  privateEquity: '20',
  naturalResources: '30',
  realEstateConstruction: '40',
  publicSector: '50',
  technology: '60',
  mediaAndEntertainment: '70',
  telecommunications: '80',
  consumerBusiness: '90',
  notForProfit: '100',
  manufacturing: '110',
  professionalServices: '120',
  transportAndLogistics: '130',
  healthcare: '140',
  other: '150',
  expectedTotal: '1 200',
  maxLengthValue: '12345678901234', // exactly 14 digits - this section's confirmed field cap
  overLimitAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 14
};

export const bsoLegalOtherRevenueSectionTestData = {
  // 5.5 BSO total = sum of 5.1-5.4. 5.6 and 5.7 are directly-entered
  // fields (no sub-items feed them), and there is no overall grand total
  // combining 5.5+5.6+5.7 - confirmed live.
  bsoAccounting: '10',
  payrollAndHr: '20',
  globalCompliance: '30',
  businessAdvisory: '40',
  expectedBsoTotal: '100',
  legalTotal: '50',
  otherTotal: '60',
  maxLengthValue: '12345678901234', // exactly 14 digits - this section's confirmed numeric field cap
  overLimitAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 14
  otherRevenueDescriptionMaxLength: 'A'.repeat(250), // 5.8's confirmed character cap
  otherRevenueDescriptionOverLimitAttempt: 'A'.repeat(300), // typed, to prove input stops at 250
};

export const advisoryRevenueSectionTestData = {
  // 4.6 Deal advisory total = sum of 4.1-4.5.
  ma: '10',
  transactionServices: '20',
  valuations: '30',
  restructuring: '40',
  other: '50',
  expectedDealAdvisoryTotal: '150',
  // 4.14 Total = 4.6 (the subtotal above) + 4.7 through 4.12 (does not
  // double-count 4.1-4.5 individually).
  riskAdvisoryServices: '60',
  digital: '70',
  forensics: '80',
  cybersecurity: '90',
  managementConsulting: '100',
  otherRevenue: '110',
  expectedTotal: '660',
  maxLengthValue: '12345678901234', // exactly 14 digits - this section's confirmed numeric field cap
  overLimitAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 14
  otherRevenueDescriptionMaxLength: 'A'.repeat(250), // 4.13's confirmed character cap
  otherRevenueDescriptionOverLimitAttempt: 'A'.repeat(300), // typed, to prove input stops at 250
};

export const auditAssuranceSectionTestData = {
  // 2.7 Total = relatedServiceEngagements + audits + reviews + otherAssuranceEngagements
  // (2.3 and 2.6 are excluded from the sum - confirmed live).
  relatedServiceEngagements: '100',
  audits: '200',
  reviews: '300',
  otherAssuranceEngagements: '400',
  expectedTotal: '1 000', // as rendered, space-separated thousands
  pieAuditsWithinLimit: '150', // <= audits (200)
  pieAuditsOverLimit: '250', // > audits (200), triggers the 2.3 validation error
  esgWithinLimit: '350', // <= otherAssuranceEngagements (400)
  esgOverLimit: '450', // > otherAssuranceEngagements (400), triggers the 2.6 validation error
  combinedTurnoverOverLimit: '1500', // > the 1 000 total, triggers the 2.8.1 validation error
  maxLengthValue: '12345678901234', // exactly 14 digits - this section's confirmed field cap
  overLimitAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 14
};

export const sustainabilityRevenueSectionTestData = {
  // 7.1 must equal the sum of 7.2.1-7.2.6 when 7.2 = "Yes" (confirmed live:
  // an exact-equality check, unlike section 2's ">" inequality rules).
  sustainabilityStrategy: '100',
  regulatoryReportingAdvisory: '200',
  assurance: '300',
  climateServices: '400',
  sustainableFinance: '500',
  advisoryOther: '600',
  totalRevenue: '2100', // matches the sum of the six breakdown fields above
  totalRevenueMismatched: '2200', // != the breakdown sum, triggers the 7.1 validation error
  totalRevenueOnly: '5000', // used with 7.2 = "No", when no breakdown fields exist to sum against
  // Confirmed live: unlike every other section's fields, 7.1 caps at 16
  // digits (the same cap as General's top-level revenue field), while the
  // 7.2.1-7.2.6 breakdown fields cap at 14 like every other section's fields.
  totalRevenueMaxLengthValue: '1234567890123456', // exactly 16 digits - 7.1's confirmed cap
  breakdownMaxLengthValue: '12345678901234', // exactly 14 digits - the 7.2.x fields' confirmed cap
  overLimitAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at the field's cap
};
