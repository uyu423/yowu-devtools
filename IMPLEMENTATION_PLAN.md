# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(v1.1)를 기반으로 **tools.yowu.dev**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 현황

- **상태**: Phase 7 완료 (v1.2.1 릴리즈 완료), Phase 8 준비 중 (v1.3.0 i18n)
- **현재 버전**: v1.2.1 (2025-01-XX)
- **다음 버전**: v1.3.0 (i18n 국제화)
- **주요 변경점**:
  - Phase 3: 모든 도구 기능 구현 완료 (JSON, URL, Base64, Time, YAML, Diff, Cron)
  - Phase 4: CI/CD 및 배포 설정 완료
  - Phase 5 (v1.1.0): ✅ 사이드바 고도화, Web App 지원, JWT 도구 추가, Web Worker 성능 최적화 완료
  - Phase 6 (v1.2.0): ✅ Command Palette, 파일 워크플로우, 공유 고도화, PWA 폴리싱, 버전 체계 정리, Hash/UUID/URL Parser 도구 추가 완료
  - Phase 7 (v1.2.1): ✅ Hash/HMAC 도구 고도화, Regex Tester 도구 추가 완료, Web Share API 텍스트 포맷팅 개선 완료
  - Phase 8 (v1.3.0): 🔄 i18n(국제화) 지원 준비 중

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
  - [x] 최대 3개 제한 및 중복 방지 로직
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

### Phase 6: v1.2.0 기능 구현 (Power-user Release)

#### 6.1 Command Palette 구현 ✅

- [x] **Command Palette 컴포넌트 생성**:
  - [x] `src/components/common/CommandPalette.tsx` 생성
  - [x] `⌘K` / `Ctrl+K` 단축키 핸들러 구현
  - [x] Fuzzy search 알고리즘 구현
  - [x] 키보드 네비게이션 (Arrow keys, Enter, ESC)
  - [x] 모바일 "Search" 버튼 통합

- [x] **ToolDefinition 확장**:
  - [x] `keywords` 필드 추가 (검색 키워드 배열)
  - [x] `category` 필드 추가 (카테고리 분류)
  - [x] 기존 도구들에 keywords/category 추가

- [x] **통합**:
  - [x] `App.tsx`에 Command Palette 통합
  - [x] 사이드바와 동일한 데이터 소스 재사용
  - [x] 즐겨찾기 토글 액션 추가

#### 6.2 파일 워크플로우 표준화 ✅

- [x] **파일 입력 컴포넌트**:
  - [x] `src/components/common/FileInput.tsx` 생성
  - [x] Drag & Drop 지원
  - [x] 파일 선택 다이얼로그
  - [x] 파일 읽기 (FileReader API)
  - [x] 에러 처리 (파일 크기 제한, 형식 검증)

- [x] **파일 다운로드 컴포넌트**:
  - [x] `src/components/common/FileDownload.tsx` 생성
  - [x] Blob 생성 및 다운로드
  - [x] 파일 확장자 자동 감지 (`fileUtils.ts`)
  - [x] 파일명 제안 기능

- [x] **Worker 응답 순서 보장**:
  - [x] `useWebWorker` 훅에 `requestId` 추가
  - [x] Worker에서 `requestId` 포함하여 응답
  - [x] 최신 요청만 반영하는 로직 구현

- [x] **도구 통합**:
  - [x] JSON 도구에 파일 열기/저장 추가
  - [x] YAML 도구에 파일 열기/저장 추가
  - [x] Diff 도구에 파일 열기/저장 추가

#### 6.3 공유(Share) 고도화 ✅

- [x] **공유 범위 표시**:
  - [x] 공유 링크 생성 시 모달로 범위 표시 (`ShareModal.tsx`)
  - [x] 포함된 필드 목록 표시
  - [x] 제외된 필드 설명 (UI 전용 상태 등)

- [x] **Web Share API 지원**:
  - [x] `navigator.share` API 감지
  - [x] 모바일에서 공유 시트 열기
  - [x] 폴백: 클립보드 복사 (기존 방식)

- [x] **민감정보 경고**:
  - [x] JWT 도구에 민감정보 경고 메시지 추가
  - [x] 공유 시 경고 모달 표시 (`ShareModal`에 `isSensitive` prop)
  - [ ] "저장 안 함" 모드 옵션 (향후 추가 가능)

- [x] **URL 스키마 버전 관리**:
  - [x] `ShareEnvelope`에 버전 필드 명시 (`v: 1`)
  - [x] 버전 호환성 검증 로직 추가
  - [x] 향후 버전 업그레이드 대비

#### 6.4 PWA 폴리싱 ✅

- [x] **Manifest shortcuts 확장**:
  - [x] 8개 도구 전부 shortcuts 추가
  - [x] 각 도구별 아이콘 및 이름 설정
  - [x] `vite.config.ts`에서 shortcuts 설정

- [x] **Screenshots 추가**:
  - [x] 데스크톱 스크린샷 2장 생성 (필드 추가 완료, 이미지 파일은 추후 추가)
  - [x] 모바일 스크린샷 2장 생성 (필드 추가 완료, 이미지 파일은 추후 추가)
  - [x] `public/` 디렉토리에 배치 (필드만 추가됨)
  - [x] `manifest.json`에 screenshots 필드 추가

- [ ] **업데이트 UX 정교화** (선택적):
  - [ ] `PWAUpdatePrompt` 컴포넌트 개선
  - [ ] "새 버전 있음" 토스트 스타일 개선
  - [ ] 업데이트 배너 디자인 개선
  - [ ] 업데이트 후 자동 새로고침 옵션

#### 6.5 버전/릴리즈 체계 정리 ✅

- [x] **빌드 타임 버전 주입**:
  - [x] `vite.config.ts`에서 `APP_VERSION` 정의
  - [x] `package.json`의 `version` 필드 읽기
  - [x] 빌드 시 환경 변수로 주입

- [x] **사이드바 footer에 버전 표시**:
  - [x] `Sidebar.tsx`에 버전 표시 추가
  - [ ] 버전 클릭 시 CHANGELOG 링크 (선택적, 향후 추가 가능)

- [x] **package.json 버전 동기화**:
  - [x] `package.json`의 `version`을 `1.2.0`으로 업데이트
  - [x] 실제 서비스 버전과 일치시킴

- [x] **RELEASE_NOTES.md 업데이트**:
  - [x] v1.2.0 릴리즈 노트 작성
  - [x] 각 버전별 변경사항 기록

#### 6.6 신규 도구 추가 (1~2개) ✅

- [x] **Hash/Checksum 도구**:
  - [x] `src/tools/hash/index.tsx` 생성
  - [x] WebCrypto API 사용 (SHA-256, SHA-1, SHA-384, SHA-512)
  - [x] HMAC 옵션 지원
  - [x] 결과를 Hex/Base64 형식으로 표시
  - [x] "보안용이 아님" 안내 메시지
  - [x] 도구 등록 및 SEO 정보 추가
  - [x] UI 개선 (타이틀 간소화, 옵션 카드 레이아웃)

- [x] **UUID/ULID 생성기**:
  - [x] `src/tools/uuid/index.tsx` 생성
  - [x] UUID v4/v7 생성
  - [x] ULID 생성
  - [x] 일괄 생성 기능 (최대 100개)
  - [x] 도구 등록 및 SEO 정보 추가

- [ ] **Password Generator**:
  - [ ] `src/tools/password/index.tsx` 생성
  - [ ] 비밀번호 길이 설정 (슬라이더, 4-128)
  - [ ] 문자 유형 선택 (대문자, 소문자, 숫자, 특수문자)
  - [ ] 유사 문자 제외 옵션 (i, l, 1, L, o, 0, O)
  - [ ] 모호한 특수문자 제외 옵션
  - [ ] 보안 강도 계산 및 표시 (엔트로피 기반)
  - [ ] 일괄 생성 기능 (최대 20개)
  - [ ] 복사 기능 (단일/일괄)
  - [ ] 유효성 검사 (최소 하나의 문자 유형 선택)
  - [ ] 도구 등록 및 SEO 정보 추가

- [x] **URL Parser** (이전 Query String Parser):
  - [x] `src/tools/query-string/index.tsx` 생성
  - [x] URL 또는 query string 입력 받기
  - [x] URL 컴포넌트 파싱 (protocol, host, path, fragment, query parameters)
  - [x] Query string 파싱 로직 구현 (직접 파싱으로 배열 파라미터 지원)
  - [x] 파라미터 구조화 표시 (테이블 형태)
  - [x] 디코딩 옵션 (`showDecoded`, `showRaw`)
  - [x] 개별 파라미터 및 URL 컴포넌트 복사 기능
  - [x] 전체 query string 복사 기능
  - [x] 에러 처리 (잘못된 URL, query string 없음)
  - [x] 실시간 파싱 (Debounce)
  - [x] 배열 파라미터 지원 (PHP 스타일, 인덱스 배열, 연관 배열, 중첩 배열)
  - [x] 도구 등록 및 SEO 정보 추가 (id: url-parser, path: /url-parser)

### Phase 7: v1.2.1 기능 구현 (Enhancement & New Tool)

#### 7.1 Hash/HMAC 도구 고도화 ✅ **진행 중**

- [ ] **파일 해시 기능 추가**:
  - [ ] Input Type 탭 추가 (`Text` / `File`)
  - [ ] 파일 선택 및 Drag & Drop 지원 (`FileInput` 컴포넌트 재사용)
  - [ ] 파일을 ArrayBuffer로 읽기 (`file.arrayBuffer()` 우선, `FileReader.readAsArrayBuffer` 대체)
  - [ ] ArrayBuffer를 `subtle.digest`로 해시 계산
  - [ ] 파일 메타 정보 표시 (name, size, lastModified)
  - [ ] 처리 상태 표시 (로딩 스피너, 큰 파일 진행률)

- [ ] **인코딩 옵션 확장**:
  - [ ] Base64URL 인코딩 옵션 추가 (`hex`, `base64`, `base64url`)
  - [ ] 출력 형식 선택 UI 개선

- [ ] **HMAC 고도화**:
  - [ ] Mode 탭 추가 (`Hash` / `HMAC`)
  - [ ] HMAC 키 인코딩 옵션 추가 (`raw-text`, `hex`, `base64`)
  - [ ] 랜덤 키 생성 버튼 추가 (WebCrypto `generateKey` 또는 안전한 랜덤 바이트)
  - [ ] 검증(verify) 섹션 추가: expected MAC 입력 → 일치 여부 표시 (OK/Fail)
  - [ ] HMAC 키 보안 정책: 기본적으로 공유 링크/로컬스토리지에 저장하지 않음
  - [ ] "키 저장" 옵션 추가 (강한 경고 문구 포함)

- [ ] **알고리즘 정리**:
  - [ ] SHA-256, SHA-512만 지원 (MD5, SHA-1, SHA-384 제거 또는 비활성화)
  - [ ] HMAC 모드에서 SHA-256/SHA-512 선택

- [ ] **에러 처리 개선**:
  - [ ] 잘못된 키 인코딩(예: hex 길이 홀수) → 사용자 친화 에러
  - [ ] 파일 읽기 실패/권한 문제 → 에러 배너

#### 7.2 Regex Tester 도구 추가 ✅ **진행 중**

- [ ] **도구 구현**:
  - [ ] `src/tools/regex/index.tsx` 생성
  - [ ] Pattern 입력 필드 (단일 라인)
  - [ ] Flags 토글 UI (`g i m s u y` + 브라우저 지원 시 `d/v`)
  - [ ] Test Text 입력 필드 (멀티라인, CodeMirror 사용)
  - [ ] Replace 미리보기 옵션 토글
  - [ ] Replacement 문자열 입력 필드 (멀티라인)

- [ ] **매치 결과 표시**:
  - [ ] Match 리스트 패널: 매치 N개 표시(인덱스/길이/매치 문자열)
  - [ ] 각 매치 클릭 시 Test Text에서 해당 범위 스크롤+하이라이트
  - [ ] Group 패널: 캡처 그룹 #1..N 값 표시
  - [ ] 네임드 그룹 `(?<name>...)` 표시 (`groups.name` 형태)

- [ ] **하이라이트 기능**:
  - [ ] Test Text 위에 overlay 하이라이트 구현
  - [ ] 전체 매치: 배경 강조
  - [ ] 그룹별 색상 (동일 그룹은 동일 색, 매치가 달라도 그룹 #1은 같은 색)
  - [ ] 특정 매치 선택 시 해당 매치의 그룹만 진하게 강조

- [ ] **치환 미리보기**:
  - [ ] Replace 결과 패널에 "치환 후 문자열" 표시
  - [ ] `$1`, `$2` 같은 숫자 그룹 참조 치환 지원
  - [ ] 네임드 그룹 참조 치환(예: `$<name>`) 지원
  - [ ] Replace 실행 모드: `replace`(첫 매치) / `replaceAll`(전체 매치)
  - [ ] `g` 플래그와 replaceMode 동기화
  - [ ] (옵션) "원본 vs 치환 결과" Diff 뷰 (기존 Text Diff 컴포넌트 재사용)

- [ ] **오류/예외 처리**:
  - [ ] 패턴 문법 오류 시 ErrorBanner에 예외 메시지 표시 (앱 크래시 금지)
  - [ ] 입력 변경 시 debounce(150~300ms)
  - [ ] 특정 시간(300ms~1s) 이상 걸리면 "정규식이 오래 걸립니다(백트래킹 가능)" 경고
  - [ ] Worker 실행 옵션 (큰 텍스트 처리 시, 선택적)

- [ ] **도구 등록**:
  - [ ] `src/tools/index.ts`에 Regex 도구 추가
  - [ ] `vite-plugin-generate-routes.ts`에 SEO 정보 추가
  - [ ] 아이콘 선택 (Lucide React: Regex 또는 Search)

- [ ] **상태 관리**:
  - [ ] `useToolState`로 상태 관리
  - [ ] URL 공유 최적화 (필터링 필요성 평가)
  - [ ] localStorage 저장/복원

### Phase 8: v1.3.0 i18n(국제화) 기능 구현

#### 8.1 i18n 인프라 구축 ✅ **준비 중**

- [ ] **i18n 라이브러리 선택 및 설정**:
  - [ ] i18n 라이브러리 선택 (예: `i18next`, `react-i18next` 또는 자체 구현)
  - [ ] 기본 설정 및 Provider 구성
  - [ ] 타입 정의 (TypeScript 지원)

- [ ] **지원 로케일 상수 정의**:
  - [ ] `src/lib/constants.ts`에 `SUPPORTED_LOCALES` 배열 정의
  - [ ] 로케일 정보 타입 정의 (`{ code: string, name: string, nativeName: string }`)
  - [ ] 기본 로케일(`en-US`) 상수 정의

- [ ] **i18n 리소스 파일 구조 생성**:
  - [ ] `src/i18n/` 디렉토리 생성
  - [ ] `src/i18n/en-US.ts` 생성 (소스 오브 트루스)
  - [ ] `src/i18n/ko-KR.ts` 생성
  - [ ] `src/i18n/ja-JP.ts` 생성
  - [ ] `src/i18n/zh-CN.ts` 생성
  - [ ] `src/i18n/es-ES.ts` 생성

- [ ] **i18n 리소스 키 구조 설계**:
  - [ ] 네임스페이스 설계 (`common.*`, `sidebar.*`, `tool.{slug}.*`, `meta.{slug}.*`)
  - [ ] 기존 UI 문자열을 키로 매핑하는 작업 계획 수립
  - [ ] 타입 안전성을 위한 키 타입 정의

#### 8.2 i18n 리소스 파일 작성 ✅ **준비 중**

- [ ] **공통 문자열 번역**:
  - [ ] `common.*` 네임스페이스: Copy, Paste, Clear, Reset, Share, Error, Loading 등
  - [ ] `sidebar.*` 네임스페이스: Favorites, Recent Tools, All Tools 등
  - [ ] 모든 로케일 파일에 동일 키 구조 작성

- [ ] **도구별 문자열 번역**:
  - [ ] 각 도구의 제목, 설명, placeholder, validation 메시지 번역
  - [ ] `tool.json.*`, `tool.url.*`, `tool.base64.*` 등 도구별 네임스페이스 작성
  - [ ] 모든 도구에 대해 모든 로케일 파일 작성

- [ ] **SEO 메타 문자열 번역**:
  - [ ] `meta.{slug}.title`, `meta.{slug}.description` 번역
  - [ ] 각 도구별 SEO 메타 정보를 모든 로케일로 번역
  - [ ] 빌드 시 사용할 수 있도록 구조화

- [ ] **번역 품질 관리**:
  - [ ] en-US를 기준으로 모든 키 작성 완료 확인
  - [ ] 다른 로케일 파일의 키 누락 검증 (빌드/테스트 단계)
  - [ ] 번역 품질 검토 (필요시 외부 번역 서비스 활용)

#### 8.3 i18n 훅 및 유틸리티 구현 ✅ **준비 중**

- [ ] **useI18n 훅 구현**:
  - [ ] 현재 로케일 상태 관리
  - [ ] `t()` 함수 제공 (번역 키 → 번역된 문자열)
  - [ ] 로케일 변경 함수 제공
  - [ ] localStorage 연동 (저장/복원)

- [ ] **로케일 감지 로직**:
  - [ ] URL에서 locale prefix 추출
  - [ ] localStorage에서 저장된 locale 읽기
  - [ ] `navigator.language` 기반 best match 로직
  - [ ] fallback 로직 (en-US)

- [ ] **i18n Provider 구현**:
  - [ ] React Context 기반 i18n 상태 제공
  - [ ] 앱 최상위에 Provider 배치
  - [ ] SSR/SSG 호환성 고려 (초기 로케일 주입)

#### 8.4 라우팅 확장 ✅ **준비 중**

- [ ] **라우트 구조 확장**:
  - [ ] `/{locale}/{tool}` 라우트 패턴 지원
  - [ ] 기존 `/{tool}` 라우트는 en-US로 리다이렉트 (또는 유지)
  - [ ] React Router 설정 업데이트

- [ ] **언어 변경 시 라우팅**:
  - [ ] 언어 선택 시 현재 tool 유지하며 locale만 변경
  - [ ] URL fragment(공유 payload) 보존 로직
  - [ ] 브라우저 히스토리 관리

- [ ] **초기 진입 시 언어 감지**:
  - [ ] URL에 locale이 없으면 localStorage/navigator.language 확인
  - [ ] 적절한 locale prefix로 리다이렉트 또는 상태 설정

#### 8.5 빌드 시스템 확장 ✅ **준비 중**

- [ ] **vite-plugin-generate-routes.ts 확장**:
  - [ ] `SUPPORTED_LOCALES` 배열 순회하여 각 로케일별 HTML 생성
  - [ ] 각 HTML에 `<html lang="{locale}">` 설정
  - [ ] 각 HTML에 해당 로케일의 메타 태그 주입
  - [ ] 초기 로케일 정보를 전역 변수/데이터 속성으로 주입

- [ ] **sitemap.xml 확장**:
  - [ ] 언어별 URL을 모두 포함하도록 확장
  - [ ] `hreflang` 태그 추가 (검색 엔진에 언어 관계 알림)
  - [ ] 각 도구의 언어별 URL 생성

- [ ] **robots.txt 업데이트**:
  - [ ] 언어별 경로가 크롤링 가능하도록 확인
  - [ ] 필요시 언어별 robots.txt 생성 (선택적)

#### 8.6 UI 컴포넌트 i18n 적용 ✅ **준비 중**

- [ ] **공통 컴포넌트 i18n 적용**:
  - [ ] `ToolHeader`: 제목, 설명, 버튼 텍스트
  - [ ] `ActionBar`: 버튼 라벨 (Copy, Download, Reset 등)
  - [ ] `ErrorBanner`: 에러 메시지
  - [ ] `Sidebar`: 메뉴 항목, 섹션 제목
  - [ ] `CommandPalette`: 검색 placeholder, 결과 텍스트

- [ ] **도구별 컴포넌트 i18n 적용**:
  - [ ] 각 도구의 모든 UI 문자열을 i18n 키로 교체
  - [ ] placeholder 텍스트
  - [ ] 옵션 라벨 및 tooltip
  - [ ] validation 메시지
  - [ ] 에러 메시지

- [ ] **하드코딩 문자열 제거**:
  - [ ] 코드베이스 전체 검색으로 하드코딩된 문자열 찾기
  - [ ] 모든 문자열을 i18n 키로 교체
  - [ ] ESLint 규칙 추가 (선택적): 하드코딩 문자열 경고

#### 8.7 언어 선택 UI 구현 ✅ **준비 중**

- [ ] **언어 선택 컴포넌트**:
  - [ ] 드롭다운 또는 버튼 그룹 형태의 언어 선택 UI
  - [ ] 현재 선택된 언어 표시
  - [ ] 각 언어의 native name 표시 (예: "한국어", "日本語", "中文")

- [ ] **언어 선택 위치**:
  - [ ] 헤더 또는 사이드바 footer에 배치
  - [ ] 테마 토글 근처 권장
  - [ ] 모바일에서도 접근 가능하도록 반응형 디자인

- [ ] **언어 변경 동작**:
  - [ ] 선택 즉시 현재 tool 유지하며 locale prefix만 변경
  - [ ] URL 업데이트 및 페이지 리로드 없이 상태 변경 (SPA)
  - [ ] localStorage에 선택한 언어 저장

#### 8.8 테스트 및 검증 ✅ **준비 중**

- [ ] **기능 테스트**:
  - [ ] 모든 도구에서 언어 변경 시 UI 텍스트가 올바르게 변경되는지 확인
  - [ ] 언어 변경 시 입력 데이터가 유지되는지 확인
  - [ ] 공유 링크의 locale prefix가 올바르게 처리되는지 확인
  - [ ] localStorage에 저장된 locale로 재진입 시 올바른 언어로 표시되는지 확인

- [ ] **빌드 검증**:
  - [ ] `npm run build` 실행하여 모든 언어별 HTML 파일 생성 확인
  - [ ] 각 HTML 파일의 `<html lang>` 속성 확인
  - [ ] 각 HTML 파일의 메타 태그가 올바른 언어로 생성되는지 확인
  - [ ] `sitemap.xml`에 언어별 URL이 모두 포함되는지 확인

- [ ] **번역 키 검증**:
  - [ ] 모든 로케일 파일의 키 일치 여부 확인 (빌드/테스트 단계)
  - [ ] 누락된 키가 있을 경우 경고 또는 빌드 실패
  - [ ] 개발 모드에서 누락 키 경고 표시

- [ ] **SEO 검증**:
  - [ ] 각 언어별 페이지가 검색 엔진에 별도 페이지로 인덱싱되는지 확인
  - [ ] `hreflang` 태그가 올바르게 생성되는지 확인
  - [ ] 언어별 메타 태그가 올바르게 설정되는지 확인

#### 8.9 문서 업데이트 ✅ **준비 중**

- [ ] **개발 문서 업데이트**:
  - [ ] `SAS.md`: i18n 요구사항 섹션 추가 완료
  - [ ] `IMPLEMENTATION_PLAN.md`: Phase 8 체크리스트 추가 완료
  - [ ] `AGENTS.md`: i18n 개발 가이드 추가
  - [ ] `RELEASE_NOTES.md`: v1.3.0 릴리즈 노트 작성

- [ ] **코드 주석 및 타입 정의**:
  - [ ] i18n 관련 타입 정의 문서화
  - [ ] 새로운 훅 및 유틸리티 함수 주석 추가
  - [ ] 번역 키 네임스페이스 구조 문서화
