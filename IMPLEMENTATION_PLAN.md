# yowu-devtools 구현 계획서 (Implementation Plan)

이 문서는 `SAS.md`(v1.1)를 기반으로 **tools.yowu.dev**를 구축하기 위한 상세 개발 계획입니다.

---

## 1. 프로젝트 현황

- **상태**: Phase 11 완료
- **현재 버전**: v1.4.2 (2025-12-17)
- **주요 변경점**:
  - Phase 3: 모든 도구 기능 구현 완료 (JSON, URL, Base64, Time, YAML, Diff, Cron)
  - Phase 4: CI/CD 및 배포 설정 완료
  - Phase 5 (v1.1.0): ✅ 사이드바 고도화, Web App 지원, JWT 도구 추가, Web Worker 성능 최적화 완료
  - Phase 6 (v1.2.0): ✅ Command Palette, 파일 워크플로우, 공유 고도화, PWA 폴리싱, 버전 체계 정리, Hash/UUID/URL Parser 도구 추가 완료
  - Phase 7 (v1.2.1): ✅ Hash/HMAC 도구 고도화, Regex Tester 도구 추가 완료, Web Share API 텍스트 포맷팅 개선 완료
  - Phase 8 (v1.3.0): ✅ i18n(국제화) 지원 완료 - 5개 언어 지원 (en-US, ko-KR, ja-JP, zh-CN, es-ES)
  - Phase 8.5 (v1.3.1): ✅ 코드 품질 개선, JWT Encoder 버그 수정, 리팩토링 완료
  - Phase 9 (v1.3.2): ✅ Cron Parser 고도화 - 다중 스펙 지원, 래퍼 정규화, 필드별 하이라이트 완료
  - Phase 9.5 (v1.3.3): ✅ PWA 업데이트 알림 수정, SEO sitemap priority 최적화 완료
  - Phase 10 (v1.4.0): ✅ **API Tester 도구 추가**, **pnpm + Turborepo 모노레포 구조 전환**, Chrome Extension companion v1.0.1
  - Phase 10.5 (v1.4.1): ✅ **cURL Parser 도구 추가**, API Tester와 cURL 통합
  - Phase 11 (v1.4.2): ✅ **API Response Diff 도구 추가**, **Locale-specific SEO 지원**

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

### Phase 8: v1.3.0 i18n(국제화) 기능 구현 ✅ **완료**

#### 8.1 i18n 인프라 구축 ✅ **완료**

- [x] **i18n 라이브러리 선택 및 설정**:

  - [x] 자체 구현 (React Context 기반)
  - [x] 기본 설정 및 Provider 구성 (`I18nProvider`)
  - [x] 타입 정의 (TypeScript 지원, `I18nResource` 타입)

- [x] **지원 로케일 상수 정의**:

  - [x] `src/lib/constants.ts`에 `SUPPORTED_LOCALES` 배열 정의
  - [x] 로케일 정보 타입 정의 (`LocaleInfo: { code, name, nativeName }`)
  - [x] 기본 로케일(`en-US`) 상수 정의

- [x] **i18n 리소스 파일 구조 생성**:

  - [x] `src/i18n/` 디렉토리 생성
  - [x] `src/i18n/en-US.ts` 생성 (소스 오브 트루스)
  - [x] `src/i18n/ko-KR.ts` 생성
  - [x] `src/i18n/ja-JP.ts` 생성
  - [x] `src/i18n/zh-CN.ts` 생성
  - [x] `src/i18n/es-ES.ts` 생성
  - [x] `src/i18n/index.ts` 생성 (통합 export)

- [x] **i18n 리소스 키 구조 설계**:
  - [x] 네임스페이스 설계 (`common.*`, `sidebar.*`, `tool.{slug}.*`, `meta.{slug}.*`)
  - [x] 기존 UI 문자열을 키로 매핑 완료
  - [x] 타입 안전성을 위한 키 타입 정의 (`satisfies I18nResource`)

#### 8.2 i18n 리소스 파일 작성 ✅ **완료**

- [x] **공통 문자열 번역**:

  - [x] `common.*` 네임스페이스: Copy, Paste, Clear, Reset, Share, Error, Loading 등
  - [x] `sidebar.*` 네임스페이스: Favorites, Recent Tools, All Tools 등
  - [x] `commandPalette.*`, `homepage.*`, `pwa.*` 네임스페이스 추가
  - [x] 모든 로케일 파일에 동일 키 구조 작성

- [x] **도구별 문자열 번역**:

  - [x] 각 도구의 제목, 설명, placeholder, validation 메시지 번역
  - [x] 14개 도구 모두 i18n 적용 완료
  - [x] Regex Tester 패턴 설명 i18n 적용 (47개 패턴)

- [x] **SEO 메타 문자열 번역**:

  - [x] `meta.{slug}.title`, `meta.{slug}.description` 번역
  - [x] 각 도구별 SEO 메타 정보를 모든 로케일로 번역
  - [x] 빌드 시 사용할 수 있도록 구조화

- [x] **번역 품질 관리**:
  - [x] en-US를 기준으로 모든 키 작성 완료 확인
  - [x] 타입 검증으로 키 누락 방지 (`satisfies I18nResource`)
  - [x] 초안 번역 완료 (ko-KR, ja-JP, zh-CN, es-ES)

#### 8.3 i18n 훅 및 유틸리티 구현 ✅ **완료**

- [x] **useI18n 훅 구현**:

  - [x] 현재 로케일 상태 관리 (`useI18n`)
  - [x] `t()` 함수 제공 (번역 키 → 번역된 문자열)
  - [x] 로케일 변경 함수 제공 (`setLocale`)
  - [x] localStorage 연동 (저장/복원)

- [x] **로케일 감지 로직**:

  - [x] URL에서 locale prefix 추출 (`getLocaleFromUrl`)
  - [x] localStorage에서 저장된 locale 읽기 (`getStoredLocale`)
  - [x] `navigator.language` 기반 best match 로직 (`getBestMatchLocale`)
  - [x] fallback 로직 (`en-US`)

- [x] **i18n Provider 구현**:
  - [x] React Context 기반 i18n 상태 제공 (`I18nContext`)
  - [x] 앱 최상위에 Provider 배치
  - [x] `buildLocalePath` 유틸리티로 locale 포함 경로 생성

#### 8.4 라우팅 확장 ✅ **완료**

- [x] **라우트 구조 확장**:

  - [x] `/{locale}/{tool}` 라우트 패턴 지원
  - [x] 기존 `/{tool}` 라우트 유지 (en-US 기본)
  - [x] React Router 설정 업데이트 (`App.tsx`)

- [x] **언어 변경 시 라우팅**:

  - [x] 언어 선택 시 현재 tool 유지하며 locale만 변경
  - [x] URL fragment(공유 payload) 보존 로직
  - [x] `Sidebar`, `HomePage`, `CommandPalette`에서 locale 포함 경로 사용

- [x] **초기 진입 시 언어 감지**:
  - [x] URL에 locale이 없으면 localStorage/navigator.language 확인
  - [x] 적절한 locale로 상태 설정

#### 8.5 빌드 시스템 확장 ✅ **완료**

- [x] **vite-plugin-generate-routes.ts 확장**:

  - [x] `SUPPORTED_LOCALES` 배열 순회하여 각 로케일별 HTML 생성
  - [x] 각 HTML에 `<html lang="{locale}">` 설정
  - [x] 각 HTML에 해당 로케일의 메타 태그 주입
  - [x] locale별 홈페이지 생성 (`/ko-KR/index.html` 등)

- [x] **sitemap.xml 확장**:

  - [x] 언어별 URL을 모두 포함하도록 확장
  - [x] 각 도구의 언어별 URL 생성

- [x] **robots.txt 업데이트**:
  - [x] 언어별 경로가 크롤링 가능하도록 확인

#### 8.6 UI 컴포넌트 i18n 적용 ✅ **완료**

- [x] **공통 컴포넌트 i18n 적용**:

  - [x] `ToolHeader`: 제목, 설명, 버튼 텍스트
  - [x] `Sidebar`: 메뉴 항목, 섹션 제목
  - [x] `CommandPalette`: 검색 placeholder, 결과 텍스트
  - [x] `PWAUpdatePrompt`: 설치 안내, 업데이트 알림
  - [x] `FileInput`, `FileDownload`: 파일 관련 메시지
  - [x] `LanguageSelector`: 언어 선택 UI

- [x] **도구별 컴포넌트 i18n 적용**:

  - [x] 14개 도구 모두 i18n 적용 완료
  - [x] placeholder 텍스트, 옵션 라벨, tooltip, validation 메시지, 에러 메시지

- [x] **하드코딩 문자열 제거**:
  - [x] 코드베이스 전체 검색으로 하드코딩된 문자열 교체
  - [x] 모든 문자열을 i18n 키로 교체

#### 8.7 언어 선택 UI 구현 ✅ **완료**

- [x] **언어 선택 컴포넌트**:

  - [x] 드롭다운 형태의 언어 선택 UI (`LanguageSelector.tsx`)
  - [x] 현재 선택된 언어 표시
  - [x] 각 언어의 native name 표시 (예: "한국어", "日本語", "中文")

- [x] **언어 선택 위치**:

  - [x] 사이드바 하단에 배치 (테마 토글 위)
  - [x] 모바일에서도 접근 가능

- [x] **언어 변경 동작**:
  - [x] 선택 즉시 현재 tool 유지하며 locale prefix만 변경
  - [x] URL 업데이트 및 페이지 리로드 없이 상태 변경 (SPA)
  - [x] localStorage에 선택한 언어 저장

#### 8.8 테스트 및 검증 ✅ **완료**

- [x] **기능 테스트**:

  - [x] 모든 도구에서 언어 변경 시 UI 텍스트가 올바르게 변경되는지 확인
  - [x] 언어 변경 시 입력 데이터가 유지되는지 확인
  - [x] 공유 링크의 locale prefix가 올바르게 처리되는지 확인
  - [x] localStorage에 저장된 locale로 재진입 시 올바른 언어로 표시되는지 확인

- [x] **빌드 검증**:

  - [x] `npm run build` 실행하여 모든 언어별 HTML 파일 생성 확인
  - [x] 각 HTML 파일의 `<html lang>` 속성 확인
  - [x] 각 HTML 파일의 메타 태그가 올바른 언어로 생성되는지 확인
  - [x] `sitemap.xml`에 언어별 URL이 모두 포함되는지 확인

- [x] **번역 키 검증**:

  - [x] 타입 시스템으로 키 일치 여부 확인 (`satisfies I18nResource`)

- [x] **SEO 검증**:
  - [x] 언어별 메타 태그가 올바르게 설정되는지 확인

#### 8.9 문서 업데이트 ✅ **완료**

- [x] **개발 문서 업데이트**:

  - [x] `SAS.md`: i18n 요구사항 섹션 추가 완료
  - [x] `IMPLEMENTATION_PLAN.md`: Phase 8 체크리스트 완료
  - [x] `AGENTS.md`: i18n 개발 가이드 추가
  - [x] `RELEASE_NOTES.md`: v1.3.0 릴리즈 노트 작성

- [x] **코드 주석 및 타입 정의**:
  - [x] i18n 관련 타입 정의 문서화 (`I18nResource`, `LocaleCode`)
  - [x] 번역 키 네임스페이스 구조 문서화

#### 8.10 추가 개선 사항 (v1.3.0) ✅ **완료**

- [x] **UI/UX 개선**:

  - [x] Hash Generator 기본 알고리즘 SHA-256으로 변경
  - [x] PWA 설치 안내 팝업 색상 스킴 개선 (blue 테마)
  - [x] UUID Generator 타이틀 간소화 (UUID/ULID → UUID)
  - [x] UUID Generator UI 개선 (옵션 카드, 타입 설명, Copy All 버튼)
  - [x] YAML Converter 좌우 패널 높이 일치
  - [x] Text Diff 복사 아이콘 위치 변경 (오른쪽으로)
  - [x] JWT Encoder 기본 알고리즘 None으로 변경
  - [x] Regex Tester 패턴 설명 i18n 적용

- [x] **Cronstrue i18n 통합**:

  - [x] 현재 로케일에 맞는 human-readable cron 설명 표시

- [x] **NanumSquareNeo 폰트 적용**:

  - [x] Variable font 적용 (300-900 weight)
  - [x] Tailwind 기본 sans 폰트로 설정

- [x] **GitHub Stars 뱃지 추가**:
  - [x] 메인 페이지 하단에 GitHub stars 뱃지 표시

---

### Phase 8.6: PWA & SEO 개선 (v1.3.3) ✅ **완료**

#### 8.6.1 PWA 업데이트 알림 수정 ✅ **완료**

- [x] **PWA 업데이트 알림 미표시 버그 수정**:

  - [x] `registerType: 'prompt'` 모드와 `skipWaiting`/`clientsClaim` 충돌 해결
  - [x] vite-plugin-pwa 공식 문서 기반 설정 최적화

- [x] **version.json 기반 업데이트 감지 추가**:

  - [x] 빌드 시 `/version.json` 자동 생성
  - [x] 앱 기동 시 서버 버전 비교
  - [x] 5분마다 주기적 버전 체크
  - [x] 포커스 시 자동 업데이트 체크
  - [x] 온라인 복귀 시 업데이트 체크

- [x] **PWA 트러블슈팅 문서 개선**:
  - [x] `docs/PWA_TROUBLESHOOTING.md` 문서 전면 개편
  - [x] `registerType` 옵션 상세 설명 추가

#### 8.6.2 SEO Sitemap Priority 최적화 ✅ **완료**

- [x] **Priority 전략 수립**:

  - [x] 개발자 검색 패턴 분석 (직접 도구 검색 > 홈페이지 검색)
  - [x] 개별 도구 페이지 우선 전략 결정

- [x] **Priority 구현**:

  - [x] 개별 도구 (en-US): priority 1.0
  - [x] Locale 도구 페이지: priority 0.9
  - [x] 홈 페이지 (모든 locale): priority 0.8
  - [x] `vite-plugin-generate-routes.ts`에 상수 정의

- [x] **문서 업데이트**:
  - [x] `SAS.md`: Sitemap Priority 전략 섹션 추가
  - [x] `RELEASE_NOTES.md`: v1.3.3 릴리즈 노트 업데이트

---

### Phase 9: Cron Parser 고도화 (v1.3.2) ✅ **완료**

v1.3.2는 Cron Parser의 대대적인 고도화로, 여러 cron 방언(UNIX, Quartz, AWS, K8s, Jenkins)을 지원하고 정확한 의미(semantics) 파싱을 제공합니다.

#### 9.0 사용 라이브러리 및 공식 스펙 검증

**현재 설치된 라이브러리**:

| 라이브러리    | 버전  | 용도                | 비고                      |
| ------------- | ----- | ------------------- | ------------------------- |
| `cron-parser` | 5.4.0 | 다음 실행 시간 계산 | UNIX 5/6필드, 타임존 지원 |
| `cronstrue`   | 3.9.0 | Human-readable 설명 | i18n 다국어 지원          |

**추가 검토 라이브러리**:

| 라이브러리        | 버전   | 용도                         | 결정              |
| ----------------- | ------ | ---------------------------- | ----------------- |
| `croner`          | 9.1.0  | Quartz 고급 문법 (`L W # ?`) | 🔶 필요시 추가    |
| `aws-cron-parser` | 1.1.12 | AWS 전용 파서                | 🔶 자체 구현 권장 |

**구현 전략**:

1. **UNIX 파싱**: `cron-parser` 활용 (기존 유지)
2. **Human-readable**: `cronstrue` 활용 (기존 유지)
3. **Quartz 고급 문법**: `croner` 추가 또는 자체 정규식 구현
4. **AWS 래퍼**: 자체 정규식으로 `cron(...)` 추출 후 기존 파서 사용
5. **Jenkins H 토큰**: 자체 구현 (H는 해시 기반 랜덤값이므로 정확한 시뮬레이션 어려움, 경고 표시)

**공식 스펙 검증 완료**:

- ✅ **UNIX/Vixie**: [man7.org/crontab.5](https://man7.org/linux/man-pages/man5/crontab.5.html) - DOM/DOW OR 규칙 확인
- ✅ **Quartz**: [quartz-scheduler.org](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html) - `?` 필수, `L W #` 지원 확인
- ✅ **AWS EventBridge**: [docs.aws.amazon.com](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html#cron-based) - `cron(...)` 래퍼, DOM/DOW 제약 확인
- ✅ **croner (참고)**: [croner.56k.guru](https://croner.56k.guru/usage/pattern/) - `legacyMode` 옵션으로 DOM/DOW AND 전환 가능

#### 9.1 스펙(방언) 지원 인프라 구축

- [ ] **타입 정의**:

  - [ ] `CronSpec` 타입 정의 (`'auto' | 'unix' | 'unix-seconds' | 'quartz' | 'aws' | 'k8s' | 'jenkins'`)
  - [ ] `CronToolState` 확장 (`spec`, `fromDateTime` 필드 추가)
  - [ ] 스펙별 특수 토큰 정의 (`? L W # H` 등)

- [ ] **스펙별 파서 모듈**:
  - [ ] `src/tools/cron/parsers/unix.ts` - UNIX/Vixie 5필드 파서
  - [ ] `src/tools/cron/parsers/unix-seconds.ts` - 6필드 파서
  - [ ] `src/tools/cron/parsers/quartz.ts` - Quartz 6~7필드 파서 (`? L W #` 지원)
  - [ ] `src/tools/cron/parsers/aws.ts` - AWS EventBridge 파서 (래퍼 추출 + year 필드)
  - [ ] `src/tools/cron/parsers/k8s.ts` - Kubernetes 매크로 지원 (`@hourly` 등)
  - [ ] `src/tools/cron/parsers/jenkins.ts` - Jenkins H 토큰 파서

#### 9.2 Auto 감지 로직 구현

- [ ] **Auto 감지 규칙**:

  - [ ] `cron(...)` 래퍼 감지 → AWS
  - [ ] `H`, `H(...)` 감지 → Jenkins
  - [ ] `?`, `L`, `W`, `#` 감지 → Quartz/AWS
  - [ ] 필드 수 기반 1차 분기 (5/6/7)
  - [ ] `@hourly`, `@daily` 매크로 감지 → K8s

- [ ] **래퍼 정규화**:
  - [ ] `cron(...)` 래퍼 추출
  - [ ] `cron('...')`, `cron("...")` 따옴표 제거
  - [ ] 앞뒤 여백/개행/텍스트 제거

#### 9.3 의미(semantics) 정확화

- [ ] **DOM/DOW OR 규칙 (UNIX/Vixie)**:

  - [ ] Human readable에 "OR" 명시
  - [ ] Next runs 계산에 OR 규칙 적용
  - [ ] "AND가 필요하면 표현식 분리" 경고

- [ ] **DOM/DOW 제약 검증 (AWS/Quartz)**:
  - [ ] `*` 동시 사용 금지 규칙
  - [ ] 한쪽 `?` 필요 규칙
  - [ ] 스펙별 에러 메시지

#### 9.4 UI/UX 고도화

- [ ] **컨트롤 바 개선**:

  - [ ] Spec/Profile 드롭다운 추가
  - [ ] Include seconds 동적 활성화/비활성화
  - [ ] Timezone 스펙별 설명 추가

- [ ] **Normalized 표시**:

  - [ ] 입력 아래 "Normalized" 라인
  - [ ] AWS 선택 시 "AWS format" 출력

- [ ] **필드별 분해 + 하이라이트**:

  - [ ] 필드별 해석 카드 (Minutes/Hours/DOM/Month/DOW/Year/Seconds)
  - [ ] 입력 토큰 색상/밑줄 하이라이트
  - [ ] hover 시 서로 강조 (모바일: 탭)
  - [ ] 특수 토큰 배지 표시 (`L/W/#/?/H`)

- [ ] **호환성/주의사항 영역**:
  - [ ] UNIX/Vixie: DOM/DOW OR 경고
  - [ ] Jenkins: H/3 월말 불규칙 경고
  - [ ] AWS: 포맷/제한/TZ/DST 특성
  - [ ] K8s: `TZ=` 미지원 경고

#### 9.5 Next runs 계산 고도화

- [ ] **기준 시각(From) 설정**:

  - [ ] "From" datetime 입력 UI
  - [ ] 기본값 Now, 사용자 지정 가능

- [ ] **출력 포맷 옵션**:

  - [ ] Localized 표시 (i18n)
  - [ ] ISO / RFC3339 / Epoch 복사 버튼

- [ ] **성능 최적화**:
  - [ ] Web Worker로 next-run 계산 오프로드
  - [ ] 계산 중 skeleton + cancel 버튼
  - [ ] 복잡한 표현식 UI 프리징 방지

#### 9.6 변환(Conversion) 기능 (선택)

- [ ] **Convert to 드롭다운**:

  - [ ] UNIX(5) ↔ UNIX+Seconds(6)
  - [ ] UNIX(5) → AWS (`cron(...)` + year)
  - [ ] Jenkins `@hourly`/`H` 설명 출력

- [ ] **변환 불가/비등가 경고**:
  - [ ] UNIX DOM/DOW OR → Quartz/AWS 변환 불가 안내

#### 9.7 i18n 지원

- [ ] **번역 키 추가**:

  - [ ] `tool.cron.spec.*` - 스펙 이름/설명
  - [ ] `tool.cron.field.*` - 필드 이름 (minutes, hours, dom, month, dow, year, seconds)
  - [ ] `tool.cron.warning.*` - 경고 메시지
  - [ ] `tool.cron.normalized` - "Normalized" 라벨
  - [ ] `tool.cron.awsFormat` - "AWS format" 라벨
  - [ ] `tool.cron.fromDateTime` - "From" 라벨
  - [ ] `tool.cron.orSemantics` - DOM/DOW OR 설명

- [ ] **모든 로케일에 번역 추가**:
  - [ ] en-US
  - [ ] ko-KR
  - [ ] ja-JP
  - [ ] zh-CN
  - [ ] es-ES

#### 9.8 테스트 및 검증

- [ ] **파서 단위 테스트**:

  - [ ] 각 스펙별 파서 정확성 테스트
  - [ ] Auto 감지 로직 테스트
  - [ ] 래퍼 정규화 테스트

- [ ] **UI 테스트**:

  - [ ] Spec 드롭다운 동작 확인
  - [ ] 하이라이트 동작 확인
  - [ ] From datetime 입력 동작 확인
  - [ ] Worker 성능 테스트

- [ ] **스펙별 검증 테스트**:
  - [ ] UNIX DOM/DOW OR 계산 정확성
  - [ ] AWS 제약 조건 검증
  - [ ] Quartz 특수 문법 파싱
  - [ ] Jenkins H 토큰 처리

#### 9.9 문서 업데이트

- [ ] **개발 문서**:

  - [ ] `SAS.md` 7.7 섹션 업데이트 ✅ 완료
  - [ ] `IMPLEMENTATION_PLAN.md` Phase 9 추가 ✅ 완료
  - [ ] `RELEASE_NOTES.md` v1.3.2 섹션 추가

- [ ] **SEO 업데이트**:
  - [ ] `vite-plugin-generate-routes.ts` cron 도구 메타 업데이트
  - [ ] keywords에 방언 관련 키워드 추가

#### 참고 문서

- [AWS EventBridge Schedule Types](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [UNIX crontab(5) man page](https://man7.org/linux/man-pages/man5/crontab.5.html)
- [Quartz CronTrigger Tutorial](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [Kubernetes CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)

---

### Phase 10: v1.4.0 API Tester & Monorepo (December 2025) ✅ **완료**

v1.4.0은 **API Tester** 도구 추가와 **pnpm + Turborepo 모노레포 구조**로의 전환을 포함하는 대규모 릴리스입니다.

#### 10.1 모노레포 구조 전환 ✅ **완료**

- [x] **pnpm + Turborepo 도입**:

  - [x] `pnpm-workspace.yaml` 설정
  - [x] `turbo.json` 빌드 파이프라인 설정
  - [x] 패키지 구조 분리:
    - `apps/web`: 메인 웹 애플리케이션
    - `apps/extension`: Chrome Extension
    - `packages/shared`: 공유 타입 및 유틸리티

- [x] **빌드 시스템 통합**:
  - [x] Turborepo 캐싱 설정
  - [x] 패키지간 의존성 관리
  - [x] 통합 빌드/린트 명령어

#### 10.2 API Tester 도구 구현 ✅ **완료**

- [x] **기본 기능**:

  - [x] HTTP 메서드 지원 (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
  - [x] URL 입력 및 Query Params 빌더
  - [x] Headers 빌더
  - [x] Body 타입 지원 (none, JSON, form-data, x-www-form-urlencoded, raw)
  - [x] Response Viewer (syntax highlighting)

- [x] **CORS 처리**:

  - [x] Direct 모드: 표준 fetch (CORS 제한)
  - [x] Extension 모드: Chrome Extension 통해 CORS bypass
  - [x] CORS 에러 안내 모달

- [x] **응답 표시 개선**:

  - [x] HTTP Status Code + Status Text 표시 (예: "200 OK")
  - [x] `http-status-codes` 라이브러리 사용
  - [x] 응답 시간, 헤더, 바디 표시

- [x] **cURL 내보내기**:
  - [x] "Copy as cURL" 기능
  - [x] 모든 옵션 포함 (headers, body, method)

#### 10.3 Chrome Extension v1.0.1 ✅ **완료**

- [x] **Extension 기능**:

  - [x] CORS bypass (declarativeNetRequest API)
  - [x] 도메인별 권한 관리
  - [x] Include Cookies 옵션 (`credentials: 'include'`)
  - [x] 에러 상세 정보 반환

- [x] **Web 연동**:

  - [x] Extension 상태 표시 (Connected/Not Connected)
  - [x] Extension 미설치 시 설치 버튼
  - [x] 에러 상세 보기 (collapsible)

- [x] **문서화**:
  - [x] `apps/extension/CHANGELOG.md`
  - [x] `apps/extension/PRIVACY_POLICY.md`

#### 10.4 i18n 지원 ✅ **완료**

- [x] **API Tester 번역 키 추가**:
  - [x] 모든 UI 문자열 i18n 적용
  - [x] 5개 언어 지원 (en-US, ko-KR, ja-JP, zh-CN, es-ES)
  - [x] 기술 용어는 영문 유지 (예: "via extension")

#### 10.5 빌드 및 배포 ✅ **완료**

- [x] **빌드 검증**:

  - [x] `npm run build` 성공
  - [x] `npm run lint` 통과
  - [x] Extension 빌드 분리 (`npm run build:extension`)

- [x] **문서 업데이트**:
  - [x] `RELEASE_NOTES.md` v1.4.0 섹션 추가
  - [x] `IMPLEMENTATION_PLAN.md` Phase 10 추가
  - [x] Extension 관련 문서 업데이트

---

### Phase 11: v1.4.2 API Response Diff & Locale-specific SEO (December 2025) ✅ **완료**

v1.4.2는 **API Response Diff** 도구 추가와 **언어별 SEO 최적화**를 포함하는 릴리스입니다.

#### 11.1 API Response Diff 도구 구현 ✅ **완료**

- [x] **기본 구조**:

  - [x] `src/tools/api-diff/` 디렉토리 생성
  - [x] 타입 정의 (`types.ts`)
  - [x] 상수 정의 (`constants.ts`)
  - [x] 컴포넌트 구조 설계

- [x] **UI 구현**:

  - [x] `TopSharedPanel`: Domain A/B 입력, Method, Path, Params, Headers, Body
  - [x] `SidePanel`: 응답 패널 (Body, Headers, Raw, cURL 탭)
  - [x] `ResultBanner`: 비교 결과 배너 및 Diff 테이블
  - [x] `KeyValueEditor`: Parameters/Headers 에디터
  - [x] `DomainPresetModal`: 도메인 프리셋 관리 모달
  - [x] CodeMirror Body 에디터

- [x] **요청 실행**:

  - [x] `useApiDiffExecutor` 훅 구현
  - [x] Chrome Extension 모드 지원
  - [x] 병렬 요청 실행 (A/B 동시)
  - [x] 타임아웃 처리 (10초)

- [x] **비교 로직**:

  - [x] `deepEqualIgnoringKeyOrder` 함수
  - [x] `findDifferentFields` 함수
  - [x] 상태코드 + JSON Body 비교
  - [x] 상이한 필드 테이블 표시

- [x] **추가 기능**:
  - [x] 히스토리 관리 (최대 30개)
  - [x] URL 공유 기능
  - [x] Copy (cURL, JSON)
  - [x] Download JSON
  - [x] Diff 테이블 높이 조절

#### 11.2 Locale-specific SEO 구현 ✅ **완료**

- [x] **i18n 기반 SEO**:

  - [x] `vite-plugin-generate-routes.ts`에 i18n 리소스 임포트
  - [x] Tool ID → i18n meta key 매핑 함수
  - [x] `generateToolHtml` 함수 locale별 SEO 적용
  - [x] `generateHomeHtml` 함수 locale별 SEO 적용

- [x] **i18n 리소스 업데이트**:

  - [x] 모든 도구의 description 최신화 (en-US)
  - [x] 모든 locale에 번역 반영 (ko-KR, ja-JP, zh-CN, es-ES)
  - [x] `meta.home` 섹션 추가 (홈 페이지 SEO)

- [x] **SEO 메타 정보**:
  - [x] locale별 title 적용
  - [x] locale별 description 적용
  - [x] Open Graph / Twitter Card 메타 태그 locale화
  - [x] JSON-LD 구조화 데이터 locale화

#### 11.3 i18n 지원 ✅ **완료**

- [x] **API Response Diff 번역 키**:
  - [x] `tool.apiDiff.*` 네임스페이스 추가
  - [x] `meta.apiDiff.*` SEO 메타 추가
  - [x] 5개 언어 지원 완료

#### 11.4 빌드 및 문서 ✅ **완료**

- [x] **빌드 검증**:

  - [x] `npm run build` 성공
  - [x] `npm run lint` 통과
  - [x] locale별 HTML 파일 생성 확인

- [x] **문서 업데이트**:
  - [x] `RELEASE_NOTES.md` v1.4.2 섹션 추가
  - [x] `IMPLEMENTATION_PLAN.md` Phase 11 추가
  - [x] `docs/V1.4.2_REQUIREMENTS.md` 상태 업데이트
