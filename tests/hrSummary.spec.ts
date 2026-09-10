import { test, expect } from './fixtures/reportDetail.fixture';

/** Strips the app's space thousand-separators and parses as a bigint - avoids float precision loss on large sums. */
function parseAmount(text: string): bigint {
  const cleaned = text.replace(/\s/g, '').trim();
  return cleaned === '' ? 0n : BigInt(cleaned);
}

/** Formats a bigint back into the app's own space-grouped display convention, e.g. 2422n -> "2 422". */
function formatThousands(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

test.describe('BFR Canvas App - Report Detail - HR Summary Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('11.1-11.8 mirror and total section 9\'s partner counts', async ({
    hrSummarySection,
    hrPartnerDetailsSection,
  }) => {
    const pairs = hrPartnerDetailsSection.categoryPairs; // [A&A, Tax, Advisory, BSO, Legal, Other]
    const summaryDisplays = [
      hrSummarySection.aaPartnersDisplay,
      hrSummarySection.taxPartnersDisplay,
      hrSummarySection.advisoryPartnersDisplay,
      hrSummarySection.bsoPartnersDisplay,
      hrSummarySection.legalPartnersDisplay,
      hrSummarySection.otherPartnersDisplay,
    ];

    let totalPartners = 0n;
    let totalFemalePartners = 0n;
    for (const [index, pair] of pairs.entries()) {
      const [partnersText, femaleText] = await Promise.all([
        pair.partnersInput.inputValue(),
        pair.femaleInput.inputValue(),
      ]);
      const partners = parseAmount(partnersText);
      totalPartners += partners;
      totalFemalePartners += parseAmount(femaleText);

      await expect(summaryDisplays[index], `11.${index + 1} mirrors ${pair.name} partners`).toHaveText(
        formatThousands(partners)
      );
    }

    await expect(hrSummarySection.totalPartnersDisplay).toHaveText(formatThousands(totalPartners));
    await expect(hrSummarySection.totalFemalePartnersDisplay).toHaveText(
      formatThousands(totalFemalePartners)
    );
  });

  test('11.9-11.17 mirror and total section 10\'s professional staff counts, with Overhead/admin excluded from the professional total', async ({
    hrSummarySection,
    hrStaffDetailsSection,
  }) => {
    const [aaTotalText, aaFemaleText, overheadStaffText, overheadFemaleText] = await Promise.all([
      hrStaffDetailsSection.aaProfStaffTotalDisplay.textContent(),
      hrStaffDetailsSection.aaFemaleProfStaffInput.inputValue(),
      hrStaffDetailsSection.overheadStaffInput.inputValue(),
      hrStaffDetailsSection.overheadFemaleStaffInput.inputValue(),
    ]);
    const aaTotal = parseAmount(aaTotalText ?? '0');
    const overheadStaff = parseAmount(overheadStaffText);

    await expect(hrSummarySection.aaProfStaffDisplay).toHaveText(formatThousands(aaTotal));
    await expect(hrSummarySection.overheadStaffDisplay).toHaveText(formatThousands(overheadStaff));

    const simplePairs = hrStaffDetailsSection.simpleCategoryPairs; // [Tax, Advisory, BSO, Legal, Other, Overhead/admin]
    const simpleSummaryDisplays = [
      hrSummarySection.taxProfStaffDisplay,
      hrSummarySection.advisoryProfStaffDisplay,
      hrSummarySection.bsoProfStaffDisplay,
      hrSummarySection.legalProfStaffDisplay,
      hrSummarySection.otherProfStaffDisplay,
    ];

    let totalProfStaff = aaTotal;
    let totalFemaleProfStaff = parseAmount(aaFemaleText);
    // Only the first five simple pairs (Tax through Other) feed the
    // "professional staff" totals - Overhead/admin (the sixth pair) is
    // mirrored separately (11.17) and confirmed live to be excluded.
    for (const [index, pair] of simplePairs.slice(0, 5).entries()) {
      const [staffText, femaleText] = await Promise.all([
        pair.staffInput.inputValue(),
        pair.femaleInput.inputValue(),
      ]);
      const staff = parseAmount(staffText);
      totalProfStaff += staff;
      totalFemaleProfStaff += parseAmount(femaleText);

      await expect(simpleSummaryDisplays[index], `11.${index + 10} mirrors ${pair.name} prof staff`).toHaveText(
        formatThousands(staff)
      );
    }

    await expect(hrSummarySection.totalProfStaffDisplay).toHaveText(formatThousands(totalProfStaff));
    await expect(hrSummarySection.totalFemaleProfStaffDisplay).toHaveText(
      formatThousands(totalFemaleProfStaff)
    );
  });

  test('11.18 mirrors 10.18 Overhead/admin female staff directly', async ({
    hrSummarySection,
    hrStaffDetailsSection,
  }) => {
    // 10.18's own value is unformatted ("80000"); its 11.18 mirror displays
    // it space-grouped ("80 000") like every other summary field here.
    const overheadFemaleText = await hrStaffDetailsSection.overheadFemaleStaffInput.inputValue();
    await expect(hrSummarySection.overheadFemaleStaffInput).toHaveValue(
      formatThousands(parseAmount(overheadFemaleText))
    );
  });

  test('11.19 Total staff and 11.20 Total female staff combine the professional and overhead/admin totals', async ({
    hrSummarySection,
  }) => {
    const [totalProfStaffText, overheadStaffText, totalFemaleProfStaffText, overheadFemaleText] =
      await Promise.all([
        hrSummarySection.totalProfStaffDisplay.textContent(),
        hrSummarySection.overheadStaffDisplay.textContent(),
        hrSummarySection.totalFemaleProfStaffDisplay.textContent(),
        hrSummarySection.overheadFemaleStaffInput.inputValue(),
      ]);

    const expectedTotalStaff = parseAmount(totalProfStaffText ?? '0') + parseAmount(overheadStaffText ?? '0');
    const expectedTotalFemaleStaff =
      parseAmount(totalFemaleProfStaffText ?? '0') + parseAmount(overheadFemaleText);

    await expect(hrSummarySection.totalStaffInput).toHaveValue(formatThousands(expectedTotalStaff));
    await expect(hrSummarySection.totalFemaleStaffInput).toHaveValue(
      formatThousands(expectedTotalFemaleStaff)
    );
  });
});
