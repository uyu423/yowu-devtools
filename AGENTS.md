# AGENTS.md — Repository Guidelines (Single Source of Truth)

This document defines the **workflow, coding standards, and verification rules** for this repository.  
AI Agents and humans must follow it before and during any change.

---

## 1) Think & Output Language

- **Think phase:** write internal reasoning in **English**.
- **Output phase:** return **all user-facing explanations and final results in Korean**.
- **UI text:** must come from **i18n resources** (do not hard-code strings), regardless of output language.

---

## 2) Project Structure & Module Organization

- Monorepo managed by **pnpm + Turborepo**. **Run all commands from repo root.**
- Packages:
  - `apps/web/`: **Vite + React 19** client  
    Key areas:
    - `src/components/` — shared UI components
    - `src/tools/` — tool pages/features
    - `src/hooks/` — React hooks
    - `src/lib/` — utilities, helpers, adapters
    - `src/i18n/` — locale resources + i18n wiring
    - `src/workers/` — web workers for heavy parsing/formatting
    - `public/` — static assets
  - `apps/extension/`: Chrome extension built with Vite; shares code via shared package
  - `packages/shared/`: cross-package helpers/types exported from `src/`
- Docs & fixtures:
  - `docs/` holds reference docs
  - `test-data/` contains sample payloads/fixtures for tests and manual verification
- Build outputs:
  - `dist/`, `dev-dist/` are **generated** and should remain **untracked**.

---

## 3) Build, Test, and Development Commands

### Install
- `pnpm install` (Node **20+ recommended**)

### Dev
- `pnpm dev` (all)
- `pnpm dev:web` / `pnpm dev:extension` (scoped)

### Lint
- `pnpm lint` (ESLint across packages)

### Tests
- `pnpm test` (Vitest; runs package-level suites)

### Build
- `pnpm build` (all)
- `pnpm build:web` / `pnpm build:extension` (scoped)
  - Web build typically runs `tsc -b` then `vite build`
  - Generates per-tool HTML plus sitemap/robots

### Preview (web)
- `pnpm --filter @yowu-devtools/web preview` (after build)

---

## 4) Post-Task Verification (Mandatory for Code/Config Changes)

**If you changed any code, config, build settings, or i18n resources, you MUST run:**

1. **Lint:** `pnpm lint`  
   - Fix **warnings as well as errors** when reasonable (especially for new/changed code).
2. **Tests:** `pnpm test`  
   - Required if tests exist for the touched area (or if changes can affect parsing/formatting/core logic).
3. **Build:** `pnpm build`  
   - Mandatory for any code/config/i18n change.

**Then verify generated artifacts** (do not commit outputs):
- `dist/` / `dev-dist/` remain untracked
- Web outputs include expected files (examples):
  - per-tool HTML pages
  - `sitemap.xml`
  - `robots.txt`

✅ **Docs-only changes:** You may skip `pnpm build` / `pnpm test` if you did not change code/config/i18n.

When submitting work (commit/PR), state which commands you ran.

---

## 5) Coding Style & Naming Conventions

### General
- TypeScript + ES modules
- Functional React components
- 2-space indentation
- Keep changes minimal, focused, and consistent with existing patterns

### Naming
- Components: **PascalCase**  
  - File name mirrors exported component: `JsonTool.tsx`
- Hooks: `useX` naming (camelCase)  
  - File name mirrors hook: `useRecentTools.ts`
- Utilities/helpers: **camelCase**  
  - File name mirrors contents where practical

### Styling
- Tailwind utility-first styling
- Use `clsx` / `tailwind-merge` for conditional classes
- Keep layouts responsive and consistent across tools

### Imports / Path Aliases
- Use path aliases `@/` rooted at each package `src/`
- Prefer local module boundaries (avoid cross-app imports unless via `packages/shared`)

### Performance & Workers
- For heavy parsing/formatting or CPU-heavy operations, prefer `src/workers/` to keep UI responsive.
- Avoid blocking the main thread for large inputs.

---

## 6) Language & i18n (UI Text Rules)

### Hard rules
- **No hard-coded UI string literals** in components/tools.
- All user-facing UI text must come from `src/i18n` resources.

### Usage
- Use `t('namespace.key')` (or the project’s standard i18n accessor) consistently.
- Add new keys to **all locale files** (e.g., `en-US.ts`, `ko-KR.ts`, etc.).
- Keep keys **stable** and **semantic** (avoid embedding full sentences as keys).
- Avoid duplicating near-identical strings—prefer shared keys when meaning is the same.

### Supported locales
- `en-US` (default), `ko-KR`, `ja-JP`, `zh-CN`, `es-ES`

---

## 7) Testing Guidelines

- Test stack: **Vitest + React Testing Library**
- Place tests close to features:
  - `*.test.ts` / `*.test.tsx` beside the module, or
  - `src/<feature>/__tests__/` if the feature is large
- Prefer deterministic unit tests over snapshot churn.
- Use `test-data/` fixtures when exercising parsers/formatters and edge cases.
- If automated coverage is missing, include **manual verification steps** in the PR description.

---

## 8) Commit & Pull Request Guidelines

### Commits
- Use **Conventional Commits** in imperative mood:
  - `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`, `chore: ...`, `test: ...`, `perf: ...`, `style: ...`
- Keep commits self-contained; avoid mixing unrelated changes.

### PRs
Include:
- Summary + rationale + linked issues (if any)
- Screenshots/GIFs for UI changes
- Manual verification steps (especially when tests don’t exist)
- Commands you ran (at minimum for code/config/i18n changes):
  - `pnpm lint`
  - `pnpm build`
  - plus `pnpm test` when applicable

---

## 9) Miscellaneous

- Build artifacts (`dist/`, `dev-dist/`) and generated files (`sitemap.xml`, `robots.txt`, per-tool HTML) are created automatically during build and should stay untracked.
- Any new UI component must follow:
  - the styling conventions (Tailwind + clsx/tailwind-merge)
  - the i18n rules (no hard-coded strings)
  - the verification checklist (lint/build, tests when applicable)

---

If this repository’s workflow changes (scripts, structure, i18n conventions), **update this file immediately** so it remains accurate.

