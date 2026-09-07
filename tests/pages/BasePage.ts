import { Page, FrameLocator, Locator } from '@playwright/test';
import { CANVAS_FRAME_SELECTOR } from '../../config/app.config';

/**
 * Common shell around every screen of the canvas app: the top nav bar
 * (Home / Reports / Help) lives outside the Power Apps screen content but
 * inside the same iframe, so every page object gets it for free.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly canvasFrame: FrameLocator;

  constructor(page: Page) {
    this.page = page;
    this.canvasFrame = page.frameLocator(CANVAS_FRAME_SELECTOR);
  }

  // .first(): once you're past Home, the breadcrumb repeats "Home"/"Reports"
  // as its own button with the same accessible name as the top nav bar's -
  // the nav bar always renders first in the DOM, so .first() disambiguates.
  get homeNavButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Home', exact: true }).first();
  }

  get reportsNavButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Reports', exact: true }).first();
  }

  get helpNavButton(): Locator {
    return this.canvasFrame.getByRole('button', { name: 'Help', exact: true });
  }
}
