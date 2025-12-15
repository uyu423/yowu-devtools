# yowu-devtools v1.4.0 구현 계획

## API Tester + Companion Chrome Extension Implementation Plan

---

## 개요

이 문서는 v1.4.0 개발을 위한 구현 계획을 정리합니다.
요구사항 상세는 `SAS_v1.4.0.md`를 참조하세요.

> **Note**: 이 문서는 AI Agent가 작업할 수 있는 대략적인 구조와 체크리스트만 포함합니다.
> 구체적인 코드 구현은 AI Agent가 SAS 문서와 기존 코드베이스를 참고하여 작성합니다.

---

## Phase 1: Monorepo 구조 전환 ✅ (완료: 2024-12-16)

### 1.1 패키지 매니저 전환 (npm → pnpm) ✅

**작업 내용**:
1. pnpm 설치
2. `pnpm-workspace.yaml` 생성
3. `package-lock.json` → `pnpm-lock.yaml` 전환

**체크리스트**:
- [x] pnpm 설치 및 설정 (v10.25.0)
- [x] 기존 스크립트 동작 확인

### 1.2 디렉토리 구조 재구성 ✅

**구현된 구조**:
```
yowu-devtools/
├── apps/
│   ├── web/                 # 기존 웹앱 (@yowu-devtools/web)
│   └── extension/           # Chrome Extension (Phase 2에서 생성)
├── packages/
│   └── shared/              # 공유 타입/유틸 (@yowu-devtools/shared)
├── package.json             # Root (Turborepo 스크립트)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── .npmrc                   # pnpm 설정 (shamefully-hoist)
```

**체크리스트**:
- [x] apps/web으로 기존 코드 이동
- [x] packages/shared 생성 (공유 타입 정의)
- [x] 경로 참조 수정 (vite-plugin-generate-routes.ts 등)
- [x] GitHub Actions 워크플로우 수정 (pnpm + monorepo)
- [x] 빌드 테스트 통과

### 1.3 Turborepo 설정 ✅

**체크리스트**:
- [x] turbo.json 생성
- [x] 루트 스크립트 설정 (dev, build, lint)
- [x] 빌드 캐싱 동작 확인

### 1.4 추가 작업 사항

- [x] `.npmrc` 추가 (`shamefully-hoist=true` - pnpm 호환성)
- [x] `workbox-window` 명시적 의존성 추가 (PWA 빌드)
- [x] `.gitignore`에 `.turbo` 추가
- [x] 개발 서버 및 브라우저 동작 확인

---

## Phase 2: Chrome Extension 기본 구조 ✅ (완료: 2024-12-16)

### 2.1 Extension 프로젝트 설정 ✅

**체크리스트**:
- [x] apps/extension 디렉토리 생성
- [x] Manifest V3 작성
- [x] Vite 빌드 설정 (@crxjs/vite-plugin 사용)
- [x] ESLint 설정 (eslint.config.js)

### 2.2 Manifest V3 핵심 설정 ✅

**구현된 설정**:
- `manifest_version`: 3
- `permissions`: `["storage"]`
- `optional_host_permissions`: `["http://*/*", "https://*/*"]`
- `externally_connectable.matches`: `["https://tools.yowu.dev/*", "http://localhost:5173/*"]`
- `background.service_worker`: Event-driven (비활성 상태 유지)

**체크리스트**:
- [x] manifest.json 작성
- [x] 아이콘 파일 생성 (16, 48, 128px) - 웹앱 아이콘 재사용
- [ ] 고정 Extension ID 설정 (key 필드) - 프로덕션 배포 시 추가 예정

### 2.7 테스트 완료 ✅

- [x] Extension 빌드 성공 (`pnpm run build`)
- [x] Chrome에 Extension 로드 성공
- [x] PING/PONG 통신 테스트 성공
- [x] Options 페이지 정상 동작 확인

### 2.3 Service Worker 구현 ✅

> **중요**: Service Worker는 **이벤트 기반**으로 동작하며, 평소에는 비활성 상태입니다.
> WebApp에서 메시지가 오면 활성화되고, 작업 완료 후 다시 비활성화됩니다.

**핵심 기능**:
- `chrome.runtime.onMessageExternal` 리스너 등록
- Origin 검증 (허용된 도메인만)
- 메시지 타입별 핸들러 분기
- 런타임 권한 관리

**체크리스트**:
- [x] 메시지 리스너 구현
- [x] Origin 검증 로직
- [x] Request Executor 구현 (fetch 실행, timeout, body 처리)
- [x] 권한 확인/요청/회수 함수

### 2.4 Options 페이지 구현 ✅

**기능**:
- 승인된 도메인 목록 표시
- 개별/전체 권한 회수
- Extension 정보 표시
- 다크모드 지원 (prefers-color-scheme)

**체크리스트**:
- [x] Options 페이지 UI (options.html + options.ts)
- [x] 권한 제거 기능 (개별/전체)
- [x] 권한 변경 이벤트 리스너

### 2.5 확장성 아키텍처 ✅

**핵심 설계**:
- 모든 메시지에 `version` 필드 포함
- Handler Registry 패턴으로 메시지 핸들러 등록
- Feature Flag 시스템으로 기능 분기

**체크리스트**:
- [x] BaseMessage 타입 정의 (version 포함) - @yowu-devtools/shared
- [x] Handler Registry 구현 (registerHandler 패턴)
- [x] Feature 상수 정의 (SUPPORTED_FEATURES)
- [x] Handshake 메시지 구현 (PING/PONG, HANDSHAKE/HANDSHAKE_ACK)

### 2.6 공유 타입 패키지 ✅

**packages/shared/src/types/api-tester.ts**:
- RequestSpec, ResponseSpec 타입
- WebAppMessage, ExtensionResponse 타입
- PROTOCOL_VERSION, SUPPORTED_FEATURES 상수
- ERROR_CODES, HTTP_METHODS 상수
- ALLOWED_ORIGINS 목록

---

## Phase 3: WebApp API Tester 도구 ✅ (완료: 2024-12-17)

### 3.1 도구 기본 구조 ✅

**구현된 파일 구조**:
```
apps/web/src/tools/api-tester/
├── index.tsx              # 도구 정의 및 메인 컴포넌트
├── types.ts               # 상태 및 데이터 타입 정의
├── components/
│   ├── MethodSelector.tsx # HTTP 메서드 선택
│   ├── UrlInput.tsx       # URL 입력 (쿼리 파라미터 자동 파싱)
│   ├── SendButton.tsx     # 요청 전송 버튼
│   ├── KeyValueEditor.tsx # 쿼리 파라미터/헤더 편집기
│   ├── BodyEditor.tsx     # 요청 바디 편집기 (타입별)
│   ├── ResponseViewer.tsx # 응답 뷰어 (Tree/Pretty/Raw)
│   ├── HistorySidebar.tsx # 히스토리 사이드바
│   └── ExtensionStatus.tsx # 확장 프로그램 상태 표시
├── hooks/
│   ├── useExtension.ts    # Extension 통신 훅
│   ├── useApiHistory.ts   # 히스토리/즐겨찾기 관리 훅
│   └── useRequestExecutor.ts # 요청 실행 훅 (CORS 전략 포함)
└── utils/
    └── index.ts           # 유틸리티 함수 (URL 파싱, cURL 생성 등)
```

**체크리스트**:
- [x] 도구 디렉토리 생성
- [x] 상태 타입 정의 (ApiTesterState, HistoryItem, ResponseData 등)
- [x] 도구 레지스트리에 등록 (tools/index.ts)
- [x] 라우팅 확인 (/api-tester, /ko-KR/api-tester 등)

### 3.2 레이아웃 구조 ✅

**2단 레이아웃**:
- 좌측: Request Builder (메서드, URL, 파라미터, 헤더, 바디)
- 우측: Response Viewer (상태, 헤더, 바디)

**체크리스트**:
- [x] ApiTester 메인 컴포넌트 (flex 레이아웃)
- [x] 반응형 디자인 (모바일/데스크탑)
- [x] 좌우 패널 분할

### 3.3 Request Builder UI ✅

**구현된 컴포넌트**:
- MethodSelector (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- UrlInput (URL 입력 및 쿼리 파라미터 자동 파싱)
- SendButton (로딩 상태, 비활성화 상태 지원)
- KeyValueEditor (체크박스, 키/값 입력, 추가/삭제)
- BodyEditor (none, text, JSON, urlencoded, multipart)

**체크리스트**:
- [x] 각 컴포넌트 구현
- [x] Body 타입별 에디터 (none, text, JSON, urlencoded, multipart)
- [x] CodeMirror JSON 에디터 통합
- [x] Mode 선택 (Direct/Extension)
- [x] Copy as cURL 버튼

### 3.4 Response Viewer UI ✅

**구현된 기능**:
- ResponseSummary (상태 코드, 응답 시간, 크기, Content-Type)
- ResponseBody (Tree/Pretty/Raw 뷰 전환)
- ResponseHeaders (테이블 형식)

**체크리스트**:
- [x] 상태 코드 색상화 (2xx: 초록, 3xx: 파랑, 4xx: 주황, 5xx: 빨강)
- [x] JSON Tree Viewer (react-json-view-lite)
- [x] Pretty JSON (CodeMirror)
- [x] Raw 텍스트 뷰
- [x] 이미지 응답 미리보기
- [x] 바이너리 다운로드 버튼

### 3.5 History Sidebar ✅

**구현된 기능**:
- 히스토리 목록 UI
- 즐겨찾기 기능 (별 아이콘)
- Context Menu (이름 변경, 삭제)
- Clear History

**체크리스트**:
- [x] 히스토리 목록 UI 구현
- [x] 즐겨찾기 기능 구현
- [x] Context Menu 구현
- [x] Clear History 구현
- [x] 검색 기능 구현

### 3.6 CORS 우회 전략 구현 ✅

**구현된 전략**:
1. Direct fetch (CORS 허용 API)
2. Extension 모드 (CORS 제한 우회)

**성공 방법 캐싱**:
- localStorage에 도메인별 성공 방법 저장
- 캐시 만료 정책: 7일
- 캐시 무효화: 실패 시 자동 재시도

**체크리스트**:
- [x] useRequestExecutor 훅 구현
- [x] Direct/Extension 모드 전환
- [x] 성공 방법 캐싱 로직
- [x] 캐시 만료/무효화 로직

### 3.7 Extension 통신 ✅

**useExtension 훅**:
- 연결 상태 관리 (checking, connected, not-installed, error)
- 요청 실행 함수 (executeRequest)
- 권한 확인/요청/회수 함수

**체크리스트**:
- [x] useExtension 훅 구현
- [x] PING/PONG 핸드셰이크
- [x] 요청 실행 함수 (EXECUTE_REQUEST)
- [x] 권한 확인/요청 함수 (CHECK_PERMISSION, REQUEST_PERMISSION)
- [x] Extension 상태 배너 UI

### 3.8 히스토리/즐겨찾기 ✅

**useApiHistory 훅**:
- 히스토리 CRUD
- 즐겨찾기 관리
- localStorage 저장

**체크리스트**:
- [x] useApiHistory 훅 구현
- [x] 최대 30개 히스토리 관리
- [x] 즐겨찾기 토글 기능

### 3.9 i18n 및 SEO ✅

**i18n 번역 키 추가**:
- `tool.apiTester.*`: 도구 UI 텍스트
- `meta.apiTester.*`: SEO 메타 태그

**체크리스트**:
- [x] en-US.ts에 키 추가
- [x] ko-KR.ts에 번역 추가
- [x] ja-JP.ts에 번역 추가
- [x] zh-CN.ts에 번역 추가
- [x] es-ES.ts에 번역 추가

**SEO 설정**:
- [x] vite-plugin-generate-routes.ts에 도구 정보 추가
- [x] 빌드 후 메타 태그 확인
- [x] sitemap.xml 업데이트 확인 (모든 로케일)

---

## Phase 4: UI 고도화 ✅ (완료: 2024-12-16)

### 4.1 요청 빌더 UI 개선 ✅

**변경 사항**:
- 탭 기반 UI → 수직 섹션 기반 UI 전환
- Query Parameters: 항상 표시, 기본 펼침, 접기 지원
- Headers: Query 아래 위치, 기본 접힘, 펼치기 지원
- Body: POST/PUT/PATCH/DELETE 메서드일 때만 표시

**체크리스트**:
- [x] CollapsibleSection 컴포넌트 구현
- [x] 탭 UI 제거, 수직 섹션 레이아웃 적용
- [x] 섹션별 접기/펼치기 상태 관리

### 4.2 Chrome Extension 배지 개선 ✅

**변경 사항**:
- 컴팩트 배지 디자인: "Chrome Extension {상태 인디케이터}"
- 상태별 색상 인디케이터 (⚪/🔴/🟡/🟢)
- 마우스 오버 툴팁으로 상세 상태 표시
- Mode 선택 UI 제거 (자동 모드 선택으로 대체)

**체크리스트**:
- [x] ExtensionStatus 컴포넌트 리팩토링
- [x] Tooltip 통합
- [x] ExtensionModeSelector 컴포넌트 제거

### 4.3 자동 Mode 선택 + CORS 모달 ✅

**변경 사항**:
- Direct 모드 자동 시도 → CORS 에러 감지 → 모달 표시
- Extension 설치 시: "Extension으로 재시도" 모달
- Extension 미설치 시: "Extension 설치 필요" 모달

**체크리스트**:
- [x] CorsModal 컴포넌트 구현
- [x] CORS 에러 감지 시 모달 자동 표시
- [x] Extension 상태에 따른 모달 내용 분기

### 4.4 Response Viewer 개선 ✅

**변경 사항**:
- 4xx/5xx HTTP 에러도 Response로 표시 (Body, Headers 탭 사용 가능)
- 네트워크/CORS 에러만 별도 에러 UI 표시
- max-width 최적화 (Pretty Viewer 전체 활용)
- Tree/Pretty 뷰에서 복사 시 Pretty 포맷 데이터 복사
- Tree 뷰에서 http/https URL 자동 링크 변환

**체크리스트**:
- [x] 4xx/5xx 응답 정상 표시 로직
- [x] max-width CSS 최적화
- [x] handleCopy 함수 개선 (Pretty 데이터 복사)
- [x] JsonWithLinks 컴포넌트 구현 (URL 링크화)

### 4.5 History Sidebar 개선 ✅

**변경 사항**:
- 기본 상태: 펼쳐진 상태 (isOpen = true)
- 너비 확장: 288px → 384px (30% 증가)

**체크리스트**:
- [x] 기본 상태 펼침으로 변경
- [x] 너비 384px로 확장

---

## Phase 5: 테스트 및 검증 (2-3일)

### 5.1 WebApp 테스트

- [ ] Direct 모드 - CORS 허용 API
- [ ] Direct 모드 - CORS 차단 API → 에러 안내
- [ ] CORS 우회 전략 순차 시도
- [ ] 성공 방법 캐싱 동작
- [ ] 다양한 HTTP 메서드
- [ ] 다양한 Body 타입
- [ ] 히스토리/즐겨찾기
- [ ] 공유 링크
- [ ] 반응형 레이아웃
- [ ] 다크모드

### 5.2 Extension 테스트

- [ ] Chrome 개발자 모드 로드
- [ ] PING/PONG 통신
- [ ] 권한 요청 흐름
- [ ] cross-origin fetch
- [ ] Options 페이지

### 5.3 통합 테스트

- [ ] WebApp ↔ Extension 통신
- [ ] 권한 요청 → 승인 → 재시도
- [ ] 에러 전파
- [ ] Extension 비활성 상태 유지 확인

---

## Phase 6: 문서화 및 배포 준비 (2일)

### 6.1 문서 업데이트

- [ ] README.md 업데이트
- [ ] RELEASE_NOTES.md 작성
- [ ] Extension 설치 가이드

### 6.2 배포 준비

**WebApp**:
- [ ] GitHub Actions 워크플로우 수정
- [ ] 빌드 테스트

**Extension**:
- [ ] 프로덕션 빌드
- [ ] Chrome Web Store 게시 준비 (개발자 계정, 스크린샷 등)

---

## 로컬 개발 환경

### 개발 워크플로우

```bash
# 1. WebApp + Extension 동시 개발
pnpm run dev

# 2. Extension 빌드
pnpm run build:extension

# 3. Chrome에 Extension 로드
# chrome://extensions/ → 개발자 모드 → 압축 해제된 확장 프로그램 로드
# apps/extension/dist 폴더 선택
```

### 환경변수

```bash
# apps/web/.env.local
VITE_EXTENSION_ID=<고정 Extension ID>
```

### 테스트용 API

| 용도 | URL |
|-----|-----|
| CORS 허용 | `https://jsonplaceholder.typicode.com/posts` |
| CORS 차단 | `https://httpbin.org/get` |
| 에러 테스트 | `https://httpbin.org/status/500` |
| 지연 테스트 | `https://httpbin.org/delay/3` |

---

## 일정 요약

| Phase | 작업 | 예상 기간 |
|-------|------|----------|
| Phase 1 | Monorepo 구조 전환 | 2-3일 |
| Phase 2 | Chrome Extension 기본 구조 | 3-4일 |
| Phase 3 | WebApp API Tester 도구 | 5-7일 |
| Phase 4 | i18n 및 SEO | 2일 |
| Phase 5 | 테스트 및 검증 | 2-3일 |
| Phase 6 | 문서화 및 배포 준비 | 2일 |
| **합계** | | **16-21일** |

---

## 위험 요소 및 대응

### 위험 1: Extension 권한 요청 UX

- **문제**: `chrome.permissions.request()`는 사용자 제스처 컨텍스트에서만 동작
- **대응**: WebApp에서 버튼 클릭 후 Extension으로 권한 요청 메시지 전달

### 위험 2: Extension ID 관리

- **문제**: 개발 중 Extension ID가 변경될 수 있음
- **대응**: manifest.json에 `key` 필드로 고정 ID 사용

### 위험 3: Chrome Web Store 심사

- **문제**: Extension 게시 심사에 시간이 소요됨
- **대응**: 먼저 개발자 모드로 테스트, 심사는 병렬 진행

### 위험 4: Service Worker 비활성화

- **문제**: Service Worker가 비활성화되면 메시지 처리 지연 발생
- **대응**: 이벤트 리스너만 등록, 상태는 필요할 때만 로드

---

_구현 계획 끝_
