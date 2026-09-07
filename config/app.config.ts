import 'dotenv/config';

export const APP_URL =
  process.env.BFR_APP_URL ??
  'https://apps.powerapps.com/play/e/88aafdc6-17fa-4c32-a5b5-35dbdbdf05c0/a/9d4e32af-d89c-4685-abc5-cdaa1913fd0c?tenantId=44f4e7a6-4821-44d7-b286-cd90436c6975';

export const CANVAS_FRAME_SELECTOR = 'iframe[name="fullscreen-app-host"]';

export const AUTH_STATE_PATH = 'playwright/.auth/user.json';

// A dedicated test/service account, never a personal one. Leave unset to
// fall back to fully manual interactive sign-in.
export const BFR_USERNAME = process.env.BFR_USERNAME;
export const BFR_PASSWORD = process.env.BFR_PASSWORD;
