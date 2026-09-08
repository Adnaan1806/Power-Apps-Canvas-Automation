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
