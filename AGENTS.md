# Repository Guidelines

## Project Structure & Module Organization

`src/` hosts the entire client. Shared layout and UI primitives live under `components/`, hooks under `hooks/`, helpers under `lib/`, and each tool inside `tools/<toolId>/`. Keep tool-specific state colocated with its component and register it in `src/tools/index.ts`. Assets fit under `src/assets/`, while `public/` is reserved for static files copied as-is by Vite. Build output goes to `dist/` and must remain untracked. Web Workers for heavy processing live under `src/workers/` (v1.1.0+).

## Build, Test, and Development Commands

- `npm run dev` – launches Vite with React Fast Refresh at `localhost:5173` for day-to-day work.
- `npm run lint` – runs ESLint using `eslint.config.js`; keep it clean before pushing.
- `npm run build` – type-checks via `tsc -b`, builds production assets, and generates route-specific HTML files for SEO.
- `npm run preview` – serves the built bundle to sanity-check release artifacts.

## AI Agent 작업 가이드

### 작업 완료 후 필수 검증

**중요**: 모든 단위 작업이 완료된 이후에는 반드시 다음을 수행해야 합니다:

1. **빌드 검증**: `npm run build` 실행하여 빌드가 성공하는지 확인

   - 타입 체크 오류 확인 (`tsc -b` 실행)
   - 빌드 오류 확인 (Vite 빌드 프로세스)
   - 생성된 파일 확인 (`dist/` 디렉토리)
   - SEO 파일 생성 확인 (`sitemap.xml`, `robots.txt`, 각 도구별 `index.html` 등)

2. **Lint 검증**: `npm run lint` 실행하여 코드 스타일 오류 확인

   - 모든 lint 오류 수정
   - 경고도 가능하면 해결

3. **작업 완료 확인**:
   - 빌드가 성공적으로 완료되었는지 확인
   - 생성된 산출물이 예상대로 생성되었는지 확인
   - 타입 오류가 없는지 확인
   - 런타임 오류가 없는지 확인 (가능한 경우)

**예외 상황**:

- 단순 문서 수정만 한 경우에는 빌드 생략 가능
- 하지만 코드 변경이 있었다면 반드시 빌드 검증 필요
- 설정 파일 변경 시에도 빌드 검증 권장

**작업 흐름 예시**:

```bash
# 1. 코드 수정
# ... 파일 편집 ...

# 2. Lint 검증
npm run lint

# 3. 빌드 검증 (필수)
npm run build

# 4. 빌드 성공 확인 후 작업 완료
```

**Note**: The build process automatically generates:

- Separate HTML files for each tool route (`/json/index.html`, `/diff/index.html`, etc.)
- SEO files (`sitemap.xml`, `robots.txt`)
- `404.html` for SPA routing support on GitHub Pages

## Coding Style & Naming Conventions

Use TypeScript + JSX with 2-space indentation and functional components. Components follow PascalCase (`JsonTool.tsx`), hooks kebab-case (`use-tool-state.ts`), and utility files lowercase. Favor hooks for state, `clsx`/`tailwind-merge` for conditional classes, and Tailwind utility classes for layout.

### Language Guidelines

#### v1.3.0 이전 (현재)

**All client-side text must be written in English only.** This includes:

- User-facing UI text (buttons, labels, tooltips, error messages)
- Footer content
- Placeholder text
- Toast notifications
- Tool descriptions
- Any text visible to end users

**Rationale**: This is a global developer tool accessible to international users. English ensures consistency and broad accessibility. Code comments, documentation files (like this one), and internal developer notes may use other languages as needed, but all user-visible content must be in English.

#### v1.3.0 이후 (i18n 적용)

**All client-side text must be referenced from i18n resources only.** This includes:

- **하드코딩된 문자열 리터럴 금지**
- 모든 UI 텍스트는 `t('namespace.key')` 또는 `I18N.namespace.key` 형태로 참조
- 새 UI 요소 추가 시: **모든 로케일 파일에 키를 동시에 추가**
- 번역이 확정되지 않은 언어는 임시로 en-US 값을 복사해도 되지만, TODO 태그로 추적
- 번역 키는 안정적인 식별자로 작성 (문장 자체를 키로 쓰지 않음)

**지원 언어**: en-US(기본), ko-KR, ja-JP, zh-CN, es-ES

**i18n 리소스 구조**:

- `src/i18n/{locale}.ts` 파일에 각 언어별 번역 정의
- 네임스페이스: `common.*`, `sidebar.*`, `tool.{slug}.*`, `meta.{slug}.*`
- `en-US.ts`를 소스 오브 트루스로 사용

자세한 내용은 `SAS.md`의 "5. i18n(국제화) 규격" 섹션을 참조하세요.

## Testing Guidelines

There are no automated tests yet; when adding them, colocate specs inside `src/<feature>/__tests__/` and name files `*.test.ts(x)`. Prefer Vitest + React Testing Library for component coverage, and mock expensive editor/diff interactions. Always document new manual verification steps in PRs until suites exist.

## Commit & Pull Request Guidelines

### 커밋 단위 규칙

**원칙**: 각 커밋은 논리적으로 독립적이고 완전한 작업 단위여야 합니다.

1. **기능 단위로 커밋**

   - 하나의 기능이나 변경사항을 하나의 커밋으로 묶습니다
   - 예: Command Palette 기능 전체, 파일 워크플로우 전체
   - ❌ 나쁜 예: 여러 기능을 한 번에 커밋
   - ✅ 좋은 예: 각 기능을 별도 커밋

2. **관련 파일은 함께 커밋**

   - 하나의 기능에 관련된 모든 파일 변경사항을 함께 커밋합니다
   - 예: 새 도구 추가 시 컴포넌트, 타입, SEO 설정을 함께 커밋

3. **문서 업데이트는 별도 커밋 가능**

   - 코드 변경과 문서 업데이트를 분리할 수 있습니다
   - 단, 코드 변경과 밀접하게 연관된 문서는 함께 커밋 가능

4. **빌드/테스트 통과 후 커밋**
   - 커밋 전에 반드시 `npm run lint`와 `npm run build`가 성공하는지 확인
   - 실패한 빌드는 커밋하지 않음

### 커밋 메시지 작성 규칙

**형식**: `<type>: <subject>`

#### 커밋 타입 (Conventional Commits)

- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `refactor:` - 코드 리팩토링 (기능 변경 없음)
- `docs:` - 문서 변경
- `chore:` - 빌드 설정, 도구 설정 등
- `style:` - 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- `test:` - 테스트 코드 추가/수정
- `perf:` - 성능 개선

#### 주제 (Subject) 작성 규칙

1. **명령형 문장 사용** (동사로 시작)

   - ✅ `Add Command Palette feature`
   - ✅ `Fix favorites sync issue`
   - ❌ `Added Command Palette feature`
   - ❌ `Fixing favorites sync issue`

2. **50자 이내로 작성**

   - 첫 줄은 간결하고 명확하게
   - 필요시 본문에 상세 설명 추가

3. **영문으로 작성**

   - 프로젝트의 일관성을 위해 커밋 메시지는 영문으로 작성
   - 한국어는 본문에만 사용 가능

4. **구체적으로 작성**
   - 무엇을 변경했는지 명확히 표현
   - ✅ `Add UUID/ULID Generator tool`
   - ❌ `Add new tool`
   - ✅ `Fix favorites sync by reading from localStorage`
   - ❌ `Fix bug`

#### 본문 (Body) 작성 규칙

본문은 선택사항이지만, 복잡한 변경사항의 경우 반드시 포함합니다.

1. **변경 이유 설명**

   - 왜 이 변경이 필요한지 설명
   - 문제점이나 개선 사항 명시

2. **변경 내용 상세 설명**

   - 주요 변경사항 나열
   - 기술적 세부사항 포함 가능

3. **이슈 참조**

   - 관련 이슈가 있으면 `Refs: #42` 형식으로 참조

4. **영문 또는 한글 모두 사용 가능**
   - 본문은 개발자 간 소통을 위한 것이므로 한글 사용 가능

#### 커밋 메시지 예시

**기능 추가 (feat)**:

```
feat: Add Command Palette (⌘K / Ctrl+K)

- Implement fuzzy search for tools
- Add keyboard navigation (arrow keys, Enter, ESC)
- Integrate with favorites and recent tools
- Add mobile support via Search button
```

**버그 수정 (fix)**:

```
fix: Fix favorites sync by reading from localStorage in event handler

- Change event handler to read directly from localStorage instead of using event detail
- This avoids closure issues and ensures the latest value is always used
- Fixes issue where Sidebar favorites didn't update immediately when toggled in Command Palette
```

**리팩토링 (refactor)**:

```
refactor: Improve Hash Generator UI layout and styling

- Simplify title to "Hash Generator"
- Group options into a card-like structure
- Move security warning to concise note at bottom
- Improve visual harmony with other tools
```

**문서 업데이트 (docs)**:

```
docs: Update development documents for v1.2.0 completion

- Update SAS.md with completed v1.2.0 features
- Update IMPLEMENTATION_PLAN.md with Phase 6 completion status
- Update RELEASE_NOTES.md with v1.2.0 release notes
- Update TEST_CHECKLIST.md with new test scenarios
```

**설정 변경 (chore)**:

```
chore: Update deploy.yml

- Update Node.js version to 20
- Add cache configuration for faster builds
```

### Pull Request 작성 규칙

1. **제목**: 커밋 메시지와 동일한 형식 사용
2. **설명**:
   - 변경 사항 요약
   - 변경 이유 및 배경
   - 테스트 방법 및 결과
   - 스크린샷/GIF (UI 변경 시)
   - 실행한 명령어 목록 (`npm run dev`, `npm run lint`, `npm run build`)
3. **체크리스트**:
   - [ ] `npm run lint` 통과
   - [ ] `npm run build` 통과
   - [ ] 관련 문서 업데이트 (필요시)
   - [ ] 테스트 완료

### 커밋 예시 (실제 프로젝트에서 사용된 패턴)

```bash
# 기능 추가
feat: Add Command Palette (⌘K / Ctrl+K)
feat: Add UUID/ULID Generator tool
feat: Enhance share functionality with ShareModal and Web Share API

# 버그 수정
fix: Fix favorites sync by reading from localStorage in event handler
fix: Improve PWA update detection and notification

# 리팩토링
refactor: Improve Hash Generator UI layout and styling
refactor: Add copy icon buttons to all tools for consistent UX

# 문서
docs: Update development documents for v1.2.0 completion
docs: v1.2.0 requirements

# 설정
chore: update deploy.yml
```

**참고**: Rebase on `main`, ensure lint/build succeed locally, and request review only when green.

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
     ];
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
     ];
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

### Sitemap Priority 전략 (v1.3.3+)

개발자들의 실제 검색 패턴을 기반으로 sitemap.xml의 priority를 최적화합니다.

**전략 근거**:

- 개발자들은 "json formatter", "base64 decode", "url encode online" 등으로 직접 검색
- "yowu devtools"를 검색하는 사용자는 극소수
- 따라서 개별 도구 페이지가 홈페이지보다 검색 엔진에서 우선순위가 높아야 함

**Priority 설정** (`vite-plugin-generate-routes.ts` 상수):

```typescript
const TOOL_PRIORITY = 1.0; // 모든 개별 도구 (en-US)
const TOOL_LOCALE_PRIORITY = 0.9; // Locale 버전 도구 페이지
const HOME_PRIORITY = 0.8; // 메인 페이지 (홈)
```

| 페이지 유형             | Priority | 예시                           |
| ----------------------- | -------- | ------------------------------ |
| 개별 도구 (en-US)       | **1.0**  | `/json`, `/base64`, `/url`     |
| Locale 도구 페이지      | **0.9**  | `/ko-KR/json`, `/ja-JP/base64` |
| 홈 페이지 (모든 locale) | **0.8**  | `/`, `/ko-KR`, `/ja-JP`        |

**참고**: Google은 priority를 무시한다고 공식 발표했으나, Bing/Yandex 등 다른 검색 엔진은 여전히 참고할 수 있습니다. 크롤 버짓 힌트 제공 및 사이트 구조 문서화 목적으로도 유용합니다. - 브랜드 색상과 대비되는 버튼 스타일 - 도구의 핵심 가치 제안 포함

- 이미지 alt 텍스트는 자동으로 `og:image:alt` 및 `twitter:image:alt` 메타 태그에 포함됨

## 사이드바 고도화 가이드 (v1.1.0)

### 최근 사용한 도구 기능

최근 사용한 도구는 localStorage에 저장되며, 사이드바에 별도 섹션으로 표시됩니다.

**구현 방법**:

1. **훅 생성**: `src/hooks/useRecentTools.ts`

   ```typescript
   const MAX_RECENT_TOOLS = 3;
   const STORAGE_KEY = 'yowu-devtools:v1:app:recentTools';

   interface RecentTool {
     toolId: string;
     timestamp: number;
   }
   ```

2. **기록 로직**: 도구 페이지 진입 시 자동 기록

   ```typescript
   // App.tsx 또는 각 도구 컴포넌트에서
   useEffect(() => {
     addRecentTool(toolId);
   }, [toolId]);
   ```

3. **사이드바 통합**: `src/components/layout/Sidebar.tsx`에 섹션 추가
   - 최근 사용한 도구 목록 표시 (최대 3개)
   - 시간순 정렬 (최신이 상단)
   - 중복 방지 (같은 도구는 최신 항목만 유지)

### 즐겨찾기 기능

즐겨찾기는 localStorage에 저장되며, 사이드바 상단에 별도 섹션으로 표시됩니다.

**구현 방법**:

1. **훅 생성**: `src/hooks/useFavorites.ts`

   ```typescript
   const STORAGE_KEY = 'yowu-devtools:v1:app:favorites';
   ```

2. **UI 통합**: 각 도구 메뉴 항목에 별 아이콘 추가

   ```typescript
   <button onClick={() => toggleFavorite(toolId)}>
     <Star className={isFavorite ? 'fill-yellow-400' : ''} />
   </button>
   ```

3. **사이드바 통합**: `src/components/layout/Sidebar.tsx`에 섹션 추가
   - 즐겨찾기로 등록된 도구 목록 표시
   - 등록 순서 유지
   - 즐겨찾기와 최근 사용 섹션 모두에 표시 가능 (중복 허용)

## Web App 지원 가이드 (v1.1.0)

### Manifest.json 생성

Chrome 앱으로 등록하기 위해 `public/manifest.json` 파일이 필요합니다.

**필수 필드**:

```json
{
  "name": "tools.yowu.dev",
  "short_name": "DevTools",
  "description": "Developer tools for JSON, URL, Base64, and more",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**구현 단계**:

1. `public/manifest.json` 파일 생성
2. `public/icon-192.png`, `public/icon-512.png` 아이콘 준비
3. `index.html`에 manifest 링크 추가:
   ```html
   <link rel="manifest" href="/manifest.json" />
   ```

**검증**:

- Chrome DevTools → Application → Manifest에서 확인
- Chrome 주소창에 설치 아이콘 표시 확인
- `chrome://apps`에서 앱 실행 확인

### Service Worker 오프라인 캐싱 (선택사항)

네트워크 장애나 서버 다운 시에도 앱이 동작하도록 Service Worker를 사용한 캐싱을 구현할 수 있습니다.

**구현 단계**:

1. **Service Worker 파일 생성**: `public/sw.js`

   - 캐시 전략 정의 (Network First, Cache First 등)
   - 캐시 만료 시간 설정
   - 오프라인 폴백 페이지 제공

2. **캐시 전략 선택**:

   - **Network First**: HTML 파일 - 최신 버전 우선, 실패 시 캐시 사용
   - **Cache First**: 정적 자산 (JS, CSS, 이미지) - 캐시 우선, 빠른 로딩
   - **Stale-While-Revalidate**: 캐시 제공 후 백그라운드에서 업데이트

3. **캐시 만료 시간 설정**:

   ```javascript
   const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7일 (밀리초)
   ```

4. **Service Worker 등록**: `src/main.tsx`에서 등록

   ```typescript
   if ('serviceWorker' in navigator) {
     window.addEventListener('load', () => {
       navigator.serviceWorker.register('/sw.js');
     });
   }
   ```

5. **Vite 빌드 통합**: `vite.config.ts`에서 Service Worker 복사 설정

   ```typescript
   import { copyFileSync } from 'fs';

   export default defineConfig({
     plugins: [
       react(),
       generateRoutes(),
       {
         name: 'copy-sw',
         closeBundle() {
           copyFileSync('public/sw.js', 'dist/sw.js');
         },
       },
     ],
   });
   ```

**캐시 무효화 전략**:

- 캐시 이름에 버전 포함: `tools-yowu-dev-v1.1.0`
- 새 버전 배포 시 캐시 이름 변경으로 자동 무효화
- 사용자에게 "캐시 지우기" 옵션 제공 (설정 메뉴)

**주의사항**:

- Service Worker는 HTTPS 또는 localhost에서만 동작
- 캐시 크기 제한 고려 (브라우저별 다름)
- 개발 중에는 Service Worker 비활성화 권장 (브라우저 DevTools에서)
- 캐시된 파일이 오래되면 기능이 동작하지 않을 수 있음

## Web Worker 성능 최적화 가이드 (v1.1.0)

### Worker 파일 생성

큰 데이터 처리 시 UI 프리징을 방지하기 위해 Web Worker를 사용합니다.

**파일 구조**:

```
src/
  workers/
    json-parser.worker.ts
    diff-calculator.worker.ts
    yaml-converter.worker.ts
```

**Worker 예시** (`json-parser.worker.ts`):

```typescript
// Worker에서 메시지 수신
self.onmessage = (e) => {
  const { input } = e.data;
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, 2);
    // 결과를 메인 스레드로 전송
    self.postMessage({ success: true, data: parsed, formatted });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
```

### Worker 사용 패턴

**메인 스레드에서 Worker 사용**:

```typescript
// Worker 생성
const worker = new Worker(
  new URL('../workers/json-parser.worker.ts', import.meta.url),
  { type: 'module' }
);

// 메시지 전송
worker.postMessage({ input: largeJsonString });

// 결과 수신
worker.onmessage = (e) => {
  const { success, data, formatted, error } = e.data;
  if (success) {
    setResult({ data, formatted });
  } else {
    setError(error);
  }
};

// 정리
worker.terminate();
```

### 성능 임계값

다음 조건에서 자동으로 Worker 사용:

- **JSON 파싱**: 입력 크기 > 1MB 또는 줄 수 > 10,000줄
- **Diff 계산**: 각 텍스트 줄 수 > 10,000줄
- **YAML 변환**: 입력 크기 > 500KB

**구현 예시**:

```typescript
const shouldUseWorker = (input: string) => {
  const size = new Blob([input]).size;
  const lines = input.split('\n').length;
  return size > 1_000_000 || lines > 10_000;
};

if (shouldUseWorker(input)) {
  // Worker 사용
  processWithWorker(input);
} else {
  // 메인 스레드에서 처리
  processInMainThread(input);
}
```

## AdSense 통합 가이드 (v1.5.1)

모든 도구에 Google AdSense 광고를 표시하여 무료 운영 및 유지보수 비용을 충당합니다. 광고는 사용자 경험을 해치지 않도록 자연스러운 위치에 배치됩니다.

### 공통 컴포넌트

- **GoogleAdsense** (`src/components/common/GoogleAdsense.tsx`): 실제 AdSense 광고 단위 및 면책 조항
- **GoogleAdsenseBlock** (`src/components/common/GoogleAdsenseBlock.tsx`): 페이지 내 자유롭게 배치 가능한 광고 블록 컴포넌트

### 새 도구에 AdSense 추가하기

1. **import 추가**:
```typescript
import { GoogleAdsenseBlock } from '@/components/common/GoogleAdsenseBlock';
```

2. **적절한 위치에 광고 블록 추가**:
```tsx
const MyTool: React.FC = () => {
  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader ... />
      
      {/* 입력 섹션 */}
      <EditorPanel ... />
      
      {/* 광고 - 입력과 출력 사이 자연스러운 위치 */}
      <GoogleAdsenseBlock />
      
      {/* 출력 섹션 */}
      <ResultPanel ... />
      
      <ShareModal {...shareModalProps} />
    </div>
  );
};
```

### 광고 배치 원칙

광고는 **사용자의 자연스러운 읽기 흐름을 방해하지 않는 위치**에 배치합니다:

- ✅ **입력과 출력 사이**: 사용자가 입력을 마치고 결과를 보기 전
- ✅ **옵션과 결과 사이**: 설정을 완료하고 결과를 확인하기 전
- ✅ **주요 기능 블록 사이**: 논리적으로 구분되는 섹션 사이
- ❌ **입력 중간**: 사용자의 작업 흐름을 방해
- ❌ **결과 중간**: 결과 확인을 방해

### 도구별 광고 배치 예시

| 도구 | 광고 위치 | 배치 이유 |
|------|-----------|-----------|
| JSON Viewer | 파일 업로드 박스 하단 | 입력 완료 후 자연스러운 휴지점 |
| API Tester | Request Body 하단 | 요청 설정 완료 후 전송 전 |
| Hash Generator | Hash Result 상단 | 입력 완료 후 결과 확인 전 |
| Text Diff | View 선택 블록 상단 | 옵션 설정 전 자연스러운 위치 |
| Regex Tester | Security Note 하단 | 입력 섹션과 Pattern Features 사이 |

### 핵심 CSS 설명

- `my-6`: 상하 여백으로 콘텐츠와 광고를 구분
- `max-w-4xl mx-auto`: 광고의 최대 너비 제한 및 중앙 정렬

### 주의사항

- **localhost에서는 AdSense가 표시되지 않음**: Google의 도메인 검증 및 보안 정책으로 인해 로컬 개발 환경에서는 광고가 로드되지 않습니다.
- **i18n 지원**: 면책 조항 텍스트는 `ads.disclaimer` 키로 i18n 리소스에서 관리됩니다.
- **다크 모드 지원**: `useResolvedTheme` 훅을 사용하여 광고 배경색이 테마에 맞게 조정됩니다.
- **In-feed 광고**: `data-ad-format="fluid"`와 `data-ad-layout-key`를 사용하여 콘텐츠에 자연스럽게 녹아드는 인피드 광고 형태로 표시됩니다.

## 문서 구조

### Root 디렉토리 (즉시 참고 문서)

- `README.md`: 프로젝트 개요 및 시작 가이드
- `AGENTS.md`: AI Agent 작업 가이드 (이 문서)
- `.cursorrules`: Cursor IDE 규칙
- `SAS.md`: 상세 요구사항 명세 (Software Architecture Specification)
- `IMPLEMENTATION_PLAN.md`: 구현 계획 및 체크리스트
- `RELEASE_NOTES.md`: 릴리스 노트
- `TEST_CHECKLIST.md`: 테스트 체크리스트

### docs/ 디렉토리 (기타 문서)

- `docs/V1.2.0_CROSS_CHECK.md`: v1.2.0 크로스 체크 결과
- `docs/PWA_TROUBLESHOOTING.md`: PWA 트러블슈팅 가이드
- `docs/TEST_RESULTS_v1.1.0.md`: v1.1.0 테스트 결과
- `docs/TEST_ISSUES_v1.1.0.md`: v1.1.0 테스트 이슈

**참고**: 핵심 개발 문서(`SAS.md`, `IMPLEMENTATION_PLAN.md`, `RELEASE_NOTES.md`, `TEST_CHECKLIST.md`)는 root에 두고, 나머지 기타 자질구레한 문서들(크로스 체크 결과, 트러블슈팅 가이드, 테스트 결과 등)은 `docs/` 하위에 생성하세요.

## i18n(국제화) 개발 가이드 (v1.3.0)

### i18n 리소스 파일 구조

**디렉토리 구조**:

```
src/
  i18n/
    en-US.ts    # 소스 오브 트루스 (기본 언어)
    ko-KR.ts    # 한국어
    ja-JP.ts    # 일본어
    zh-CN.ts    # 중국어
    es-ES.ts    # 스페인어
```

**리소스 파일 예시** (`en-US.ts`):

```typescript
export const enUS = {
  common: {
    copy: 'Copy',
    paste: 'Paste',
    clear: 'Clear',
    reset: 'Reset',
    share: 'Share',
    error: 'Error',
    loading: 'Loading',
  },
  sidebar: {
    favorites: 'Favorites',
    recentTools: 'Recent Tools',
    allTools: 'All Tools',
  },
  tool: {
    json: {
      title: 'JSON Viewer',
      description: 'Pretty print and traverse JSON',
      placeholder: 'Paste JSON here...',
      // ...
    },
    // ...
  },
  meta: {
    json: {
      title: 'JSON Viewer - tools.yowu.dev',
      description: 'Free online JSON viewer, formatter, and validator...',
    },
    // ...
  },
} as const;
```

### 번역 키 네임스페이스 규칙

1. **공통 문자열**: `common.*`

   - Copy, Paste, Clear, Reset, Share, Error, Loading 등
   - 모든 도구에서 공통으로 사용되는 문자열

2. **사이드바**: `sidebar.*`

   - Favorites, Recent Tools, All Tools 등
   - 사이드바 전용 문자열

3. **도구별**: `tool.{slug}.*`

   - 각 도구의 제목, 설명, placeholder, validation 메시지 등
   - 예: `tool.json.title`, `tool.json.description`, `tool.json.placeholder`

4. **SEO 메타**: `meta.{slug}.*`
   - 각 도구의 SEO 메타 정보 (title, description)
   - 빌드 시 사용

### UI에서 i18n 사용 방법

**훅 사용 예시**:

```typescript
import { useI18n } from '@/hooks/useI18n';

const MyComponent = () => {
  const { t } = useI18n();

  return <button>{t('common.copy')}</button>;
};
```

**또는 상수 참조 방식**:

```typescript
import { I18N } from '@/i18n';

const MyComponent = () => {
  const locale = useLocale(); // 현재 로케일

  return <button>{I18N[locale].common.copy}</button>;
};
```

### 새 UI 요소 추가 시 체크리스트

1. **번역 키 추가**:

   - [ ] `src/i18n/en-US.ts`에 새 키 추가 (소스 오브 트루스)
   - [ ] `src/i18n/ko-KR.ts`에 번역 추가
   - [ ] `src/i18n/ja-JP.ts`에 번역 추가
   - [ ] `src/i18n/zh-CN.ts`에 번역 추가
   - [ ] `src/i18n/es-ES.ts`에 번역 추가
   - [ ] 번역이 확정되지 않은 언어는 임시로 en-US 값 복사 + TODO 태그

2. **코드에서 사용**:

   - [ ] 하드코딩된 문자열을 i18n 키로 교체
   - [ ] `t('namespace.key')` 또는 `I18N[locale].namespace.key` 형태로 참조

3. **검증**:
   - [ ] 빌드 시 번역 키 누락 검증 (자동화 권장)
   - [ ] 개발 모드에서 누락 키 경고 표시

### 언어 선택 UI 구현

**언어 선택 컴포넌트 예시**:

```typescript
import { useI18n } from '@/hooks/useI18n';
import { SUPPORTED_LOCALES } from '@/lib/constants';

const LanguageSelector = () => {
  const { locale, setLocale } = useI18n();

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {loc.nativeName}
        </option>
      ))}
    </select>
  );
};
```

**언어 변경 시 라우팅**:

- 현재 tool slug 유지
- locale prefix만 변경 (`/{locale}/{tool}`)
- URL fragment(공유 payload) 보존

### 빌드 시 언어별 HTML 생성

**vite-plugin-generate-routes.ts 확장**:

- `SUPPORTED_LOCALES` 배열 순회
- 각 `(locale, tool)` 조합에 대해 HTML 파일 생성
- 각 HTML에 `<html lang="{locale}">` 설정
- 각 HTML에 해당 로케일의 메타 태그 주입

**생성되는 파일 구조**:

```
dist/
  json/
    index.html          # en-US (기본)
  ko-KR/
    json/
      index.html        # ko-KR
  ja-JP/
    json/
      index.html        # ja-JP
  # ...
```

### 번역 키 검증

**빌드/테스트 단계에서 검증**:

- 모든 로케일 파일의 키 일치 여부 확인
- 누락된 키가 있을 경우 경고 또는 빌드 실패
- 개발 모드에서 누락 키 경고 표시

**검증 스크립트 예시**:

```typescript
// scripts/validate-i18n.ts
import { enUS } from '../src/i18n/en-US';
import { koKR } from '../src/i18n/ko-KR';
// ...

function validateKeys(source: any, target: any, path: string = '') {
  // 재귀적으로 키 일치 여부 확인
  // 누락된 키 발견 시 에러 또는 경고
}
```

### SEO 최적화 (언어별)

**sitemap.xml 확장**:

- 언어별 URL을 모두 포함
- `hreflang` 태그 추가 (검색 엔진에 언어 관계 알림)

**예시**:

```xml
<url>
  <loc>https://tools.yowu.dev/json</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://tools.yowu.dev/json"/>
  <xhtml:link rel="alternate" hreflang="ko" href="https://tools.yowu.dev/ko-KR/json"/>
  <!-- ... -->
</url>
```

### 주의사항

- **하드코딩 금지**: 모든 UI 문자열은 i18n 리소스에서 참조
- **키 안정성**: 번역 키는 안정적인 식별자로 작성 (문장 자체를 키로 쓰지 않음)
- **번역 품질**: en-US를 기준으로 모든 키 작성, 다른 언어는 번역 품질 확인
- **빌드 검증**: 빌드 시 번역 키 누락 검증 필수
- **성능**: i18n 리소스는 빌드 시 번들에 포함되므로 크기 고려
- **타입 안전성**: TypeScript 타입 정의로 번역 키 타입 안전성 보장

자세한 내용은 `SAS.md`의 "5. i18n(국제화) 규격" 섹션을 참조하세요.

### 주의사항

- Worker는 메인 스레드와 메시지 통신만 가능 (직접 DOM 접근 불가)
- 큰 데이터 전송 시 성능 오버헤드 고려
- Worker 지원 여부 확인 (`typeof Worker !== 'undefined'`)
- 폴백 로직 필수 (Worker 미지원 시 메인 스레드 처리)

## 키보드 단축키 가이드라인

모든 도구에서 일관된 키보드 단축키를 제공하여 사용자 경험을 향상시킵니다.

### 공통 단축키

| 기능                | Mac             | Windows/Linux      | 설명                                                |
| ------------------- | --------------- | ------------------ | --------------------------------------------------- |
| **실행/생성**       | `⌘ + Enter`     | `Ctrl + Enter`     | 주요 액션 실행 (Send, Generate, Execute, Export 등) |
| **취소**            | `Esc`           | `Esc`              | 진행 중인 작업 취소 또는 모달 닫기                  |
| **파일 열기**       | `⌘ + O`         | `Ctrl + O`         | 파일 선택 다이얼로그 열기 (Media Studio)            |
| **파이프라인 리셋** | `⌘ + Shift + R` | `Ctrl + Shift + R` | 설정 초기화 (Media Studio)                          |
| **클립보드 복사**   | `⌘ + C`         | `Ctrl + C`         | 결과 클립보드 복사 (Image Studio)                   |

### 도구별 단축키 구현 현황

| 도구           | 실행 단축키                   | 기타 단축키                                      |
| -------------- | ----------------------------- | ------------------------------------------------ |
| API Tester     | `⌘/Ctrl + Enter` (Send)       | -                                                |
| API Diff       | `⌘/Ctrl + Enter` (Execute)    | `Esc` (Cancel)                                   |
| UUID Generator | `⌘/Ctrl + Enter` (Regenerate) | -                                                |
| Image Studio   | `⌘/Ctrl + Enter` (Export)     | `⌘/Ctrl + O`, `⌘/Ctrl + Shift + R`, `⌘/Ctrl + C` |
| Video Studio   | `⌘/Ctrl + Enter` (Export)     | `⌘/Ctrl + O`, `⌘/Ctrl + Shift + R`, `Esc`        |

### 구현 방법

1. **OS 감지**:

```typescript
// 파일 상단에 상수 정의
const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const executeShortcut = isMac ? '⌘↵' : 'Ctrl+Enter';
```

2. **키보드 이벤트 리스너 추가**:

```typescript
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + Enter: 실행
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && canExecute) {
        handleExecute();
      }
    }
    // Esc: 취소
    if (e.key === 'Escape' && isProcessing) {
      e.preventDefault();
      handleCancel();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleExecute, handleCancel, isLoading, canExecute, isProcessing]);
```

3. **Tooltip으로 단축키 안내**:

버튼 텍스트는 이미 버튼에 표시되어 있으므로, tooltip에는 **단축키만** 표시합니다.

```typescript
import { Tooltip } from '@/components/ui/Tooltip';

<Tooltip content={executeShortcut}>
  <button onClick={handleExecute}>{t('common.execute')}</button>
</Tooltip>;
```

### 주의사항

1. **입력 필드 포커스 시 단축키 비활성화**: 텍스트 입력 중에는 `Enter` 단축키가 개행으로 동작해야 하므로, 입력 필드에 포커스된 경우 단축키를 비활성화합니다.

```typescript
const activeElement = document.activeElement;
const isInputFocused =
  activeElement instanceof HTMLInputElement ||
  activeElement instanceof HTMLTextAreaElement ||
  activeElement?.getAttribute('contenteditable') === 'true';

if (isInputFocused) {
  return; // 기본 동작 허용
}
```

2. **useCallback으로 핸들러 메모이제이션**: `useEffect` 의존성 배열 경고를 방지하기 위해 핸들러 함수를 `useCallback`으로 감쌉니다.

3. **동적 단축키 표시**: Mac과 Windows/Linux 사용자에게 적절한 단축키를 표시합니다.

   - Mac: `⌘` (Command), `⇧` (Shift), `⌥` (Option), `↵` (Enter)
   - Windows/Linux: `Ctrl`, `Shift`, `Alt`, `Enter`

4. **i18n 불필요**: 단축키 표시 (`⌘↵`, `Ctrl+Enter` 등)는 국제 표준 기호이므로 i18n 처리가 필요하지 않습니다.

### 신규 도구 추가 시 체크리스트

- [ ] "실행" 버튼이 있는 경우 `⌘/Ctrl + Enter` 단축키 구현
- [ ] 취소 기능이 있는 경우 `Esc` 단축키 구현
- [ ] 실행 버튼에 `Tooltip`으로 단축키 안내 추가
- [ ] OS에 따른 동적 단축키 표시 구현

## Cross-Tool Navigation Button 디자인 가이드

도구 간 데이터 전달 버튼 ("Open in X", "Send to X", "Compare in X" 등)의 스타일을 통일합니다.

### 표준 스타일 (텍스트 + 아이콘)

```tsx
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
// 대상 도구의 아이콘을 import (예: FileJson, Globe, FileDiff 등)

<button
  onClick={handleNavigate}
  className={cn(
    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md',
    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'border border-blue-200 dark:border-blue-800',
    'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    'hover:border-blue-300 dark:hover:border-blue-700',
    'transition-all duration-200',
    'shadow-sm hover:shadow'
  )}
>
  <TargetToolIcon className="w-3.5 h-3.5" />
  <span>{t('tool.xxx.openInYYY')}</span>
  <ExternalLink className="w-3 h-3 opacity-70" />
</button>;
```

### 컴팩트 스타일 (아이콘만)

테이블 셀이나 공간이 제한된 곳에서 아이콘만 사용할 때:

```tsx
<button
  onClick={handleNavigate}
  className={cn(
    'p-1.5 rounded-md',
    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'border border-blue-200 dark:border-blue-800',
    'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    'hover:border-blue-300 dark:hover:border-blue-700',
    'transition-all duration-200',
    'shadow-sm hover:shadow'
  )}
  title={t('tool.xxx.openInYYY')}
>
  <TargetToolIcon className="w-4 h-4" />
</button>
```

### 아이콘 사용 규칙

대상 도구의 정의된 아이콘을 사용합니다:

| 대상 도구      | 아이콘       | Import         |
| -------------- | ------------ | -------------- |
| JSON Viewer    | `FileJson`   | `lucide-react` |
| YAML Converter | `FileCode2`  | `lucide-react` |
| API Tester     | `Globe`      | `lucide-react` |
| API Diff       | `GitCompare` | `lucide-react` |
| Text Diff      | `FileDiff`   | `lucide-react` |

### 적용 사례

| 위치        | 버튼                          | 아이콘       |
| ----------- | ----------------------------- | ------------ |
| cURL Parser | Open in API Tester            | `Globe`      |
| cURL Parser | Open in JSON Viewer (compact) | `FileJson`   |
| API Tester  | Send to API Diff              | `GitCompare` |
| API Tester  | Open in JSON Viewer           | `FileJson`   |
| API Tester  | Open in YAML Converter        | `FileCode2`  |
| API Diff    | Compare in Text Diff          | `FileDiff`   |

### 스타일 특징

1. **파란색 테마**: `blue-50/blue-900` 배경, `blue-200/blue-800` 테두리
2. **미묘한 그림자**: `shadow-sm` 기본, `hover:shadow` 호버 시
3. **테두리 상호작용**: `hover:border-blue-300/blue-700`로 호버 피드백
4. **부드러운 전환**: `transition-all duration-200`
5. **작은 텍스트**: `text-xs font-medium`
6. **ExternalLink 아이콘**: 외부 네비게이션임을 시각적으로 표시 (`opacity-70`로 약간 흐리게)

### 주의사항

- 버튼 비활성화 시 `opacity-50 cursor-not-allowed` 추가
- 로딩 상태 시 `Loader2` 아이콘으로 교체 (`animate-spin` 적용)
- 드롭다운 메뉴가 있는 경우 `ChevronDown` 아이콘 추가
