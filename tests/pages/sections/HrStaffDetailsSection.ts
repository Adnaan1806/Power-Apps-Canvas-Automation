import { Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Fields inside a report detail form's "10. HR staff details" section.
 * Reached via ReportDetailPage.hrStaffDetailsSection after expanding the
 * section.
 *
 * Structurally like section 9 (category pairs of staff / female staff,
 * each independently validated, female <= its own category), but with two
 * differences confirmed live:
 * - A&A is a three-way breakdown (10.1-10.3) feeding an auto-computed
 *   total (10.4), and 10.5 "A&A female prof staff" validates against that
 *   computed total rather than a single raw input - the other six
 *   categories (Tax, Advisory, BSO, Legal, Other, Overhead/admin) are
 *   simple pairs like section 9's.
 * - 10.4 itself renders as a plain, non-interactive text element - neither
 *   `textbox` nor `button` role (unlike section 8's button-styled totals).
 *   It DOES live inside the same `appmagic-typed-card` ancestor as its own
 *   label, same as every other field - an earlier attempt assumed
 *   otherwise from the aria snapshot's apparent flat sibling structure,
 *   which turned out to not match the real DOM (confirmed via direct DOM
 *   inspection) - the same class of trap already documented for
 *   GeneralSection.statusRow. Don't trust the aria snapshot's nesting
 *   alone for a new structural locator; verify against the real DOM.
 *
 * Every field except 10.4 shares the same broken generic accessible name
 * ("SHRStaff") - confirmed live, so every textbox getter uses the
 * structural typed-card/label lookup, same technique as
 * AuditAssuranceSection.fieldInput. Numeric fields cap at 13 characters
 * here (confirmed live for 10.6 and 10.17) - NOT 12 like section 9's
 * "SHRPartners" fields, confirming (again) that these caps are field/
 * section-specific and must be checked live, never assumed.
 *
 * Validation error wording confirmed live for A&A (against the computed
 * total), Tax and Overhead/admin ("Number of X female Y must not be
 * greater than number of X Y."); trusted for Advisory, BSO, Legal, Other
 * given the exact structural/naming symmetry. 10.16 "Other prof staff
 * explanation" is optional (250-char cap, same pattern as 4.13/5.8/8.13/
 * 9.13) - confirmed live all 17 other fields are required for "Completed".
 *
 * Numeric fields' HTML maxlength (13) is misleading here too - confirmed
 * live a value within that cap can still fail at Save with a Dataverse
 * error ("Value must be between 0 and 100000000000", same ceiling as
 * section 9) if it numerically exceeds that ceiling. Not covered by this
 * file's own tests (descoped, same as section 9) - worth knowing before
 * assuming 13 digits is always safe here.
 */
export class HrStaffDetailsSection extends BasePage {
  get header(): Locator {
    return this.canvasFrame.getByText('10. HR staff details', { exact: true });
  }

  /** Same row-container pattern confirmed for GeneralSection.statusRow. */
  get statusRow(): Locator {
    return this.header.locator('xpath=ancestor::*[contains(@class, "appmagic-group")][1]');
  }

  get aaSeniorManagersInput(): Locator {
    return this.fieldInput('10.1 A&A prof staff senior managers');
  }

  get aaManagersInput(): Locator {
    return this.fieldInput('10.2 A&A prof staff managers');
  }

  get aaAuditorsAnalystsInput(): Locator {
    return this.fieldInput('10.3 A&A prof staff auditors analysts');
  }

  /** Read-only, auto-computed as the sum of 10.1 through 10.3. Renders as plain text, not a textbox/button. */
  get aaProfStaffTotalDisplay(): Locator {
    return this.totalDisplay('10.4 A&A prof staff total');
  }

  get aaFemaleProfStaffInput(): Locator {
    return this.fieldInput('10.5 A&A female prof staff');
  }

  get aaFemaleProfStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of A&A female prof staff must not be greater than number of A&A prof staff total.',
      { exact: true }
    );
  }

  get taxProfStaffInput(): Locator {
    return this.fieldInput('10.6 Tax prof staff');
  }

  get taxFemaleProfStaffInput(): Locator {
    return this.fieldInput('10.7 Tax female prof staff');
  }

  get taxFemaleProfStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Tax female prof staff must not be greater than number of Tax prof staff.',
      { exact: true }
    );
  }

  get advisoryProfStaffInput(): Locator {
    return this.fieldInput('10.8 Advisory prof staff');
  }

  get advisoryFemaleProfStaffInput(): Locator {
    return this.fieldInput('10.9 Advisory female prof staff');
  }

  get advisoryFemaleProfStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Advisory female prof staff must not be greater than number of Advisory prof staff.',
      { exact: true }
    );
  }

  get bsoProfStaffInput(): Locator {
    return this.fieldInput('10.10 BSO prof staff');
  }

  get bsoFemaleProfStaffInput(): Locator {
    return this.fieldInput('10.11 BSO female prof staff');
  }

  get bsoFemaleProfStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of BSO female prof staff must not be greater than number of BSO prof staff.',
      { exact: true }
    );
  }

  get legalProfStaffInput(): Locator {
    return this.fieldInput('10.12 Legal prof staff');
  }

  get legalFemaleProfStaffInput(): Locator {
    return this.fieldInput('10.13 Legal female prof staff');
  }

  get legalFemaleProfStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Legal female prof staff must not be greater than number of Legal prof staff.',
      { exact: true }
    );
  }

  get otherProfStaffInput(): Locator {
    return this.fieldInput('10.14 Other prof staff');
  }

  get otherFemaleProfStaffInput(): Locator {
    return this.fieldInput('10.15 Other female prof staff');
  }

  get otherFemaleProfStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Other female prof staff must not be greater than number of Other prof staff.',
      { exact: true }
    );
  }

  get otherProfStaffExplanationInput(): Locator {
    return this.fieldInput('10.16 Other prof staff explanation');
  }

  get overheadStaffInput(): Locator {
    return this.fieldInput('10.17 Overhead/admin staff');
  }

  get overheadFemaleStaffInput(): Locator {
    return this.fieldInput('10.18 Overhead/admin female staff');
  }

  get overheadFemaleStaffError(): Locator {
    return this.canvasFrame.getByText(
      'Number of Overhead/admin female staff must not be greater than number of Overhead/admin staff.',
      { exact: true }
    );
  }

  /**
   * The six simple category pairs (everything except A&A, which is a
   * three-way breakdown feeding a computed total rather than a single raw
   * input - see aaProfStaffTotalDisplay). For tests that loop rather than
   * repeat near-identical assertions per category.
   */
  get simpleCategoryPairs(): Array<{ name: string; staffInput: Locator; femaleInput: Locator; error: Locator }> {
    return [
      { name: 'Tax', staffInput: this.taxProfStaffInput, femaleInput: this.taxFemaleProfStaffInput, error: this.taxFemaleProfStaffError },
      { name: 'Advisory', staffInput: this.advisoryProfStaffInput, femaleInput: this.advisoryFemaleProfStaffInput, error: this.advisoryFemaleProfStaffError },
      { name: 'BSO', staffInput: this.bsoProfStaffInput, femaleInput: this.bsoFemaleProfStaffInput, error: this.bsoFemaleProfStaffError },
      { name: 'Legal', staffInput: this.legalProfStaffInput, femaleInput: this.legalFemaleProfStaffInput, error: this.legalFemaleProfStaffError },
      { name: 'Other', staffInput: this.otherProfStaffInput, femaleInput: this.otherFemaleProfStaffInput, error: this.otherFemaleProfStaffError },
      { name: 'Overhead/admin', staffInput: this.overheadStaffInput, femaleInput: this.overheadFemaleStaffInput, error: this.overheadFemaleStaffError },
    ];
  }

  /**
   * Scoped to this section's own component, not the whole page - same
   * `following::` XPath axis as every other section's saveButton (see
   * AuditAssuranceSection.saveButton for the two wrong approaches already
   * ruled out).
   */
  get saveButton(): Locator {
    return this.header.locator('xpath=following::button[normalize-space(.)="Save"][1]');
  }

  /** Lives outside the canvas iframe, in the Power Apps player chrome. */
  get saveSuccessAlert(): Locator {
    return this.page.getByRole('alert');
  }

  /** Same structural lookup as AuditAssuranceSection.fieldInput. */
  private fieldInput(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .getByRole('textbox');
  }

  /**
   * For 10.4 only: verified live via real DOM inspection (not just the
   * aria snapshot, which can compress/omit wrapper elements and made the
   * value look like a plain top-level sibling of the label when it isn't -
   * confirmed the SAME class of bug already documented for
   * GeneralSection.statusRow) - the value actually lives inside the SAME
   * `appmagic-typed-card` ancestor as every other field, just rendered as
   * plain text rather than a textbox/button, five DOM levels below a
   * `.appmagic-label-text` leaf. Every other leaf in the card (the
   * required-field "*" marker, the label itself, an unused/empty control)
   * is ALSO wrapped by ancestors whose aggregate text includes the value,
   * so a bare `getByText(regex)` proved unreliable here (it resolved to a
   * real element, but with empty text, on a fresh page load) - filtering
   * the concrete `.appmagic-label-text` leaves directly by their own
   * content is what actually works.
   *
   * Confirmed live on a fresh page load: this can briefly resolve to TWO
   * such leaves with identical text (Power Apps appears to render a
   * hidden auto-sizing "measurer" clone alongside the real label during a
   * recompute - not reproducible in an already-settled, longer-lived
   * session, only right after typing). `.first()` disambiguates, same
   * resolution already used for other confirmed duplicate-render cases in
   * this codebase (ReportDetailPage.reportTitle, ReportsPage.headerRow).
   */
  private totalDisplay(label: string): Locator {
    return this.canvasFrame
      .getByText(label, { exact: true })
      .locator('xpath=ancestor::*[contains(@class, "appmagic-typed-card")][1]')
      .locator('.appmagic-label-text')
      .filter({ hasText: /^[\d,\s]+$/ })
      .first();
  }

  /** Expands the section, if it isn't already expanded (same toggle-on-click pattern as GeneralSection). */
  async expand(): Promise<void> {
    const alreadyExpanded = await this.aaSeniorManagersInput.isVisible().catch(() => false);
    if (alreadyExpanded) return;

    await this.header.click();
    await this.aaSeniorManagersInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Types into a field and blurs - Save stays disabled until blur, same as GeneralSection. */
  async fillField(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.fill('');
    await input.pressSequentially(value);
    await input.blur();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /** Collapses the status row's whitespace-heavy textContent into a single readable line. */
  async getStatusText(): Promise<string> {
    const raw = await this.statusRow.textContent();
    return (raw ?? '').replace(/\s+/g, ' ').trim();
  }
}
