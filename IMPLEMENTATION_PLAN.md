# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(v1.1)를 기반으로 **tools.yowu.dev**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 현황

- **상태**: Phase 5 완료 ✅ (v1.1.0 릴리스 준비 완료)
- **현재 버전**: v1.1.0 (2024-12-14)
- **주요 변경점**:
  - Phase 3: 모든 도구 기능 구현 완료 (JSON, URL, Base64, Time, YAML, Diff, Cron)
  - Phase 4: CI/CD 및 배포 설정 완료
  - Phase 5 (v1.1.0): ✅ 사이드바 고도화, Web App 지원, JWT 도구 추가, Web Worker 성능 최적화 완료

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

#### 5.1 사이드바 고도화 ✅ **완료**

- [x] **최근 사용한 도구 기능**:
  - [x] `useRecentTools` 훅 구현 (localStorage 기반)
  - [x] 도구 페이지 진입 시 자동 기록 로직 (`App.tsx`)
  - [x] 사이드바에 "Recent Tools" 섹션 추가
  - [x] 최대 5개 제한 및 중복 방지 로직
  - [x] 시간순 정렬 (최신이 상단)

- [x] **즐겨찾기 기능**:
  - [x] `useFavorites` 훅 구현 (localStorage 기반)
  - [x] 각 도구 메뉴 항목에 별 아이콘 추가
  - [x] 별 아이콘 클릭 시 즐겨찾기 추가/제거
  - [x] 사이드바에 "Favorites" 섹션 추가 (상단)
  - [x] 즐겨찾기 순서 유지 (등록 순서)

#### 5.2 Web App 지원 ✅ **완료**

- [x] **PWA 플러그인 도입**:
  - [x] `vite-plugin-pwa` 설치 및 설정
  - [x] `manifest.json` 자동 생성 설정
  - [x] Service Worker 자동 생성 및 등록

- [x] **Manifest 설정**:
  - [x] 앱 이름, 아이콘, 테마 색상 설정
  - [x] 시작 URL 설정 (`/`)
  - [x] 표시 모드 설정 (`standalone`)
  - [x] Shortcuts 설정 (JSON Viewer, URL Encoder)

- [x] **아이콘 준비**:
  - [x] 다양한 크기의 아이콘 생성 (192x192, 512x512)
  - [x] `public/` 디렉토리에 배치

- [x] **Service Worker 오프라인 캐싱**:
  - [x] `vite-plugin-pwa`를 통한 자동 Service Worker 생성
  - [x] 캐시 전략 구현 (Network First, Cache First)
  - [x] 캐시 만료 시간 설정 (7일)
  - [x] 오프라인 폴백 페이지 생성 (`public/offline.html`)
  - [x] `usePWA` 훅을 통한 Service Worker 등록 및 관리
  - [x] 자동 업데이트 알림 (`PWAUpdatePrompt` 컴포넌트)
  - [x] 설치 프롬프트 지원

#### 5.3 JWT 도구 추가 ✅ **완료**

- [x] **도구 구현**:
  - [x] `src/tools/jwt/index.tsx` 생성
  - [x] JWT 디코딩 로직 구현 (Header, Payload, Signature 분리)
  - [x] Base64 URL 디코딩 및 JSON 파싱
  - [x] JWT 인코딩 로직 구현 (HMAC 서명 지원)
  - [x] 서명 검증 기능 (HMAC, RSA, ECDSA)
  - [x] 토큰 유효성 검사 (만료 시간 확인)
  - [x] 에러 처리 및 표시

- [x] **도구 등록**:
  - [x] `src/tools/index.ts`에 JWT 도구 추가
  - [x] `vite-plugin-generate-routes.ts`에 SEO 정보 추가
  - [x] 아이콘 선택 (Lucide React: KeyRound)

#### 5.4 Web Worker 성능 최적화 ✅ **완료**

- [x] **Worker 파일 생성**:
  - [x] `src/workers/json-parser.worker.ts` 생성
  - [x] `src/workers/diff-calculator.worker.ts` 생성
  - [x] `src/workers/yaml-converter.worker.ts` 생성

- [x] **공통 Worker 훅 구현**:
  - [x] `useWebWorker` 훅 구현 (재사용 가능한 Worker 로직)
  - [x] Worker 지원 여부 자동 감지
  - [x] 에러 처리 및 폴백 로직

- [x] **Worker 통합**:
  - [x] JSON 도구에 Worker 통합 (큰 입력 시 자동 사용)
  - [x] Diff 도구에 Worker 통합 (큰 텍스트 비교 시)
  - [x] YAML 도구에 Worker 통합 (큰 파일 변환 시)
  - [x] 로딩 인디케이터 추가
  - [x] 에러 처리 및 폴백 로직

- [x] **성능 임계값 설정**:
  - [x] JSON: 1MB 이상 또는 10,000줄 이상 시 Worker 사용
  - [x] Diff: 10,000줄 이상 시 Worker 사용
  - [x] YAML: 큰 파일 처리 시 자동 Worker 사용
  - [x] `shouldUseWorkerForText` 헬퍼 함수 구현
