# tools.yowu.dev

An open toolbox for developers who would rather keep sensitive snippets on their own machines. Too many “free” web converters quietly ship data to unknown backends, so this project keeps every transformation inside the browser, publishes every line of code, and documents the UX decisions in the open. The goal is simple: make the common chores (JSON inspection, cron sanity checks, quick diffs, etc.) pleasant **and** trustworthy.

## Why it exists

- **Transparent processing** – no servers, no trackers, and an auditable codebase. If a tool claims to only prettify JSON, you should be able to confirm that’s all it does.
- **Shareable but private by default** – nothing leaves the tab unless you explicitly create a share link; even then the payload stays compressed inside the URL fragment.
- **Composable workspace** – a single layout, persistent state per tool, and theme controls so you’re not juggling a dozen shady tabs during a debugging session.

## Highlights

- Client-only React + Vite app with Tailwind styling and CodeMirror editors.
- Tool registry under `src/tools/` keeps features isolated but consistent (state storage, sharing, theming).
- Toast-powered feedback for copy/share actions, and live conversion flows tuned for quick iteration.
- LocalStorage + share-links let you hand off repro cases without inventing screenshots.
- **SEO-optimized**: Each tool has its own page with dedicated meta tags for search engine indexing.
- **Dark mode support**: System/Light/Dark theme toggle with consistent styling across all tools.

For the full specification, UX rules, and backlog, read `SAS.md`. This README intentionally stays high level so we avoid duplicating that source of truth.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run lint
npm run build
npm run preview
```

## Repository layout

```
src/
  components/   shared layout + primitives (ToolHeader, ActionBar, etc.)
  hooks/        tool state, title, theme helpers
  lib/          clipboard + misc utilities
  tools/        each self-contained feature (json, url, base64, ...)
```

Shared contributor instructions live in `AGENTS.md`; treat them as the working agreement before sending any PRs.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds `dist/` and updates GitHub Pages under the `tools.yowu.dev` custom domain. Always run `npm run lint` and `npm run build` locally before merging to keep the pipeline green.

### SEO & Routing

- Uses **BrowserRouter** (not HashRouter) for clean URLs (`/json`, `/diff`, etc.)
- Build process automatically generates separate HTML files for each tool route
- Each tool page includes dedicated meta tags (title, description, Open Graph, Twitter Card)
- `sitemap.xml` and `robots.txt` are auto-generated for search engine optimization
- `404.html` handles SPA routing for direct URL access
