아래 문서는 **AI Agent(또는 개발자)가 바로 구현을 시작할 수 있는 수준**으로 작성한 **SRS(Software Requirements Specification)** 초안입니다. 그대로 리포지토리의 `docs/SRS.md`로 넣어도 됩니다.

---

# yowu-devtools SRS (v1.1)

## 0. 문서 메타

- 프로젝트명: **tools.yowu.dev** (구 yowu-devtools)
- 목적: 개발자가 자주 쓰는 변환/검증/뷰어 도구를 **서버 없이** 하나의 **정적 웹앱**으로 제공
- 배포: **GitHub Pages + Custom Domain (`tools.yowu.dev`)**
- 핵심 원칙:

  1. **자주 쓰는 도구 몇 개를 아주 잘**
  2. **새 도구 추가가 쉬운 구조(플러그인/모듈형)**
  3. **데이터는 로컬 처리(외부 전송 없음)**
  4. **모바일 대응 + 미니멀 UI + 빠른 체감 성능**
  5. **URL 공유(입력 데이터 포함, base64 기반) + 로컬스토리지 자동 복원**
  6. **기능/UX가 바뀌면 README, AGENTS, SAS 등 모든 문서를 즉시 확인·갱신해 최신 상태를 유지**

---

## 1. 범위

### 1.1 In-Scope (v1에 반드시 포함)

도구(툴) 목록:

1. JSON Pretty Viewer
2. URL Encode/Decode
3. Base64 Encode/Decode (텍스트 기준, v1에서 파일은 옵션)
4. Epoch/ISO 시간 변환
5. YAML ↔ JSON 변환
6. Text Diff
7. CRON 표현식(설명 + 다음 실행 시각)
8. JWT Encode/Decode (v1.1.0 추가)

공통 기능:

- Left Sidebar에서 툴 선택 → 툴 페이지 진입
- **URL 공유**: 현재 툴 상태(입력 포함)를 base64 인코딩해 링크로 공유
- **마지막 상태 자동 저장/복원**: localStorage
- **테마**: System/Browser 기본 + 사용자 토글(ON/OFF) 제공
- **키보드 단축키**: 최소 세트 제공
- **모바일 대응**: Sidebar는 Drawer(햄버거) 형태로 축소
- **UX 강화** (v1.1 추가):
  - Toast 알림 (`sonner`) - 복사 성공, 에러 등 피드백
  - 실시간 변환 (Debounce 300~500ms) - 버튼 클릭 없이 자동 변환
  - 동적 페이지 타이틀 - 각 툴 페이지 진입 시 브라우저 탭 제목 변경
  - 그룹별 최적화된 Width 전략 (Wide/Medium/Narrow)
- **사이드바 고도화** (v1.1.0 추가):
  - 최근 사용한 도구 리스트 (localStorage 기반)
  - 즐겨찾기 리스트 및 메뉴 즐겨찾기 등록 기능 (localStorage 기반)
- **Web App 지원** (v1.1.0 추가):
  - Chrome 앱으로 등록 가능 (`manifest.json` 기반)
  - 독립 창으로 실행 가능
  - Service Worker 기반 오프라인 캐싱 (선택사항, 향후 구현)
- **성능 개선** (v1.1.0 추가):
  - 큰 데이터 처리 시 Web Worker 도입으로 UI 프리징 방지

### 1.2 Out-of-Scope (v1에서 제외)

- 로그인/계정/동기화
- 서버 기능/백엔드
- 분석/로그(Analytics) 삽입
- "외부 API 호출" 기반 기능(예: DNS 조회, HTTP 호출 등)
- ~~PWA/오프라인 캐시~~ ✅ v1.1.0에서 구현 완료 (`vite-plugin-pwa` 사용)
- ~~JWT 검증 기능~~ ✅ v1.1.0에서 구현 완료 (서명 검증 포함)

---

## 2. 사용자 시나리오 (User Stories)

- US-01: 개발 중 JSON을 붙여넣고 **트리로 탐색/검색/복사**하고 싶다. **(Sample Data 로드 버튼 포함)**
- US-02: URL 파라미터를 encode/decode해서 바로 복사하고 싶다. **(실시간 변환으로 즉시 결과 확인)**
- US-03: Base64를 인코딩/디코딩해서 결과를 바로 복사하고 싶다. **(Toast 알림으로 복사 성공 확인)**
- US-04: epoch(ms/s) ↔ ISO 시간을 KST/UTC로 빠르게 바꾸고 싶다.
- US-05: YAML과 JSON을 상호 변환하고, 오류가 나면 **어느 줄/컬럼인지** 보고 싶다.
- US-06: 두 텍스트 차이를 **모바일에서도 보기 쉽게** 비교하고 싶다.
- US-07: cron을 넣으면 사람이 읽는 설명과 다음 실행 시각들을 확인하고 싶다.
- US-08: 지금 입력한 상태 그대로 **링크로 공유**하고, 받은 사람도 그대로 재현되면 좋겠다.
- US-09: 다시 접속했을 때 **마지막 작업 상태가 복원**되면 좋겠다.
- US-10: 각 도구 페이지로 진입 시 **브라우저 탭 타이틀**이 바뀌어 여러 탭을 띄워놓고 작업할 때 식별하기 쉬워야 한다.
- US-11: 사이드바에서 `yowu.dev` 로고를 클릭해 개발자 블로그로 이동할 수 있다.
- US-12: 사이드바에서 **최근 사용한 도구**를 빠르게 접근하고 싶다. (v1.1.0)
- US-13: 자주 쓰는 도구를 **즐겨찾기**로 등록해 상단에 고정하고 싶다. (v1.1.0)
- US-14: JWT 토큰을 디코딩해서 payload를 확인하고 싶다. (v1.1.0)
- US-15: Chrome 앱으로 등록해 독립 창에서 사용하고 싶다. (v1.1.0)
- US-16: 큰 JSON이나 텍스트를 처리할 때 UI가 멈추지 않았으면 좋겠다. (v1.1.0)

---

## 3. 기술 스택 결정 (권장안)

> 목표: 타입 안정성 + 빠른 개발 + 유지보수/확장 용이 + 정적 배포 최적

- Language: **TypeScript**
- Build: **Vite**
- UI: **React**
- Routing: **React Router (BrowserRouter)**

  - GitHub Pages에서 BrowserRouter 사용, 각 라우트별 HTML 파일 자동 생성으로 SEO 최적화
  - `404.html`을 통한 SPA 라우팅 지원

- Styling: **Tailwind CSS**

  - 미니멀 UI 구현/반응형에 유리

- Editor/Highlight: **CodeMirror 6**(권장)

  - JSON/YAML/텍스트 입력에 신뢰성 있고 가볍게 구성 가능

- YAML: `yaml` (파싱/스트링화)
- Diff: `diff-match-patch` 또는 `fast-diff` + 라인 기반 렌더링
- CRON:

  - 파싱/다음 실행: `cron-parser`
  - 사람 읽기: `cronstrue`(로케일 고려) 또는 자체 한글 템플릿

- Share 압축(권장): `lz-string` (URL 길이 완화)
- Notifications: **Sonner** (Toast 알림)
- Icons: **Lucide React**

---

## 4. 정보 구조 (IA) / 화면 구조

### 4.1 전역 레이아웃

- Left Sidebar: 툴 리스트(초기엔 단순 나열)

  - Header: 로고(yowu.dev 링크) + 타이틀(`tools.yowu.dev`)
  - **즐겨찾기 섹션** (v1.1.0 추가): 즐겨찾기로 등록한 도구 목록 (별 아이콘으로 등록/해제)
  - **최근 사용한 도구 섹션** (v1.1.0 추가): 최근 사용한 도구 목록 (최대 5개, 시간순 정렬)
  - 전체 툴 리스트: 모든 도구 목록
  - 툴이 많아질 경우를 대비해 **카테고리 필드**를 모델에 포함(현재 UI에서는 미사용 가능)
  - Footer: 테마 토글(Light/System/Dark)
  - 이스터에그: "More coming soon..." 뱃지 (툴 목록 하단)

- Main Area: 선택된 툴 페이지
- Top Bar(모바일 포함):

  - 좌측: 햄버거(모바일에서 Sidebar 오픈)
  - 중앙: 툴 제목
  - 우측: 검색(옵션), 테마 토글, "Share" 버튼, GitHub 링크

### 4.2 반응형 규칙

- Desktop: Sidebar 고정(좌측), 메인 2열(입력/출력) 기본
- Mobile:

  - Sidebar는 Drawer
  - 툴 페이지는 **세로 스택(입력 → 출력)**, Diff는 탭(Left/Right/Result) 또는 간소화 뷰 제공

### 4.3 그룹별 Width 전략 (v1.1 추가)

- **Wide Group** (`max-w-[90rem]`): 좌우 분할 뷰가 핵심인 도구들
  - JSON Viewer, YAML Converter, Text Diff
- **Medium Group** (`max-w-5xl`): 텍스트 입력이 주가 되지만 상하 배치인 도구들
  - URL Encoder, Base64 Converter
- **Narrow Group** (`max-w-3xl`): 입력 폼이 단순한 도구들
  - Time Converter, Cron Parser

---

## 5. 공통 동작 규격 (모든 툴 공통)

### 5.1 툴 페이지 공통 UI 컴포넌트

- `ToolHeader`

  - Title, description(짧게), actions(Reset, Share, Copy Output 등)

- `ToolLayout`

  - 기본 2-pane(입력/출력) 레이아웃 제공

- `EditorPanel`

  - 입력/출력용 CodeMirror 래퍼

- `ActionBar`

  - 변환 실행, 스왑, 복사, 다운로드(필요 시)

- `ErrorBanner`

  - 파싱 에러/유효성 에러 표시 (line/column 있으면 포함)

### 5.2 상태 저장/복원 (localStorage)

- 저장 정책: **입력 변경 시 debounce 300ms** 후 저장
- Key 규칙:

  - 전역: `yowu-devtools:v1:app`
  - 툴별: `yowu-devtools:v1:tool:<toolId>`

- 저장 데이터(툴별):

  - `state`: 각 툴 입력/옵션
  - `updatedAt`: epoch ms

- 복원 우선순위:

  1. URL 공유 파라미터(d)가 있으면 그것을 최우선 적용
  2. 없으면 localStorage 복원
  3. 없으면 툴 기본값

### 5.3 URL 공유(입력 포함) 규격

#### 5.3.1 기본 구조

- URL 형태(권장):

  - `/#/<toolId>?d=<payload>`

- payload 내용(공통 envelope):

```json
{
  "v": 1,
  "tool": "json",
  "state": { "...tool specific..." }
}
```

- 인코딩 규칙:

  - `payloadJson` → `LZString.compressToEncodedURIComponent(payloadJson)` → `d`
  - **항상 압축 사용**: URL 길이 제한 완화를 위해 `lz-string` 압축을 기본으로 사용

- 디코딩 실패 시:

  - 사용자에게 "공유 링크가 손상되었거나 버전이 맞지 않습니다" 안내
  - 툴 기본 상태로 fallback

#### 5.3.2 Payload 최적화 전략 (v1.3 추가)

> **목적**: URL 길이를 최소화하여 브라우저/메신저 제한을 피하고, 공유 링크의 실용성을 높임

- **필터링 원칙**:

  - 공유에 **필요한 필드만** 포함
  - UI 전용 상태(예: 검색어, 스크롤 위치)는 제외
  - 계산된 값(예: 파싱 결과, 변환 결과)은 제외
  - 사용자 입력과 설정 옵션만 포함

- **구현 방식**:

  - `useToolState` 훅에 선택적 `shareStateFilter` 옵션 제공
  - 필터 함수가 제공되면 공유 시 필터링된 state만 직렬화
  - 필터가 없으면 전체 state 직렬화 (하위 호환성 유지)

- **도구별 필터링 전략**:

  | 도구 | 포함 필드 | 제외 필드 | 이유 |
  |------|----------|----------|------|
  | JSON | `input`, `indent`, `sortKeys`, `viewMode`, `expandLevel` | `search` | 검색어는 UI 전용 상태 |
  | YAML | `source`, `direction`, `indent` | 없음 | 모든 필드가 공유에 필요 |
  | Diff | `left`, `right`, `view`, `ignoreWhitespace`, `ignoreCase` | 없음 | 모든 필드가 공유에 필요 |
  | Base64 | `input`, `mode`, `urlSafe` | 없음 | 모든 필드가 공유에 필요 |
  | URL | `input`, `mode`, `plusForSpace` | 없음 | 모든 필드가 공유에 필요 |
  | Time | `epochInput`, `epochUnit`, `isoInput`, `timezone` | 없음 | 모든 필드가 공유에 필요 (작은 데이터) |
  | Cron | `expression`, `hasSeconds`, `timezone`, `nextCount` | 없음 | 모든 필드가 공유에 필요 (작은 데이터) |

- **구현 예시**:

```typescript
// JSON 도구 예시: search 필드 제외
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
      // search 필드는 제외 (UI 전용)
    }),
  }
);

// YAML 도구 예시: 필터 없음 (모든 필드 필요)
const { state, shareState } = useToolState<YamlToolState>(
  'yaml',
  DEFAULT_STATE
  // 필터 없음 = 모든 필드 포함
);
```

- **URL 길이 제한 고려사항**:

  - 브라우저 URL 길이 제한: 일반적으로 2,000~8,000자
  - 메신저/이메일 공유: 일부 플랫폼은 더 짧은 제한 적용
  - **권장**: 압축 후 1,500자 이하를 목표로 필터링
  - 큰 입력값이 있는 도구(JSON, YAML, Diff 등)는 필터링으로도 URL이 길 수 있으나, 압축으로 완화

- **검증 방법**:

  - 각 도구에서 "Share" 버튼 클릭 후 생성된 URL 길이 확인
  - 공유 링크를 새 탭에서 열어 상태가 정확히 복원되는지 확인
  - 필터링된 필드가 제외되었는지 확인 (예: JSON의 `search` 필드)

> **중요**: 
> - URL 길이 제한이 브라우저/메신저마다 다르므로, v1부터 `lz-string` 기반 "압축 공유"를 기본으로 사용
> - 필터링은 선택적이지만, URL 길이 최적화를 위해 권장됨
> - 신규 도구 추가 시 필터링 필요성을 평가하고, UI 전용 상태는 반드시 제외

### 5.4 테마 정책

- 기본: `prefers-color-scheme`를 따라감 (System)
- 사용자 설정: `System | Light | Dark` 3-state 토글 권장
- 저장: `yowu-devtools:v1:app.theme = "system"|"light"|"dark"`

### 5.5 키보드 단축키 (최소 세트)

- 전역

  - `Ctrl/Cmd + K`: 툴 검색/빠른 이동(간단한 커맨드 팔레트)
  - `Ctrl/Cmd + /`: 현재 툴 도움말 토글(옵션)

- 툴 공통(가능한 툴에 적용)

  - `Ctrl/Cmd + Enter`: 변환/실행
  - `Ctrl/Cmd + Shift + C`: 출력 복사
  - `Esc`: 모달/팔레트 닫기

### 5.6 UX 정책 (v1.1 추가)

- **Real-time Conversion**: 입력 변경 시 300~500ms Debounce 후 자동 변환 시도 (URL, Base64, JSON 등)
- **Toast 알림**: 복사 성공, 변환 에러 등은 `sonner` Toast로 알림
- **Validation 힌트**: 입력창 테두리 색상(Red/Green)으로 유효성 힌트 제공 (JSON 등)
- **동적 타이틀**: 페이지 진입 시 `document.title` 업데이트 (`{ToolName} - tools.yowu.dev`)

### 5.7 Tooltip 정책 (v1.2 추가)

- **공통 Tooltip 컴포넌트**: 모든 도구에서 일관된 tooltip UI 제공
  - 컴포넌트: `src/components/ui/Tooltip.tsx` (공통 Tooltip 래퍼)
  - 컴포넌트: `src/components/ui/OptionLabel.tsx` (라벨 + Info 아이콘 + Tooltip 조합)
- **사용 규칙**:
  - 결과에 영향을 주는 옵션(label) 옆에 Info 아이콘 표시
  - 마우스 오버 시 해당 옵션의 역할을 설명하는 tooltip 표시
  - Tooltip은 화면 경계를 자동 감지하여 위/아래 위치 자동 조정
  - 최대 너비: `max-w-lg` (512px), 내용에 맞게 자동 조정
  - 다크 모드 지원 (배경: `bg-gray-900 dark:bg-gray-700`)
- **적용 대상**: 모든 도구의 옵션 라벨 (Indent, Sort keys, Tree Depth, Ignore Whitespace, Ignore Case, URL Safe, Use + for spaces, Include seconds field, Timezone, Next runs 등)

### 5.8 사이드바 고도화 (v1.1.0 추가)

#### 즐겨찾기 기능

- **저장 위치**: `yowu-devtools:v1:app:favorites` (localStorage)
- **데이터 형식**: `string[]` (도구 ID 배열)
- **기능**:
  - 각 도구 메뉴 항목에 별 아이콘 표시
  - 별 아이콘 클릭 시 즐겨찾기 추가/제거
  - 즐겨찾기로 등록된 도구는 사이드바 상단에 별도 섹션으로 표시
  - 즐겨찾기 순서는 등록 순서 유지

#### 최근 사용한 도구 기능

- **저장 위치**: `yowu-devtools:v1:app:recentTools` (localStorage)
- **데이터 형식**: `Array<{ toolId: string; timestamp: number }>` (최대 5개)
- **기능**:
  - 도구 페이지 진입 시 자동으로 기록
  - 최근 사용한 순서대로 표시 (최신이 상단)
  - 중복 방지: 같은 도구를 다시 사용하면 기존 항목을 제거하고 최상단에 추가
  - 최대 5개까지만 유지 (오래된 항목 자동 삭제)
  - 즐겨찾기와 중복 표시 가능 (즐겨찾기 섹션과 최근 사용 섹션 모두에 표시 가능)

### 5.9 Web App 지원 (v1.1.0 추가)

#### Manifest.json

- **파일 위치**: `public/manifest.json`
- **기능**:
  - Chrome/Edge 브라우저에서 "앱으로 설치" 가능
  - 독립 창으로 실행 가능
  - 앱 아이콘 및 이름 설정
  - 시작 URL 설정 (`/`)
  - 테마 색상 설정 (다크 모드 지원)

#### 설치 방법

- Chrome/Edge에서 사이트 방문 시 주소창에 설치 아이콘 표시
- 또는 Chrome 메뉴 → "도구" → "확장 프로그램" → "앱"에서 설치
- 설치 후 `chrome://apps`에서 실행 가능

#### Service Worker 오프라인 캐싱 (선택사항)

**목적**: 네트워크 장애나 GitHub Pages 다운 시에도 앱이 동작하도록 정적 파일 캐싱

**캐시 전략**:

- **Cache First**: 정적 자산 (JS, CSS, 이미지) - 오래된 캐시라도 사용
- **Network First with Fallback**: HTML 파일 - 네트워크 우선, 실패 시 캐시 사용
- **캐시 만료 시간**: 설정 가능 (예: 7일, 30일)

**구현 예시**:

```typescript
// public/sw.js (Service Worker)
const CACHE_NAME = 'tools-yowu-dev-v1.1.0';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7일

// 설치 시 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        // 정적 자산 목록
      ]);
    })
  );
});

// 요청 처리 (Network First 전략)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 네트워크 성공 시 캐시 업데이트
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 제공
        return caches.match(event.request).then((response) => {
          if (response) {
            // 캐시 만료 확인
            const cacheDate = response.headers.get('sw-cache-date');
            if (cacheDate && Date.now() - parseInt(cacheDate) < CACHE_EXPIRY) {
              return response;
            }
          }
          // 캐시도 없으면 오프라인 페이지
          return caches.match('/offline.html');
        });
      })
  );
});
```

**등록 방법**:

```typescript
// src/main.tsx 또는 App.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
```

**주의사항**:

- Service Worker는 HTTPS 또는 localhost에서만 동작
- 캐시 무효화를 위해 버전 관리 필요 (`CACHE_NAME`에 버전 포함)
- 사용자에게 캐시 정리 옵션 제공 고려
- 캐시 크기 제한 고려 (브라우저별 다름, 보통 50MB~1GB)

### 5.10 Web Worker 성능 최적화 (v1.1.0 추가)

#### 적용 대상

- 큰 데이터 처리 시 UI 프리징 방지
- 주요 적용 도구:
  - JSON Viewer: 큰 JSON 파싱 (예: 1MB 이상)
  - Text Diff: 큰 텍스트 비교 (예: 10,000줄 이상)
  - YAML Converter: 큰 YAML 파일 변환

#### 구현 전략

- **자동 감지**: 입력 크기나 줄 수를 기준으로 자동으로 Worker 사용 결정
- **폴백**: Worker를 지원하지 않는 환경에서는 메인 스레드에서 처리
- **로딩 인디케이터**: Worker 처리 중에는 로딩 상태 표시
- **에러 처리**: Worker 내부 에러를 메인 스레드로 전달하여 표시

#### Worker 파일 구조

```
src/
  workers/
    json-parser.worker.ts    # JSON 파싱 Worker
    diff-calculator.worker.ts # Diff 계산 Worker
    yaml-converter.worker.ts  # YAML 변환 Worker
```

---

## 6. 성능/최적화 요구사항 (NFR)

### 6.1 목표

- 초기 로딩(캐시 후)에서 **즉시 조작 가능** 체감
- 입력이 커져도 UI가 버벅이지 않도록(특히 JSON/DIFF)

### 6.2 구체 요구사항

- NFR-01: 입력 파싱/변환 중에도 UI가 멈추지 않도록 노력
- NFR-02: 큰 입력(예: 수 MB)에서 에디터/렌더가 과도하게 느려지지 않게 방어 로직 제공
- NFR-03: 무거운 연산(대형 JSON 파싱, 대형 diff 계산)은 **Web Worker 옵션** 제공 (v1.1.0 구현 완료)

> Web Worker 설명(사용자 이해용): 브라우저에서 **별도 스레드**로 계산을 돌려 UI를 멈추지 않게 하는 기능. v1.1.0부터 큰 입력일 때 자동으로 Worker 사용하여 UI 프리징을 방지합니다.

---

## 7. 툴별 상세 요구사항

### 7.1 JSON Pretty Viewer (`toolId: json`)

#### 목적

- JSON 텍스트를 보기 좋게 포맷 + 트리 탐색 + 검색 + 복사 편의

#### 입력/상태

```ts
type JsonToolState = {
  input: string;
  viewMode: 'tree' | 'code' | 'split'; // 기본 split
  indent: 2 | 4; // 기본 2
  sortKeys: boolean; // 기본 false
  expandLevel: number; // 기본 2 (tree)
  search: string; // 기본 "" - UI 전용 상태 (URL 공유 시 제외)
};
```

#### 기능 요구사항

- FR-J-01: `input` 파싱 성공 시

  - Code View: pretty JSON 출력
  - Tree View: object/array를 접기/펼치기 가능한 트리로 표시

- FR-J-02: 파싱 실패 시

  - ErrorBanner에 메시지 + 가능하면 line/column 표시

- FR-J-03: 검색

  - key/value 매칭, 하이라이트, 다음/이전 이동

- FR-J-04: 복사

  - "Copy Pretty", "Copy Minified"
  - 트리 노드에서 "Copy JSONPath", "Copy Value"

- FR-J-05: UX

  - input 변경 시 자동으로 결과 갱신(기본), 단 대형 입력이면 "Apply" 버튼 모드로 전환 가능(옵션)
  - **Sample Data 로드 버튼** 제공 (v1.1 추가)

- AC(수용 기준)

  - 유효 JSON을 붙여넣으면 1초 내(일반 크기) 트리/코드가 표시
  - 에러는 사용자에게 이해 가능한 형태로 표시
  - 복사 기능이 실제 클립보드에 들어감

---

### 7.2 URL Encode/Decode (`toolId: url`)

#### 상태

```ts
type UrlToolState = {
  input: string;
  mode: 'encode' | 'decode'; // 기본 encode
  plusForSpace: boolean; // 기본 false
};
```

#### 기능

- FR-U-01: Encode: `encodeURIComponent` 기반
- FR-U-02: Decode: `decodeURIComponent`, 실패 시 에러 표시
- FR-U-03: 옵션 `plusForSpace=true`일 때

  - encode 시 공백을 `+`로, decode 시 `+`를 공백으로 처리(쿼리스트링 친화)

- FR-U-04: Copy Output
- FR-U-05: **실시간 자동 변환** (v1.1 추가)
- FR-U-06: **Input ↔ Output Swap 버튼** (v1.1 추가)
- AC

  - 모드 전환 시 동일 입력으로 즉시 결과가 업데이트
  - decode 실패 시 앱이 죽지 않고 에러 배너 표시

---

### 7.3 Base64 Encode/Decode (`toolId: base64`)

#### 상태

```ts
type Base64ToolState = {
  input: string;
  mode: 'encode' | 'decode'; // 기본 encode
  urlSafe: boolean; // 기본 false (base64url)
};
```

#### 기능

- FR-B-01: UTF-8 안전 인코딩/디코딩(TextEncoder/TextDecoder 사용)
- FR-B-02: urlSafe 옵션 시 `+ / =`를 URL-safe 형태로 변환
- FR-B-03: decode 실패 시 에러 표시
- FR-B-04: **실시간 자동 변환** (v1.1 추가)
- FR-B-05: **Input ↔ Output Swap 버튼** (v1.1 추가)
- AC

  - 한글 포함 문자열도 깨지지 않음(UTF-8 보장)

---

### 7.4 Epoch/ISO 변환 (`toolId: time`)

#### 상태

```ts
type TimeToolState = {
  epochInput: string; // 숫자 문자열
  epochUnit: 'ms' | 's'; // 기본 ms
  isoInput: string; // ISO 문자열
  timezone: 'local' | 'utc'; // 기본 local
};
```

#### 기능

- FR-T-01: Epoch → ISO 변환
- FR-T-02: ISO → Epoch 변환
- FR-T-03: "Now" 버튼: 현재 시각을 epoch/iso에 즉시 반영
- FR-T-04: timezone 토글에 따라 표시/해석 기준 변경
- FR-T-05: **실시간 자동 변환** (v1.1 추가)
- AC

  - ms/s 혼동이 적도록 UI에 라벨 명확히 표시

---

### 7.5 YAML ↔ JSON (`toolId: yamljson`)

#### 상태

```ts
type YamlJsonToolState = {
  input: string;
  direction: 'yamlToJson' | 'jsonToYaml'; // 기본 yamlToJson
  indent: 2 | 4; // 기본 2
};
```

#### 기능

- FR-Y-01: YAML → JSON 변환(파싱 실패 시 line/col 표시)
- FR-Y-02: JSON → YAML 변환(JSON 파싱 실패 처리)
- FR-Y-03: 결과 pretty 출력
- AC

  - 에러 메시지에 최소한 "어느 줄에서 실패"가 포함

---

### 7.6 Text Diff (`toolId: diff`)

#### 상태

```ts
type DiffToolState = {
  left: string;
  right: string;
  view: 'side' | 'unified'; // 기본 side(데스크탑), 모바일은 자동 탭
  ignoreWhitespace: boolean; // 기본 false
  ignoreCase: boolean; // 기본 false
};
```

#### 기능

- FR-D-01: diff 계산 후 변경 구간 하이라이트
- FR-D-02: side-by-side / unified 전환
- FR-D-03: 옵션(공백/대소문자 무시) 적용
- FR-D-04: Copy unified result (옵션)
- 모바일 UX

  - FR-D-M-01: 모바일에서는 `Left | Right | Diff` 탭 제공

- AC

  - 짧은 텍스트는 즉시, 긴 텍스트는 0.5~2초 내(환경차) 표시 + 로딩 인디케이터

---

### 7.7 CRON 표현식 (`toolId: cron`)

#### 상태

```ts
type CronToolState = {
  expression: string;
  hasSeconds: boolean; // 기본 false(5필드), true면 6필드
  timezone: 'local' | 'utc';
  nextCount: 10 | 20; // 기본 10
};
```

#### 기능

- FR-C-01: 유효성 검증(필드 수/범위)
- FR-C-02: 사람 읽는 설명 제공(가능하면 한글)
- FR-C-03: 다음 실행 시각 N개 출력
- FR-C-04: 잘못된 cron이면 에러 배너 + 예시 제공
- AC

  - `*/5 * * * *` 같은 표현에서 다음 실행이 실제로 리스트업 됨

---

### 7.8 JWT Encode/Decode (`toolId: jwt`) (v1.1.0 추가)

#### 상태

```ts
type JwtToolState = {
  token: string;
  mode: 'decode' | 'encode'; // 기본 decode
};
```

#### 기능

- FR-JWT-01: JWT 토큰 디코딩 (Header, Payload, Signature 분리 표시)
- FR-JWT-02: Base64 URL 디코딩된 Header/Payload를 JSON 형태로 표시
- FR-JWT-03: JWT 인코딩 (Header + Payload → 토큰 생성, Signature는 옵션)
- FR-JWT-04: 디코딩 실패 시 에러 배너 표시
- FR-JWT-05: **주의**: 검증 기능은 제공하지 않음 (디코딩/인코딩만 제공)
- AC

  - 유효한 JWT 토큰을 붙여넣으면 Header, Payload가 즉시 표시됨
  - Base64 URL 디코딩 오류 시 명확한 에러 메시지 제공

---

## 8. 확장성 설계 (신규 툴 추가가 쉬운 구조)

### 8.1 Tool 플러그인 계약(인터페이스)

```ts
export type ToolDefinition<TState> = {
  id: string; // route/toolId
  title: string;
  description: string;
  icon?: ReactNode;
  category?: string; // 미래 대비
  route: string; // "/json" 형태 (HashRouter 기준)
  defaultState: TState;

  // URL 공유/복원
  encodeState: (state: TState) => unknown; // JSON-safe
  decodeState: (raw: any) => TState; // validation 포함

  // React page
  Component: React.FC;
};
```

### 8.2 도구 등록 방식

- `src/tools/index.ts`에 tool registry 배열만 추가하면:

  - Sidebar 자동 노출
  - 라우팅 자동 생성
  - Share/Restore/localStorage 키 자동 구성

### 8.3 신규 툴 개발 체크리스트(DoD)

- defaultState 정의
- encode/decode + 간단 validation(스키마)
- 모바일 레이아웃 포함
- 최소 단축키 연결(Cmd/Ctrl+Enter, Copy)
- localStorage 저장/복원 동작 확인
- 공유 링크 재현 확인
- **URL 공유 최적화** (권장):
  - `shareStateFilter` 옵션 평가: UI 전용 상태(검색어, 스크롤 위치 등)는 제외
  - 공유에 필요한 필드만 포함하도록 필터 함수 정의
  - 생성된 URL 길이 확인 (압축 후 1,500자 이하 권장)
  - 공유 링크로 상태가 정확히 복원되는지 검증
- **SEO 최적화** (필수):
  - `vite-plugin-generate-routes.ts`의 `tools` 배열에 도구 정보 추가
  - `seoDescription`: 150-160자, 주요 기능 포함, 프라이버시 강조
  - `keywords`: 5-10개, 검색 가능성 높은 키워드
  - `features`: 5-7개, 핵심 기능 목록
  - 빌드 후 `dist/{tool-path}/index.html`에서 메타 태그 확인
  - `dist/sitemap.xml`에 새 경로 추가 확인

---

## 9. 보안/프라이버시

- PR-01: 사용자 입력 데이터는 **외부로 전송하지 않음**
- PR-02: Analytics/Tracking 없음
- PR-03: URL 공유는 사용자가 명시적으로 "Share"를 눌렀을 때만 생성
- PR-04: localStorage에 저장된 데이터는 브라우저 내에만 존재(암호화는 v1 범위 밖, 단 안내 문구 가능)

---

## 10. 배포( GitHub Pages + tools.yowu.dev )

### 10.1 GitHub Actions 파이프라인(권장)

- on: push to main
- steps:

  - install → lint → typecheck → test → build
  - `dist/`를 GitHub Pages에 배포
  - CNAME 파일에 `tools.yowu.dev` 포함

### 10.2 커스텀 도메인

- GitHub Pages 설정: Custom domain `tools.yowu.dev`
- DNS:

  - A/AAAA 또는 CNAME 구성(운영 방식에 맞게)

- 라우팅:

  - BrowserRouter 사용, 빌드 시 각 라우트별 HTML 파일 자동 생성
  - `404.html`이 SPA 라우팅을 처리하여 직접 URL 접근 시 React 앱으로 리다이렉트
  - 각 도구 페이지가 검색 엔진에 별도 페이지로 인덱싱됨

### 10.3 SEO 최적화

- 빌드 시 자동 생성되는 파일:
  - 각 도구별 HTML 파일 (`/json/index.html`, `/diff/index.html` 등)
  - 각 HTML에 도구별 메타 태그 포함 (title, description, Open Graph, Twitter Card)
  - `sitemap.xml`: 모든 페이지를 검색 엔진에 알림
  - `robots.txt`: 검색 엔진 크롤링 허용 및 sitemap 위치 지정
- Vite 플러그인: `vite-plugin-generate-routes.ts`가 빌드 후 자동으로 라우트 HTML 생성

#### 신규 도구 추가 시 SEO 최적화 필수 사항

신규 도구를 추가할 때는 반드시 `vite-plugin-generate-routes.ts`의 `tools` 배열에 다음 정보를 포함해야 합니다:

1. **필수 필드**:

   - `id`: 도구 식별자 (소문자, 하이픈 사용)
   - `path`: 라우트 경로 (`/tool-name` 형식)
   - `title`: 도구 이름
   - `description`: 짧은 설명
   - `seoDescription`: SEO 최적화된 상세 설명 (150-160자 권장)
   - `keywords`: 검색 키워드 배열 (5-10개 권장)
   - `features`: 주요 기능 목록 (5-7개 권장)

2. **SEO 설명 작성 원칙**:

   - "Free" 또는 "Free online"으로 시작
   - 주요 기능을 간결하게 나열
   - "All processing happens in your browser" 등 프라이버시 강조
   - 150-160자 이내로 작성

3. **키워드 선택 원칙**:

   - 사용자 검색 패턴 고려
   - 동의어 및 변형어 포함
   - 자연스러운 키워드 사용 (스터핑 방지)

4. **자동 생성되는 SEO 요소**:

   - Title 태그: `{title} - tools.yowu.dev`
   - Meta description, keywords
   - Canonical URL
   - Open Graph 태그 (og:title, og:description, og:url, og:image)
   - Twitter Card 태그
   - JSON-LD 구조화된 데이터 (WebApplication 스키마)

5. **검증**:
   - `npm run build` 실행 후 `dist/{tool-path}/index.html` 확인
   - `dist/sitemap.xml`에 새 경로 추가 확인
   - 메타 태그가 올바르게 생성되었는지 확인

자세한 가이드는 `AGENTS.md`의 "SEO 최적화 가이드" 섹션을 참조하세요.

---

## 11. 테스트/품질

- Lint: ESLint
- Format: Prettier
- Typecheck: `tsc --noEmit`
- Unit: Vitest (유틸 함수: base64url, lz encode/decode, cron parse wrapper 등)
- E2E(선택): Playwright

  - 시나리오:

    - 공유 링크 생성 → 새 탭에서 열면 상태 재현
    - localStorage 복원 동작
    - 테마 토글 유지

---

## 12. v1 구현 우선순위(추천)

1. 앱 골격(레이아웃/라우팅/툴 레지스트리/테마/localStorage/share)
2. JSON Viewer
3. URL / Base64
4. Time / YAML↔JSON
5. Diff / CRON
6. 단축키/모바일 마감

---

## 13. 향후 추가하기 좋은 도구 Backlog(참고)

- ~~JWT 디코더(검증 X, payload 표시)~~ ✅ v1.1.0에서 구현 완료
- UUID v4/v7 생성기
- QueryString ↔ JSON
- Hash(SHA-256) 생성기("보안용 아님" 안내 포함)
- JSONPath 테스트
- Regex Tester
- HTML/JSON minify
- Case Converter

---

## 14. 변경 이력

- **v1.1.0** (2024-12-14):

  - **사이드바 고도화** ✅:
    - 최근 사용한 도구 리스트 추가 (최대 5개, localStorage 기반)
    - 즐겨찾기 리스트 및 메뉴 즐겨찾기 등록 기능 추가 (localStorage 기반)
    - 사이드바 UI 개선: 즐겨찾기/최근 사용 섹션 분리
    - `useRecentTools`, `useFavorites` 훅 구현 완료
  - **Web App 지원** ✅:
    - `vite-plugin-pwa` 도입으로 PWA 기능 완전 지원
    - `manifest.json` 자동 생성 (Chrome 앱으로 등록 가능)
    - 독립 창으로 실행 가능 (`standalone` 모드)
    - 앱 아이콘 및 테마 색상 설정 완료
    - Service Worker 기반 오프라인 캐싱 구현
    - 자동 업데이트 알림 및 설치 프롬프트
    - 오프라인 폴백 페이지 추가
    - `usePWA` 훅 및 `PWAUpdatePrompt` 컴포넌트 구현
  - **신규 도구 추가** ✅:
    - JWT Encode/Decode 도구 추가
    - JWT 디코딩: Header, Payload, Signature 분리 및 표시
    - JWT 인코딩: Header/Payload JSON 입력 및 HMAC 서명 지원
    - 서명 검증 기능 (HMAC, RSA, ECDSA)
    - 토큰 유효성 검사 (만료 시간 확인)
  - **성능 개선** ✅:
    - 큰 데이터 처리 시 Web Worker 도입으로 UI 프리징 방지
    - JSON 파싱: 1MB 이상 또는 10,000줄 이상 시 자동 Worker 사용
    - Diff 계산: 10,000줄 이상 시 자동 Worker 사용
    - YAML 변환: 큰 파일 처리 시 자동 Worker 사용
    - `useWebWorker` 공통 훅 구현으로 코드 재사용성 향상
    - 로딩 인디케이터 추가

- **v1.3** (2025-01-XX):

  - URL 공유 기능 최적화: `shareStateFilter` 옵션 추가
  - JSON 도구: `search` 필드 제외하여 URL 길이 최적화
  - 각 도구별 필터링 전략 문서화
  - URL 길이 제한 고려사항 및 검증 방법 추가

- **v1.2** (2025-01-XX):

  - HashRouter → BrowserRouter 변경으로 SEO 최적화
  - 빌드 시 각 도구별 HTML 파일 자동 생성
  - 각 도구 페이지에 맞춤 메타 태그 자동 생성
  - `sitemap.xml` 및 `robots.txt` 자동 생성
  - `404.html`을 통한 SPA 라우팅 지원
  - 다크 모드 완전 지원 (모든 컴포넌트 및 도구)

- **v1.1** (2025-12-14):

  - 사이드바 UI 개선: 로고(yowu.dev) 추가, GitHub 링크 위치 변경, 이스터에그 뱃지 추가
  - UX 강화: Toast 알림(`sonner`), 실시간 변환, 동적 타이틀, 그룹별 Width 전략 적용
  - 프로젝트명 변경: `yowu-devtools` → `tools.yowu.dev`

- **v1.0.0** (2025-01-XX):
  - 초기 릴리스: Phase 0~3 완료
  - 7개 핵심 도구 구현 완료 (JSON Viewer, URL Encoder, Base64 Converter, Time Converter, YAML Converter, Text Diff, Cron Parser)
  - 공통 기능 구현: 상태 저장/복원, URL 공유, 테마 지원, Toast 알림
  - CI/CD 및 GitHub Pages 배포 설정 완료
  - SEO 최적화: BrowserRouter, 도구별 HTML 파일 생성, sitemap.xml, robots.txt
