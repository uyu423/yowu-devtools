# Repository Guidelines

## Project Structure & Module Organization
`src/` hosts the entire client. Shared layout and UI primitives live under `components/`, hooks under `hooks/`, helpers under `lib/`, and each tool inside `tools/<toolId>/`. Keep tool-specific state colocated with its component and register it in `src/tools/index.ts`. Assets fit under `src/assets/`, while `public/` is reserved for static files copied as-is by Vite. Build output goes to `dist/` and must remain untracked.

## Build, Test, and Development Commands
- `npm run dev` – launches Vite with React Fast Refresh at `localhost:5173` for day-to-day work.
- `npm run lint` – runs ESLint using `eslint.config.js`; keep it clean before pushing.
- `npm run build` – type-checks via `tsc -b`, builds production assets, and generates route-specific HTML files for SEO.
- `npm run preview` – serves the built bundle to sanity-check release artifacts.

**Note**: The build process automatically generates:
- Separate HTML files for each tool route (`/json/index.html`, `/diff/index.html`, etc.)
- SEO files (`sitemap.xml`, `robots.txt`)
- `404.html` for SPA routing support on GitHub Pages

## Coding Style & Naming Conventions
Use TypeScript + JSX with 2-space indentation and functional components. Components follow PascalCase (`JsonTool.tsx`), hooks kebab-case (`use-tool-state.ts`), and utility files lowercase. Favor hooks for state, `clsx`/`tailwind-merge` for conditional classes, and Tailwind utility classes for layout. Keep user-facing strings in English only.

## Testing Guidelines
There are no automated tests yet; when adding them, colocate specs inside `src/<feature>/__tests__/` and name files `*.test.ts(x)`. Prefer Vitest + React Testing Library for component coverage, and mock expensive editor/diff interactions. Always document new manual verification steps in PRs until suites exist.

## Commit & Pull Request Guidelines
Write short imperative commit subjects (`add base64 swap`, `wire cron parser`). Reference issues in the body (`Refs: #42`) when relevant. Pull requests should describe the change, include screenshots/GIFs for UI updates, and list any commands executed (`dev`, `lint`, `build`). Rebase on `main`, ensure lint/build succeed locally, and request review only when green.

## Environment & Deployment Notes
Use Node 20+ / npm 10 to stay in sync with `package-lock.json`. Install dependencies with npm only. GitHub Pages deployment is handled by `.github/workflows/deploy.yml`; verify `npm run build` before merging to `main` because pushes trigger a deploy. Whenever a feature, UX flow, or tool option changes, immediately review and refresh all relevant docs (`README.md`, `AGENTS.md`, `SAS.md`, implementation notes) so instructions never drift from the actual behavior.

## Routing & SEO
- Uses **BrowserRouter** (not HashRouter) for clean, SEO-friendly URLs
- Each tool route (`/json`, `/diff`, etc.) generates a separate HTML file during build
- Custom Vite plugin (`vite-plugin-generate-routes.ts`) handles route HTML generation
- Each generated HTML includes tool-specific meta tags for search engine optimization
- GitHub Pages handles SPA routing via `404.html` redirect script

## URL 공유 최적화

### 필터링 전략

URL 공유 시 필요한 필드만 포함하여 URL 길이를 최소화합니다. `useToolState` 훅의 `shareStateFilter` 옵션을 사용하여 구현합니다.

### 구현 방법

1. **필터 함수 정의**: UI 전용 상태를 제외하고 공유에 필요한 필드만 선택

```typescript
const { state, shareState } = useToolState<JsonToolState>(
  'json',
  DEFAULT_STATE,
  {
    shareStateFilter: ({ input, indent, sortKeys, viewMode, expandLevel }) => ({
      input,
      indent,
      sortKeys,
      viewMode,
      expandLevel,
      // search 필드는 UI 전용이므로 제외
    }),
  }
);
```

2. **필터링 원칙**:
   - ✅ 포함: 사용자 입력, 설정 옵션
   - ❌ 제외: UI 전용 상태 (검색어, 스크롤 위치 등), 계산된 값 (파싱 결과 등)

3. **검증**:
   - Share 버튼 클릭 후 생성된 URL 길이 확인
   - 공유 링크로 상태가 정확히 복원되는지 확인
   - 필터링된 필드가 제외되었는지 확인

### 도구별 가이드

- **JSON 도구**: `search` 필드 제외 (UI 전용)
- **YAML/Diff/Base64/URL**: 모든 필드 필요 (필터 없음)
- **Time/Cron**: 작은 데이터이므로 필터 없음 (모든 필드 포함)

자세한 내용은 `SAS.md`의 "5.3 URL 공유(입력 포함) 규격" 섹션을 참조하세요.

### SEO 최적화 가이드 (신규 메뉴 추가 시 필수)

신규 도구를 추가할 때는 반드시 SEO 최적화를 위해 다음 단계를 수행해야 합니다:

1. **`vite-plugin-generate-routes.ts`에 도구 정보 추가**
   - 파일 상단의 `tools` 배열에 새 도구 정보를 추가합니다.
   - 다음 필드들을 포함해야 합니다:
     ```typescript
     {
       id: 'tool-id',              // 도구 ID (소문자, 하이픈 사용)
       path: '/tool-path',          // 라우트 경로
       title: 'Tool Name',          // 도구 이름
       description: 'Short description',  // 짧은 설명
       seoDescription: '...',       // SEO 최적화된 상세 설명 (150-160자 권장)
       keywords: [                  // 검색 키워드 배열 (5-10개 권장)
         'keyword1',
         'keyword2',
         // ...
       ],
       features: [                  // 주요 기능 목록
         'Feature 1',
         'Feature 2',
         // ...
       ],
     }
     ```

2. **SEO 설명 작성 가이드**
   - `seoDescription`: 150-160자 권장 (검색 결과에 표시됨)
   - "Free" 또는 "Free online"으로 시작하여 무료 도구임을 명시
   - 주요 기능을 간결하게 나열
   - "All processing happens in your browser" 또는 "Client-side processing" 등 프라이버시 강조 문구 포함
   - 예시:
     ```
     'Free online JSON viewer, formatter, and validator. Pretty print JSON with syntax highlighting, tree view, search, and copy features. All processing happens in your browser - no data sent to servers.'
     ```

3. **키워드 선택 가이드**
   - 사용자가 검색할 가능성이 높은 키워드 포함
   - 도구의 주요 기능을 나타내는 키워드
   - 동의어 및 변형어 포함 (예: "encoder" / "encode", "converter" / "converter tool")
   - 5-10개 권장, 너무 많으면 스팸으로 인식될 수 있음
   - 예시:
     ```typescript
     keywords: [
       'json viewer',
       'json formatter',
       'json prettifier',
       'json validator',
       'json parser',
       'json tree',
       'json beautifier',
       'online json tool',
     ]
     ```

4. **기능 목록 작성 가이드**
   - 도구의 주요 기능을 간결하게 나열
   - 사용자가 기대할 수 있는 핵심 기능 위주
   - 5-7개 권장
   - 예시:
     ```typescript
     features: [
       'Pretty print JSON',
       'Tree view navigation',
       'Search and highlight',
       'Minify JSON',
       'Sort keys',
       'Copy formatted JSON',
     ]
     ```

5. **자동 생성되는 SEO 요소**
   - 빌드 시 다음이 자동으로 생성됩니다:
     - `<title>` 태그: `{title} - tools.yowu.dev`
     - `<meta name="description">`: `seoDescription` 사용
     - `<meta name="keywords">`: `keywords` 배열을 쉼표로 구분
     - `<link rel="canonical">`: `https://tools.yowu.dev{path}`
     - Open Graph 태그 (og:title, og:description, og:url, og:image)
     - Twitter Card 태그 (twitter:title, twitter:description, twitter:image)
     - JSON-LD 구조화된 데이터 (WebApplication 스키마)

6. **검증 방법**
   - `npm run build` 실행 후 `dist/{tool-path}/index.html` 파일 확인
   - 생성된 HTML의 `<head>` 섹션에 모든 메타 태그가 포함되어 있는지 확인
   - `dist/sitemap.xml`에 새 도구 경로가 추가되었는지 확인
   - 브라우저 개발자 도구로 메타 태그 검증 (예: Open Graph Debugger)

7. **주의사항**
   - SEO 정보는 실제 도구 기능과 일치해야 함 (과장된 설명 금지)
   - 키워드 스터핑 방지 (자연스러운 키워드 사용)
   - 각 도구마다 고유한 `seoDescription`과 `keywords` 사용 (중복 방지)
   - 빌드 후 반드시 생성된 HTML 파일 확인
   - **Title 길이**: 50-60자 권장 (자동으로 " - Free Online Tool | tools.yowu.dev" 접미사 추가)
   - **Description 길이**: 110-160자 권장 (160자 초과 시 자동으로 잘림)

8. **Open Graph 이미지 최적화**
   - 이미지 파일: `public/opengraph.png`
   - 권장 크기: 1200x630px (Facebook/LinkedIn 표준)
   - 이미지에 Call-to-Action 포함 권장:
     - "Try Now", "Get Started", "Use Free Tool" 등의 텍스트
     - 브랜드 색상과 대비되는 버튼 스타일
     - 도구의 핵심 가치 제안 포함
   - 이미지 alt 텍스트는 자동으로 `og:image:alt` 및 `twitter:image:alt` 메타 태그에 포함됨
