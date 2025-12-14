# Release Notes

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

