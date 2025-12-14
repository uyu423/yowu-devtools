# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(v1.1)를 기반으로 **tools.yowu.dev**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 현황

- **상태**: Phase 3 완료 (Logic Implementation), Phase 4 부분 완료
- **현재 버전**: v1.0.0 (Core Features Complete)
- **주요 변경점**:
  - Phase 3: 모든 도구 기능 구현 완료 (JSON, URL, Base64, Time, YAML, Diff, Cron)
  - Phase 4: CI/CD 및 배포 설정 완료
  - 남은 작업: Command Palette (Ctrl+K) 구현, manifest.json 추가

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
  - [x] **Tooltip 공통 컴포넌트**: `Tooltip.tsx`, `OptionLabel.tsx` 구현 및 모든 도구에 적용

### Phase 3: 도구별 기능 구현 (Logic Implementation) - **완료**

각 도구별로 **로직 연결 + 실시간 변환 + 에러 처리 + Toast 알림**을 구현합니다.

**1. JSON Pretty Viewer** (Priority: High)

- [x] **Dependencies**: `react-json-view-lite` 설치
- [x] **Logic**:
  - [x] 입력 JSON 파싱 (`JSON.parse`) 및 에러 핸들링
  - [x] 유효성 검사 (테두리 색상 표시)
  - [x] **Sample Data** 로드 버튼 기능
  - [x] **Tree View** 컴포넌트 연동
  - [x] Format / Minify 기능
  - [x] Copy to Clipboard (w/ Toast)

**2. URL Encode/Decode**

- [x] **Logic**:
  - [x] `encodeURIComponent` / `decodeURIComponent`
  - [x] 실시간 자동 변환 (Debounce)
  - [x] Error Handling (Decode 실패 시)
  - [x] **Swap Input/Output** 버튼

**3. Base64 Encode/Decode**

- [x] **Logic**:
  - [x] UTF-8 Safe Encoding/Decoding (`TextEncoder`/`TextDecoder`)
  - [x] URL Safe 옵션 처리 (`-` ↔ `+`, `_` ↔ `/`)
  - [x] 실시간 자동 변환
  - [x] **Swap Input/Output** 버튼

**4. Epoch/ISO Converter**

- [x] **Dependencies**: `date-fns` 설치
- [x] **Logic**:
  - [x] Epoch(ms/s) ↔ ISO 양방향 실시간 변환
  - [x] **Set to Now** 타이머 기능
  - [x] Timezone 처리 (UTC/Local)

**5. YAML ↔ JSON**

- [x] **Dependencies**: `yaml` 설치
- [x] **Logic**:
  - [x] YAML 파싱 및 JSON 변환
  - [x] JSON 파싱 및 YAML 변환
  - [x] 에러 라인 감지 및 표시

**6. Text Diff**

- [x] **Dependencies**: `diff-match-patch` 설치
- [x] **Logic**:
  - [x] 텍스트 비교 알고리즘 수행
  - [x] 결과 HTML 렌더링 (Insert/Delete 하이라이트)
  - [x] Ignore Whitespace 옵션 적용

**7. Cron Parser**

- [x] **Dependencies**: `cron-parser`, `cronstrue` 설치
- [x] **Logic**:
  - [x] Cron 식 파싱 및 유효성 검사
  - [x] Human Readable Description 생성
  - [x] Next Run Times 계산

### Phase 4: 마무리기능 및 배포 (Polish & Deploy)

- [ ] **Command Palette**: `Ctrl+K` 툴 검색 구현
- [x] **Metadata**: Favicon, Title, Meta Tags 설정 완료
  - [ ] `manifest.json` 추가 (PWA 지원용, 선택사항)
- [x] **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) 작성 완료
- [x] **Deployment**: GitHub Pages 배포 확인 및 Custom Domain 설정 완료 (`dist/CNAME` 확인)
- [x] **SEO 최적화**: 각 도구별 HTML 파일 자동 생성 및 메타 태그 설정 완료
  - 신규 도구 추가 시 `vite-plugin-generate-routes.ts`에 SEO 정보 필수 추가 (자세한 가이드는 `AGENTS.md` 참조)
