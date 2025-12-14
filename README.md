# tools.yowu.dev

A React + TypeScript + Vite playground that bundles everyday developer utilities (JSON viewer, URL/Base64 converters, cron helper, diff tool, etc.) into a single fast, client-only experience. Phase 3 now wires up the business logic for every tool plus toast feedback, live conversion, and persistent state sharing.

## Stack
- React 19, Vite 7, TypeScript 5.9
- Tailwind CSS + CodeMirror 6 for the UI/editor experience
- Utility libs: `react-json-view-lite`, `yaml`, `diff-match-patch`, `cron-parser`, `cronstrue`, `date-fns`, `lz-string`, `sonner`

## Available tools
- **JSON Pretty Viewer** – formatting, tree navigation, key sorting, sample data, copy pretty/minified
- **URL Encode/Decode** – live encode/decode with `+` for spaces and swap support
- **Base64 Converter** – UTF-8 safe, Base64URL toggle, swap, clipboard
- **Epoch / ISO Converter** – ms/s + timezone toggles, validation, “Set to Now”
- **YAML ↔ JSON** – bidirectional parsing with error locations and indent control
- **Text Diff** – split/unified views, ignore whitespace/case, unified export
- **Cron Parser** – validates expressions, humanizes schedules, lists upcoming runs

## Getting started
```bash
npm install        # install deps
npm run dev        # start Vite dev server (http://localhost:5173)
npm run lint       # ESLint
npm run build      # type-check + production bundle
npm run preview    # serve the dist/ output
```

## Project layout
```
src/
  components/      shared layout + common UI
  hooks/           theme, title, tool-state utilities
  tools/           individual tool implementations
  lib/             helpers (clipboard, classnames)
```
Shared contributor guidelines live in `AGENTS.md`.

## Documentation updates
Feature changes must always be reflected in the markdown docs at the same time. After modifying any tool, workflow, or requirement, review `README.md`, `AGENTS.md`, `SAS.md`, and other spec notes to ensure they describe the new behavior. Keeping these references fresh is part of the definition of done for every change.

## Deployment
A GitHub Pages workflow (`.github/workflows/deploy.yml`) builds `dist/`, uploads it as a Pages artifact, and deploys to the `github-pages` environment every push to `main`. Update DNS/CNAME to `tools.yowu.dev` when ready.
