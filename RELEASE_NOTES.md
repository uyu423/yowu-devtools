<!--
RELEASE_NOTES.md must be written in English.
-->

# Release Notes

## v1.5.1 (December 2025) - API Burst Test

Introducing **API Burst Test**, a browser-based HTTP load testing tool for quick API performance checks. All requests originate from your browser—no server proxy required.

### New Features

- ✨ **API Burst Test Tool**: Simple browser-based load testing

  - **Load Modes**: Total requests (N) or duration (Z seconds) with configurable concurrency
  - **Rate Limiting**: Global QPS or per-worker QPS control
  - **Metrics Collection**: RPS, latency distribution (p50/p90/p95/p99), status codes, error breakdown
  - **Time Series Charts**: RPS, latency, and errors over time visualization
  - **hey CLI Integration**: Copy test configuration as `hey` command for CLI comparison
  - **Chrome Extension**: CORS bypass and cookie inclusion support
  - **Export Options**: JSON, CSV, and summary copy to clipboard

- ✨ **Responsible Use Safeguards**:

  - Required acknowledgment before first test execution
  - Hard limits: max 6 concurrent connections (HTTP/1.1), 50 (HTTP/2), 10,000 requests, 60s duration
  - Collapsible warning banners for responsible use notice and browser limitations
  - Clear performance gap warning (5x+ difference vs CLI tools)

- ✨ **API Tester Integration**:
  - "Send to Burst Test" button in API Tester
  - Transfers URL, method, headers, body, and cookie settings

### Enhancements

- 🔧 **HTTP/2 Mode**: Toggle to increase max concurrency from 6 to 50 (requires server support)
- 🔧 **Beta Badge**: Added to tool header indicating experimental status
- 🔧 **Collapsible Warnings**: Each warning section (Responsible Use, Browser Limitations) collapses independently
- 🌐 **Full i18n Support**: All UI translated to 5 languages (en-US, ko-KR, ja-JP, zh-CN, es-ES)

### Technical

- Core engine with token bucket rate limiter and concurrent request executor
- Metrics calculation: percentiles, histogram buckets, reservoir sampling
- Error classification: timeout, CORS, network, aborted, HTTP 4xx/5xx
- AbortController for clean test cancellation
- Time series data collection at 1-second intervals
- New directories: `src/tools/api-burst-test/`, `src/tools/api-burst-test/core/`

### Privacy & Limitations

- 🔒 All requests sent directly from your browser (your IP visible to target server)
- ⚠️ Browser-based: Results may differ 5x+ from CLI tools (hey, wrk, ab)
- ⚠️ Not suitable for production load testing—use CLI tools for accurate benchmarks
- ⚠️ HTTP/1.1 limited to 6 concurrent connections per domain (browser restriction)

---

## v1.5.0 (December 2025) - Media Tools: Image Studio & Video Studio

Major release introducing **Image Studio** and **Video Studio** tools for browser-based media processing. All processing happens locally in your browser—no data is ever sent to servers.

### New Features

- ✨ **Image Studio**: Complete image editing pipeline

  - **Crop**: Free ratio, fixed ratios (1:1, 4:3, 16:9), custom ratio support
  - **Resize**: Width/height input, aspect ratio lock, resize modes (Contain, Cover, Stretch)
  - **Rotate/Flip**: 90° rotation, horizontal/vertical flip
  - **Export**: PNG, JPEG, WebP formats with quality control
  - Pipeline-based editing: combine multiple operations in one export
  - Drag & drop, file picker, and clipboard paste support
  - Real-time preview with crop overlay
  - Preset management: save, load, export/import presets

- ✨ **Video Studio**: Browser-based video editing powered by ffmpeg.wasm

  - **Thumbnail Extraction**: Extract frame at any timestamp as PNG/JPEG/WebP
  - **Trim**: Set start/end times to extract video segments
  - **Cut (Segment Removal)**: Remove unwanted portions from video
  - **Crop**: Crop video frame with aspect ratio presets
  - **Resize**: Change output resolution with presets (480p, 720p, 1080p, 1440p, 4K)
  - **Export**: MP4 (H.264) and WebM (VP9) formats with quality presets
  - Pipeline-based editing: combine Trim + Crop + Resize in single export
  - Progress indicator with cancel support
  - Preset management: save, load, export/import presets

- ✨ **Pipeline Workflow**: Both tools support combining multiple operations

  - Enable/disable individual steps
  - Collapsible step panels for cleaner UI
  - Step count indicator
  - One-click "Run & Export" execution

- ✨ **Preset System**: Save and reuse your editing configurations
  - Save current settings as named presets
  - Load presets to restore configurations
  - Export all presets to JSON file
  - Import presets from JSON file
  - Privacy-first: presets stored locally only

### Enhancements

- 🔧 **Pretendard Font**: Added as secondary fallback font for better multilingual support

  - Font stack: NanumSquareNeo → Pretendard → Inter → system fonts
  - Improved rendering for Latin characters when NanumSquareNeo lacks coverage

- 🔧 **HTML lang Attribute**: Now dynamically updated based on current locale

  - Proper BCP 47 format: `en-US`, `ko-KR`, `ja-JP`, `zh-CN`, `es-ES`
  - Both static HTML (build) and runtime (SPA navigation) correctly set lang attribute
  - Better accessibility and SEO for international users

- 🌐 **Full i18n Support**: All Media Tools UI translated to 5 languages

  - English (en-US), Korean (ko-KR), Japanese (ja-JP), Chinese (zh-CN), Spanish (es-ES)
  - Pipeline, export, and progress status messages all localized

- ⌨️ **Keyboard Shortcuts**:
  - `⌘/Ctrl + O`: Open file
  - `⌘/Ctrl + Enter`: Run & Export
  - `⌘/Ctrl + Shift + R`: Reset pipeline
  - `⌘/Ctrl + C`: Copy to clipboard (Image Studio)
  - `Esc`: Cancel processing

### Technical

- **Image Processing**: Canvas API with `createImageBitmap()` for efficient decoding
- **Video Processing**: ffmpeg.wasm (single-thread core) running in browser
- **Memory Management**: Automatic cleanup of Blob URLs and ffmpeg FS files
- **Singleton Pattern**: ffmpeg instance reused across operations
- **Progress Tracking**: Real-time progress from ffmpeg logs with time parsing
- New directories: `src/tools/image-studio/`, `src/tools/video-studio/`
- Dependencies: `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `jszip`

### Privacy

- 🔒 All media processing happens in your browser
- 🔒 No files are uploaded to any server
- 🔒 Presets stored in localStorage only
- 🔒 Share links contain settings only (no media data)

---

## v1.4.2 (December 2025) - API Response Diff & Locale-specific SEO

Introducing the **API Response Diff** tool for comparing API responses from two domains, plus **locale-specific SEO** for better international search visibility.

### New Features

- ✨ **API Response Diff Tool**: Compare API responses from two domains

  - Send identical requests to Domain A and Domain B simultaneously
  - JSON response comparison with deep equality (ignoring key order)
  - Side-by-side diff view with field highlighting (yellow for different, red for missing)
  - Diff table showing only different fields with field path and values
  - Response metadata display (Status, Elapsed time, Size)
  - Multiple tabs: Body (JSON Viewer), Headers, Raw, cURL
  - **Domain Presets**: Save, load, export/import domain configurations
  - Chrome Extension integration for CORS bypass (same as API Tester)
  - History management (last 30 executions)
  - URL sharing with current configuration

- ✨ **Locale-specific SEO**: Language-optimized SEO for all tools

  - Tool descriptions and meta tags in 5 languages (en-US, ko-KR, ja-JP, zh-CN, es-ES)
  - Each locale's HTML files include localized meta descriptions
  - Improved search visibility for international users
  - Home page SEO also localized per language

### Enhancements

- 🔧 **Updated Tool Descriptions**: All tool descriptions refined to highlight main features
- 🔧 **i18n Meta Integration**: Build system now imports i18n resources for SEO generation
- 🔧 **Tool ID to i18n Key Mapping**: Automatic mapping between tool IDs and i18n keys

### Technical

- New tool directory: `src/tools/api-diff/`
- Reuses `useExtension` and Extension mode from API Tester
- Comparison utilities: `deepEqualIgnoringKeyOrder`, `findDifferentFields`
- Domain presets stored in localStorage with export/import support
- `vite-plugin-generate-routes.ts` extended to use i18n for locale-specific SEO
- i18n `meta.home` section added for home page SEO

---

## v1.4.1 (December 2025) - cURL Parser & API Tester Integration

Introducing the **cURL Parser** tool and enhanced cURL integration with API Tester.

### New Features

- ✨ **cURL Parser Tool**: Parse and analyze cURL commands

  - Paste cURL commands and view structured breakdown
  - Request Summary with method and URL
  - Query Parameters table with enable/disable toggles
  - Headers table with copy functionality
  - Cookies section with raw string and parsed key-value table
  - Body viewer with JSON pretty formatting
  - Options display (follow redirects, compressed, insecure TLS, basic auth)
  - Warnings for unsupported features (file uploads, shell variables, config files)

- ✨ **"Open in API Tester" Button**: One-click transfer of parsed cURL to API Tester

  - Preserves locale prefix (e.g., `/ko-KR/curl` → `/ko-KR/api-tester`)
  - Automatically fills method, URL, headers, body, and options

- ✨ **API Tester cURL Paste Support**: Paste cURL directly in URL input

  - Auto-detects cURL commands vs regular URLs
  - Automatically parses and fills the form
  - Toast notification on success/failure
  - "Paste as URL" fallback option on parse failure
  - Undo functionality to restore previous state

### Enhancements

- 🔧 **JSON Viewer Integration**: Values that look like JSON show "Open in JSON Viewer" button
- 🔧 **Clickable URLs**: URL values in parsed results are now clickable links
- 🔧 **Collapsible Raw Cookie**: Raw cookie section collapsed by default (expandable)
- 🔧 **URL Decode Display Option**: Toggle to show URL-decoded values
- 🌐 **i18n**: Full internationalization support for cURL Parser (5 languages)

### Technical

- New cURL parsing library at `src/lib/curl/`
- Shell-like tokenizer with quote handling and line continuation
- Supports `-H`, `-d`, `-X`, `-b`, `-F`, `--data-urlencode`, and more
- State transfer via sessionStorage for API Tester integration

---

## v1.4.0 (December 2025) - API Tester & Monorepo Architecture

Major release introducing the **API Tester** tool and migrating to a **pnpm + Turborepo monorepo** architecture.

### New Features

- ✨ **API Tester Tool**: Full-featured HTTP client for testing APIs

  - Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
  - Request builder with query params, headers, and body
  - Multiple body types: none, JSON, form-data, x-www-form-urlencoded, raw
  - Response viewer with syntax highlighting
  - HTTP status code with status text display (e.g., "200 OK", "404 Not Found")
  - **Direct Mode**: Standard fetch requests (subject to CORS)
  - **Extension Mode**: CORS bypass via Chrome Extension

- ✨ **Chrome Extension Integration**

  - Companion extension for CORS bypass
  - Permission management per domain
  - "Include Cookies" option for authenticated requests
  - Extension install button when not detected
  - Detailed error view for debugging

- ✨ **Copy as cURL**: Export requests as cURL commands

### Architecture

- 📦 **Monorepo Migration**: Migrated from single-package to pnpm + Turborepo monorepo
  - `apps/web`: Main web application
  - `apps/extension`: Chrome Extension
  - `packages/shared`: Shared types and utilities
  - Turborepo for efficient build caching

### Enhancements

- 🔧 **Response Viewer**: Show HTTP status text alongside status code
- 🔧 **Extension Status Badge**: Visual indicator of extension connection
- 🔧 **CORS Modal**: Clear guidance on CORS restrictions and solutions
- 🌐 **i18n**: Full internationalization support for API Tester (5 languages)
- 🔀 **Resizable Panels in API Tester**: Drag to resize request/response panels horizontally
- 📤 **Open in Viewer**: Send JSON/YAML responses directly to JSON Viewer or YAML Converter
- 💾 **History Sidebar State Persistence**: Remember open/closed state of history sidebar
- 🔗 **Clickable URLs in JSON Viewer Tree**: URL strings in tree view are now clickable links

### Technical

- Uses `http-status-codes` library for HTTP status text
- Extension uses Manifest V3 with Service Worker
- Shared types between web and extension via `packages/shared`

---

## Extension v1.0.1 (December 2025) - API Tester Enhancement

The first feature release of **Yowu DevTools Companion** Chrome Extension, enhancing the API Tester tool with CORS bypass and cookie handling capabilities.

**New Features:**

- ✨ **CORS Bypass**: Execute cross-origin API requests that would otherwise be blocked by browser security policies

  - Requests executed in extension context, bypassing CORS restrictions
  - Automatic header modification via `declarativeNetRequest` API

- ✨ **Include Cookies Option**: Optionally include browser cookies in API requests

  - Toggle "Include Cookies" checkbox in API Tester (Extension mode only)
  - Uses `credentials: 'include'` for automatic cookie handling
  - i18n support for tooltip (all 5 languages)

- ✨ **Permission Management**: Granular host permission control

  - Explicit permission grant per domain
  - Permission caching in localStorage

- ✨ **Error Details View**: Detailed error information for debugging
  - Collapsible "Show Details" section in response area
  - Includes: error code, message, request URL, method, headers

**Bug Fixes:**

- 🔧 Fixed "Invalid name" error when sending requests with empty header keys

**Technical:**

- Manifest V3 with Service Worker architecture
- Permissions: `storage`, `cookies`, `declarativeNetRequest`
- See `apps/extension/CHANGELOG.md` for full details

---

## v1.3.4 (December 2025) - JSON Viewer & Share UX Improvements

**New Features:**

- ✨ **JSON Viewer Fullscreen Mode**:

  - Added fullscreen toggle button next to the copy button
  - Right panel expands to full width for better viewing of large JSON
  - Press ESC or click toggle again to exit fullscreen

- ✨ **Improved Search UX in JSON Viewer**:
  - Search input now only appears in Pretty mode (where highlighting works)
  - Cleaner UI when using Tree or Minify modes

**Enhancements:**

- 🔧 **Share Modal on Web**:

  - Web browser now shows confirmation modal before copying share link (same as mobile)
  - Modal displays what data will be included in the shared URL
  - Different button text: "Copy Link" (web) vs "Generate Share Link" (mobile)

- 🎨 **Sidebar Design Improvements**:

  - "More coming soon" badge is now center-aligned
  - Added "Suggest a feature" link below the badge
  - Links to [GitHub Issues](https://github.com/uyu423/yowu-devtools/issues) for feature requests

- ⚡ **ResizablePanels Optimization**:
  - Added `expandRightPanel` prop for fullscreen support
  - Reduced resizer padding by 50% for better space efficiency

**Technical:**

- `ResizablePanels.tsx`: New component for flexible panel layouts with expand support
- `ShareModal.tsx`: Added `isMobile` prop for button text differentiation
- `useToolSetup.ts`: Updated share logic to show modal on both web and mobile
- `Sidebar.tsx`: Added external link to GitHub Issues
- i18n: Added translations for `fullscreen`, `exitFullscreen`, `copyLink`, `suggestFeature`

---

## v1.3.3 (December 2025) - PWA Update Notification Fix & SEO Optimization

**Bug Fixes:**

- 🔧 **PWA Update Notification Not Showing**:
  - Resolved conflict between `registerType: 'prompt'` mode and `skipWaiting`/`clientsClaim` settings
  - Update notifications now display correctly in installed PWA after new version deployment
  - Optimized configuration based on vite-plugin-pwa official documentation

**Enhancements:**

- ⚡ **Improved PWA Update Detection**:

  - **Added version.json-based version check** (alongside Service Worker)
    - Auto-generate `/version.json` file at build time
    - Compare server version on app startup for update notification
    - Periodic version check every 5 minutes
  - Auto-check for updates when app receives focus (tab switch, window activation)
  - Immediate update check when coming back online from offline
  - Skip update check when offline (prevents unnecessary errors)
  - Uses `onRegisteredSW` callback (v0.12.8+ recommended approach)

- 🔍 **SEO: Sitemap Priority Optimization**:

  - Applied priority strategy based on real developer search patterns
  - Individual tool pages (en-US): **priority 1.0** (search engine top priority)
  - Locale tool pages: **priority 0.9**
  - Home pages (all locales): **priority 0.8**
  - Developers search directly for "json formatter", "base64 decode" etc., so tool pages prioritized over homepage

- 📖 **PWA Troubleshooting Documentation Overhaul**:
  - Explained relationship between `registerType` option and `skipWaiting`/`clientsClaim`
  - Added guide for resolving update not reflecting issues
  - Added console log meaning explanations
  - Added vite-plugin-pwa official documentation links

**Technical:**

- `vite.config.ts`: Removed `skipWaiting` and `clientsClaim` options (prompt mode compatible)
- `vite-plugin-generate-routes.ts`:
  - Auto-generate `version.json` at build time
  - Defined sitemap priority constants (`TOOL_PRIORITY`, `TOOL_LOCALE_PRIORITY`, `HOME_PRIORITY`)
- `usePWA.ts`: Version-based update check + Service Worker update check in parallel
- `docs/PWA_TROUBLESHOOTING.md`: Complete documentation overhaul

**References:**

- [vite-plugin-pwa Prompt for update](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html)
- [vite-plugin-pwa Periodic SW updates](https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html)

---

## v1.3.2 (December 2025) - Cron Parser Advanced

A major Cron Parser enhancement supporting various cron dialects with accurate semantics parsing and improved UI/UX.

**New Features:**

- ✨ **Multi Cron Spec Support**:

  - **Auto** (recommended): Auto-detect by analyzing input
  - **UNIX/Vixie**: Standard 5-field, DOM/DOW OR rule clarification
  - **UNIX + Seconds**: 6-field (includes seconds)
  - **Quartz**: 6-7 fields, `? L W #` advanced operators support
  - **AWS EventBridge**: `cron(...)` wrapper + year field
  - **Kubernetes CronJob**: `@hourly`, `@daily` macro support
  - **Jenkins**: `H` hash token and alias support

- ✨ **Wrapper Normalization**:

  - Auto-extract from `cron(...)`, `cron('...')`, `cron("...")`
  - Remove leading/trailing whitespace/newlines/text
  - Display "Normalized" and "AWS format"

- ✨ **Field Breakdown + Highlighting**:

  - Display cards for Minutes / Hours / DOM / Month / DOW / (Year/Seconds)
  - Color/underline highlighting for input tokens
  - Mutual highlighting on hover (mobile: tap)
  - Badge display for `L/W/#/?/H` special tokens

- ✨ **Enhanced Next Runs Calculation**:
  - "From" base time setting (useful for debugging)
  - Copy buttons for ISO / RFC3339 / Epoch formats
  - Web Worker to prevent UI freezing

**Enhancements:**

- 🔧 **Semantics Clarification**:

  - UNIX/Vixie: Explicit DOM/DOW **OR** rule (not AND!)
  - AWS/Quartz: DOM/DOW simultaneous specification constraint validation
  - Differentiated error messages per spec

- ⚠️ **Automatic Compatibility/Warnings**:

  - UNIX/Vixie: DOM/DOW OR warning
  - Jenkins: `H/3` short period end-of-month irregularity warning
  - AWS: Format/limitations/TZ/DST characteristics
  - K8s: `TZ=` not supported, `.spec.timeZone` recommended

- 🔄 **Conversion Feature** (optional):
  - UNIX(5) ↔ UNIX+Seconds(6)
  - UNIX(5) → AWS (`cron(...)`)
  - Clear warnings for non-convertible/non-equivalent expressions

**Technical:**

- Separate parser modules per spec (`src/tools/cron/parsers/`)
- Auto-detection logic (wrapper, special tokens, field count based)
- Offload next-run calculation to Web Worker
- Add i18n translation keys (`tool.cron.spec.*`, `tool.cron.field.*`, `tool.cron.warning.*`)

**Dependencies:**

| Library                  | Purpose                    | Notes             |
| ------------------------ | -------------------------- | ----------------- |
| `cron-parser` (existing) | Next run time calculation  | UNIX 5/6 fields   |
| `cronstrue` (existing)   | Human-readable description | i18n support      |
| `croner` (under review)  | Quartz advanced syntax     | `L W # ?` support |

**Spec Verification:**

- ✅ UNIX/Vixie DOM/DOW OR rule: [man7.org](https://man7.org/linux/man-pages/man5/crontab.5.html)
- ✅ Quartz `?` required rule: [quartz-scheduler.org](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- ✅ AWS EventBridge constraints: [docs.aws.amazon.com](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html#cron-based)

---

## v1.3.1 (December 2025) - Code Quality & Bug Fixes

**Bug Fixes:**

- 🔧 **JWT Encoder**: Fixed HMAC algorithm (HS256/HS384/HS512) not showing results
  - Corrected conditional logic that prevented `signToken()` from being called

**Refactoring:**

- 🏗️ **New Custom Hooks**:
  - `useToolSetup`: Combines `useTitle` and `useI18n` for consistent tool setup
  - `useLocalStorage`: Generic localStorage hook with cross-tab/component sync
- 🎨 **New Common Components**:
  - `ModeToggle`: Reusable mode toggle button group (URL, Base64, Diff tools)
  - `ResultPanel`: Consistent result display with copy button
- 🌐 **i18n Improvements**:
  - ShareModal now fully internationalized
  - Added ShareModal-related translation keys to all locales
- ⚡ **Performance Optimizations**:
  - Static route generation in App.tsx (moved outside component)
  - Reduced re-renders from route definitions
- 🗑️ **Code Cleanup**:
  - Removed deprecated `shareState` function from `useToolState`
  - Simplified `useFavorites` and `useRecentTools` with `useLocalStorage`
  - Added `i18nKey` field to `ToolDefinition` for explicit i18n mapping
  - Added `getToolI18nKey` helper function

**Technical:**

- Refactored localStorage hooks to use common `useLocalStorage` abstraction
- Improved code organization with consistent patterns across tools
- Better separation of concerns in tool components

---

## v1.3.0 (December 2025) - i18n Internationalization

**New Features:**

- ✨ **Multi-language Support**: Full internationalization support

  - Supported languages: English (en-US), Korean (ko-KR), Japanese (ja-JP), Chinese (zh-CN), Spanish (es-ES)
  - Language selection dropdown in sidebar (above theme toggle)
  - Automatic language detection: URL → localStorage → browser language → en-US fallback
  - Language-specific URLs: `/{locale}/{tool}` (e.g., `/ko-KR/json`)
  - All UI strings referenced from i18n resources (no hardcoded strings)
  - Type-safe translations with `satisfies I18nResource`

- 🎨 **NanumSquareNeo Font**: Beautiful Korean-optimized variable font
  - Variable font support (weight 300-900)
  - Better readability for CJK characters

**Enhancements:**

- 🌐 **i18n Infrastructure**:

  - Custom React Context-based i18n implementation
  - i18n resource files: `src/i18n/{locale}.ts`
  - Namespace structure: `common.*`, `sidebar.*`, `commandPalette.*`, `homepage.*`, `pwa.*`, `tool.{slug}.*`, `meta.{slug}.*`
  - Type-safe translation keys (TypeScript `satisfies` keyword)
  - Missing key fallback to en-US

- 🔗 **URL/Routing**:

  - Language prefix in URLs: `/{locale}/{tool}`
  - Maintain current tool when changing language
  - Preserve URL fragments (share payload) when changing language
  - Sidebar, HomePage, CommandPalette all use locale-aware navigation

- 🏗️ **Build System**:

  - Generate language-specific HTML files for each tool and locale combination
  - Language-specific meta tags (title, description, Open Graph, Twitter Card)
  - Extended sitemap.xml with language-specific URLs
  - Each HTML has proper `<html lang="{locale}">` attribute

- 💾 **Storage**:
  - Language preference saved to localStorage (`yowu-devtools:common:locale`)
  - Restore language preference on app reload
  - Language selection persists across sessions

**UI/UX Improvements:**

- 🔐 **Hash Generator**: Default algorithm changed to SHA-256
- 📱 **PWA Install Prompt**: Updated color scheme to blue theme
- 🆔 **UUID Generator**:
  - Simplified title (UUID/ULID → UUID)
  - Improved UI with type descriptions and "Copy All" button
- 📝 **YAML Converter**: Left/right panels now have consistent heights
- 📊 **Text Diff**: Copy icon moved to right side for better UX
- 🔑 **JWT Encoder**: Default algorithm changed to "None"
- 🔤 **Regex Tester**: Pattern descriptions now support i18n (47 patterns)
- 📅 **Cron Parser**: Human-readable descriptions now localized via cronstrue
- ⭐ **GitHub Stars Badge**: Added to main page footer

**Improvements:**

- 🌍 Better accessibility for international users
- 🔍 Improved SEO with language-specific pages
- 📱 Consistent UI experience across all languages
- 🎨 Language selector UI in sidebar

**Technical:**

- Custom React Context-based i18n implementation (no external library)
- Extended `vite-plugin-generate-routes.ts` for language-specific HTML generation
- `useI18n` hook with `t()` function and `setLocale()` method
- `buildLocalePath()` utility for locale-aware URL construction
- i18n utilities: `getLocaleFromUrl`, `getStoredLocale`, `getBestMatchLocale`
- Build-time type checking ensures translation key consistency

## v1.2.1 (December 2025) - Regex & Hash Enhancement

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
- 📤 Improved Web Share API text formatting
  - Professional share message format with title, privacy message, and URL
  - Better control over share text order (title → privacy → URL)
  - Cleaner messaging without celebratory wording

**Technical:**

- Extended Hash tool state schema for file support
- Regex tool implementation with overlay highlighting
- HMAC key security policy implementation
- File reading via `file.arrayBuffer()` API

## v1.2.0 (December 2025) - Power-user Release

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

## v1.1.1 (December 2025)

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

## v1.1.0 (December 2025)

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
