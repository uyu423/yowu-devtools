# yowu-devtools v1.4.1 구현 계획

## cURL Parser + API Tester 연동/고도화 Implementation Plan

---

## 개요

이 문서는 v1.4.1 개발을 위한 구현 계획을 정리합니다.
요구사항 상세는 `SAS_v1.4.1.md`를 참조하세요.

> **Note**: 이 문서는 AI Agent가 작업할 수 있는 대략적인 구조와 체크리스트만 포함합니다.
> 구체적인 코드 구현은 AI Agent가 SAS 문서와 기존 코드베이스를 참고하여 작성합니다.

---

## Phase 1: cURL 파서 코어 라이브러리 구현 ✅

### 1.1 타입 정의 ✅

**작업 내용**:

1. `src/lib/curl/types.ts` 생성
2. `CurlParseResult` 타입 정의
3. 관련 유틸리티 타입 정의

**체크리스트**:

- [x] `CurlParseResult` 타입 정의
- [x] `CurlRequest` 타입 정의
- [x] `CurlBody` 타입 정의
- [x] `CurlWarning` 타입 정의
- [x] TypeScript 타입 검증 통과

### 1.2 토큰화 로직 구현 ✅

**작업 내용**:

1. `src/lib/curl/tokenizer.ts` 생성
2. 쉘-like 토큰화 로직 구현
3. 따옴표 처리 (단일/이중)
4. 백슬래시 이스케이프 처리
5. 라인 컨티뉴에이션 (`\`+개행) 처리

**체크리스트**:

- [x] 기본 토큰화 로직 구현
- [x] 단일 따옴표 처리
- [x] 이중 따옴표 처리
- [x] 백슬래시 이스케이프 처리 (`\"`, `\'`, `\\`)
- [x] 라인 컨티뉴에이션 처리
- [x] 테스트 케이스 작성 (간단한 케이스)

### 1.3 cURL 파싱 로직 구현 ✅

**작업 내용**:

1. `src/lib/curl/parseCurl.ts` 생성
2. URL 추출 로직
3. Method 추출 로직 (`-X/--request`)
4. Headers 파싱 (`-H/--header`)
5. Cookies 파싱 (`-b/--cookie`, `-H "Cookie: ..."`)
6. Body 파싱 (`-d`, `--data-raw`, `--data-urlencode`, `-F/--form`)
7. Options 파싱 (`-L`, `-k`, `--compressed`, `-u`)

**체크리스트**:

- [x] URL 추출 (마지막 토큰 또는 `curl 'https://...'` 형태)
- [x] Method 추출 (`-X/--request`)
- [x] Method 추론 (Body 존재 시 POST, `-G` 있으면 GET)
- [x] Headers 파싱 (반복 `-H` 지원)
- [x] Cookies 파싱 (`-b/--cookie` string 형태)
- [x] Cookies 파싱 (`-H "Cookie: ..."` 형태)
- [x] Cookie string 파싱 (`a=b; c=d` 형태)
- [x] Body 파싱 (`-d/--data`)
- [x] Body 파싱 (`--data-raw`, `--data-binary`)
- [x] Body 파싱 (`--data-urlencode`)
- [x] Body 파싱 (`-F/--form` 텍스트 필드)
- [x] Body type 추론 (JSON, text, urlencoded, multipart)
- [x] Options 파싱 (`-L/--location`)
- [x] Options 파싱 (`-k/--insecure`)
- [x] Options 파싱 (`--compressed`)
- [x] Options 파싱 (`-u/--user` Basic auth)
- [x] Query params 추출 (URL에서)

### 1.4 경고 및 에러 처리 ✅

**작업 내용**:

1. 지원 불가 케이스 감지
2. 경고 메시지 생성
3. 에러 처리

**체크리스트**:

- [x] `--data @file` 감지 및 경고
- [x] `-K config` 감지 및 경고
- [x] `$TOKEN`, `$(...)` 감지 및 경고 (쉘 변수)
- [x] `-F file=@path` 감지 및 경고 (파일 경로)
- [x] `-b cookiefile.txt` 감지 및 경고 (파일 기반)
- [x] 파싱 실패 시 에러 메시지

### 1.5 정규화 및 유틸리티 함수 ✅

**작업 내용**:

1. `normalizeCurl` 함수 구현 (라인 컨티뉴 제거, 토큰 정리)
2. URL 디코딩/인코딩 유틸리티
3. Cookie 디코딩 유틸리티

**체크리스트**:

- [x] `normalizeCurl` 함수 구현
- [x] URL 디코딩 함수
- [x] URL 인코딩 함수
- [x] Cookie 디코딩 함수

---

## Phase 2: cURL Parser Tool UI 구현 ✅

### 2.1 도구 기본 구조 생성 ✅

**작업 내용**:

1. `src/tools/curl-parser/index.tsx` 생성
2. 도구 정의 및 등록
3. 기본 레이아웃 구성

**체크리스트**:

- [x] `src/tools/curl-parser/index.tsx` 생성
- [x] 도구 타입 정의 (`CurlParserState`)
- [x] 기본 상태 정의 (`DEFAULT_STATE`)
- [x] `src/tools/index.ts`에 도구 등록
- [x] 기본 레이아웃 구성 (입력 영역 + 출력 영역)

### 2.2 입력 영역 UI ✅

**작업 내용**:

1. EditorPanel 컴포넌트 사용 (URL Parser 스타일)
2. 입력 debounce 처리 (자동 파싱)

**체크리스트**:

- [x] EditorPanel 컴포넌트 사용
- [x] Placeholder 텍스트 (i18n)
- [x] 자동 파싱 (debounce 300ms)
- [x] ToolHeader에 Reset/Share 버튼 통합

### 2.3 표시 옵션 UI ✅

**작업 내용**:

1. 표시 옵션 토글 UI 구현
2. 옵션 상태 관리

**체크리스트**:

- [x] "URL Decode in display" 토글 (기본 ON)
- [x] 옵션 상태 LocalStorage 저장
- [x] 옵션 변경 시 출력 재렌더링
- [x] ~~"Cookie decode" 토글~~ (스펙 변경으로 제거)
- [x] ~~"Hide sensitive values" 토글~~ (스펙 변경으로 제거)

### 2.4 출력 패널 UI ✅

**작업 내용**:

1. Request Summary 섹션
2. Query Params 섹션
3. Headers 섹션
4. Cookies 섹션
5. Body 섹션
6. cURL Options 섹션
7. Parse Warnings 섹션

**체크리스트**:

- [x] Request Summary 섹션 (Method, URL)
- [x] "Open in API Tester" 버튼
- [x] Query Params 테이블 (key/value + enable 토글)
- [x] Headers 테이블 (key/value)
- [x] Cookies 섹션 (원문 + 파싱된 테이블)
- [x] Cookies Raw 섹션 접기/펼치기 (기본 접힌 상태)
- [x] Body 섹션 (type 추론 + 미리보기)
- [x] Body JSON pretty view
- [x] cURL Options 표시
- [x] Parse Warnings 목록 표시
- [x] JSON 형태 값에 "Open in JSON Viewer" 버튼 추가
- [x] URL 형태 값을 클릭 가능한 링크로 표시

### 2.5 "Open in API Tester" 연동 ✅

**작업 내용**:

1. 데이터 전달 로직 구현
2. 라우팅 처리 (i18n prefix 유지)
3. API Tester 폼 자동 채움 연동

**체크리스트**:

- [x] 파싱 결과를 API Tester form state로 변환
- [x] sessionStorage를 통한 데이터 전달
- [x] 라우팅 처리 (`/{locale}/curl` → `/{locale}/api-tester`)
- [x] API Tester에서 데이터 수신 및 폼 채움

### 2.6 LocalStorage 및 URL 공유 ✅

**작업 내용**:

1. `useToolState` 훅 통합
2. LocalStorage 저장
3. URL 공유 기능

**체크리스트**:

- [x] `useToolState` 훅 통합
- [x] LocalStorage 저장 (마지막 입력 + 표시 옵션)
- [x] URL 공유 기능 (`shareStateFilter` 적용)

### 2.7 SEO 최적화 ✅

**작업 내용**:

1. `vite-plugin-generate-routes.ts`에 도구 정보 추가
2. SEO 메타 태그 설정

**체크리스트**:

- [x] `vite-plugin-generate-routes.ts`에 cURL Parser 추가
- [x] SEO description 작성 (150-160자)
- [x] Keywords 설정 (5-10개)
- [x] Features 목록 작성 (5-7개)
- [x] 빌드 후 HTML 파일 확인
- [x] sitemap.xml에 경로 추가 확인

---

## Phase 3: API Tester cURL 붙여넣기 기능 구현 ✅

### 3.1 cURL 감지 로직 ✅

**작업 내용**:

1. URL 입력창 paste 이벤트 핸들러 추가
2. cURL 커맨드 감지 로직 구현

**체크리스트**:

- [x] URL 입력창 paste 이벤트 핸들러 추가
- [x] cURL 감지 로직 (`trimStart()` 기준)
- [x] `curl ` 로 시작하는 경우 감지
- [x] 줄바꿈 포함 + 첫 토큰이 `curl`인 경우 감지
- [x] 일반 URL 붙여넣기는 기존대로 동작

### 3.2 파싱 및 폼 채움 로직 ✅

**작업 내용**:

1. cURL 파싱 실행
2. 파싱 결과를 API Tester form state로 변환
3. 폼 자동 채움

**체크리스트**:

- [x] cURL 파싱 실행 (`parseCurl` 함수 호출)
- [x] 파싱 결과를 API Tester form state로 변환
- [x] Method 설정
- [x] URL + Query params 설정
- [x] Headers 설정 (쿠키 포함)
- [x] Body 설정 (JSON/text/urlencoded/multipart)
- [x] 기존 입력값 덮어쓰기
- [x] Undo 기능 구현

### 3.3 에러 처리 및 UX ✅

**작업 내용**:

1. 파싱 실패 시 에러 처리
2. "Paste as URL" 대안 제공
3. Toast 알림

**체크리스트**:

- [x] 파싱 실패 시 에러 메시지 표시
- [x] "Paste as URL" 버튼 제공
- [x] Toast 알림 ("cURL parsed and applied")
- [x] 파싱 실패 Toast 알림

### 3.4 i18n 통합 ✅

**작업 내용**:

1. i18n 리소스에 키 추가
2. UI 텍스트 i18n 적용

**체크리스트**:

- [x] `api.curlPaste.applied` 키 추가 (모든 로케일)
- [x] `api.curlPaste.failed` 키 추가 (모든 로케일)
- [x] `api.curlPaste.pasteAsUrl` 키 추가 (모든 로케일)
- [x] `api.curlPaste.undo` 키 추가 (모든 로케일)
- [x] UI 텍스트 i18n 적용

---

## Phase 4: i18n 리소스 추가 ✅

### 4.1 cURL Parser 관련 키 추가 ✅

**작업 내용**:

1. 모든 로케일 파일에 cURL Parser 키 추가
2. 번역 작성

**체크리스트**:

- [x] `en-US.ts`에 키 추가 (소스 오브 트루스)
- [x] `ko-KR.ts`에 번역 추가
- [x] `ja-JP.ts`에 번역 추가
- [x] `zh-CN.ts`에 번역 추가
- [x] `es-ES.ts`에 번역 추가

**추가된 키 목록**:

- `tool.curl.*` (제목, 설명, placeholder 등)
- `curl.warning.*` (경고 메시지)
- `api.curlPaste.*` (API Tester 붙여넣기 관련)

### 4.2 번역 품질 확인 ✅

**체크리스트**:

- [x] 모든 키가 모든 로케일에 존재하는지 확인
- [x] 번역 키 누락 검증 (빌드/테스트 단계)

---

## Phase 5: 테스트 및 검증 ✅

### 5.1 기능 테스트 ✅

**체크리스트**:

- [x] cURL Parser 기본 파싱 테스트
- [x] API Tester cURL 붙여넣기 테스트
- [x] LocalStorage 저장 테스트
- [x] URL 공유 테스트
- [x] i18n 테스트 (모든 로케일)
- [x] 모바일 반응형 테스트

### 5.2 수용 기준 (AC) 검증 ✅

**체크리스트**:

- [x] `curl https://example.com` → GET + URL 정상 추출
- [x] `-X POST -H ... -d '{"a":1}'` → method/headers/json body 정상
- [x] `-H 'Cookie: a=b; c=d'` 또는 `-b 'a=b; c=d'` → cookie 테이블 정상 파싱
- [x] `--data-urlencode 'q=hello%20world'` → 표시 디코드 옵션 정상
- [x] `-F 'k=v' -F 'file=@/path/a.png'` → 텍스트 필드 적용 + 파일은 경고/placeholder
- [x] "Open in API Tester"로 전환 시 값이 동일하게 이관
- [x] URL 입력창에 cURL 붙여넣으면 자동 파싱되어 폼이 채워짐
- [x] 일반 URL 붙여넣기는 그대로 URL 입력됨
- [x] 파싱 실패 시 사용자에게 오류 + "Paste as URL" 대안 제공

### 5.3 빌드 및 린트 검증 ✅

**체크리스트**:

- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [x] 타입 체크 오류 없음
- [x] 생성된 HTML 파일 확인 (SEO 메타 태그)
- [x] sitemap.xml에 경로 추가 확인

---

## Phase 6: 문서 업데이트 ✅

### 6.1 릴리스 노트 작성 ✅

**체크리스트**:

- [x] `RELEASE_NOTES.md`에 v1.4.1 섹션 추가
- [x] 신규 기능 설명
- [x] 주요 변경사항 정리

### 6.2 기타 문서 업데이트 ✅

**체크리스트**:

- [x] `SAS_v1.4.1.md` 상태 업데이트 (구현 완료)
- [x] `IMPLEMENTATION_PLAN_v1.4.1.md` 체크리스트 업데이트
- [x] 버전 업데이트 (`package.json`: 1.4.0 → 1.4.1)

---

## 구현 완료 요약

### 주요 구현 사항

1. **cURL Parser Tool**

   - cURL 커맨드 파싱 및 구조화 표시
   - URL Parser와 유사한 UI/UX (자동 파싱, Reset/Share 버튼)
   - Request Summary, Query Params, Headers, Cookies, Body, Options, Warnings 섹션
   - JSON 형태 값에 "Open in JSON Viewer" 버튼
   - URL 형태 값을 클릭 가능한 링크로 표시
   - Raw Cookie 섹션 접기/펼치기 (기본 접힌 상태)

2. **API Tester 연동**

   - "Open in API Tester" 버튼으로 원클릭 전환
   - URL 입력창에 cURL 붙여넣기 지원 (자동 파싱)
   - Undo 기능으로 이전 상태 복원 가능

3. **i18n 지원**
   - 5개 언어 (en-US, ko-KR, ja-JP, zh-CN, es-ES) 완전 지원

### 스펙 변경 사항

- ~~Cookie decode 기능~~ → 제거 (사용성 단순화)
- ~~Hide sensitive values 기능~~ → 제거 (사용성 단순화)
- Parse/Clear 버튼 → 자동 파싱 + ToolHeader의 Reset/Share 버튼으로 통합

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-06-17  
**상태**: ✅ 구현 완료
