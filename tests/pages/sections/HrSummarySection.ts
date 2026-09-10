import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "11. HR summary" section. Reached
 * via ReportDetailPage.hrSummarySection after expanding the section.
 *
 * Entirely read-only - confirmed live there is no per-section Save button
 * at all (only the global, disabled "Save All"), and the status badge is
 * permanently "Information only" regardless of data state. A pure
 * rollup/reconciliation view over sections 9 (HR partner details) and 10
 * (HR staff details): every field either mirrors a field from one of
 * those two sections, or sums several of them - confirmed live via exact
 * arithmetic matches, not just plausible guesses:
 * - 11.1-11.6 mirror section 9's six "X partners" fields (9.1/9.3/9.5/9.7/
 *   9.9/9.11) directly. 11.7 "Total partners" = sum(11.1-11.6). 11.8
 *   "Total female partners" = sum of section 9's six "X female partners"
 *   fields (9.2/9.4/9.6/9.8/9.10/9.12).
 * - 11.9-11.14 mirror section 10's six simple-pair "X prof staff" fields
 *   (10.6/10.8/10.10/10.12/10.14) plus 10.4 (the computed A&A total, for
 *   11.9). 11.17 mirrors 10.17 "Overhead/admin staff" separately. 11.15
 *   "Total prof staff" = sum(11.9-11.14) - confirmed live this EXCLUDES
 *   11.17 (Overhead/admin isn't counted as "professional" staff). 11.16
 *   "Total female prof staff" = sum of section 10's six simple-pair female
 *   fields (10.7/10.9/10.11/10.13/10.15) plus 10.5 (A&A female), likewise
 *   excluding 10.18.
 * - 11.18 mirrors 10.18 "Overhead/admin female staff" directly. 11.19
 *   "Total staff" = 11.15 + 11.17. 11.20 "Total female staff" = 11.16 +
 *   11.18.
 * - Note: 11.11's visible label has a typo ("Advisory proff staff") -
 *   confirmed live, matched verbatim since these getters locate by exact
 *   visible label text. 11.17 is numbered out of sequence (it renders
 *   between 11.14 and 11.15 in DOM order, not after 11.16) - confirmed
 *   live, not a transcription error.
 *
 * Every field's rendered role is inconsistent and NOT meaningful (some
 * render as `button`, some as plain non-interactive text, confirmed live
 * for the same field across a page reload) - EXCEPT 11.18/11.19/11.20,
 * which are genuine `textbox` elements with unique accessible names
 * matching their own visible labels (not broken, unlike most other
 * sections' fields). Getters for 11.1-11.17 use the same structural
 * typed-card lookup as HrStaffDetailsSection.totalDisplay (filtering
 * `.appmagic-label-text` leaves by digit content, `.first()` for the same
 * transient-duplicate-render safety), since that pattern is confirmed to
 * work regardless of the field's actual rendered role.
 */
export class HrSummarySection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('11. HR summary', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get aaPartnersDisplay(): Locator {
    return this.fieldDisplay('11.1 A&A partners');
  }

  get taxPartnersDisplay(): Locator {
    return this.fieldDisplay('11.2 Tax partners');
  }

  get advisoryPartnersDisplay(): Locator {
    return this.fieldDisplay('11.3 Advisory partners');
  }

  get bsoPartnersDisplay(): Locator {
    return this.fieldDisplay('11.4 BSO partners');
  }

  get legalPartnersDisplay(): Locator {
    return this.fieldDisplay('11.5 Legal partners');
  }

  get otherPartnersDisplay(): Locator {
    return this.fieldDisplay('11.6 Other partners');
  }

  /** Read-only, auto-computed as the sum of 11.1 through 11.6. */
  get totalPartnersDisplay(): Locator {
    return this.fieldDisplay('11.7 Total partners');
  }

  /** Read-only, auto-computed as the sum of section 9's six female-partners fields. */
  get totalFemalePartnersDisplay(): Locator {
    return this.fieldDisplay('11.8 Total female partners');
  }

  get aaProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.9 A&A prof staff');
  }

  get taxProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.10 Tax prof staff');
  }

  /** Confirmed live: the visible label itself has a typo ("proff"), matched verbatim. */
  get advisoryProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.11 Advisory proff staff');
  }

  get bsoProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.12 BSO prof staff');
  }

  get legalProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.13 Legal prof staff');
  }

  get otherProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.14 Other prof staff');
  }

  /** Mirrors 10.17 directly - excluded from 11.15's "professional staff" total. */
  get overheadStaffDisplay(): Locator {
    return this.fieldDisplay('11.17 Overhead/admin staff');
  }

  /** Read-only, auto-computed as the sum of 11.9 through 11.14 - confirmed live this excludes 11.17. */
  get totalProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.15 Total prof staff');
  }

  /** Read-only, auto-computed as the sum of section 10's six simple-pair female fields (10.5/10.7/10.9/10.11/10.13/10.15) - confirmed live this excludes 10.18. */
  get totalFemaleProfStaffDisplay(): Locator {
    return this.fieldDisplay('11.16 Total female prof staff');
  }

  /** A genuine textbox with a unique accessible name matching its own label - mirrors 10.18 directly. */
  get overheadFemaleStaffInput(): Locator {
    return this.canvasFrame.getByRole('textbox', {
      name: '11.18 Overhead/admin female staff',
      exact: true,
    });
  }

  /** Read-only, auto-computed as 11.15 + 11.17. */
  get totalStaffInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '11.19 Total staff', exact: true });
  }

  /** Read-only, auto-computed as 11.16 + 11.18. */
  get totalFemaleStaffInput(): Locator {
    return this.canvasFrame.getByRole('textbox', { name: '11.20 Total female staff', exact: true });
  }

  /**
   * Structural lookup shared by every 11.1-11.17 getter, same technique as
   * HrStaffDetailsSection.totalDisplay - works regardless of whether the
   * field happens to render as a `button` or plain text (confirmed live
   * this varies per field, and even for the same field across a reload).
   * `.first()` guards against the same transient duplicate-render
   * confirmed for HrStaffDetailsSection's 10.4.
   */
  private fieldDisplay(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .locator('.appmagic-label-text')
      .filter({ hasText: /^[\d,\s]+$/ })
      .first();
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.aaPartnersDisplay.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.aaPartnersDisplay.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Collapses the status row's whitespace-heavy textContent into a single readable line. */
  async getStatusText(): Promise<string> {
    const raw = await this.statusRow.textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }
}
