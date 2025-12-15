아래 문서는 **AI Agent(또는 개발자)가 바로 구현을 시작할 수 있는 수준**으로 작성한 **SRS(Software Requirements Specification)** 초안입니다. 그대로 리포지토리의 `docs/SRS.md`로 넣어도 됩니다.

---

# tools.yowu.dev SRS (v1.3.2)

## 0. 문서 메타

- 프로젝트명: **tools.yowu.dev** (구 yowu-devtools)
- 현재 버전: **v1.3.1** (Code Quality & Bug Fixes)
- 다음 버전: **v1.3.2** (Cron Parser Advanced) - 🚧 개발 예정
- 목적: 개발자가 자주 쓰는 변환/검증/뷰어 도구를 **서버 없이** 하나의 **정적 웹앱**으로 제공
- 배포: **GitHub Pages + Custom Domain (`tools.yowu.dev`)**
- 변경 이력: **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** 참조
- 핵심 원칙:

  1. **자주 쓰는 도구 몇 개를 아주 잘**
  2. **새 도구 추가가 쉬운 구조(플러그인/모듈형)**
  3. **데이터는 로컬 처리(외부 전송 없음)**
  4. **모바일 대응 + 미니멀 UI + 빠른 체감 성능**
  5. **URL 공유(입력 데이터 포함, base64 기반) + 로컬스토리지 자동 복원**
  6. **기능/UX가 바뀌면 README, AGENTS, SAS 등 모든 문서를 즉시 확인·갱신해 최신 상태를 유지**
  7. **다국어 지원(i18n)**: 영어, 한국어, 일본어, 중국어, 스페인어

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
9. Query String Parser (v1.2.0 추가)
10. Hash/HMAC Generator (v1.2.0 추가, v1.2.1 고도화)
11. Regex Tester (v1.2.1 추가)

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
- US-17: 키보드만으로 도구를 빠르게 찾고 이동하고 싶다. (v1.2.0)
- US-18: 파일을 드래그 앤 드롭하거나 선택해서 바로 열고 싶다. (v1.2.0)
- US-19: 변환 결과를 파일로 다운로드하고 싶다. (v1.2.0)
- US-20: 공유 링크에 어떤 데이터가 포함되는지 명확히 알고 싶다. (v1.2.0)
- US-21: 모바일에서 공유 링크를 쉽게 공유하고 싶다. (v1.2.0)
- US-22: 앱 버전을 확인하고 싶다. (v1.2.0)
- US-23: 문자열의 해시값(SHA-256 등)을 계산하고 싶다. (v1.2.0)
- US-24: UUID나 ULID를 빠르게 생성하고 싶다. (v1.2.0)
- US-26: 복잡한 query string이 포함된 URL의 구조와 파라미터를 구조 분해해서 알아보기 쉽게 보고 싶다. (v1.2.0)

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
  - **최근 사용한 도구 섹션** (v1.1.0 추가): 최근 사용한 도구 목록 (최대 3개, 시간순 정렬)
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

## 5. i18n(국제화) 규격 (v1.3.0)

### 5.0 목표

- 기존 영어(en-US)만 제공하던 UI를 **한국어/일본어/중국어/스페인어**까지 확대
- 모든 사용자 노출 문자열을 **하드코딩 금지**하고 i18n 리소스에서만 참조
- 빌드 산출물에 **언어별 경로(prefix) + 툴별 경로**를 정적으로 생성하여 GitHub Pages에서 서버 없이 동작

### 5.0.1 지원 언어/로케일

- 기본(디폴트): `en-US`
- 추가: `ko-KR`, `ja-JP`, `zh-CN`, `es-ES`
- **지원 로케일 리스트는 단일 상수(`SUPPORTED_LOCALES`)로 관리** (라우팅/드롭다운/빌드 모두 이 값을 참조)

### 5.0.2 URL/라우팅 규칙

#### 경로 규칙(정적 파일 산출물)

- 영어(기본): `/{tool}/index.html`
  - 예: `/json/index.html`
- 한국어: `/{locale}/{tool}/index.html`
  - 예: `/ko-KR/json/index.html`
- 기타: `/{locale}/{tool}/index.html`

#### 런타임 라우팅 규칙

- 앱 라우트는 "(locale prefix) + (tool slug)" 구조를 지원
- **우선순위(중요)**:
  1. URL에 locale prefix가 있으면 그 값을 최우선 사용
  2. 없으면 localStorage의 `yowu.devtools.locale` 사용
  3. 없으면 `navigator.language`(가능하면 best match)
  4. 최종 fallback은 `en-US`

> 기존이 BrowserRouter 기반이므로(해시 라우팅 X) 위 구조를 **라우트 생성/프리렌더 단계**에서 함께 확장하는 전략을 사용합니다.

### 5.0.3 i18n 리소스(문자열) 구조

#### 디렉토리/파일

- `src/i18n/`
  - `en-US.ts` (또는 `.json`)
  - `ko-KR.ts`
  - `ja-JP.ts`
  - `zh-CN.ts`
  - `es-ES.ts`

#### 키 정책

- 키는 **안정적인 식별자**로 작성 (문장 자체를 키로 쓰지 않음)
- 권장 네임스페이스 예시:
  - `common.*` (Copy, Paste, Clear, Error 등)
  - `sidebar.*` (Favorites, Recent 등)
  - `tool.{slug}.*` (각 도구별 제목/설명/placeholder/validation 메시지)
  - `meta.{slug}.title`, `meta.{slug}.description` (SEO 메타)

#### 타입/정합성(강력 권장)

- `en-US`를 **소스 오브 트루스**로 두고,
- 빌드/테스트 단계에서 **다른 로케일 파일이 동일 키를 모두 보유**하는지 검증(누락/오타 방지)
- 누락 키는 런타임에서 `en-US`로 fallback (또는 개발 환경에서 경고)

### 5.0.4 프론트엔드 사용 방식(필수)

- UI에서 문자열을 노출할 때:
  - **직접 문자열 리터럴 금지**
  - `t('common.copy')` 또는 `I18N.common.copy` 형태의 단일 진입점만 허용
- "AI Agent 작업 규칙":
  - 새 UI 요소 추가 시: **모든 로케일 파일에 키를 동시에 추가**하고, 기본값은 en-US 기준으로 먼저 채움
  - 번역이 확정되지 않은 언어는 임시로 en-US 값을 복사해도 되지만(빌드 실패 방지), TODO 태그로 추적

### 5.0.5 언어 선택 UI/UX

- 위치: 헤더 또는 설정(테마 토글 근처 권장)
- 동작:
  - 선택 즉시 **현재 보고 있는 tool slug 유지한 채 locale prefix만 변경**하여 이동
  - URL fragment(공유 payload)가 존재하면 **그대로 유지** (예: `#/...`가 아니라면 `location.hash` 보존)
- 저장:
  - localStorage key: `yowu.devtools.locale`
  - 값: `en-US | ko-KR | ja-JP | zh-CN | es-ES`

### 5.0.6 빌드/프리렌더(SSG) 요구사항

현재도 "툴별 HTML 생성"을 하고 있으므로, 이를 아래처럼 확장:

- 입력: `SUPPORTED_LOCALES × TOOL_ROUTES`
- 출력: 각 `(locale, tool)` 조합에 대해 정적 HTML 파일 생성
- 각 HTML에는 다음이 포함되어야 함:
  - `<html lang="ko-KR">` 등 locale에 맞는 lang 설정
  - 해당 locale의 meta title/description(OpenGraph/Twitter 포함) 적용(현재 SEO 구조 유지)
  - 초기 부팅 시 사용할 기본 locale 정보를 주입(예: 전역 변수/데이터 속성 등)

> 프리렌더는 "서버 없이 정적 호스팅 + 성능 이점"이 핵심이라, GitHub Pages 운영 철학과도 일치합니다.

### 5.0.7 PWA/manifest 관련(선택 + 권장)

- manifest에 `lang`를 명시하는 것은 표준적으로 가능
- 다만 manifest 멤버 자체도 브라우저 호환성이 제각각일 수 있으니, v1.3.0에서는 우선:
  - manifest는 기존처럼 유지(영문 중심)
  - UI 언어는 앱 내부 i18n으로 처리
  - (추가 고도화) locale별 `/ko-KR/manifest.webmanifest`를 생성해 `<link rel="manifest">`를 locale별 HTML에서 다르게 주는 방식 고려

### 5.0.8 테스트/검수(Definition of Done)

- [ ] 모든 툴 페이지에서 사용자 노출 문자열이 i18n을 통해서만 렌더링됨
- [ ] locale 변경 시 동일 tool 유지 + 입력 데이터/공유 hash 유지
- [ ] localStorage에 저장된 locale로 재진입 시 올바른 prefix로 랜딩
- [ ] 빌드 결과물에 `/ko-KR/...`, `/ja-JP/...` 등 디렉토리 및 각 tool의 `index.html`이 생성됨
- [ ] sitemap/robots가 **언어별 URL까지 포함**하도록 확장(현재 자동 생성 구조 유지)
- [ ] 누락 번역 키가 있을 경우: (선택) CI에서 실패 또는 개발 모드에서 명확한 경고

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

  | 도구   | 포함 필드                                                 | 제외 필드 | 이유                                  |
  | ------ | --------------------------------------------------------- | --------- | ------------------------------------- |
  | JSON   | `input`, `indent`, `sortKeys`, `viewMode`, `expandLevel`  | `search`  | 검색어는 UI 전용 상태                 |
  | YAML   | `source`, `direction`, `indent`                           | 없음      | 모든 필드가 공유에 필요               |
  | Diff   | `left`, `right`, `view`, `ignoreWhitespace`, `ignoreCase` | 없음      | 모든 필드가 공유에 필요               |
  | Base64 | `input`, `mode`, `urlSafe`                                | 없음      | 모든 필드가 공유에 필요               |
  | URL    | `input`, `mode`, `plusForSpace`                           | 없음      | 모든 필드가 공유에 필요               |
  | Time   | `epochInput`, `epochUnit`, `isoInput`, `timezone`         | 없음      | 모든 필드가 공유에 필요 (작은 데이터) |
  | Cron   | `expression`, `hasSeconds`, `timezone`, `nextCount`       | 없음      | 모든 필드가 공유에 필요 (작은 데이터) |

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
>
> - URL 길이 제한이 브라우저/메신저마다 다르므로, v1부터 `lz-string` 기반 "압축 공유"를 기본으로 사용
> - 필터링은 선택적이지만, URL 길이 최적화를 위해 권장됨
> - 신규 도구 추가 시 필터링 필요성을 평가하고, UI 전용 상태는 반드시 제외

### 5.4 테마 정책

- 기본: `prefers-color-scheme`를 따라감 (System)
- 사용자 설정: `System | Light | Dark` 3-state 토글 권장
- 저장: `yowu-devtools:v1:app.theme = "system"|"light"|"dark"`

### 5.5 키보드 단축키 (최소 세트)

- 전역

  - `Ctrl/Cmd + K`: **Command Palette 열기** (v1.2.0)
    - 도구 검색 및 빠른 이동
    - 즐겨찾기 토글, 최근 도구 접근 등 빠른 액션
    - ESC로 닫기
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
- **데이터 형식**: `Array<{ toolId: string; timestamp: number }>` (최대 3개)
- **기능**:
  - 도구 페이지 진입 시 자동으로 기록
  - 최근 사용한 순서대로 표시 (최신이 상단)
  - 중복 방지: 같은 도구를 다시 사용하면 기존 항목을 제거하고 최상단에 추가
  - 최대 3개까지만 유지 (오래된 항목 자동 삭제)
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
    navigator.serviceWorker
      .register('/sw.js')
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
- **응답 순서 보장** (v1.2.0): `requestId` 기반으로 연속 요청 시 최신 응답만 반영

#### Worker 파일 구조

```
src/
  workers/
    json-parser.worker.ts    # JSON 파싱 Worker
    diff-calculator.worker.ts # Diff 계산 Worker
    yaml-converter.worker.ts  # YAML 변환 Worker
```

### 5.11 Command Palette (v1.2.0 추가)

#### 목적

키보드만으로 도구를 빠르게 찾고 이동할 수 있는 UX 제공

#### 기능 요구사항

- **단축키**: `⌘K` (Mac) / `Ctrl+K` (Windows/Linux)
- **검색 기능**:
  - 도구 제목 기반 검색
  - 키워드 기반 검색 (Fuzzy search)
  - 실시간 필터링
- **빠른 액션**:
  - 엔터로 도구 이동
  - 즐겨찾기 토글 (선택적)
  - 최근 도구 접근
- **모바일 지원**: 상단 "Search" 버튼으로 동일 UI 제공

#### 구현 포인트

- `ToolDefinition`에 `keywords`, `category` 필드 추가
- 사이드바와 동일한 데이터 소스 재사용
- ESC로 닫기, 키보드 네비게이션 지원

### 5.12 파일 워크플로우 (v1.2.0 추가)

#### 목적

파일 기반 작업을 빠르게 수행할 수 있는 워크플로우 제공

#### 기능 요구사항

- **파일 열기**:
  - Drag & Drop 지원
  - 파일 선택 다이얼로그
  - 공통 컴포넌트로 모든 도구에 재사용 가능
- **파일 저장**:
  - 출력 다운로드 버튼
  - 파일 확장자 자동 감지 (`.json`, `.yml`, `.txt` 등)
- **성능**:
  - 큰 파일은 Worker로 처리
  - `requestId` 기반 응답 순서 보장 (연속 입력 시 결과 뒤섞임 방지)

#### 적용 도구

- JSON Viewer: `.json` 파일 열기/저장
- YAML Converter: `.yaml`, `.yml` 파일 열기/저장
- Text Diff: `.txt` 파일 열기/저장

### 5.13 공유(Share) 고도화 (v1.2.0 추가)

#### 목적

공유 링크의 안전성과 이해 가능성 향상

#### 기능 요구사항

- **공유 범위 표시**: 어떤 데이터가 공유되는지 명확히 표시
  - 입력만 공유 / 입력 + 옵션 공유 구분
- **Web Share API 지원**: 모바일에서 공유 시트 바로 열기
- **민감정보 경고**: JWT 등 민감한 도구는 기본적으로 payload 최소화
- **URL 스키마 버전 관리**: `#v=1&tool=json&payload=...` 형식으로 호환성 유지
- **저장 옵션**: LocalStorage 저장 데이터와 공유 데이터 분리 옵션 제공

#### 구현 포인트

- 공유 링크 생성 시 범위 표시 모달/토스트
- Web Share API 지원 (지원 브라우저에서만)
- 민감정보 경고 메시지 강화

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

#### 상태 (v1.3.2 고도화 예정)

```ts
type CronSpec =
  | 'auto'
  | 'unix'
  | 'unix-seconds'
  | 'quartz'
  | 'aws'
  | 'k8s'
  | 'jenkins';

type CronToolState = {
  expression: string;
  spec: CronSpec; // 기본 'auto' (v1.3.2)
  hasSeconds: boolean; // 기본 false(5필드), true면 6필드 - spec과 연동
  timezone: string; // 'local' | 'utc' | IANA TZ (예: 'Asia/Seoul')
  nextCount: 10 | 20 | 50; // 기본 10
  fromDateTime?: string; // 기준 시각 (기본 now) - v1.3.2
};
```

#### 기능 (기본)

- FR-C-01: 유효성 검증(필드 수/범위)
- FR-C-02: 사람 읽는 설명 제공(i18n, cronstrue 연동)
- FR-C-03: 다음 실행 시각 N개 출력
- FR-C-04: 잘못된 cron이면 에러 배너 + 예시 제공
- AC
  - `*/5 * * * *` 같은 표현에서 다음 실행이 실제로 리스트업 됨

#### v1.3.2 고도화 요구사항

##### 1) 지원 스펙(방언) 정의 + UI에서 선택/자동감지

**1-1. Spec/Profile 드롭다운 추가 (기본: Auto)**

현재 `Include seconds field` 체크박스 옆에 **Spec/Profile 드롭다운** 추가:

| Spec                   | 설명                            | 필드 수 | 특수 문법           |
| ---------------------- | ------------------------------- | ------- | ------------------- |
| **Auto** (권장)        | 입력을 보고 추정                | 5~7     | -                   |
| **UNIX/Vixie**         | 표준 5필드, DOM/DOW **OR 규칙** | 5       | -                   |
| **UNIX + Seconds**     | 초 필드 포함 변형               | 6       | -                   |
| **Quartz**             | 고급 연산자 지원                | 6~7     | `? L W #`           |
| **AWS EventBridge**    | `cron(...)` 래퍼                | 6       | `? L W` + year 필드 |
| **Kubernetes CronJob** | 매크로 포함                     | 5       | `@hourly` 등        |
| **Jenkins**            | H 해시 토큰/별칭                | 5       | `H H(...)`          |

**1-2. Auto 감지 규칙 (필수)**

- FR-C-05: `cron(`으로 시작 → **AWS 래퍼**로 판정
- FR-C-06: `H`, `H(...)` 포함 → **Jenkins** 후보
- FR-C-07: `?` 또는 `L/W/#` 포함 → **Quartz/AWS** 후보 (필드 수/래퍼로 최종 결정)
- FR-C-08: 필드 수(5/6/7)로 1차 분기
- FR-C-09: `@hourly`, `@daily` 등 매크로 → **Kubernetes** 후보

##### 2) 입력 포맷 "래퍼" 정규화

**2-1. 래퍼는 모두 "껍데기"로 취급하고 내부 필드만 파싱**

다음은 **동일 케이스로 묶어서** 처리:

- FR-C-10: `cron( … )` → 내부만 추출해서 파싱
- FR-C-11: `cron('…')`, `cron("…")` (Jenkins Pipeline) → 따옴표/괄호 제거 후 파싱
- FR-C-12: 여백/개행/앞뒤 텍스트가 있어도 **가장 안쪽 표현식만 안전 추출**

**2-2. Normalized 표시 추가 (권장)**

- FR-C-13: 입력 바로 아래에 "Normalized" 라인 표시
  - 예: **Normalized:** `3-59/7 6-22/2 1,15,28-31 */2 1-5`
- FR-C-14: AWS 선택 시 **AWS format** 도 출력
  - 예: **AWS format:** `cron(3-59/7 6-22/2 1,15,28-31 */2 1-5 *)`

##### 3) 의미(semantics) 정확화

**3-1. UNIX/Vixie의 DOM/DOW는 "AND가 아니라 OR"**

- FR-C-15: 스펙이 UNIX/Vixie일 때 Human readable에 `day-of-month OR day-of-week` 명시
- FR-C-16: Next runs도 OR 규칙으로 계산
- FR-C-17: "AND가 필요하면 표현식을 2개로 분리해야 함" 경고 제공

**3-2. AWS/Quartz 계열은 DOM/DOW 동시 지정 제약 검증**

- FR-C-18: AWS는 `*`를 동시에 못 쓰고, 한쪽은 `?` 필요
- FR-C-19: 스펙별 제약을 Validation 규칙으로 분리
- FR-C-20: 에러 메시지도 스펙에 맞게 다르게 표시

##### 4) UI/UX 고도화

**4-1. 컨트롤 바 개선**

- FR-C-21: **Spec/Profile 드롭다운** 추가
- FR-C-22: `Include seconds`는 Spec가 "UNIX+Seconds/Quartz"가 아닐 때 비활성/대체
- FR-C-23: Timezone 스펙별 의미 안내:
  - AWS: UTC 또는 지정 TZ로 스케줄 평가 (+ DST 동작)
  - K8s: `.spec.timeZone` 사용 가능, 미지정 시 컨트롤 플레인 로컬 TZ
  - Jenkins/UNIX: 서버 로컬 기준

**4-2. Human readable를 "필드별 분해 + 하이라이트"로 확장**

- FR-C-24: 문장 1줄 + **필드별 해석 카드**
  - Minutes / Hours / DOM / Month / DOW / (Year/Seconds)
- FR-C-25: 입력 문자열에서 해당 토큰을 **색/밑줄로 하이라이트** (hover 시 서로 강조)
- FR-C-26: `L/W/#/?/H` 같은 특수 토큰은 "이 스펙에서만" 배지로 표시

**4-3. "호환성/주의사항" 영역 추가**

- FR-C-27: 스펙별 흔한 경고 자동 안내:
  - UNIX/Vixie: DOM/DOW OR 경고
  - Jenkins: `H/3` 같은 짧은 주기 DOM 월말 불규칙 경고
  - AWS: `cron(...)` 포맷 + 필드/와일드카드 제한 + TZ/DST 특성
  - K8s: `TZ=` 미지원, `.spec.timeZone` 권장

##### 5) Next runs 계산/표시 고도화

**5-1. "기준 시각(From)" 설정**

- FR-C-28: 기본 Now, 옵션으로 사용자가 기준 datetime 입력 가능

**5-2. 출력 포맷 옵션**

- FR-C-29: Localized 표시 (i18n과 연동)
- FR-C-30: 복사 버튼: ISO / RFC3339 / Epoch 포맷 선택

**5-3. 성능 요구사항**

- FR-C-31: next-run 계산을 **Web Worker로 오프로드** (복잡한 표현식 UI 프리징 방지)
- FR-C-32: 계산 중에는 skeleton + cancel 버튼

##### 6) 변환(Conversion) 기능 (선택)

- FR-C-33: "Convert to" 드롭다운:
  - UNIX(5) ↔ UNIX+Seconds(6)
  - UNIX(5) → AWS (`cron(...)` + year `*`)
  - Jenkins: `@hourly`/`H` 포함 표현 설명/출력
- FR-C-34: **변환 불가/비등가**는 명확히 경고
  - 예: UNIX의 DOM/DOW OR를 Quartz/AWS식으로 100% 동일 변환 불가

#### AC (v1.3.2)

- 입력 `cron(0 12 * * ? *)` → 자동으로 AWS로 감지, Normalized 표시
- UNIX 스펙에서 `0 12 1,15 * 1-5` → "1일, 15일 **또는** 월~금 12:00에 실행" (OR 명시)
- Quartz 스펙에서 `0 0 12 ? * MON-FRI` → `?` 특수 문법 배지 표시
- "From" 시각 변경 시 Next runs 즉시 재계산
- 복잡한 표현식에서 UI 프리징 없이 스피너 표시

#### 구현 참고: npm 라이브러리 (v1.3.2)

현재 설치된 라이브러리와 추가 고려 라이브러리:

| 라이브러리          | 버전   | 용도                | 지원 문법             | 설치 여부    |
| ------------------- | ------ | ------------------- | --------------------- | ------------ |
| **cron-parser**     | 5.4.0  | 다음 실행 시간 계산 | UNIX 5/6필드, 타임존  | ✅ 설치됨    |
| **cronstrue**       | 3.9.0  | Human-readable 설명 | 다국어 i18n           | ✅ 설치됨    |
| **croner**          | 9.1.0  | Quartz 고급 문법    | `L W # ?`, legacyMode | 🔶 추가 검토 |
| **aws-cron-parser** | 1.1.12 | AWS 전용 파서       | AWS EventBridge       | 🔶 추가 검토 |

**라이브러리 선택 권장사항**:

1. **기본 파싱/계산**: `cron-parser` (현재 사용 중) - UNIX 5/6필드에 충분
2. **Human-readable**: `cronstrue` (현재 사용 중) - i18n 지원
3. **Quartz 고급 문법**: `croner` 추가 또는 자체 구현 검토
   - `croner`는 `L`, `#`, `?` 지원하며 `{ legacyMode: false }`로 DOM/DOW AND 전환 가능
4. **AWS 래퍼 처리**: 자체 정규식으로 `cron(...)` 추출 후 기존 파서 사용 권장

#### 공식 스펙 검증 결과 (v1.3.2)

각 스펙의 공식 문서와 요구사항 교차 검증 결과:

| 스펙                | 검증 출처                                                                                                      | DOM/DOW 동작                         | 특수 문법           | 검증 결과 |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------- | --------- |
| **UNIX/Vixie**      | [man7.org/crontab.5](https://man7.org/linux/man-pages/man5/crontab.5.html)                                     | **OR** (둘 다 제한 시)               | `@hourly` 등 매크로 | ✅ 일치   |
| **Quartz**          | [quartz-scheduler.org](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html) | `?` 필수 (한쪽)                      | `L W #`             | ✅ 일치   |
| **AWS EventBridge** | [docs.aws.amazon.com](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html#cron-based)   | `?` 필수 (한쪽), `*` 동시 불가       | `L W #`, year 필드  | ✅ 일치   |
| **croner (참고)**   | [croner.56k.guru](https://croner.56k.guru/usage/pattern/)                                                      | OR (기본), AND (`legacyMode: false`) | `L #`, 5-7필드      | ✅ 참고   |

**핵심 검증 내용**:

1. **UNIX DOM/DOW OR 규칙**: man7.org 공식 문서 확인

   > "If both fields are restricted (i.e., do not contain the '\*' character), the command will be run when **either** field matches the current time."

2. **AWS 제약사항**: AWS 공식 문서 확인

   > "You can't use \* in both the Day-of-month and Day-of-week fields. If you use it in one, you must use ? in the other."

3. **Quartz `?` 필수**: Quartz 공식 문서 확인
   > "Support for specifying both a day-of-week and a day-of-month value is not complete (you must currently use the '?' character in one of these fields)."

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

### 7.9 Hash/HMAC Generator (`toolId: hash`) (v1.2.0 추가, v1.2.1 고도화)

#### 상태

```ts
type HashToolState = {
  mode: 'hash' | 'hmac'; // 기본 hash
  inputType: 'text' | 'file'; // 기본 text
  text?: string; // 텍스트 입력
  // file은 공유/저장 대신 "마지막 파일명" 정도만 표시(실데이터 저장 금지)
  algorithm: 'SHA-256' | 'SHA-512'; // 기본 SHA-256
  outputEncoding: 'hex' | 'base64' | 'base64url'; // 기본 hex
  hmacKeyText?: string; // HMAC 키 (기본 저장/공유 제외)
  hmacKeyEncoding?: 'raw' | 'hex' | 'base64'; // 키 인코딩 형식 (기본 raw)
  // 옵션: 랜덤 키 생성, 검증(verify) 섹션은 UI 상태로만 관리
};
```

#### 기능

**Hash 모드**:

- FR-H-01: 텍스트 입력의 해시값 계산 (WebCrypto API 사용)
- FR-H-02: 파일 입력의 해시값 계산 (`file.arrayBuffer()` 또는 `FileReader.readAsArrayBuffer`)
- FR-H-03: 알고리즘 지원 (SHA-256, SHA-512)
- FR-H-04: 결과를 Hex, Base64, Base64URL 형식으로 표시
- FR-H-05: 파일 메타 정보 표시 (name, size, lastModified)
- FR-H-06: 처리 상태 표시 (로딩 스피너, 큰 파일 진행률)

**HMAC 모드**:

- FR-H-07: HMAC-SHA-256, HMAC-SHA-512 지원
- FR-H-08: 키 인코딩 옵션 (raw-text, hex, base64)
- FR-H-09: 랜덤 키 생성 버튼 (WebCrypto `generateKey` 또는 안전한 랜덤 바이트)
- FR-H-10: 검증(verify) 섹션: expected MAC 입력 → 일치 여부 표시 (OK/Fail)
- FR-H-11: 텍스트/파일 모두 HMAC 지원

**보안 및 프라이버시**:

- FR-H-12: **HMAC 키는 기본적으로 공유 링크/로컬스토리지에 저장하지 않음**
  - 사용자가 명시적으로 "키 저장"을 켠 경우에만 저장 (강한 경고 문구)
- FR-H-13: **주의**: "보안용이 아님" 안내 메시지 표시

**에러 처리**:

- FR-H-14: 잘못된 키 인코딩(예: hex 길이 홀수) → 사용자 친화 에러
- FR-H-15: WebCrypto 미지원 환경 → "브라우저가 Web Crypto를 지원하지 않습니다" 안내
- FR-H-16: 파일 읽기 실패/권한 문제 → 에러 배너

- AC
  - 텍스트 입력 SHA-256/512 결과가 WebCrypto 기반으로 안정적으로 생성됨
  - 파일 입력 시 `arrayBuffer()`/FileReader 기반으로 해시가 생성됨
  - HMAC은 importKey + sign 플로우로 생성됨
  - 큰 파일 처리 시 진행률 표시 (읽기 단계까지)

---

### 7.10 UUID/ULID Generator (`toolId: uuid`) (v1.2.0 추가)

#### 상태

```ts
type UuidToolState = {
  type: 'uuid-v4' | 'uuid-v7' | 'ulid'; // 기본 uuid-v4
  count: number; // 기본 1, 최대 100
  format: 'lowercase' | 'uppercase'; // 기본 lowercase
};
```

#### 기능

- FR-UUID-01: UUID v4 생성 (랜덤 UUID)
- FR-UUID-02: UUID v7 생성 (타임스탬프 기반, 시간순 정렬 가능)
- FR-UUID-03: ULID 생성 (UUID v7과 유사하지만 더 짧음)
- FR-UUID-04: 여러 개 일괄 생성 (최대 100개)
- FR-UUID-05: 생성된 ID 복사 (단일/일괄)
- AC

  - 버튼 클릭 시 즉시 생성
  - 일괄 생성 시 목록으로 표시
  - 각 ID별 개별 복사 버튼 제공

---

### 7.11 Password Generator (`toolId: password`) (v1.2.0 추가)

#### 상태

```ts
type PasswordToolState = {
  length: number; // 기본 16, 최소 4, 최대 128
  includeUppercase: boolean; // 기본 true
  includeLowercase: boolean; // 기본 true
  includeNumbers: boolean; // 기본 true
  includeSymbols: boolean; // 기본 true
  excludeSimilar: boolean; // 기본 false (i, l, 1, L, o, 0, O 제외)
  excludeAmbiguous: boolean; // 기본 false ({ } [ ] ( ) / \ ' " ` ~ , ; : . < > 제외)
  count: number; // 기본 1, 최대 20
};
```

#### 기능

- FR-PWD-01: 사용자 정의 길이의 비밀번호 생성
- FR-PWD-02: 문자 유형 선택 (대문자, 소문자, 숫자, 특수문자)
- FR-PWD-03: 유사 문자 제외 옵션 (i, l, 1, L, o, 0, O)
- FR-PWD-04: 모호한 특수문자 제외 옵션 ({ } [ ] ( ) / \ ' " ` ~ , ; : . < >)
- FR-PWD-05: 여러 개 일괄 생성 (최대 20개)
- FR-PWD-06: 생성된 비밀번호 복사 (단일/일괄)
- FR-PWD-07: 비밀번호 보안 강도 표시 (약함/보통/강함/매우강함)
- FR-PWD-08: 최소 하나의 문자 유형이 선택되어야 함 (유효성 검사)
- AC
  - 옵션 변경 시 자동으로 새 비밀번호 생성
  - 보안 강도는 엔트로피 기반으로 계산
  - 복사 시 Toast 알림 표시
  - 일괄 생성 시 목록으로 표시, 각 비밀번호별 개별 복사 버튼 제공

#### 보안 강도 계산

비밀번호의 보안 강도는 엔트로피(entropy) 기반으로 계산합니다:

- **엔트로피 공식**: `log2(문자 집합 크기 ^ 길이)`
- **문자 집합 크기**: 선택된 문자 유형의 총 개수

  - 대문자: 26개 (A-Z)
  - 소문자: 26개 (a-z)
  - 숫자: 10개 (0-9)
  - 특수문자: 32개 (!@#$%^&\*()\_+-=[]{}|;:,.<>?/~`)
  - 유사 문자 제외 시: 대문자에서 I, L, O 제외 (23개), 소문자에서 i, l, o 제외 (23개), 숫자에서 0, 1 제외 (8개)
  - 모호한 특수문자 제외 시: 특수문자에서 { } [ ] ( ) / \ ' " ` ~ , ; : . < > 제외 (약 16개)

- **강도 기준**:
  - 약함: 엔트로피 < 28 (약 2^28 = 268,435,456 가지 경우의 수)
  - 보통: 엔트로피 28-40
  - 강함: 엔트로피 40-60
  - 매우강함: 엔트로피 > 60

---

### 7.12 URL Parser (`toolId: url-parser`) (v1.2.0 추가)

#### 목적

URL을 입력받아서, 해당 URL의 구조(protocol, host, path, fragment)와 query parameters를 구조 분해해서 알아보기 쉽게 사용자에게 노출해주는 도구

#### 상태

```ts
type QueryStringToolState = {
  input: string; // URL 또는 query string
  showDecoded: boolean; // 기본 true - 디코딩된 값 표시 여부
  showRaw: boolean; // 기본 false - 원본 인코딩된 값 표시 여부
};
```

#### 기능

- FR-QS-01: URL 또는 query string 입력 받기
- FR-QS-02: URL 컴포넌트 파싱
  - Protocol (https://, http://) 파싱 및 표시
  - Host (도메인) 파싱 및 표시
  - Path (경로) 파싱 및 표시
  - Fragment (# 이후) 파싱 및 표시
  - 각 컴포넌트 개별 복사 기능
- FR-QS-03: Query string 파싱 및 구조 분해
  - `?` 이후의 query string 추출
  - `&`로 구분된 파라미터 분리
  - `=`로 구분된 키/값 분리
  - 배열 파라미터 지원 (PHP 스타일 `arr[]`, 인덱스 배열 `arr[0]`, 연관 배열 `arr[key]`, 중첩 배열 `arr[0][key]`)
- FR-QS-04: 파라미터 구조화 표시
  - 각 파라미터의 키(key) 표시
  - 각 파라미터의 값(value) 표시
  - 인코딩 상태 표시 (인코딩됨/디코딩됨)
  - 파라미터 개수 표시
- FR-QS-05: 디코딩 옵션
  - `showDecoded`: 디코딩된 값 표시 (기본 true)
  - `showRaw`: 원본 인코딩된 값 표시 (기본 false)
  - 두 옵션 모두 활성화 시 비교 가능
- FR-QS-06: 개별 파라미터 및 URL 컴포넌트 복사
  - 각 파라미터의 키/값 쌍 복사
  - 각 URL 컴포넌트 (protocol, host, path, fragment) 복사
  - 전체 query string 복사
- FR-QS-07: 에러 처리
  - 잘못된 URL 형식 시 에러 메시지 표시
  - Query string이 없는 경우 안내 메시지 표시
- FR-QS-08: 실시간 파싱
  - 입력 변경 시 즉시 파싱 및 결과 업데이트
- AC
  - 복잡한 query string도 정확히 파싱됨
  - 배열 파라미터 형식 모두 지원
  - 인코딩된 값과 디코딩된 값을 비교 가능
  - 각 파라미터 및 URL 컴포넌트를 개별적으로 복사 가능
  - URL 공유 기능 지원

---

### 7.13 Regex Tester (`toolId: regex`) (v1.2.1 추가)

#### 목적

정규식 패턴과 테스트 문자열을 입력하면 매치 결과를 즉시 시각화하고, 치환(replace) 결과를 미리보기로 제공하는 도구

#### 상태

```ts
type RegexToolState = {
  pattern: string; // 정규식 패턴
  flags: {
    g: boolean; // global
    i: boolean; // ignore case
    m: boolean; // multiline
    s: boolean; // dotAll
    u: boolean; // unicode
    y: boolean; // sticky
    d?: boolean; // hasIndices (브라우저 지원 시)
    v?: boolean; // unicodeSets (브라우저 지원 시)
  };
  text: string; // 테스트 문자열 (멀티라인)
  replacementEnabled: boolean; // 치환 미리보기 활성화 여부
  replacement: string; // 치환 문자열 (멀티라인 가능)
  replaceMode: 'first' | 'all'; // replace / replaceAll 모드
  selectedMatchIndex?: number; // 선택된 매치 인덱스
};
```

#### 기능 요구사항

**입력**:

- FR-R-01: Pattern 입력 (단일 라인)
- FR-R-02: Flags 토글 (지원 범위: `g i m s u y` + 브라우저가 지원하면 `d/v`도 노출, 미지원 flag는 비활성/숨김)
- FR-R-03: Test Text 입력 (멀티라인)
- FR-R-04: Replace 미리보기 옵션(토글)
  - Replacement 문자열 입력(멀티라인 가능)
  - Replace 실행 모드: `replace`(첫 매치) / `replaceAll`(전체 매치) → 내부적으로는 `g` 플래그와 동기화

**출력 - Match 리스트 패널**:

- FR-R-05: 매치 N개 표시(인덱스/길이/매치 문자열)
- FR-R-06: 각 매치 클릭 시 Test Text에서 해당 범위 스크롤+하이라이트

**출력 - Group 패널**:

- FR-R-07: 캡처 그룹 #1..N 값 표시(그룹 순서 규칙: 여는 괄호 기준 1부터)
- FR-R-08: 네임드 그룹 `(?<name>...)`이 있으면 `groups.name` 형태로 표시

**하이라이트(핵심)**:

- FR-R-09: Test Text 위에 overlay 하이라이트:
  - 전체 매치: 배경 강조
  - **그룹별 색상**(동일 그룹은 동일 색, 매치가 달라도 그룹 #1은 같은 색)
  - 특정 매치 선택 시 해당 매치의 그룹만 진하게 강조

**치환 미리보기(Replacement Preview)**:

- FR-R-10: Replace 결과 패널에 "치환 후 문자열" 표시
- FR-R-11: `$1`, `$2` 같은 숫자 그룹 참조 치환 지원
- FR-R-12: 네임드 그룹 참조 치환(예: `$<name>`) 지원
- FR-R-13: (옵션) "원본 vs 치환 결과" Diff 뷰(기존 Text Diff 컴포넌트 재사용)

**오류/예외 처리**:

- FR-R-14: 패턴 문법 오류 시(예: 괄호 미닫힘)
  - 결과 영역은 비우고 ErrorBanner에 예외 메시지 표시(앱 크래시 금지)
- FR-R-15: 성능 보호
  - 입력 변경 시 debounce(예: 150~300ms)
  - 특정 시간(예: 300ms~1s) 이상 걸리면 "정규식이 오래 걸립니다(백트래킹 가능)" 경고 + Worker 실행 옵션(있으면)

**상태/공유**:

- FR-R-16: 공유 링크에는 pattern/text/replacement 포함(민감 정보 경고 문구 표시)
- FR-R-17: localStorage에 상태 저장/복원

- AC
  - 패턴/텍스트 입력 시 즉시 매치 리스트가 갱신됨
  - 캡처 그룹/네임드 그룹 값이 정확히 표시됨
  - replacement 결과가 JS `replace()` 규칙대로 재현됨
  - 정규식 엔진은 JavaScript RegExp(브라우저 내장) 기준으로 동작

---

## 8. 확장성 설계 (신규 툴 추가가 쉬운 구조)

### 8.1 Tool 플러그인 계약(인터페이스)

```ts
export type ToolDefinition<TState> = {
  id: string; // route/toolId
  title: string;
  description: string;
  icon?: ReactNode;
  category?: string; // 카테고리 (v1.2.0: Command Palette에서 사용)
  keywords?: string[]; // 검색 키워드 (v1.2.0: Command Palette에서 사용)
  path: string; // "/json" 형태 (BrowserRouter 기준)
  defaultState: TState;

  // URL 공유/복원 (선택적, useToolState에서 처리)
  // encodeState?: (state: TState) => unknown; // JSON-safe
  // decodeState?: (raw: any) => TState; // validation 포함

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
- ~~Hash(SHA-256) 생성기("보안용 아님" 안내 포함)~~ ✅ v1.2.0에서 구현 완료
- ~~Hash/HMAC 고도화(파일 해시, base64url, 키 인코딩)~~ ✅ v1.2.1에서 구현 예정
- ~~UUID v4/v7 생성기~~ ✅ v1.2.0에서 구현 완료
- ~~Regex Tester~~ ✅ v1.2.1에서 구현 예정
- QueryString ↔ JSON
- JSONPath 테스트
- HTML/JSON minify
- Case Converter
- Color Converter (HEX, RGB, HSL)
- QR Code Generator
