# Privacy Policy - Yowu DevTools Companion

This document explains the permissions required by the Yowu DevTools Companion extension and how user data is handled.

## Dedicated Purpose

This extension enables the API Tester tool on tools.yowu.dev to bypass browser CORS restrictions when making API requests. The extension executes fetch requests in the extension context (which is not subject to CORS) and returns responses to the web application, allowing users to test APIs that would otherwise be blocked by browser security policies.

## Permissions

### storage

The extension uses Chrome's storage API to save user-granted domain permissions locally in the browser. When a user grants permission to access a specific API domain, this preference is stored locally so the user doesn't need to grant permission again for subsequent requests. All data is stored locally using `chrome.storage.local` and is never transmitted to external servers.

### cookies

**Why this permission is required:**

This permission is required to include authentication cookies when making API requests on behalf of the user.

When users test APIs that require session-based or cookie-based authentication, the extension needs to read cookies for the target domain and include them in the request. This enables users to test authenticated endpoints without manually copying and pasting cookie values.

**Key points:**

- Cookies are only read for domains that the user has explicitly granted permission to access
- Cookie data is only used for API requests initiated by the user and is never stored or transmitted elsewhere
- Users maintain full control through the optional host permissions system

### declarativeNetRequest

**Why this permission is required:**

This permission is used to modify HTTP request headers for cross-origin API requests to prevent CORS-related failures.

Specifically, it:

- Removes the Origin header from requests
- Modifies Sec-Fetch-Site and Sec-Fetch-Mode headers

This allows users to test APIs that have restrictive CORS policies which would otherwise reject requests based on Origin header checks. Many API servers are configured to only accept requests from specific origins, and this modification enables developers to test these APIs directly from the browser.

**Key points:**

- Header modifications only apply to API requests initiated by the user through the extension
- No user data is collected, stored, or transmitted
- This is a common requirement for API testing tools to function properly

### storage

**Why this permission is required:**

This permission is used to store user preferences and settings locally within the browser.

**Key points:**

- All data is stored locally on the user's device
- No data is synced to external servers
- Used for storing extension configuration only

## Data Handling

### What data we collect

- **None.** This extension does not collect, store, or transmit any user data to external servers.

### What data stays on your device

- User preferences and settings (via chrome.storage)
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

Last updated: 2024-12-17
