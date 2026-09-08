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
