# Yowu DevTools Companion - Changelog

All notable changes to the Chrome Extension are documented in this file.

---

## v1.0.5 (December 2025) - JIT Architecture

**Major architectural change**: Switched to Just-In-Time (JIT) Rule Activation to solve the fundamental conflict between API Tester and regular web browsing.

### 🎯 Problem Solved

**The Dilemma**:
- With `initiatorDomains`: Other websites work ✅, but API Tester fails ❌ (chrome-extension:// not supported)
- Without `initiatorDomains`: API Tester works ✅, but other websites get CORS errors ❌ (rules affect all sites)

**Root Cause**: Chrome's declarativeNetRequest doesn't properly match `chrome-extension://` in `initiatorDomains`, making it impossible to filter rules to only affect extension requests while keeping them active persistently.

### ✨ New Architecture: JIT (Just-In-Time) Rule Activation

Rules are now created and destroyed dynamically per-request:

1. **On Startup**: Clean up all stale rules (no persistent rules)
2. **Before API Request**: Add declarativeNetRequest rule for target domain
3. **Execute Request**: Origin header is removed by the rule
4. **After Request**: Immediately remove the rule (success or failure)

**Benefits**:
- ✅ API Tester works perfectly (Origin header removed)
- ✅ Other websites unaffected (rules only active for milliseconds)
- ✅ No `initiatorDomains` needed (rule exists only during extension request)
- ✅ Clean startup (no stale rules from previous sessions)

### Technical Details

**Key Changes**:
- `syncDynamicRulesWithPermissions()` → `cleanupDynamicRulesOnStartup()`
- `addDynamicRuleForDomain()`: Now returns `ruleId`, logs `[JIT]` prefix
- `removeDynamicRuleForDomain()`: Takes `ruleId` parameter, called after each request
- `executeRequest()`: Wraps fetch with rule activation/deactivation

**Timeline**:
```
[0ms]    Add rule for target domain
[1ms]    Execute fetch() - Origin header removed ✅
[150ms]  Response received
[151ms]  Remove rule immediately
```

**Security**: 
- Rules exist for <200ms per request (typical)
- Only domains with granted permissions can have rules
- `externally_connectable` restricts which websites can trigger extension

**Performance**: 
- Negligible overhead (~2-5ms for rule add/remove)
- Rules are domain-specific, not global

---

## v1.0.4 (December 2025) - Build Mode Split

Split build configuration into dev/prod modes for localhost handling.

### Changes

- 🔧 **Build mode split**: Separate `build:dev` and `build` (prod) commands
  - Dev build: Includes 'localhost' in `initiatorDomains`
  - Prod build: Excludes 'localhost' to avoid affecting other developers
  - Prevents conflicts when multiple developers have the extension installed

---

## v1.0.3 (December 2025) - Permission Cleanup

Cleanup release to comply with Chrome Web Store policies.

### Changes

- 🔧 **Remove unused permissions**: Removed `storage` and `cookies` permissions from manifest
  - These permissions were declared but not actually used in the code
  - `declarativeNetRequest` permission is retained (actively used for CORS bypass)
  - Cookie handling still works via `credentials: 'include'` (no `cookies` permission needed)

### Technical Details

- **Permissions** (updated):
  - `declarativeNetRequest`: Modify request headers for CORS bypass
  - ~~`storage`~~: Removed (not used)
  - ~~`cookies`~~: Removed (not needed for `credentials: 'include'`)

---

## v1.0.2 (December 2025) - Bug Fixes

Minor bug fixes and improvements.

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

