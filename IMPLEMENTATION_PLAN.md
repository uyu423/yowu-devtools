# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(v1.1)를 기반으로 **tools.yowu.dev**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 현황

- **상태**: Phase 2 완료 (UI Scaffolding & Architecture Setup)
- **현재 버전**: v0.1.0 (UI Only)
- **주요 변경점**:
  - 그룹별 Width 최적화 적용
  - 사이드바 UI 개선 (로고, 이스터에그, 테마 토글)
  - `sonner` Toast 라이브러리 추가
  - `useTitle` 훅 추가

---

## 2. 권장 폴더 구조

```text
src/
├── assets/               # 이미지(로고 등)
├── components/
│   ├── ui/               # 공통 UI
│   ├── layout/           # AppLayout, Sidebar
│   └── common/           # EditorPanel, ToolHeader, ActionBar
├── hooks/
│   ├── useTheme.ts       # 테마 관리
│   ├── useTitle.ts       # 페이지 타이틀 관리
│   ├── useLocalStorage.ts
│   └── useUrlState.ts
├── lib/
│   ├── utils.ts          # cn 등 유틸
├── tools/                # 개별 도구 구현체
│   ├── index.ts          # Tool Registry
│   ├── types.ts          # ToolDefinition
│   ├── json/             # JSON Viewer
│   ├── url/              # URL Encoder
│   ├── base64/           # Base64
│   ├── time/             # Time Converter
│   ├── yaml/             # YAML Converter
│   ├── diff/             # Text Diff
│   └── cron/             # Cron Parser
```

---

## 3. 단계별 구현 체크리스트

### Phase 0~2: 초기 설정 및 UI 스캐폴딩 (Completed)

- [x] Project Init (Vite, Tailwind, Router)
- [x] Core Architecture (ToolRegistry, Layout)
- [x] Common UI Components (Editor, Header)
- [x] All Tool UI Scaffolding (JSON, URL, Base64, Time, YAML, Diff, Cron)
- [x] **UX Improvements**:
  - [x] Dark Mode (System/Light/Dark)
  - [x] Sidebar Polish (Logo, GitHub Link, Badge)
  - [x] Grouped Width Strategy
  - [x] `sonner` Setup
  - [x] `useTitle` Hook

### Phase 3: 도구별 기능 구현 (Logic Implementation) - **Current**

각 도구별로 **로직 연결 + 실시간 변환 + 에러 처리 + Toast 알림**을 구현합니다.

**1. JSON Pretty Viewer** (Priority: High)

- [ ] **Dependencies**: `react-json-view` 설치
- [ ] **Logic**:
  - [ ] 입력 JSON 파싱 (`JSON.parse`) 및 에러 핸들링
  - [ ] 유효성 검사 (테두리 색상 표시)
  - [ ] **Sample Data** 로드 버튼 기능
  - [ ] **Tree View** 컴포넌트 연동
  - [ ] Format / Minify 기능
  - [ ] Copy to Clipboard (w/ Toast)

**2. URL Encode/Decode**

- [ ] **Logic**:
  - [ ] `encodeURIComponent` / `decodeURIComponent`
  - [ ] 실시간 자동 변환 (Debounce)
  - [ ] Error Handling (Decode 실패 시)
  - [ ] **Swap Input/Output** 버튼

**3. Base64 Encode/Decode**

- [ ] **Logic**:
  - [ ] UTF-8 Safe Encoding/Decoding (`TextEncoder`/`TextDecoder`)
  - [ ] URL Safe 옵션 처리 (`-` ↔ `+`, `_` ↔ `/`)
  - [ ] 실시간 자동 변환
  - [ ] **Swap Input/Output** 버튼

**4. Epoch/ISO Converter**

- [ ] **Dependencies**: `date-fns` 설치
- [ ] **Logic**:
  - [ ] Epoch(ms/s) ↔ ISO 양방향 실시간 변환
  - [ ] **Set to Now** 타이머 기능
  - [ ] Timezone 처리 (UTC/Local)

**5. YAML ↔ JSON**

- [ ] **Dependencies**: `yaml` 설치
- [ ] **Logic**:
  - [ ] YAML 파싱 및 JSON 변환
  - [ ] JSON 파싱 및 YAML 변환
  - [ ] 에러 라인 감지 및 표시

**6. Text Diff**

- [ ] **Dependencies**: `diff-match-patch` 설치
- [ ] **Logic**:
  - [ ] 텍스트 비교 알고리즘 수행
  - [ ] 결과 HTML 렌더링 (Insert/Delete 하이라이트)
  - [ ] Ignore Whitespace 옵션 적용

**7. Cron Parser**

- [ ] **Dependencies**: `cron-parser`, `cronstrue` 설치
- [ ] **Logic**:
  - [ ] Cron 식 파싱 및 유효성 검사
  - [ ] Human Readable Description 생성
  - [ ] Next Run Times 계산

### Phase 4: 마무리기능 및 배포 (Polish & Deploy)

- [ ] **Command Palette**: `Ctrl+K` 툴 검색 구현
- [ ] **Metadata**: `manifest.json`, Favicon, Title 설정
- [ ] **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) 작성
- [ ] **Deployment**: GitHub Pages 배포 확인 및 Custom Domain 설정
