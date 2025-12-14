# Repository Guidelines

## Project Structure & Module Organization
`src/` hosts the entire client. Shared layout and UI primitives live under `components/`, hooks under `hooks/`, helpers under `lib/`, and each tool inside `tools/<toolId>/`. Keep tool-specific state colocated with its component and register it in `src/tools/index.ts`. Assets fit under `src/assets/`, while `public/` is reserved for static files copied as-is by Vite. Build output goes to `dist/` and must remain untracked.

## Build, Test, and Development Commands
- `npm run dev` – launches Vite with React Fast Refresh at `localhost:5173` for day-to-day work.
- `npm run lint` – runs ESLint using `eslint.config.js`; keep it clean before pushing.
- `npm run build` – type-checks via `tsc -b` and builds production assets.
- `npm run preview` – serves the built bundle to sanity-check release artifacts.

## Coding Style & Naming Conventions
Use TypeScript + JSX with 2-space indentation and functional components. Components follow PascalCase (`JsonTool.tsx`), hooks kebab-case (`use-tool-state.ts`), and utility files lowercase. Favor hooks for state, `clsx`/`tailwind-merge` for conditional classes, and Tailwind utility classes for layout. Keep user-facing strings in English only.

## Testing Guidelines
There are no automated tests yet; when adding them, colocate specs inside `src/<feature>/__tests__/` and name files `*.test.ts(x)`. Prefer Vitest + React Testing Library for component coverage, and mock expensive editor/diff interactions. Always document new manual verification steps in PRs until suites exist.

## Commit & Pull Request Guidelines
Write short imperative commit subjects (`add base64 swap`, `wire cron parser`). Reference issues in the body (`Refs: #42`) when relevant. Pull requests should describe the change, include screenshots/GIFs for UI updates, and list any commands executed (`dev`, `lint`, `build`). Rebase on `main`, ensure lint/build succeed locally, and request review only when green.

## Environment & Deployment Notes
Use Node 20+ / npm 10 to stay in sync with `package-lock.json`. Install dependencies with npm only. GitHub Pages deployment is handled by `.github/workflows/deploy.yml`; verify `npm run build` before merging to `main` because pushes trigger a deploy. Whenever a feature, UX flow, or tool option changes, immediately review and refresh all relevant docs (`README.md`, `AGENTS.md`, `SAS.md`, implementation notes) so instructions never drift from the actual behavior.
