# Yowu DevTools Companion - Changelog

All notable changes to the Chrome Extension are documented in this file.

---

## v1.0.1 (December 2025) - API Tester Enhancement

The first feature release of Yowu DevTools Companion extension, enhancing the API Tester tool with CORS bypass and cookie handling capabilities.

### New Features

- ✨ **CORS Bypass**: Execute cross-origin API requests that would otherwise be blocked by browser security policies
  - Requests are executed in the extension context, bypassing CORS restrictions
  - Automatic header modification via `declarativeNetRequest` API (removes Origin, modifies Sec-Fetch-* headers)

- ✨ **Include Cookies Option**: Optionally include browser cookies in API requests
  - Toggle "Include Cookies" checkbox in API Tester (Extension mode only)
  - Uses `credentials: 'include'` for automatic cookie handling
  - Tooltip explains the feature in all supported languages (en-US, ko-KR, ja-JP, zh-CN, es-ES)

- ✨ **Permission Management**: Granular host permission control
  - Users must explicitly grant permission for each domain
  - Permission caching in localStorage for faster subsequent requests
  - Permissions can be managed via extension options page

- ✨ **Error Details View**: Detailed error information for debugging
  - Collapsible "Show Details" section in API Tester response area
  - Includes: error code, message, request URL, method, headers, cookies setting
  - Helps users diagnose issues with failed requests

### Bug Fixes

- 🔧 **Empty Header Key Filter**: Fixed "Invalid name" error when sending requests with empty header keys
  - Skip headers with empty or whitespace-only keys
  - Trim header keys before using them

### Technical Details

- **Manifest Version**: 3
- **Minimum Chrome Version**: 102
- **Permissions**:
  - `storage`: Store user preferences and granted permissions
  - `cookies`: Include authentication cookies in API requests
  - `declarativeNetRequest`: Modify request headers for CORS bypass
- **Optional Host Permissions**: `http://*/*`, `https://*/*` (requested per-domain)

### Privacy

- No user data is collected, stored, or transmitted to external servers
- All API requests are sent directly to user-specified endpoints
- Cookie data is only used for API requests and never stored
- See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for detailed privacy information

---

## v1.0.0 (December 2025) - Initial Release

Initial release of Yowu DevTools Companion extension.

### Features

- Basic message passing between tools.yowu.dev and extension
- Service Worker-based background script (Manifest V3)
- Options page for extension settings
- `externally_connectable` configuration for secure communication

### Technical Details

- Protocol version: 1.0.0
- Supported features: CORS bypass, permission management

