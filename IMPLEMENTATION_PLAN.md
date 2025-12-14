# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(v1.1)를 기반으로 **tools.yowu.dev**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 현황

- **상태**: Phase 4 완료, Phase 5 진행 중 (v1.1.0 개발)
- **현재 버전**: v1.0.0 → v1.1.0 (개발 중)
- **주요 변경점**:
  - Phase 3: 모든 도구 기능 구현 완료 (JSON, URL, Base64, Time, YAML, Diff, Cron)
  - Phase 4: CI/CD 및 배포 설정 완료
  - Phase 5 (v1.1.0): 사이드바 고도화, Web App 지원, JWT 도구 추가, Web Worker 성능 최적화

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

### Phase 4: 마무리기능 및 배포 (Polish & Deploy) - **완료**

- [ ] **Command Palette**: `Ctrl+K` 툴 검색 구현 (향후 구현)
- [x] **Metadata**: Favicon, Title, Meta Tags 설정 완료
- [x] **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) 작성 완료
- [x] **Deployment**: GitHub Pages 배포 확인 및 Custom Domain 설정 완료 (`dist/CNAME` 확인)
- [x] **SEO 최적화**: 각 도구별 HTML 파일 자동 생성 및 메타 태그 설정 완료
  - 신규 도구 추가 시 `vite-plugin-generate-routes.ts`에 SEO 정보 필수 추가 (자세한 가이드는 `AGENTS.md` 참조)

### Phase 5: v1.1.0 기능 구현 (Enhancement & Performance)

#### 5.1 사이드바 고도화

- [ ] **최근 사용한 도구 기능**:
  - [ ] `useRecentTools` 훅 구현 (localStorage 기반)
  - [ ] 도구 페이지 진입 시 자동 기록 로직
  - [ ] 사이드바에 "Recent Tools" 섹션 추가
  - [ ] 최대 5개 제한 및 중복 방지 로직
  - [ ] 시간순 정렬 (최신이 상단)

- [ ] **즐겨찾기 기능**:
  - [ ] `useFavorites` 훅 구현 (localStorage 기반)
  - [ ] 각 도구 메뉴 항목에 별 아이콘 추가
  - [ ] 별 아이콘 클릭 시 즐겨찾기 추가/제거
  - [ ] 사이드바에 "Favorites" 섹션 추가 (상단)
  - [ ] 즐겨찾기 순서 유지 (등록 순서)

#### 5.2 Web App 지원

- [ ] **Manifest.json 생성**:
  - [ ] `public/manifest.json` 파일 생성
  - [ ] 앱 이름, 아이콘, 테마 색상 설정
  - [ ] 시작 URL 설정 (`/`)
  - [ ] 표시 모드 설정 (`standalone`)
  - [ ] `index.html`에 manifest 링크 추가

- [ ] **아이콘 준비**:
  - [ ] 다양한 크기의 아이콘 생성 (192x192, 512x512 등)
  - [ ] `public/` 디렉토리에 배치

- [ ] **Service Worker 오프라인 캐싱** (선택사항):
  - [ ] `public/sw.js` 파일 생성
  - [ ] 캐시 전략 구현 (Network First, Cache First)
  - [ ] 캐시 만료 시간 설정 (예: 7일)
  - [ ] 오프라인 폴백 페이지 생성 (`public/offline.html`)
  - [ ] `src/main.tsx`에서 Service Worker 등록
  - [ ] Vite 빌드 설정에 Service Worker 복사 추가
  - [ ] 캐시 무효화 전략 구현 (버전 기반)

#### 5.3 JWT 도구 추가

- [ ] **도구 구현**:
  - [ ] `src/tools/jwt/index.tsx` 생성
  - [ ] JWT 디코딩 로직 구현 (Header, Payload, Signature 분리)
  - [ ] Base64 URL 디코딩 및 JSON 파싱
  - [ ] JWT 인코딩 로직 구현 (옵션)
  - [ ] 에러 처리 및 표시

- [ ] **도구 등록**:
  - [ ] `src/tools/index.ts`에 JWT 도구 추가
  - [ ] `vite-plugin-generate-routes.ts`에 SEO 정보 추가
  - [ ] 아이콘 선택 (Lucide React)

#### 5.4 Web Worker 성능 최적화

- [ ] **Worker 파일 생성**:
  - [ ] `src/workers/json-parser.worker.ts` 생성
  - [ ] `src/workers/diff-calculator.worker.ts` 생성
  - [ ] `src/workers/yaml-converter.worker.ts` 생성 (옵션)

- [ ] **Worker 통합**:
  - [ ] JSON 도구에 Worker 통합 (큰 입력 시 자동 사용)
  - [ ] Diff 도구에 Worker 통합 (큰 텍스트 비교 시)
  - [ ] 로딩 인디케이터 추가
  - [ ] 에러 처리 및 폴백 로직

- [ ] **성능 임계값 설정**:
  - [ ] JSON: 1MB 이상 또는 10,000줄 이상 시 Worker 사용
  - [ ] Diff: 10,000줄 이상 시 Worker 사용
  - [ ] 설정 가능한 임계값 (향후 옵션으로 노출 가능)
