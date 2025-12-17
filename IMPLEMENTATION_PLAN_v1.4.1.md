# yowu-devtools v1.4.1 구현 계획

## cURL Parser + API Tester 연동/고도화 Implementation Plan

---

## 개요

이 문서는 v1.4.1 개발을 위한 구현 계획을 정리합니다.
요구사항 상세는 `SAS_v1.4.1.md`를 참조하세요.

> **Note**: 이 문서는 AI Agent가 작업할 수 있는 대략적인 구조와 체크리스트만 포함합니다.
> 구체적인 코드 구현은 AI Agent가 SAS 문서와 기존 코드베이스를 참고하여 작성합니다.

---

## Phase 1: cURL 파서 코어 라이브러리 구현

### 1.1 타입 정의

**작업 내용**:
1. `src/lib/curl/types.ts` 생성
2. `CurlParseResult` 타입 정의
3. 관련 유틸리티 타입 정의

**체크리스트**:
- [ ] `CurlParseResult` 타입 정의
- [ ] `CurlRequest` 타입 정의
- [ ] `CurlBody` 타입 정의
- [ ] `CurlWarning` 타입 정의
- [ ] TypeScript 타입 검증 통과

### 1.2 토큰화 로직 구현

**작업 내용**:
1. `src/lib/curl/tokenizer.ts` 생성
2. 쉘-like 토큰화 로직 구현
3. 따옴표 처리 (단일/이중)
4. 백슬래시 이스케이프 처리
5. 라인 컨티뉴에이션 (`\`+개행) 처리

**체크리스트**:
- [ ] 기본 토큰화 로직 구현
- [ ] 단일 따옴표 처리
- [ ] 이중 따옴표 처리
- [ ] 백슬래시 이스케이프 처리 (`\"`, `\'`, `\\`)
- [ ] 라인 컨티뉴에이션 처리
- [ ] 테스트 케이스 작성 (간단한 케이스)

### 1.3 cURL 파싱 로직 구현

**작업 내용**:
1. `src/lib/curl/parseCurl.ts` 생성
2. URL 추출 로직
3. Method 추출 로직 (`-X/--request`)
4. Headers 파싱 (`-H/--header`)
5. Cookies 파싱 (`-b/--cookie`, `-H "Cookie: ..."`)
6. Body 파싱 (`-d`, `--data-raw`, `--data-urlencode`, `-F/--form`)
7. Options 파싱 (`-L`, `-k`, `--compressed`, `-u`)

**체크리스트**:
- [ ] URL 추출 (마지막 토큰 또는 `curl 'https://...'` 형태)
- [ ] Method 추출 (`-X/--request`)
- [ ] Method 추론 (Body 존재 시 POST, `-G` 있으면 GET)
- [ ] Headers 파싱 (반복 `-H` 지원)
- [ ] Cookies 파싱 (`-b/--cookie` string 형태)
- [ ] Cookies 파싱 (`-H "Cookie: ..."` 형태)
- [ ] Cookie string 파싱 (`a=b; c=d` 형태)
- [ ] Body 파싱 (`-d/--data`)
- [ ] Body 파싱 (`--data-raw`, `--data-binary`)
- [ ] Body 파싱 (`--data-urlencode`)
- [ ] Body 파싱 (`-F/--form` 텍스트 필드)
- [ ] Body type 추론 (JSON, text, urlencoded, multipart)
- [ ] Options 파싱 (`-L/--location`)
- [ ] Options 파싱 (`-k/--insecure`)
- [ ] Options 파싱 (`--compressed`)
- [ ] Options 파싱 (`-u/--user` Basic auth)
- [ ] Query params 추출 (URL에서)

### 1.4 경고 및 에러 처리

**작업 내용**:
1. 지원 불가 케이스 감지
2. 경고 메시지 생성
3. 에러 처리

**체크리스트**:
- [ ] `--data @file` 감지 및 경고
- [ ] `-K config` 감지 및 경고
- [ ] `$TOKEN`, `$(...)` 감지 및 경고 (쉘 변수)
- [ ] `-F file=@path` 감지 및 경고 (파일 경로)
- [ ] `-b cookiefile.txt` 감지 및 경고 (파일 기반)
- [ ] 파싱 실패 시 에러 메시지

### 1.5 정규화 및 유틸리티 함수

**작업 내용**:
1. `normalizeCurl` 함수 구현 (라인 컨티뉴 제거, 토큰 정리)
2. URL 디코딩/인코딩 유틸리티
3. Cookie 디코딩 유틸리티

**체크리스트**:
- [ ] `normalizeCurl` 함수 구현
- [ ] URL 디코딩 함수
- [ ] URL 인코딩 함수
- [ ] Cookie 디코딩 함수

---

## Phase 2: cURL Parser Tool UI 구현

### 2.1 도구 기본 구조 생성

**작업 내용**:
1. `src/tools/curl-parser/index.tsx` 생성
2. 도구 정의 및 등록
3. 기본 레이아웃 구성

**체크리스트**:
- [ ] `src/tools/curl-parser/index.tsx` 생성
- [ ] 도구 타입 정의 (`CurlParserState`)
- [ ] 기본 상태 정의 (`DEFAULT_STATE`)
- [ ] `src/tools/index.ts`에 도구 등록
- [ ] 기본 레이아웃 구성 (입력 영역 + 출력 영역)

### 2.2 입력 영역 UI

**작업 내용**:
1. 멀티라인 textarea 구현
2. Parse/Clear/Copy normalized 버튼 추가
3. 입력 debounce 처리

**체크리스트**:
- [ ] 멀티라인 textarea 구현
- [ ] Placeholder 텍스트 (i18n)
- [ ] Parse 버튼 추가
- [ ] Clear 버튼 추가
- [ ] Copy normalized cURL 버튼 추가 (옵션)
- [ ] 입력 debounce 처리 (150~300ms)
- [ ] 자동 파싱 트리거

### 2.3 표시 옵션 UI

**작업 내용**:
1. 표시 옵션 토글 UI 구현
2. 옵션 상태 관리

**체크리스트**:
- [ ] "URL Decode in display" 토글 (기본 ON)
- [ ] "URL Encode on export" 토글 (기본 OFF)
- [ ] "Cookie decode" 토글 (기본 ON)
- [ ] "Hide sensitive values" 토글 (기본 ON)
- [ ] 옵션 상태 LocalStorage 저장
- [ ] 옵션 변경 시 출력 재렌더링

### 2.4 출력 패널 UI

**작업 내용**:
1. Request Summary 섹션
2. Query Params 섹션
3. Headers 섹션
4. Cookies 섹션
5. Body 섹션
6. cURL Options 섹션
7. Parse Warnings 섹션

**체크리스트**:
- [ ] Request Summary 섹션 (Method, URL, 버튼)
- [ ] "Open in API Tester" 버튼
- [ ] "Copy as JSON" 버튼 (옵션)
- [ ] Query Params 테이블 (key/value + enable 토글)
- [ ] Headers 테이블 (key/value + 그룹 분리)
- [ ] Headers 민감 헤더 마스킹 표시
- [ ] Cookies 섹션 (원문 + 파싱된 테이블)
- [ ] Body 섹션 (type 추론 + 미리보기)
- [ ] Body JSON pretty view
- [ ] cURL Options 표시
- [ ] Parse Warnings 목록 표시
- [ ] 섹션 접기/펼치기 기능 (모바일 고려)

### 2.5 민감정보 마스킹 로직

**작업 내용**:
1. 민감 헤더 감지 로직
2. 마스킹 표시 로직 (앞 6글자 + `…`)

**체크리스트**:
- [ ] 민감 헤더 감지 (Cookie, Authorization 등)
- [ ] 마스킹 표시 로직 구현
- [ ] "Hide sensitive values" 옵션 반영
- [ ] 실제 값은 state에 유지 (표시만 마스킹)

### 2.6 "Open in API Tester" 연동

**작업 내용**:
1. 데이터 전달 로직 구현
2. 라우팅 처리 (i18n prefix 유지)
3. API Tester 폼 자동 채움 연동

**체크리스트**:
- [ ] 파싱 결과를 API Tester form state로 변환
- [ ] 앱 내부 상태 전달 (store/context 또는 sessionStorage)
- [ ] 라우팅 처리 (`/{locale}/curl` → `/{locale}/api`)
- [ ] API Tester에서 데이터 수신 및 폼 채움
- [ ] "민감정보 포함됨" 배지 표시

### 2.7 LocalStorage 및 URL 공유

**작업 내용**:
1. `useToolState` 훅 통합
2. LocalStorage 저장 (민감정보 제외)
3. URL 공유 기능 (민감정보 제외 기본)

**체크리스트**:
- [ ] `useToolState` 훅 통합
- [ ] LocalStorage 저장 (마지막 입력 + 표시 옵션만)
- [ ] 민감정보 저장 제외 (기본)
- [ ] URL 공유 기능 (`shareStateFilter` 적용)
- [ ] 민감정보 포함 토글 (기본 OFF) + 경고

### 2.8 SEO 최적화

**작업 내용**:
1. `vite-plugin-generate-routes.ts`에 도구 정보 추가
2. SEO 메타 태그 설정

**체크리스트**:
- [ ] `vite-plugin-generate-routes.ts`에 cURL Parser 추가
- [ ] SEO description 작성 (150-160자)
- [ ] Keywords 설정 (5-10개)
- [ ] Features 목록 작성 (5-7개)
- [ ] 빌드 후 HTML 파일 확인
- [ ] sitemap.xml에 경로 추가 확인

---

## Phase 3: API Tester cURL 붙여넣기 기능 구현

### 3.1 cURL 감지 로직

**작업 내용**:
1. URL 입력창 paste 이벤트 핸들러 추가
2. cURL 커맨드 감지 로직 구현

**체크리스트**:
- [ ] URL 입력창 paste 이벤트 핸들러 추가
- [ ] cURL 감지 로직 (`trimStart()` 기준)
- [ ] `curl ` 로 시작하는 경우 감지
- [ ] 줄바꿈 포함 + 첫 토큰이 `curl`인 경우 감지
- [ ] 일반 URL 붙여넣기는 기존대로 동작

### 3.2 파싱 및 폼 채움 로직

**작업 내용**:
1. cURL 파싱 실행
2. 파싱 결과를 API Tester form state로 변환
3. 폼 자동 채움

**체크리스트**:
- [ ] cURL 파싱 실행 (`parseCurl` 함수 호출)
- [ ] 파싱 결과를 API Tester form state로 변환
- [ ] Method 설정
- [ ] URL + Query params 설정
- [ ] Headers 설정 (쿠키 포함)
- [ ] Body 설정 (JSON/text/urlencoded/multipart)
- [ ] Options 설정 (Follow redirects 등)
- [ ] 기존 입력값 덮어쓰기
- [ ] Undo 기능 구현 (1회, 권장)

### 3.3 에러 처리 및 UX

**작업 내용**:
1. 파싱 실패 시 에러 처리
2. "Paste as URL" 대안 제공
3. Toast 알림

**체크리스트**:
- [ ] 파싱 실패 시 에러 메시지 표시
- [ ] "Paste as URL" 버튼 제공
- [ ] Toast 알림 ("cURL parsed and applied")
- [ ] 파싱 실패 Toast 알림

### 3.4 i18n 통합

**작업 내용**:
1. i18n 리소스에 키 추가
2. UI 텍스트 i18n 적용

**체크리스트**:
- [ ] `api.curlPaste.applied` 키 추가 (모든 로케일)
- [ ] `api.curlPaste.failed` 키 추가 (모든 로케일)
- [ ] `api.curlPaste.pasteAsUrl` 키 추가 (모든 로케일)
- [ ] `api.curlPaste.undo` 키 추가 (모든 로케일)
- [ ] UI 텍스트 i18n 적용

---

## Phase 4: i18n 리소스 추가

### 4.1 cURL Parser 관련 키 추가

**작업 내용**:
1. 모든 로케일 파일에 cURL Parser 키 추가
2. 번역 작성

**체크리스트**:
- [ ] `en-US.ts`에 키 추가 (소스 오브 트루스)
- [ ] `ko-KR.ts`에 번역 추가
- [ ] `ja-JP.ts`에 번역 추가
- [ ] `zh-CN.ts`에 번역 추가
- [ ] `es-ES.ts`에 번역 추가
- [ ] 번역이 확정되지 않은 언어는 en-US 값 복사 + TODO 태그

**추가할 키 목록**:
- `tool.curl.*` (제목, 설명, placeholder 등)
- `curl.warning.*` (경고 메시지)
- `api.curlPaste.*` (API Tester 붙여넣기 관련)

### 4.2 번역 품질 확인

**체크리스트**:
- [ ] 모든 키가 모든 로케일에 존재하는지 확인
- [ ] 번역 키 누락 검증 (빌드/테스트 단계)

---

## Phase 5: 테스트 및 검증

### 5.1 기능 테스트

**체크리스트**:
- [ ] cURL Parser 기본 파싱 테스트
- [ ] API Tester cURL 붙여넣기 테스트
- [ ] 민감정보 마스킹 테스트
- [ ] LocalStorage 저장 테스트 (민감정보 제외)
- [ ] URL 공유 테스트 (민감정보 제외)
- [ ] i18n 테스트 (모든 로케일)
- [ ] 모바일 반응형 테스트

### 5.2 수용 기준 (AC) 검증

**체크리스트**:
- [ ] `curl https://example.com` → GET + URL 정상 추출
- [ ] `-X POST -H ... -d '{"a":1}'` → method/headers/json body 정상
- [ ] `-H 'Cookie: a=b; c=d'` 또는 `-b 'a=b; c=d'` → cookie 테이블 정상 파싱
- [ ] `--data-urlencode 'q=hello%20world'` → 표시 디코드 옵션 정상
- [ ] `-F 'k=v' -F 'file=@/path/a.png'` → 텍스트 필드 적용 + 파일은 경고/placeholder
- [ ] "Open in API Tester"로 전환 시 값이 동일하게 이관
- [ ] URL 입력창에 cURL 붙여넣으면 자동 파싱되어 폼이 채워짐
- [ ] 일반 URL 붙여넣기는 그대로 URL 입력됨
- [ ] 파싱 실패 시 사용자에게 오류 + "Paste as URL" 대안 제공

### 5.3 빌드 및 린트 검증

**체크리스트**:
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] 타입 체크 오류 없음
- [ ] 생성된 HTML 파일 확인 (SEO 메타 태그)
- [ ] sitemap.xml에 경로 추가 확인

---

## Phase 6: 문서 업데이트

### 6.1 릴리스 노트 작성

**체크리스트**:
- [ ] `RELEASE_NOTES.md`에 v1.4.1 섹션 추가
- [ ] 신규 기능 설명
- [ ] 주요 변경사항 정리

### 6.2 기타 문서 업데이트

**체크리스트**:
- [ ] `README.md`에 cURL Parser 도구 소개 추가
- [ ] `TEST_CHECKLIST.md`에 테스트 케이스 추가
- [ ] `AGENTS.md` 업데이트 (필요시)

---

## 구현 우선순위

1. **Phase 1**: cURL 파서 코어 라이브러리 구현 (가장 중요)
2. **Phase 2**: cURL Parser Tool UI 구현
3. **Phase 3**: API Tester cURL 붙여넣기 기능 구현
4. **Phase 4**: i18n 리소스 추가
5. **Phase 5**: 테스트 및 검증
6. **Phase 6**: 문서 업데이트

---

## 주의사항

### 보안 및 프라이버시

- ✅ 모든 처리는 브라우저 로컬에서 수행 (네트워크 전송 없음)
- ✅ LocalStorage 저장 시 민감정보 제외 (기본)
- ✅ URL 공유 시 민감정보 제외 (기본)
- ✅ API Tester로 전달 시에는 전달하되, "민감정보 포함됨" 배지 표시

### 성능

- ✅ 파싱은 debounce 처리 (150~300ms)
- ✅ 큰 body 처리 시 Web Worker 고려
- ✅ UI 프리징 금지 (특히 모바일)

### 코드 구조

- ✅ cURL Parser와 API Tester가 동일 파싱 유틸 공유
- ✅ `src/lib/curl/parseCurl.ts` (core)
- ✅ `src/tools/curl-parser/...` (UI)
- ✅ `src/tools/api-tester/...` (paste handler)

### 확장 가능성

- ✅ 향후 "API Utilities" 카테고리로 묶을 수 있도록 경로 구조 고려
- ✅ 다른 HTTP 클라이언트 포맷 지원은 향후 고려

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-01-XX

