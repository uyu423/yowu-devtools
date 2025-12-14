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

### 1.2 Out-of-Scope (v1에서 제외)

- 로그인/계정/동기화
- 서버 기능/백엔드
- 분석/로그(Analytics) 삽입
- "외부 API 호출" 기반 기능(예: DNS 조회, HTTP 호출 등)
- PWA/오프라인 캐시(추후 옵션)

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

---

## 3. 기술 스택 결정 (권장안)

> 목표: 타입 안정성 + 빠른 개발 + 유지보수/확장 용이 + 정적 배포 최적

- Language: **TypeScript**
- Build: **Vite**
- UI: **React**
- Routing: **React Router (HashRouter 권장)**

  - GitHub Pages/정적 호스팅에서 라우팅 이슈 최소화

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

  - `payloadJson` → (옵션) `LZString.compressToEncodedURIComponent(payloadJson)` → `d`
  - 압축을 쓰지 않는 경우: `base64url(utf8(payloadJson))`

- 디코딩 실패 시:

  - 사용자에게 "공유 링크가 손상되었거나 버전이 맞지 않습니다" 안내
  - 툴 기본 상태로 fallback

> **중요**: URL 길이 제한이 브라우저/메신저마다 다르므로, v1부터 `lz-string` 기반 "압축 공유"를 기본으로 권장.

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

---

## 6. 성능/최적화 요구사항 (NFR)

### 6.1 목표

- 초기 로딩(캐시 후)에서 **즉시 조작 가능** 체감
- 입력이 커져도 UI가 버벅이지 않도록(특히 JSON/DIFF)

### 6.2 구체 요구사항

- NFR-01: 입력 파싱/변환 중에도 UI가 멈추지 않도록 노력
- NFR-02: 큰 입력(예: 수 MB)에서 에디터/렌더가 과도하게 느려지지 않게 방어 로직 제공
- NFR-03: 무거운 연산(대형 JSON 파싱, 대형 diff 계산)은 **Web Worker 옵션** 제공

> Web Worker 설명(사용자 이해용): 브라우저에서 **별도 스레드**로 계산을 돌려 UI를 멈추지 않게 하는 기능. v1에서는 "큰 입력일 때 자동으로 Worker 사용" 정도로 내부 구현 옵션으로 둔다.

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
  search: string; // 기본 ""
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

  - HashRouter 사용 시 별도 404 리라이트 불필요

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

- JWT 디코더(검증 X, payload 표시)
- UUID v4/v7 생성기
- QueryString ↔ JSON
- Hash(SHA-256) 생성기("보안용 아님" 안내 포함)
- JSONPath 테스트
- Regex Tester
- HTML/JSON minify
- Case Converter

---

## 14. 변경 이력 (v1.1)

- **v1.1** (2025-12-14):
  - 사이드바 UI 개선: 로고(yowu.dev) 추가, GitHub 링크 위치 변경, 이스터에그 뱃지 추가
  - UX 강화: Toast 알림(`sonner`), 실시간 변환, 동적 타이틀, 그룹별 Width 전략 적용
  - 프로젝트명 변경: `yowu-devtools` → `tools.yowu.dev`
