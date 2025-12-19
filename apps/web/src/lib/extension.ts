/**
 * Chrome Extension Constants and Types
 *
 * Shared constants for the Yowu DevTools Companion extension.
 */

/**
 * Chrome Extension ID for Yowu DevTools Companion (Production)
 *
 * This is the production extension ID used as a fallback when VITE_EXTENSION_ID
 * environment variable is not set.
 *
 * For local development, create a `.env.local` file in `apps/web/` directory
 * with your development extension ID:
 *
 *   VITE_EXTENSION_ID=lhaoapjoifnhfnlklbkggodnkpeikgme
 *
 * Development Extension ID: lhaoapjoifnhfnlklbkggodnkpeikgme
 * Production Extension ID: jmkojnlpffcdelhhefnnjgbgffiaigce
 *
 * Update this value if the production extension ID changes.
 */
export const EXTENSION_ID = 'jmkojnlpffcdelhhefnnjgbgffiaigce';

/**
 * Chrome Web Store URL for the extension
 */
export const EXTENSION_STORE_URL = `https://chromewebstore.google.com/detail/yowu-devtools-companion/${EXTENSION_ID}`;

/**
 * Extension connection status
 */
export type ExtensionStatus =
  | 'not-installed'
  | 'permission-required'
  | 'connected'
  | 'checking';

