# Test Issues - v1.2.0

이 문서는 v1.2.0 버전 테스트 중 발견된 이슈들을 기록합니다.

**테스트 날짜**: 2025-12-14  
**테스트 환경**: Chrome/Edge (최신 버전)  
**테스트 범위**: TEST_CHECKLIST.md의 모든 항목

## 테스트 진행 상황

### 완료된 테스트

#### US-01: JSON Pretty Viewer
- ✅ 유효한 JSON 입력 시 파싱 성공 확인
- ✅ 잘못된 JSON 입력 시 에러 메시지 표시 확인
- ✅ Tree/Pretty/Minified 모드 전환 확인
- ✅ Tree View 노드 확장/축소 동작 확인
- ✅ 에러 메시지에 줄 번호/컬럼 정보 포함 확인

#### US-17: Command Palette (v1.2.0)
- ✅ ⌘K / Ctrl+K 단축키로 팔레트 열기 확인
- ✅ 도구 검색 기능 확인
- ✅ 최근 도구 표시 확인
- ✅ 키보드 네비게이션 (↑↓, Enter, ESC) 확인

#### US-02: URL Encode/Decode
- ✅ 페이지 로드 확인
- ✅ 기본 인코딩 동작 확인 (자동 인코딩)
- ✅ 특수문자 인코딩 확인 (`&`, `=` 등)

#### US-18: 파일 워크플로우 - 파일 열기 (v1.2.0)
- ✅ FileInput 컴포넌트 구현 확인 (Drag & Drop, 파일 선택 다이얼로그)
- ✅ JSON 도구: accept=".json,application/json", maxSize=50MB 확인
- ✅ YAML 도구: accept 동적 변경 확인 (방향에 따라 .yaml/.yml 또는 .json)
- ✅ Diff 도구: 좌우 각각 FileInput 구현 확인, accept=".txt,text/plain"
- ✅ 파일 크기 제한 로직 확인 (maxSize 체크)
- ✅ 에러 처리 로직 확인 (파일 읽기 실패, 크기 초과)
- ✅ 로딩 인디케이터 구현 확인
- ✅ Toast 알림 구현 확인 (성공/실패)
- ⚠️ 실제 파일 업로드 테스트는 수동으로 진행 필요 (브라우저 파일 선택 다이얼로그 필요)

#### US-19: 파일 워크플로우 - 파일 저장 (v1.2.0)
- ✅ FileDownload 컴포넌트 구현 확인
- ✅ JSON 도구: "Download Pretty" (output.json), "Download Minified" (output.min.json) 테스트 완료
- ✅ YAML 도구: "Download" 버튼 테스트 완료 (방향에 따라 output.json 또는 output.yaml)
- ✅ Diff 도구: "Download Unified" 버튼 확인 (diff.txt)
- ✅ 다운로드 성공 시 Toast 알림 확인 ("File downloaded successfully")
- ✅ 파일명 제안 기능 확인 (각 도구별 적절한 파일명)
- ✅ 파일 확장자 확인 (.json, .yaml, .txt)
- ✅ MIME 타입 설정 확인 (getMimeType 함수 사용)
- ✅ Blob 생성 및 다운로드 로직 확인
- ✅ 다운로드 중 버튼 비활성화 확인 (disabled prop)

#### US-03: Base64 Encode/Decode
- ✅ 페이지 로드 확인
- ✅ 기본 인코딩 동작 확인 (자동 인코딩)
- ✅ 이모지 인코딩 확인 (UTF-8 지원)
- ✅ URL Safe 옵션 확인

#### US-04: Epoch/ISO Time Conversion
- ✅ 페이지 로드 확인
- ✅ 기본 시간 변환 확인

#### US-05: YAML ↔ JSON Conversion
- ✅ 페이지 로드 확인
- ✅ 기본 변환 동작 확인
- ✅ 방향 전환 기능 확인

#### US-06: Text Diff
- ✅ 페이지 로드 확인
- ✅ 기본 Diff 동작 확인
- ✅ Split/Unified View 전환 확인

#### US-07: CRON Expression Parser
- ✅ 페이지 로드 확인
- ✅ 기본 파싱 동작 확인

#### US-21: JWT Decoder/Encoder (v1.2.0)
- ✅ 페이지 로드 확인
- ✅ 기본 디코딩 동작 확인

#### US-22: Hash/Checksum Generator (v1.2.0)
- ✅ 페이지 로드 확인
- ✅ 기본 해시 생성 확인

#### US-23: UUID/ULID Generator (v1.2.0)
- ✅ 페이지 로드 확인
- ✅ 기본 생성 동작 확인

#### US-25: Password Generator (v1.2.0)
- ✅ 페이지 로드 및 기본 기능 확인
- ✅ 비밀번호 생성 확인

#### US-08: URL 공유 기능
- ✅ Share State 버튼 클릭 시 공유 링크 생성 확인
- ✅ Toast 알림 "Share link copied." 표시 확인
- ✅ URL에 상태 정보 포함 확인 (URL fragment)
- ✅ 공유 링크 생성 기능 정상 작동

#### US-09: 상태 자동 저장/복원
- ✅ Reset 버튼 클릭 시 기본 상태로 초기화 확인
- ✅ 입력값이 기본값으로 복원 확인
- ✅ 옵션 설정이 기본값으로 복원 확인

#### US-10: 동적 페이지 타이틀
- ✅ JSON 도구: "JSON Viewer | Yowu's DevTools" 확인
- ✅ Base64 도구: "Base64 Converter | Yowu's DevTools" 확인
- ✅ Time 도구: "Time Converter | Yowu's DevTools" 확인
- ✅ 각 도구별 타이틀 정상 변경 확인

#### US-12: 최근 사용한 도구 (v1.1.0)
- ✅ 사이드바에 "Recent" 섹션 표시 확인
- ✅ 최근 사용한 도구 목록 표시 확인 (최대 3개)
- ✅ 최신 도구가 상단에 표시 확인
- ✅ Command Palette에서도 최근 도구 표시 확인

#### US-17: Command Palette (v1.2.0)
- ✅ ⌘K / Ctrl+K 단축키로 팔레트 열기 확인
- ✅ ESC 키로 팔레트 닫기 확인
- ✅ 도구 검색 기능 확인
- ✅ 최근 도구 표시 확인
- ✅ 키보드 네비게이션 안내 표시 확인 (↑↓ Navigate Enter Select Esc Close)

#### US-16: Web Worker 성능 최적화 (v1.1.0) - 대용량 데이터 테스트

**대용량 데이터 테스트 (우선순위 높음)**

##### JSON Viewer - large-json.json (2.3MB, 73,755줄)
- ✅ Worker 사용 조건 확인: `shouldUseWorkerForText(input, 1_000_000, 10_000)` - 경계값 확인 완료
- ✅ Worker 구현 확인: `json-parser.worker.ts` - requestId 포함하여 응답 순서 보장
- ✅ 코드 레벨 검증 완료:
  - 파일 크기: 2.3MB > 1MB 경계값 ✓
  - 줄 수: 73,755줄 > 10,000줄 경계값 ✓
  - Worker 활성화 조건 충족 ✓
- ✅ Request ID 기반 응답 순서 보장 확인 (v1.2.0)
- ⚠️ 실제 파일 로드 테스트 필요: 브라우저에서 `test-data/large-json.json` 파일 직접 로드하여 확인 필요
  - DevTools → Sources → Workers에서 `json-parser.worker.ts` 확인 필요
  - UI 프리징 없이 처리되는지 확인 필요
  - 로딩 인디케이터 표시 확인 필요

##### YAML Converter - large-yaml.yaml (604KB, 22,915줄)
- ✅ Worker 사용 조건 확인: `shouldUseWorkerForText(source, 500_000, 10_000)` - 경계값 확인 완료
- ✅ Worker 구현 확인: `yaml-converter.worker.ts` - requestId 포함하여 응답 순서 보장
- ✅ 코드 레벨 검증 완료:
  - 파일 크기: 604KB > 500KB 경계값 ✓
  - 줄 수: 22,915줄 > 10,000줄 경계값 ✓
  - Worker 활성화 조건 충족 ✓
- ✅ Request ID 기반 응답 순서 보장 확인 (v1.2.0)
- ⚠️ 실제 파일 로드 테스트 필요: 브라우저에서 `test-data/large-yaml.yaml` 파일 직접 로드하여 확인 필요
  - DevTools → Sources → Workers에서 `yaml-converter.worker.ts` 확인 필요
  - UI 프리징 없이 처리되는지 확인 필요
  - 로딩 인디케이터 표시 확인 필요

##### Text Diff - large-text-1.txt, large-text-2.txt (각각 2.5MB, 10,503줄)
- ✅ Worker 사용 조건 확인: `shouldUseWorkerForText(text, 500_000, 10_000)` - 경계값 확인 완료
- ✅ Worker 구현 확인: `diff-calculator.worker.ts` - requestId 포함하여 응답 순서 보장
- ✅ 코드 레벨 검증 완료:
  - 파일 크기: 2.5MB > 500KB 경계값 ✓
  - 줄 수: 10,503줄 > 10,000줄 경계값 ✓
  - Worker 활성화 조건 충족 ✓
- ✅ Request ID 기반 응답 순서 보장 확인 (v1.2.0)
- ⚠️ 실제 파일 로드 테스트 필요: 브라우저에서 두 파일 모두 직접 로드하여 확인 필요
  - DevTools → Sources → Workers에서 `diff-calculator.worker.ts` 확인 필요
  - UI 프리징 없이 처리되는지 확인 필요
  - 로딩 인디케이터 표시 확인 필요

##### Base64 Converter - large-base64.txt (1.4MB)
- ✅ 파일 크기 확인: 1.4MB
- ⚠️ Base64 도구는 Worker 미사용 (현재 구현 확인 필요)
- ⚠️ 실제 파일 로드 테스트 필요: 브라우저에서 `test-data/large-base64.txt` 파일 직접 로드하여 확인 필요
  - 디코딩 성능 확인 필요
  - UI 프리징 없이 처리되는지 확인 필요

**Worker 응답 순서 보장 (v1.2.0)**
- ✅ `useWebWorker` 훅에서 requestId 기반 응답 필터링 구현 확인
- ✅ 각 Worker에서 requestId를 응답에 포함하여 전송 확인
- ✅ 이전 요청의 응답이 무시되는지 확인 (race condition 방지)

**주의사항**
- 실제 파일 로드 테스트는 브라우저에서 수동으로 진행해야 함 (MCP 브라우저 도구 제한)
- 모든 테스트 데이터 파일은 Worker 경계값을 넘어서 생성되어 Worker 활성화 보장
- Worker가 활성화되지 않는 경우 파일 크기/줄 수 확인 필요

#### US-11: 사이드바 네비게이션
- ✅ 로고 클릭 시 새 탭에서 `https://yowu.dev/` 열림 확인
- ✅ 도구 메뉴 클릭 시 해당 도구 페이지로 이동 확인
- ✅ 현재 활성화된 도구 하이라이트 표시 확인 (`[active]` 상태)
- ✅ 사이드바 기본 기능 정상 작동 확인

#### US-13: 즐겨찾기 기능
- ✅ 즐겨찾기 버튼 클릭 시 활성화 상태 변경 확인 (`[active]` 상태)
- ✅ 사이드바에 Favorites 섹션 표시 확인
  - `favoriteTools.length > 0`일 때만 표시됨
  - 즐겨찾기 도구가 별 아이콘과 함께 표시됨
- ✅ localStorage 저장 동작 확인 완료 ✅ 수정 완료
  - 즐겨찾기 버튼 클릭 후 localStorage에 정상적으로 저장됨 (`["json"]`)
  - 사이드바에 Favorites 섹션이 즉시 표시됨
  - **수정 내용**: `useFavorites` 훅의 `handleFavoritesChanged` 이벤트 핸들러가 이벤트의 `detail`을 우선 사용하도록 수정
  - `toggleFavorite`, `addFavorite`, `removeFavorite` 함수에서 직접 localStorage 저장 및 이벤트 발생하도록 수정

#### US-20: 공유 범위 표시 (v1.2.0)
- ✅ ShareModal 컴포넌트 구현 확인 (`src/components/common/ShareModal.tsx`)
- ✅ 포함된 필드 목록 표시 확인 (`includedFields` prop)
- ✅ 제외된 필드 설명 표시 확인 (`excludedFields` prop)
- ✅ 민감정보 경고 메시지 표시 확인 (`isSensitive` prop)
- ✅ 모달 UI 구현 확인 (오버레이, 헤더, 푸터, 버튼)

#### US-22: 버전 표시 (v1.2.0)
- ✅ 메인 페이지에 버전 표시 확인 (`App.tsx` - `v{APP_VERSION}`)
- ✅ `package.json`의 `version`과 일치 확인 (`1.2.0`)
- ✅ 빌드 타임 버전 주입 확인 (`vite.config.ts`에서 `APP_VERSION` 정의)
- ✅ `src/lib/constants.ts`에 `APP_VERSION` export 확인
- ⚠️ 사이드바 footer 버전 표시는 의도적으로 제거됨 (V1.2.0_CROSS_CHECK.md 참조)

#### US-21: Web Share API 지원 (v1.2.0)
- ✅ Web Share API 구현 확인 (`useToolState.ts`의 `shareViaWebShare` 함수)
- ✅ `navigator.share` API 감지 로직 확인
- ✅ 모바일 감지 로직 확인 (`isMobileDevice` 또는 User Agent 체크)
- ✅ 모바일에서 공유 시트 열기 구현 확인
- ✅ 데스크탑 폴백: 클립보드 복사로 동작 확인
- ✅ 에러 처리 확인 (AbortError 처리, 공유 취소 시 에러 없음)
- ✅ Toast 알림 구현 확인 (성공/실패)
- ⚠️ 실제 모바일 환경에서 테스트 필요 (브라우저 MCP 도구 제한)

#### US-14: JWT 디코딩/인코딩 상세 테스트 (v1.1.0)
- ✅ JWT 디코딩 기능 확인 (Header, Payload, Signature 분리)
- ✅ Header JSON 표시 확인 (react-json-view-lite 사용)
- ✅ Payload JSON 표시 확인
- ✅ Signature 표시 확인
- ✅ Raw 값 표시 확인 (Base64URL 디코딩 전)
- ✅ 서명 검증 기능 확인 (HMAC 알고리즘: HS256, HS384, HS512)
- ✅ 토큰 유효성 검사 확인 (만료 시간 `exp` 확인)
- ✅ Encode 모드 전환 확인 (Decode ↔ Encode)
- ✅ 페이지 타이틀 동적 변경 확인 ("JWT Decoder" / "JWT Encoder")
- ✅ 복사 기능 확인 (Header JSON, Payload JSON, Signature 복사)
- ✅ Validation Status 표시 확인 (Valid/Invalid, 만료 여부)
- ✅ Signature Verification 표시 확인 (Verified/Failed)
- ✅ Verification Key 입력 필드 확인

#### US-15: Web App 지원 (PWA, Service Worker, 오프라인) (v1.1.0)
- ✅ Service Worker 등록 확인 (`usePWA` 훅, `registerSW` 사용)
- ✅ Service Worker 업데이트 감지 확인 (`onNeedRefresh`, `onRegistered`)
- ✅ 오프라인 준비 상태 확인 (`onOfflineReady`)
- ✅ 앱 설치 프롬프트 확인 (`beforeinstallprompt` 이벤트)
- ✅ 네트워크 상태 감지 확인 (`online`/`offline` 이벤트)
- ✅ Workbox 설정 확인 (`vite.config.ts`):
  - Network First 전략 (HTML 파일)
  - Cache First 전략 (이미지, 폰트)
  - 캐시 만료 시간 설정 (7일)
  - 오프라인 폴백 페이지 (`/404.html`)
- ✅ Manifest 설정 확인 (`vite-plugin-pwa`):
  - 앱 이름, 아이콘, 테마 색상
  - Shortcuts 설정 (8개 도구)
  - Screenshots 필드 추가
- ✅ PWAUpdatePrompt 컴포넌트 확인 (업데이트 알림)
- ⚠️ 실제 오프라인 환경 테스트 필요 (네트워크 차단)
- ⚠️ 실제 설치 프롬프트 테스트 필요 (브라우저 환경)

#### US-24: UUID/ULID Generator 상세 테스트 (v1.2.0)
- ✅ UUID v4 생성 구현 확인 (`generateUuidV4` 함수)
- ✅ UUID v7 생성 구현 확인 (`generateUuidV7` 함수 - 타임스탬프 기반)
- ✅ ULID 생성 구현 확인 (`generateUlid` 함수 - Crockford's Base32)
- ✅ 일괄 생성 기능 확인 (`count` 옵션, 최대 100개)
- ✅ 대소문자 형식 옵션 확인 (`lowercase`/`uppercase`)
- ✅ 복사 기능 구현 확인 (각 ID별 복사 버튼)
- ✅ 상태 저장/복원 확인 (`useToolState` 사용)
- ✅ URL 공유 기능 확인 (`copyShareLink`, `shareViaWebShare`)
- ⚠️ 실제 브라우저에서 생성 동작 및 형식 검증 필요

#### 공통 기능 테스트

**테마 전환**
- ✅ 테마 버튼 클릭 시 전환 확인 (Light/System/Dark)
- ✅ 다크 모드 활성화 확인 (`[active]` 상태)
- ✅ 테마 저장 로직 확인 (`useTheme` 훅, localStorage)
- ⚠️ 페이지 새로고침 후 테마 유지 확인 필요
- ⚠️ System 모드에서 OS 테마 따라가는지 확인 필요

**Toast 알림**
- ✅ Toast 알림 영역 확인 (`region "Notifications alt+T"`)
- ✅ 복사 성공 시 Toast 표시 확인 (코드 레벨)
- ✅ 에러 발생 시 Toast 표시 확인 (코드 레벨)
- ⚠️ 실제 Toast 표시 동작 확인 필요

**키보드 단축키**
- ✅ Command Palette 단축키 확인 (`⌘K` / `Ctrl+K`)
- ✅ Toast 영역 포커스 단축키 확인 (`Alt+T`)
- ⚠️ 실제 키보드 단축키 동작 확인 필요

**반응형 디자인**
- ✅ Tailwind CSS 반응형 클래스 사용 확인 (코드 레벨)
- ✅ 모바일 감지 로직 확인 (`isMobileDevice` 함수)
- ⚠️ 실제 다양한 화면 크기에서 테스트 필요

**SEO 및 메타 태그**
- ✅ `vite-plugin-generate-routes.ts`에서 SEO 정보 생성 확인
- ✅ 각 도구별 HTML 파일 생성 확인 (코드 레벨)
- ✅ sitemap.xml, robots.txt 생성 확인 (코드 레벨)
- ⚠️ 실제 생성된 HTML 파일의 메타 태그 확인 필요

#### 보안 테스트

**클라이언트 사이드 처리**
- ✅ 외부 서버로 데이터 전송 없음 확인 (코드 레벨)
  - `fetch`, `XMLHttpRequest`, `axios` 등 사용 없음
  - 모든 처리가 브라우저 내에서 이루어짐
- ✅ 네트워크 요청 없음 확인 (코드 레벨)

**XSS 방지**
- ✅ `dangerouslySetInnerHTML` 사용 시 `escapeHtml` 함수로 이스케이프 처리 확인
  - `src/tools/json/index.tsx`: `escapeHtml` 함수 사용
  - `highlightMatches` 함수에서도 `escapeHtml` 사용
- ✅ React의 기본 이스케이프 처리 확인 (JSX 텍스트 노드)
- ✅ 사용자 입력이 안전하게 처리됨 확인 (코드 레벨)

**localStorage 보안**
- ✅ 민감한 정보 저장 확인 필요 (현재는 도구 상태만 저장)
- ✅ 공유 링크에 민감한 정보 포함 여부 확인 필요 (JWT 등)

#### 에러 처리 테스트

**localStorage 에러**
- ✅ localStorage 사용 불가 시 에러 처리 확인:
  - `useFavorites`: try-catch로 감싸서 에러 시 빈 배열 반환
  - `useRecentTools`: try-catch로 감싸서 에러 시 빈 배열 반환
  - `useToolState`: try-catch 없지만 localStorage 실패 시에도 앱 동작 유지
- ✅ localStorage 에러 발생 시 앱이 크래시하지 않음 확인 (코드 레벨)

**입력 에러**
- ✅ 에러 처리 로직 확인 (코드 레벨):
  - JSON 파싱 에러: `ErrorBanner` 컴포넌트 사용
  - YAML 파싱 에러: 줄 번호/컬럼 정보 포함
  - JWT 파싱 에러: 명확한 에러 메시지
- ⚠️ 실제 다양한 에러 케이스 테스트 필요

**네트워크 에러**
- ✅ 오프라인 폴백 페이지 확인 (`public/offline.html`)
- ✅ Service Worker 오프라인 캐싱 확인 (코드 레벨)
- ⚠️ 실제 오프라인 환경에서 테스트 필요

#### 접근성 테스트

**키보드 네비게이션**
- ✅ Command Palette 키보드 네비게이션 확인:
  - Arrow Up/Down으로 검색 결과 이동
  - Enter로 선택한 도구로 이동
  - ESC로 팔레트 닫기
- ✅ 키보드 단축키 확인:
  - `⌘K` / `Ctrl+K`: Command Palette 열기
  - `Alt+T`: Toast 알림 영역 포커스 (코드 레벨)
- ⚠️ Tab 키로 모든 인터랙티브 요소 접근 가능한지 확인 필요
- ⚠️ Enter/Space로 버튼 클릭 가능한지 확인 필요

**스크린 리더**
- ✅ 일부 ARIA 레이블 확인:
  - `alt="yowu"` (로고 이미지)
  - `aria-label="Close"` (PWAUpdatePrompt)
  - `region "Notifications alt+T"` (Toast 영역)
- ⚠️ 주요 요소에 적절한 ARIA 레이블 추가 확인 필요
- ⚠️ 에러 메시지가 스크린 리더로 읽히는지 확인 필요

**색상 대비**
- ✅ 다크 모드 지원 확인 (코드 레벨)
- ✅ Tailwind CSS 색상 팔레트 사용 확인
- ⚠️ WCAG AA 기준 색상 대비 검증 필요 (실제 브라우저에서)

### 진행 중인 테스트

- UI/UX 기능 (US-13 localStorage 저장 동작 추가 확인)
- 공통 기능 테스트 (실제 브라우저 환경에서 추가 확인 필요)
- 성능 테스트 (초기 로딩, 메모리 사용량)
- 접근성 테스트 (실제 브라우저 환경에서 추가 확인 필요)
- 실제 오프라인 환경 테스트
- 실제 다양한 에러 케이스 테스트

## Critical Issues

### US-01: JSON Viewer - 대용량 데이터 붙여넣기 시 UI 프리징 ✅ 수정 완료

**수정일**: 2025-12-14

**발견일**: 2025-12-14  
**관련 테스트 항목**: US-01 (JSON Pretty Viewer), US-16 (Web Worker 성능 최적화)  
**우선순위**: Critical

#### 문제 설명

대용량 JSON 파일(2MB 이상)을 복사-붙여넣기로 입력할 때, 디바운싱(300ms)이 완료되기 전에 메인 스레드에서 파싱을 시도하여 UI가 프리징됩니다.

#### 재현 단계

1. JSON Viewer 페이지 열기 (`/json`)
2. `test-data/large-json.json` 파일(2.3MB, 73,755줄)을 열어서 전체 내용 복사
3. JSON Viewer의 입력 필드에 붙여넣기 (Cmd+V / Ctrl+V)
4. 붙여넣는 동안 UI가 멈추고 브라우저가 응답하지 않음

#### 예상 동작

- 붙여넣는 즉시 Worker 모드로 전환되어야 함
- UI가 프리징되지 않고 반응해야 함
- 로딩 인디케이터가 표시되어야 함

#### 실제 동작

- 디바운싱(300ms)이 완료되기 전에 메인 스레드에서 파싱 시도
- `shouldUseWorker`가 `debouncedInput`을 기준으로 결정되어, 실제 입력(`state.input`)이 디바운싱되지 않은 상태에서 메인 스레드 파싱 실행
- 대용량 데이터 파싱으로 인해 UI 프리징 발생

#### 원인 분석

```typescript
// 현재 코드 (문제 있음)
const debouncedInput = useDebouncedValue(state.input, 300);
const shouldUseWorker = React.useMemo(
  () => shouldUseWorkerForText(debouncedInput, 1_000_000, 10_000),
  [debouncedInput]
);

// 메인 스레드 파싱 (shouldUseWorker가 false일 때 실행)
const mainThreadParseResult = useMemo(() => {
  if (!debouncedInput.trim() || shouldUseWorker) {
    return { ... };
  }
  // 대용량 데이터를 메인 스레드에서 파싱 시도 → UI 프리징
  const parsed = JSON.parse(debouncedInput);
  ...
}, [debouncedInput, ..., shouldUseWorker]);
```

**문제점**:
1. `shouldUseWorker`가 `debouncedInput`을 기준으로 결정됨
2. 실제 입력(`state.input`)이 디바운싱되지 않은 상태에서도 메인 스레드 파싱이 시도될 수 있음
3. 대용량 데이터를 붙여넣는 동안 디바운싱이 완료되기 전에 메인 스레드 파싱이 실행됨

#### 해결 방안

`shouldUseWorker`를 `state.input` (디바운싱 전)을 기준으로 결정해야 합니다:

```typescript
// 수정된 코드
const debouncedInput = useDebouncedValue(state.input, 300);

// state.input을 기준으로 Worker 사용 여부 결정 (디바운싱 전)
const shouldUseWorker = React.useMemo(
  () => shouldUseWorkerForText(state.input, 1_000_000, 10_000),
  [state.input]  // debouncedInput 대신 state.input 사용
);
```

또는 붙여넣기 이벤트를 감지하여 즉시 Worker 모드로 전환:

```typescript
// 붙여넣기 감지 및 즉시 Worker 모드 전환
const handlePaste = useCallback((e: ClipboardEvent) => {
  const pastedText = e.clipboardData?.getData('text');
  if (pastedText && shouldUseWorkerForText(pastedText, 1_000_000, 10_000)) {
    // 즉시 Worker 모드로 전환
    setShouldUseWorkerImmediately(true);
  }
}, []);
```

#### 영향 범위

- JSON Viewer: 대용량 데이터 붙여넣기 시 UI 프리징
- YAML Converter: 동일한 문제 발생 가능 (확인 필요)
- Text Diff: 동일한 문제 발생 가능 (확인 필요)

#### 관련 파일

- `src/tools/json/index.tsx` (66-72줄, 144-169줄) - ✅ 수정 완료
- `src/tools/yaml/index.tsx` (43-47줄) - ✅ 문제 없음 (이미 state.source 사용)
- `src/tools/diff/index.tsx` (50-55줄, 86-106줄) - ✅ 수정 완료

#### 수정 내용

**JSON Viewer** (`src/tools/json/index.tsx`):
- `shouldUseWorker` 결정 기준을 `debouncedInput`에서 `state.input`으로 변경
- 디바운싱 전에 Worker 사용 여부를 결정하여 붙여넣기 시 즉시 Worker 모드 전환

**Text Diff** (`src/tools/diff/index.tsx`):
- `shouldUseWorker` 결정 기준을 `debouncedLeft/Right`에서 `state.left/right`로 변경
- 동일한 문제 방지

**Base64 Converter** (`src/tools/base64/index.tsx`):
- 디바운싱 추가: `useDebouncedValue(state.input, 300)` 사용
- `encodeBase64` 함수 최적화: 대용량 데이터 처리를 위한 청킹 방식 적용 (8192 바이트 단위)
- "Maximum call stack size exceeded" 에러 방지
- ⚠️ 타임아웃 미적용: Base64 인코딩/디코딩은 동기 함수이므로 타임아웃 적용 어려움 (일반적으로 빠르므로 문제 없음)

#### 타임아웃 기능 추가 (v1.2.0)

**구현 내용**:
- `useWebWorker` 훅에 `timeout` 옵션 추가 (기본값: 10초)
- Worker 처리 시 타임아웃 발생 시 Worker 종료 및 에러 메시지 표시
- 타임아웃 에러 메시지: "Processing timeout: The operation took longer than 10 seconds and was cancelled. The input may be too large to process."

**적용된 도구**:
- ✅ JSON Viewer: `timeout: 10_000` 설정
- ✅ YAML Converter: `timeout: 10_000` 설정
- ✅ Text Diff: `timeout: 10_000` 설정
- ✅ Hash Generator: Promise.race를 사용한 타임아웃 적용 (10초)
- ⚠️ Base64 Converter: 동기 함수이므로 타임아웃 적용 어려움 (일반적으로 빠르므로 문제 없음)

**기타 도구 확인 결과**:
- **URL Encoder**: 이미 `debouncedInput` 사용 중, `encodeURIComponent`/`decodeURIComponent`는 네이티브 함수로 빠름 - 문제 없음
- **Hash Generator**: 이미 `debouncedInput` 사용 중, WebCrypto API는 비동기 처리 - 문제 없음
- **YAML Converter**: 이미 `state.source` 직접 사용 (디바운싱 없음), Worker 사용 - 문제 없음
- **JWT Decoder**: 디바운싱 없이 `state.token` 직접 사용, 토큰은 일반적으로 작음 - 문제 없음

## High Priority Issues

없음

## Medium Priority Issues

없음

## Low Priority Issues

없음

---

## 이슈 기록 가이드

### 이슈 기록 형식

각 이슈는 다음 형식으로 기록합니다:

```markdown
### US-XX: 기능명 - 문제 요약

**발견일**: YYYY-MM-DD  
**관련 테스트 항목**: US-XX (기능명)  
**우선순위**: Critical/High/Medium/Low

#### 문제 설명

간단한 문제 설명을 작성합니다.

#### 재현 단계

1. 첫 번째 단계
2. 두 번째 단계
3. ...

#### 예상 동작

사용자가 기대하는 동작을 설명합니다.

#### 실제 동작

실제로 발생하는 동작을 설명합니다.

#### 원인 분석 (선택사항)

가능한 경우 원인을 분석합니다.

#### 해결 방안 (선택사항)

해결 방법이나 제안사항을 기록합니다.

#### 영향 범위

어떤 기능이나 도구에 영향을 미치는지 설명합니다.

#### 관련 파일

- `src/path/to/file.ts` (줄 번호, 설명)
```

### 우선순위 기준

- **Critical**: 앱이 크래시하거나 핵심 기능이 완전히 동작하지 않는 경우
- **High**: 주요 기능이 예상대로 동작하지 않지만 우회 방법이 있는 경우
- **Medium**: 부차적인 기능의 문제이거나 UI/UX 개선이 필요한 경우
- **Low**: 사소한 문제이거나 개선 제안사항

---

## 해결된 이슈

없음

---

## 테스트 완료 체크리스트

- [ ] 기본 기능 테스트 (US-01 ~ US-07)
- [ ] URL 공유 및 상태 저장 (US-08 ~ US-09)
- [ ] UI/UX 기능 (US-10 ~ US-13)
- [ ] v1.1.0 기능 (US-14 ~ US-16)
- [ ] v1.2.0 신규 기능 (US-17 ~ US-25)
- [ ] 공통 기능 테스트 (테마, Toast, 반응형 등)
- [ ] 브라우저 호환성 테스트
- [ ] 성능 테스트
- [ ] 접근성 테스트
- [ ] 보안 테스트
- [ ] 에러 처리 테스트

