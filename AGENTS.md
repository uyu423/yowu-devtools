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
**All client-side text must be written in English only.** This includes:
- User-facing UI text (buttons, labels, tooltips, error messages)
- Footer content
- Placeholder text
- Toast notifications
- Tool descriptions
- Any text visible to end users

**Rationale**: This is a global developer tool accessible to international users. English ensures consistency and broad accessibility. Code comments, documentation files (like this one), and internal developer notes may use other languages as needed, but all user-visible content must be in English.

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

### 주의사항

- Worker는 메인 스레드와 메시지 통신만 가능 (직접 DOM 접근 불가)
- 큰 데이터 전송 시 성능 오버헤드 고려
- Worker 지원 여부 확인 (`typeof Worker !== 'undefined'`)
- 폴백 로직 필수 (Worker 미지원 시 메인 스레드 처리)
