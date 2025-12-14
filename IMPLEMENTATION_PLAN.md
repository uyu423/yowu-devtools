# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(SRS v1)를 기반으로 **yowu-devtools**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 개요 및 기술 스택

- **Build/Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + `clsx`/`tailwind-merge`
- **Routing**: React Router (HashRouter) - _GitHub Pages 호환성_
- **State/Storage**: React Context + Custom Hooks (`localStorage`, `lz-string` URL compression)
- **Editor**: CodeMirror 6 (`@uiw/react-codemirror`)
- **Key Libraries**:
  - `lz-string` (URL 공유 압축)
  - `yaml` (YAML 파싱)
  - `diff-match-patch` (Text Diff)
  - `cron-parser`, `cronstrue` (Cron)
  - `date-fns` (Time)
  - `lucide-react` (Icons)

---

## 2. 권장 폴더 구조 (Directory Structure)

확장성을 고려한 `ToolDefinition` 패턴을 적용합니다.

```text
src/
├── assets/
├── components/
│   ├── ui/               # 공통 UI (Button, Input, Modal, Drawer)
│   ├── layout/           # AppLayout, Sidebar, Header
│   └── common/           # 툴 공통 (CodeEditor, ToolHeader, ActionBar, ErrorBanner)
├── hooks/
│   ├── useTheme.ts       # 테마 토글
│   ├── useLocalStorage.ts
│   └── useUrlState.ts    # URL param 기반 상태 복원 (lz-string)
├── lib/
│   ├── utils.ts          # cn 등 유틸
│   └── constants.ts
├── tools/                # 개별 도구 구현체 (플러그인 구조)
│   ├── index.ts          # Tool Registry (모든 툴 import 및 배열 export)
│   ├── types.ts          # ToolDefinition 인터페이스 정의
│   ├── json/             # [Tool] JSON Viewer
│   ├── url/              # [Tool] URL Encoder
│   ├── base64/           # [Tool] Base64
│   ├── time/             # [Tool] Epoch/ISO
│   ├── yaml/             # [Tool] YAML Converter
│   ├── diff/             # [Tool] Text Diff
│   └── cron/             # [Tool] Cron Parser
├── App.tsx               # 라우팅 및 레이아웃 구성
└── main.tsx
```

---

## 3. 단계별 구현 체크리스트

### Phase 0: 프로젝트 초기화 (Initialization)

- [ ] **Scaffold**: Vite + React + TS 프로젝트 생성
- [ ] **Config**: `tsconfig.json` paths 설정 (`@/*`)
- [ ] **Dependencies**: Tailwind CSS, Lucide React, React Router 설치
- [ ] **Utils**: `clsx`, `tailwind-merge` 설치 및 `cn` 유틸리티 구현
- [ ] **Layout**: 기본 `AppLayout` (Sidebar + Main Area) 및 반응형(Drawer) 구조 잡기

### Phase 1: 핵심 아키텍처 (Core Architecture)

SRS의 **확장성 설계(8장)** 및 **공통 동작(5장)** 구현

- [ ] **Interface**: `ToolDefinition<T>` 인터페이스 정의 (`src/tools/types.ts`)
- [ ] **Registry**: `src/tools/index.ts`에 빈 레지스트리 생성
- [ ] **Routing**: 레지스트리를 순회하며 `HashRouter` 라우트 동적 생성 로직 구현
- [ ] **Theme**: `useTheme` 훅 구현 (System/Dark/Light) 및 UI 토글
- [ ] **State Sync**:
  - [ ] `useLocalStorage`: Debounce(300ms) 적용
  - [ ] `useUrlState`: `lz-string` 설치 및 `/#/<toolId>?d=<compressed>` 인코딩/디코딩 로직 구현

### Phase 2: 전체 도구 UI 스캐폴딩 (UI First)

모든 도구의 **UI 골격과 레이아웃을 먼저 완성**합니다. 이 단계에서는 실제 변환 로직은 연동하지 않고, 컴포넌트 배치와 스타일링에 집중합니다.

**공통 컴포넌트**

- [ ] **Components**: `ToolHeader`, `ActionBar`, `EditorPanel` (CodeMirror), `ErrorBanner` 구현

**각 툴별 UI 배치 (Input/Output/Options)**

- [ ] **JSON Pretty Viewer UI**:
  - [ ] 입력 Editor + 트리 뷰(또는 결과 Editor) 좌우/상하 배치
  - [ ] View Mode 토글, Indent 설정 UI
- [ ] **URL Encode/Decode UI**:
  - [ ] Input/Output TextArea
  - [ ] Encode/Decode 모드 토글, 옵션 체크박스
- [ ] **Base64 Encode/Decode UI**:
  - [ ] Input/Output TextArea
  - [ ] URL Safe 옵션 체크박스
- [ ] **Epoch/ISO Converter UI**:
  - [ ] Epoch 입력 인풋 + 단위(ms/s) 선택 라디오
  - [ ] ISO 입력 인풋 + Timezone 선택 토글
  - [ ] "Now" 버튼 배치
- [ ] **YAML ↔ JSON UI**:
  - [ ] 2-pane Editor (YAML / JSON)
  - [ ] 변환 방향 전환 버튼
- [ ] **Text Diff UI**:
  - [ ] Left/Right 입력 Editor
  - [ ] 결과 Diff 뷰 영역 (Side-by-side / Unified 토글)
- [ ] **Cron Expression UI**:
  - [ ] Cron 식 입력 인풋
  - [ ] 설명(Description) 표시 영역
  - [ ] 다음 실행 시간 리스트 영역

### Phase 3: 도구별 기능 구현 (Logic Implementation)

UI가 준비된 상태에서 각 도구의 핵심 로직(변환, 파싱, 계산)과 상태 관리(State/Store)를 연결합니다.

- [ ] **JSON Viewer Logic**
  - [ ] JSON 파싱/Stringify 로직 및 에러 핸들링
  - [ ] Tree View 데이터 바인딩
- [ ] **URL Logic**
  - [ ] `encodeURIComponent` / `decodeURIComponent` 연결
- [ ] **Base64 Logic**
  - [ ] UTF-8 safe 인코딩/디코딩 (`TextEncoder`/`TextDecoder`) 연결
- [ ] **Time Logic**
  - [ ] `date-fns` 기반 시간 변환 로직 연결
  - [ ] 실시간 타이머(Now) 동작
- [ ] **YAML Logic**
  - [ ] `yaml` 라이브러리 파싱 연결
  - [ ] 에러 라인 감지 및 표시
- [ ] **Diff Logic**
  - [ ] `diff-match-patch` 계산 로직 연결
  - [ ] Diff 결과 렌더링
- [ ] **Cron Logic**
  - [ ] `cron-parser` 파싱 및 Next Run 계산
  - [ ] `cronstrue` 설명 생성

### Phase 4: 마무리기능 및 배포 (Polish & Deploy)

- [ ] **Command Palette**: `Ctrl+K` 툴 검색 구현
- [ ] **Mobile Polish**: 모바일 뷰포트에서의 Drawer 및 에디터 높이 조정
- [ ] **Metadata**: `manifest.json`, Favicon, Title 설정
- [ ] **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) 작성
- [ ] **Deployment**: GitHub Pages 배포 확인 및 Custom Domain 설정

---

## 4. 개발 규칙

1. **상태 관리**: 툴의 상태는 반드시 `ToolDefinition.defaultState`와 일치하는 구조여야 하며, 가능한 `useToolState`(Local+URL 복합) 훅을 통해 관리합니다.
2. **에러 처리**: 파싱 에러 등으로 앱이 크래시되지 않도록 `try-catch`와 `ErrorBanner`를 적극 활용합니다.
3. **타입 안전성**: `any` 사용을 지양하고 Zod 등을 이용해 외부 입력(URL Param)을 검증하면 좋습니다(v1에서는 간단한 타입 가드 사용).
