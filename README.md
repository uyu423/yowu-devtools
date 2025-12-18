# tools.yowu.dev

An open toolbox for developers who would rather keep sensitive snippets on their own machines. Too many "free" web converters quietly ship data to unknown backends, so this project keeps every transformation inside the browser, publishes every line of code, and documents the UX decisions in the open. The goal is simple: make the common chores (JSON inspection, cron sanity checks, quick diffs, API testing, etc.) pleasant **and** trustworthy.

## Why it exists

- **Transparent processing** – no servers, no trackers, and an auditable codebase. If a tool claims to only prettify JSON, you should be able to confirm that's all it does.
- **Shareable but private by default** – nothing leaves the tab unless you explicitly create a share link; even then the payload stays compressed inside the URL fragment.
- **Composable workspace** – a single layout, persistent state per tool, and theme controls so you're not juggling a dozen shady tabs during a debugging session.

## Highlights

### Core Features

- Client-only React + Vite app with Tailwind styling and CodeMirror editors.
- Tool registry under `apps/web/src/tools/` keeps features isolated but consistent (state storage, sharing, theming).
- Toast-powered feedback for copy/share actions, and live conversion flows tuned for quick iteration.
- LocalStorage + share-links let you hand off repro cases without inventing screenshots.
- **SEO-optimized**: Each tool has its own page with dedicated meta tags for search engine indexing.
- **Dark mode support**: System/Light/Dark theme toggle with consistent styling across all tools.
- **i18n Support**: Multi-language support with 5 languages (English, Korean, Japanese, Chinese, Spanish).
- **Language-specific URLs**: Locale-prefixed routes (`/ko-KR/json`, `/ja-JP/diff`, etc.) for SEO optimization.

### Recent Releases

#### v1.5.x - Media Tools

- **Image Studio** (v1.5.0): Browser-based image editing with crop, resize, rotate/flip, and format conversion.
- **Video Studio** (v1.5.0): Video editing powered by ffmpeg.wasm—trim, cut, crop, resize, and export to MP4/WebM.
- **Pipeline Workflow** (v1.5.0): Combine multiple operations in a single export with preset management.
- **Pretendard Font** (v1.5.0): Added as secondary fallback font for better multilingual support.

#### v1.4.x - API Testing Suite

- **API Response Diff** (v1.4.2): Compare API responses from two domains side-by-side with JSON diff highlighting.
- **Locale-specific SEO** (v1.4.2): Language-optimized meta tags and descriptions for all tools.
- **cURL Parser** (v1.4.1): Parse cURL commands into structured components with one-click API Tester import.
- **API Tester** (v1.4.0): Full-featured HTTP client with CORS bypass via Chrome Extension.
- **Chrome Extension**: Companion extension for CORS bypass and cookie handling in API requests.
- **Monorepo Architecture** (v1.4.0): Migrated to pnpm + Turborepo for better build performance.

#### v1.3.x - Internationalization & Polish

- **Cron Parser Advanced** (v1.3.2): Multi-dialect support (UNIX, Quartz, AWS, Jenkins, K8s) with field breakdown.
- **JSON Viewer Fullscreen** (v1.3.4): Expand result panel to full width for large JSON exploration.
- **Share Modal UX** (v1.3.4): Confirmation modal shows what data will be shared before copying.
- **PWA Update Fix** (v1.3.3): Improved version detection and update notifications.
- **Sitemap Priority** (v1.3.3): SEO-optimized sitemap with tool pages prioritized over homepage.

#### v1.2.x - Power User Features

- **Command Palette** (v1.2.0): Fast tool navigation with `⌘K` / `Ctrl+K` keyboard shortcut.
- **File Workflow** (v1.2.0): Drag & drop files and download results for JSON, YAML, and Diff tools.
- **Regex Tester** (v1.2.1): Test regex patterns with match highlighting, capture groups, and replacement preview.
- **Hash/HMAC Generator** (v1.2.0): SHA-256/512, file hash, HMAC signatures with verification.
- **UUID Generator** (v1.2.0): Generate UUID v4/v7 and ULID identifiers.
- **URL Parser** (v1.2.0): Break down URLs into protocol, host, path, query parameters, and fragment.

#### v1.1.x - PWA & Performance

- **Enhanced Sidebar** (v1.1.0): Recent tools and favorites for quick access.
- **Web App support** (v1.1.0): Install as a Chrome app with offline caching.
- **Performance optimized** (v1.1.0): Web Workers prevent UI freezing for large data.
- **JWT Decoder/Encoder** (v1.1.0): Decode JWTs and create signed tokens with HMAC algorithms.

## Release Notes

See [RELEASE_NOTES.md](./RELEASE_NOTES.md) for detailed release notes.

## Reporting Issues

This project does not collect any logs or analytics. If you encounter a bug or error, please report it by opening a [GitHub Issue](https://github.com/uyu423/yowu-devtools/issues). Include as much detail as possible:

- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser and OS information (if relevant)

For the full specification, UX rules, and backlog, read `SAS.md`. This README intentionally stays high level so we avoid duplicating that source of truth.

## Getting started

```bash
# Install dependencies (uses pnpm workspaces)
pnpm install

# Development
pnpm --filter web dev       # http://localhost:5173

# Linting and building
pnpm --filter web lint
pnpm --filter web build
pnpm --filter web preview
```

## Repository layout

This project uses a **pnpm + Turborepo monorepo** structure:

```
apps/
  web/                 Main web application (tools.yowu.dev)
    src/
      components/      Shared layout + primitives (ToolHeader, ActionBar, etc.)
      hooks/           Tool state, title, theme, i18n helpers
      i18n/            Translation files for each locale
      lib/             Clipboard + utilities + i18n utils
      tools/           Each self-contained feature (json, url, api-tester, ...)
      workers/         Web workers for heavy processing
  extension/           Chrome Extension for CORS bypass
packages/
  shared/              Shared types and utilities between web and extension
```

Shared contributor instructions live in `AGENTS.md`; treat them as the working agreement before sending any PRs.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds `apps/web/dist/` and updates GitHub Pages under the `tools.yowu.dev` custom domain. Always run `pnpm --filter web lint` and `pnpm --filter web build` locally before merging to keep the pipeline green.

### SEO & Routing

- Uses **BrowserRouter** (not HashRouter) for clean URLs (`/json`, `/diff`, etc.)
- Build process automatically generates separate HTML files for each tool route
- Each tool page includes dedicated meta tags (title, description, Open Graph, Twitter Card)
- `sitemap.xml` and `robots.txt` are auto-generated for search engine optimization
- `404.html` handles SPA routing for direct URL access
- **i18n routing** (v1.3.0): Language-prefixed URLs (`/ko-KR/json`, `/ja-JP/diff`, etc.) with locale-specific HTML files
- **Language detection**: URL → localStorage → browser language → `en-US` fallback

## License

This project is licensed under the **GNU General Public License v3.0 or later** ([GPL-3.0-or-later](https://spdx.org/licenses/GPL-3.0-or-later.html)).

- **Source code**: [github.com/uyu423/yowu-devtools](https://github.com/uyu423/yowu-devtools)
- **Full license text**: [LICENSE](./LICENSE)

### Summary

- ✅ You may use, modify, and distribute this software freely
- ✅ You may use this for commercial purposes
- ⚠️ Modified versions must also be licensed under GPL-3.0 (or later) and disclose source code
- ⚠️ No warranty is provided — see the [GPL-3.0 full text](https://www.gnu.org/licenses/gpl-3.0.html) for details

### No Warranty

This software is provided **"AS IS"**, without warranty of any kind, express or implied. See [Section 15–17 of the GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.html#section15) for the full disclaimer.
