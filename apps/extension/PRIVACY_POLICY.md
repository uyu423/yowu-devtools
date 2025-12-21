# Privacy Policy - Yowu DevTools Companion

This document explains the permissions required by the Yowu DevTools Companion extension and how user data is handled.

## Dedicated Purpose

This extension enables the API Tester tool on tools.yowu.dev to bypass browser CORS restrictions when making API requests. The extension executes fetch requests in the extension context (which is not subject to CORS) and returns responses to the web application, allowing users to test APIs that would otherwise be blocked by browser security policies.

## Permissions

### declarativeNetRequest

**Why this permission is required:**

This permission is used to modify HTTP request headers for cross-origin API requests to prevent CORS-related failures.

Specifically, it:

- Removes the Origin header from requests
- Modifies Sec-Fetch-Site and Sec-Fetch-Mode headers

**Key points:**

- Header modifications are applied using **dynamic rules** that are created only when a user grants permission for a specific domain
- Rules are automatically removed when permission is revoked
- **No rules are applied to other websites** - only domains explicitly approved by the user are affected
- This is a common requirement for API testing tools to function properly

### Cookie Handling

When the "Include Cookies" option is enabled in the API Tester, the extension uses the standard `credentials: 'include'` fetch option to include cookies in requests. This is a browser-native feature that:

- Automatically includes cookies for domains the user has granted host permissions to
- Does not require the `cookies` permission
- Never stores or transmits cookie data to external servers

## Data Handling

### What data we collect

- **None.** This extension does not collect, store, or transmit any user data to external servers.

### What data stays on your device

- Granted host permissions (managed by Chrome)

### What data is transmitted

- API requests are sent directly to the target servers specified by the user
- No data is sent to our servers or any third-party services

## User Control

- Users must explicitly grant permission for each domain they want to access
- Permissions can be revoked at any time through the extension's options page
- All API requests are initiated by user action only

## Contact

For questions about this privacy policy, please visit: https://tools.yowu.dev

---

Last updated: 2025-12-18
