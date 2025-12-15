# Release Notes

## v1.3.2 (Upcoming) - Cron Parser Advanced

**🚧 개발 예정**

다양한 cron 방언(UNIX, Quartz, AWS, Kubernetes, Jenkins)을 지원하고, 정확한 의미(semantics) 파싱을 제공하는 대대적인 Cron Parser 고도화입니다.

**New Features:**

- ✨ **다중 Cron 스펙 지원**:
  - **Auto** (권장): 입력을 분석하여 자동 감지
  - **UNIX/Vixie**: 표준 5필드, DOM/DOW OR 규칙 명확화
  - **UNIX + Seconds**: 6필드 (초 포함)
  - **Quartz**: 6~7필드, `? L W #` 고급 연산자 지원
  - **AWS EventBridge**: `cron(...)` 래퍼 + year 필드
  - **Kubernetes CronJob**: `@hourly`, `@daily` 매크로 지원
  - **Jenkins**: `H` 해시 토큰 및 별칭 지원

- ✨ **래퍼 정규화**:
  - `cron(...)`, `cron('...')`, `cron("...")` 자동 추출
  - 앞뒤 여백/개행/텍스트 제거
  - "Normalized" 및 "AWS format" 표시

- ✨ **필드별 분해 + 하이라이트**:
  - Minutes / Hours / DOM / Month / DOW / (Year/Seconds) 카드 표시
  - 입력 토큰 색상/밑줄 하이라이트
  - hover 시 서로 강조 (모바일: 탭)
  - `L/W/#/?/H` 특수 토큰 배지 표시

- ✨ **Next runs 계산 고도화**:
  - "From" 기준 시각 설정 (디버깅에 유용)
  - ISO / RFC3339 / Epoch 복사 버튼
  - Web Worker로 UI 프리징 방지

**Enhancements:**

- 🔧 **의미(semantics) 정확화**:
  - UNIX/Vixie: DOM/DOW **OR** 규칙 명시 (AND 아님!)
  - AWS/Quartz: DOM/DOW 동시 지정 제약 검증
  - 스펙별 에러 메시지 차별화

- ⚠️ **호환성/주의사항 자동 안내**:
  - UNIX/Vixie: DOM/DOW OR 경고
  - Jenkins: `H/3` 짧은 주기 월말 불규칙 경고
  - AWS: 포맷/제한/TZ/DST 특성
  - K8s: `TZ=` 미지원, `.spec.timeZone` 권장

- 🔄 **변환(Conversion) 기능** (선택):
  - UNIX(5) ↔ UNIX+Seconds(6)
  - UNIX(5) → AWS (`cron(...)`)
  - 변환 불가/비등가 명확 경고

**Technical:**

- 스펙별 파서 모듈 분리 (`src/tools/cron/parsers/`)
- Auto 감지 로직 (래퍼, 특수 토큰, 필드 수 기반)
- Web Worker로 next-run 계산 오프로드
- i18n 번역 키 추가 (`tool.cron.spec.*`, `tool.cron.field.*`, `tool.cron.warning.*`)

**Dependencies:**

| 라이브러리 | 용도 | 비고 |
|-----------|------|------|
| `cron-parser` (기존) | 다음 실행 시간 계산 | UNIX 5/6필드 |
| `cronstrue` (기존) | Human-readable 설명 | i18n 지원 |
| `croner` (검토 중) | Quartz 고급 문법 | `L W # ?` 지원 |

**Spec Verification:**

- ✅ UNIX/Vixie DOM/DOW OR 규칙: [man7.org](https://man7.org/linux/man-pages/man5/crontab.5.html)
- ✅ Quartz `?` 필수 규칙: [quartz-scheduler.org](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- ✅ AWS EventBridge 제약: [docs.aws.amazon.com](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html#cron-based)

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
  - Language preference saved to localStorage (`yowu.devtools.locale`)
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
