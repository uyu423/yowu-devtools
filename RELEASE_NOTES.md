# Release Notes

## v1.2.1 (January 2025) - Regex & Hash Enhancement

**New Features:**

- ✨ **Regex Tester**: Test and visualize regular expressions
  - Pattern matching with visual highlights (full matches and capture groups)
  - Named capture groups support (`(?<name>...)`)
  - Group-specific color coding (same group = same color across matches)
  - Replacement preview with `$1`, `$2`, `$<name>` support
  - Flags toggle (g, i, m, s, u, y, d, v)
  - Match list panel with click-to-scroll functionality
  - Performance protection (debounce, backtracking warnings)
  - JavaScript RegExp engine (browser-native)

**Enhancements:**

- 🚀 **Hash/HMAC Generator Improvements**:
  - File hash support: Calculate hash for files (drag & drop or file picker)
  - Base64URL encoding option added (hex, base64, base64url)
  - HMAC key encoding options (raw-text, hex, base64)
  - Random key generation button (WebCrypto generateKey)
  - HMAC verification section: Enter expected MAC → shows match status (OK/Fail)
  - File metadata display (name, size, lastModified)
  - Processing status indicator (loading spinner, progress for large files)
  - Security enhancement: HMAC keys are NOT saved to share links/localStorage by default
  - Algorithm cleanup: SHA-256 and SHA-512 only (removed MD5, SHA-1, SHA-384)

**Improvements:**

- 🔒 Enhanced security for HMAC keys (not shared by default)
- 📁 File-based workflow for hash calculation
- 🎨 Better visual feedback for regex matches and groups
- ⚡ Performance optimizations for regex testing

**Technical:**

- Extended Hash tool state schema for file support
- Regex tool implementation with overlay highlighting
- HMAC key security policy implementation
- File reading via `file.arrayBuffer()` API

## v1.2.0 (December 2024) - Power-user Release

**New Features:**

- ✨ **Command Palette**: Fast tool navigation with `⌘K` / `Ctrl+K`
  - Search tools by title or keywords (Fuzzy search)
  - Quick actions: Navigate, toggle favorites, access recent tools
  - Mobile support: "Search" button in header
- ✨ **File Workflow**: Drag & drop and file download support
  - Drag & drop files or use file picker to load input
  - Download results as files (`.json`, `.yml`, `.txt`, etc.)
  - Available in JSON, YAML, and Diff tools
  - Worker response ordering guaranteed with `requestId` for large files
- ✨ **Enhanced Share**: Improved sharing experience
  - Shows what data is included in share links
  - Web Share API support for mobile devices
  - Enhanced privacy warnings for sensitive tools (JWT)
  - URL schema versioning for compatibility
- ✨ **PWA Polish**: Complete PWA installation experience
  - All 8 tools added to shortcuts
  - Screenshots for desktop and mobile
  - Improved update notifications and refresh prompts
- ✨ **Version Display**: App version shown in sidebar footer
  - Build-time version injection from `package.json`
  - Version synchronization between package.json and service
- ✨ **New Tools**:
  - Hash Generator: SHA-256, SHA-1, SHA-384, SHA-512, HMAC support (WebCrypto API)
  - UUID/ULID Generator: Generate UUID v4/v7 and ULID with batch generation (up to 100 IDs)
  - URL Parser: Parse and visualize URL components (protocol, host, path, fragment, query parameters) with decoding options and array parameter support

**Improvements:**

- 🎯 Better keyboard navigation with Command Palette
- 📁 File-based workflow for faster iteration
- 🔒 Enhanced privacy controls and warnings
- 📱 Better mobile sharing experience
- 🎨 Improved PWA installation and update UX
- 📊 Version tracking and release notes

**Technical:**

- Extended `ToolDefinition` with `keywords` and `category` fields
- Worker response ordering with `requestId` to prevent race conditions
- Web Share API integration with clipboard fallback
- Build-time version injection via Vite environment variables
- CHANGELOG.md for Git tag-based release notes

## v1.1.1 (January 2025)

**Bug Fixes:**

- 🔧 Fixed HS384 and HS512 signature verification issues in JWT tool
  - Improved signature encoding for large arrays
  - Fixed buffer range handling in signature verification
- 🔧 Fixed JWT encoding algorithm handling
  - Header's `alg` field now takes precedence over separate algorithm selector (JWT standard compliance)
  - Algorithm selector automatically updates header JSON for convenience

**Improvements:**

- 🎨 Improved Toast notification styling for dark mode
  - Toast notifications now match project's color scheme (`gray-800` background, `gray-700` border)
  - Consistent with other UI elements in dark mode

**Technical:**

- Enhanced Base64URL encoding/decoding for better compatibility
- Improved error handling in JWT signature generation

## v1.1.0 (December 2024)

**New Features:**

- ✨ **Enhanced Sidebar**: Recent tools list and favorites for quick access
- ✨ **JWT Tool**: Decode and encode JSON Web Tokens with signature verification
- ✨ **Web App Support**: Install as a Chrome app with PWA features
  - Automatic updates with user-friendly prompts
  - Offline caching with Service Worker
  - Install prompt for easy app installation
- ✨ **Performance Improvements**: Web Workers for large data processing
  - JSON parsing for files > 1MB or 10,000+ lines
  - Text diff calculation for large comparisons
  - YAML conversion for large files

**Improvements:**

- 🎨 Improved offline fallback page design
- 🔔 Update notifications when new versions are available
- 📱 Better mobile experience with PWA support
- ⚡ Faster processing of large datasets without UI freezing

**Technical:**

- Migrated to `vite-plugin-pwa` for better PWA support
- Added `useWebWorker` hook for reusable Worker logic
- Enhanced caching strategies (Network First, Cache First)
- Improved Service Worker management with automatic updates

