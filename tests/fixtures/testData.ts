export const generalSectionTestData = {
  currency: 'EUR',
  validRevenue: '12345678901234', // 14 digits, well within the field's cap
  maxLengthRevenue: '1234567890123456', // exactly 16 digits - the field's confirmed limit
  overLimitRevenueAttempt: '12345678901234567890', // 20 digits typed, to prove input stops at 16
};
