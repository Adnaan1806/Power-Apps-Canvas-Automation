import { test, expect } from './fixtures/reportDetail.fixture';
import { revenueSummarySectionTestData as data } from './fixtures/testData';

/** Strips the app's space thousand-separators and parses as a bigint - avoids float precision loss on General's up-to-16-digit total. */
function parseAmount(text: string): bigint {
  const cleaned = text.replace(/\s/g, '').trim();
  return cleaned === '' ? 0n : BigInt(cleaned);
}

/** Formats a bigint back into the app's own space-grouped display convention, e.g. 2422n -> "2 422". */
function formatThousands(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

test.describe('BFR Canvas App - Report Detail - Revenue Summary Section', () => {
  test.describe.configure({ mode: 'serial' });

  test('8.10 Total revenue calculated equals the sum of 8.2-8.7', async ({ revenueSummarySection }) => {
    // Confirmed live: right after expand(), 8.2-8.9's mirrored totals (which
    // pull from five other sections) can still be blank for a moment - a
    // one-shot read here raced that and summed six empty strings to 0.
    // Poll until every mirror has actually populated before trusting the sum.
    let expectedTotal = 0n;
    await expect
      .poll(
        async () => {
          const parts = await Promise.all([
            revenueSummarySection.auditAssuranceTotalDisplay.textContent(),
            revenueSummarySection.taxTotalDisplay.textContent(),
            revenueSummarySection.advisoryTotalDisplay.textContent(),
            revenueSummarySection.bsoTotalDisplay.textContent(),
            revenueSummarySection.legalTotalDisplay.textContent(),
            revenueSummarySection.otherTotalDisplay.textContent(),
          ]);
          if (parts.some((text) => !text || text.trim() === '')) return false;

          expectedTotal = parts.reduce((sum, text) => sum + parseAmount(text ?? '0'), 0n);
          return true;
        },
        { timeout: 15_000 }
      )
      .toBe(true);

    // toHaveValue auto-retries in case 8.10's own recompute lags briefly
    // behind its six inputs settling (same stale-total risk as every other
    // section's auto-computed total).
    await expect(revenueSummarySection.totalRevenueCalculatedInput).toHaveValue(
      formatThousands(expectedTotal)
    );
  });

  test('a mismatched Sector total shows the 8.8 validation error', async ({
    revenueSummarySection,
    sectorRevenueSection,
  }) => {
    const [sectorTotalText, calculatedText] = await Promise.all([
      sectorRevenueSection.totalInput.inputValue(),
      revenueSummarySection.totalRevenueCalculatedInput.inputValue(),
    ]);

    if (parseAmount(sectorTotalText) === parseAmount(calculatedText)) {
      // Already reconciled from a prior run - nudge one sub-field so the
      // two totals genuinely differ. Power Apps only enables Save when a
      // typed value differs from what's persisted, so re-typing the same
      // value would leave Save disabled.
      const current = await sectorRevenueSection.financialServicesInput.inputValue();
      const nudged = parseAmount(current) + 1n;
      await sectorRevenueSection.fillField(
        sectorRevenueSection.financialServicesInput,
        nudged.toString()
      );
      await sectorRevenueSection.save();
      await expect(sectorRevenueSection.saveSuccessAlert).toHaveText('Form saved: Sector revenue');
      // Confirmed live: this alert takes a few seconds to auto-dismiss.
      // Without waiting it out, a save in a later test can fire its own
      // alert while this one still lingers, and a bare getByRole('alert')
      // then resolves to both toasts at once (strict-mode violation).
      await expect(sectorRevenueSection.saveSuccessAlert).toBeHidden({ timeout: 20_000 });
    }

    // Left mismatched deliberately - the reconciliation test at the end of
    // this file fixes it for real, rather than restoring it here just to
    // re-break it again in the next test.
    await expect(revenueSummarySection.sectorTotalError).toBeVisible();
  });

  test('a mismatched Total revenue declared shows the 8.10 validation error', async ({
    revenueSummarySection,
    generalSection,
  }) => {
    const [declaredText, calculatedText] = await Promise.all([
      generalSection.getTotalRevenueValue(),
      revenueSummarySection.totalRevenueCalculatedInput.inputValue(),
    ]);
    const declared = parseAmount(declaredText);

    if (declared === parseAmount(calculatedText)) {
      const nudged = declared === 1n ? '2' : '1';
      await generalSection.fillTotalRevenue(nudged);
      await generalSection.save();
      await expect(generalSection.saveSuccessAlert).toHaveText('Form saved: General');
      // Same auto-dismiss race as the Sector save above.
      await expect(generalSection.saveSuccessAlert).toBeHidden({ timeout: 20_000 });
    }

    // Left mismatched deliberately - see the comment in the previous test.
    await expect(revenueSummarySection.totalRevenueCalculatedError).toBeVisible();
  });

  test('8.13 appears when the linked prior year\'s difference exceeds 10%', async ({
    revenueSummarySection,
  }) => {
    const diffText = await revenueSummarySection.percentDifferenceInput.inputValue();
    const diffValue = Math.abs(parseFloat(diffText.replace('%', '').trim()));
    expect(diffValue).toBeGreaterThan(10);

    await expect(revenueSummarySection.explanationInput).toBeVisible();
  });

  test('8.13 caps input at 250 characters', async ({ revenueSummarySection }) => {
    await revenueSummarySection.fillField(
      revenueSummarySection.explanationInput,
      data.explanationOverLimitAttempt
    );

    const value = await revenueSummarySection.explanationInput.inputValue();
    expect(value).toBe(data.explanationMaxLength);
    expect(value.length).toBe(250);
  });

  test('leaving 8.13 empty shows a warning, filling it clears the warning', async ({
    revenueSummarySection,
  }) => {
    await revenueSummarySection.fillField(revenueSummarySection.explanationInput, '');
    await expect(revenueSummarySection.explanationNotProvidedWarning).toBeVisible();

    // Confirmed live: a prior run's attempted click on this section's Save
    // button actually persisted this exact sentence anyway despite looking
    // disabled, so retyping the same text can leave nothing "dirty" to
    // detect. Stamping a timestamp guarantees this run's value always
    // differs from whatever's already persisted.
    const explanationText = `${data.explanationText} (verified ${Date.now()})`;
    await revenueSummarySection.fillField(revenueSummarySection.explanationInput, explanationText);
    await expect(revenueSummarySection.explanationNotProvidedWarning).toBeHidden();

    // Not saved here: confirmed live this section's own Save button stays
    // permanently disabled regardless of state (see RevenueSummarySection's
    // class comment) - only the live warning/visibility behavior is
    // testable for this field.
  });

  test('reconciling General\'s and Sector\'s totals to match 8.10 clears both errors and marks the section "Completed"', async ({
    revenueSummarySection,
    generalSection,
    sectorRevenueSection,
  }, testInfo) => {
    const target = parseAmount(await revenueSummarySection.totalRevenueCalculatedInput.inputValue());

    // General's declared total is a plain editable field - set it directly.
    const currentDeclared = parseAmount(await generalSection.getTotalRevenueValue());
    if (currentDeclared !== target) {
      await generalSection.fillTotalRevenue(target.toString());
      await generalSection.save();
      await expect(generalSection.saveSuccessAlert).toHaveText('Form saved: General');
      // Confirmed live: this alert takes a few seconds to auto-dismiss. The
      // Sector save below fires a second one shortly after - without
      // waiting for this one to clear first, getByRole('alert') resolves to
      // both toasts at once and the next assertion hits a strict-mode
      // violation instead of a clean pass/fail.
      await expect(generalSection.saveSuccessAlert).toBeHidden({ timeout: 20_000 });
    }

    // Sector's total (6.16) is a sum of 15 sub-fields, not directly
    // editable - adjust one sub-field by the delta needed to bring the sum
    // to target instead.
    const currentSectorTotal = parseAmount(await sectorRevenueSection.totalInput.inputValue());
    if (currentSectorTotal !== target) {
      const delta = target - currentSectorTotal;
      const currentFinancialServices = parseAmount(
        await sectorRevenueSection.financialServicesInput.inputValue()
      );
      const nudgedFinancialServices = currentFinancialServices + delta;
      if (nudgedFinancialServices < 0n) {
        throw new Error(
          `Cannot reconcile Sector total: nudging 6.1 Financial services by ${delta} would go negative`
        );
      }

      await sectorRevenueSection.fillField(
        sectorRevenueSection.financialServicesInput,
        nudgedFinancialServices.toString()
      );
      await expect(sectorRevenueSection.totalInput).toHaveValue(formatThousands(target));
      await sectorRevenueSection.save();
      await expect(sectorRevenueSection.saveSuccessAlert).toHaveText('Form saved: Sector revenue');
      // Same auto-dismiss race as General's alert above - this section's
      // own save further below fires a third toast shortly after.
      await expect(sectorRevenueSection.saveSuccessAlert).toBeHidden({ timeout: 20_000 });
    }

    await expect(revenueSummarySection.sectorTotalError).toBeHidden();
    await expect(revenueSummarySection.totalRevenueCalculatedError).toBeHidden();
    await expect(revenueSummarySection.statusRow).toContainText('Completed');

    const statusText = await revenueSummarySection.getStatusText();
    console.log(`Revenue summary status after reconciliation: "${statusText}"`);
    testInfo.annotations.push({ type: 'Section status', description: statusText });
  });
});
