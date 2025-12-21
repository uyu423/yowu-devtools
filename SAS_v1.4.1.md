# yowu-devtools v1.4.1 SRS (Software Requirements Specification)

## cURL Parser + API Tester 연동/고도화

---

## 문서 메타

- **프로젝트명**: tools.yowu.dev (yowu-devtools)
- **버전**: v1.4.1
- **기능명**: cURL Parser + API Tester 연동/고도화
- **작성일**: 2025-06-17
- **상태**: ✅ 구현 완료

---

## 0. 배경 및 목표

### 0.1 배경

개발자들이 API 테스트를 위해 cURL 커맨드를 복사하여 사용하는 경우가 많습니다. 하지만 기존 API Tester에서는 cURL 커맨드를 수동으로 파싱하여 폼에 입력해야 하는 불편함이 있었습니다.

**사용자 시나리오**:

1. 개발자가 브라우저 DevTools나 Postman에서 cURL 커맨드를 복사
2. cURL 커맨드를 구조화하여 확인하고 싶음
3. API Tester에서 동일한 요청을 재현하고 싶음
4. API Tester URL 입력창에 cURL을 붙여넣으면 자동으로 파싱되어 폼이 채워지길 원함

### 0.2 v1.4.1 목표

1. **신규 Tool: cURL Parser 추가**

   - 사용자가 복사한 `curl ...` 커맨드를 붙여넣으면 요청 요소(URL/메서드/헤더/쿠키/바디/옵션)를 구조화해 보여줌
   - 파싱 결과를 API Tester로 즉시 열기 기능 제공

2. **API Tester 고도화: cURL 붙여넣기 지원**

   - URL 입력창에 `curl ...`을 붙여넣으면 자동 파싱 → 폼 자동 채움
   - 일반 URL 붙여넣기는 기존대로 동작

3. **보안 및 프라이버시**
   - 민감정보(쿠키/Authorization 등) 취급 정책 및 UX
   - 로컬 처리만 수행 (서버 전송 없음)

---

## 1. 범위

### 1.1 In Scope

- ✨ **신규 Tool: cURL Parser**

  - cURL 커맨드 파싱 및 구조화 표시
  - "Open in API Tester" 연동 기능
  - URL 인코딩/디코딩 표시 옵션
  - Cookie 상세 파싱

- 🔧 **API Tester 고도화**

  - URL 입력창에서 cURL 붙여넣기 지원
  - 자동 파싱 및 폼 자동 채움

- 🔒 **민감정보 취급 정책**
  - 쿠키/Authorization 등 민감 헤더 마스킹 옵션
  - 저장/공유 시 민감정보 제외 기본 정책

### 1.2 Out of Scope (v1.4.1 제외)

- ❌ 서버 실행, 프록시, 네트워크 로그 수집
- ❌ 완전한 bash 파서 (변수 치환, command substitution, heredoc, `$(...)`, backtick 등)
- ❌ `curl -K config`, `@file`/`--data @file` 실제 파일 로딩
  - 지원은 "경고 + 수동 입력 유도"로 처리

---

## 2. 라우팅 및 네비게이션

### 2.1 신규 페이지

- **경로**: `/curl` (또는 `/api/curl` 중 선택)
  - 기존 툴 분류 규칙에 맞추되 향후 "API Utilities" 카테고리로 묶기 쉬운 경로 권장
  - i18n 지원: `/{locale}/curl` (예: `/ko-KR/curl`)

### 2.2 사이드바

- "cURL Parser" 항목 추가
- 기존 도구들과 동일한 카테고리 구조 유지

### 2.3 API Tester

- 기존 `/api` 경로 유지
- i18n 지원: `/{locale}/api`

---

## 3. 공통 정책 (보안/프라이버시)

### 3.1 처리 원칙

- ✅ **모든 처리는 브라우저 로컬에서 수행** (네트워크 전송 없음)
- ✅ **LocalStorage 저장 정책**:
  - 기본: 마지막 입력한 curl 커맨드와 "표시 옵션"만 저장
  - **쿠키/Authorization 등 민감 헤더는 기본 저장/공유 제외**

### 3.2 공유 링크 정책

- cURL Parser 결과 공유는 "옵션/비민감 항목"만 기본 포함
- 민감항목 포함은 명시적 토글(기본 OFF) + 경고 문구 필요

---

## 4. 신규 기능 1: cURL Parser

### 4.1 UI 요구사항

#### 4.1.1 입력 영역

- **멀티라인 textarea**: "Paste cURL command" placeholder
- **버튼**:
  - `Parse` (자동 파싱은 입력 debounce로 하되, 버튼도 제공)
  - `Clear`
  - `Copy normalized cURL` (옵션)
- **입력 지원**:
  - 여러 줄 `\` 라인 컨티뉴에이션 포함 커맨드 지원
  - 앞뒤 텍스트가 섞여도(로그/메시지) "첫 `curl`부터" 추출 시도(선택)

#### 4.1.2 표시 옵션 (토글)

- `URL Decode in display` (기본 ON)
- `URL Encode on export` (기본 OFF)
- `Cookie decode` (기본 ON)
- `Hide sensitive values` (기본 ON)
  - ON이면 쿠키/Authorization 일부 마스킹(예: 앞 6글자 + `…`)

#### 4.1.3 출력 (파싱 결과) 패널

섹션을 접기/펼치기로 제공 (모바일 고려)

**1. Request Summary**

- Method
- URL (원본/디코드 표시 토글)
- "Open in API Tester" 버튼
- "Copy as JSON" (요청 모델 export, 선택)

**2. Query Params**

- key/value 테이블 + enable 토글 (기본 true)
- decode 표시/encode export 옵션 반영

**3. Headers**

- key/value 테이블
- 헤더 그룹 분리 (권장):
  - General (Accept 등)
  - Auth (Authorization, X-API-Key 등)
  - Cookies (Cookie 헤더는 별도 섹션으로 분리)
- 민감 헤더 마스킹 표시 (옵션에 따라)

**4. Cookies (상세 파싱)**

- 소스: `-b/--cookie` 또는 `-H 'cookie: ...'`
- "Cookie string" 원문 표시 + 파싱된 key/value 테이블
- 지원:
  - `a=b; c=d` 형태 파싱
  - 동일 키 중복 시 마지막 우선 또는 배열로 보관 (정책 명시)
- 한계:
  - `-b cookiefile.txt` 형태는 "파일 기반"으로 간주 → **지원 불가 경고 + 수동 붙여넣기 안내**

**5. Body**

- Body type 추론:
  - JSON (헤더/내용 기반)
  - raw text
  - x-www-form-urlencoded (`--data-urlencode` 포함)
  - multipart/form-data (`-F/--form`)
- raw body 미리보기 + (JSON이면) pretty view 제공
- 파일 첨부 (`-F file=@path`)는 "로컬 파일 경로"만 존재 → **지원 불가 경고 + API Tester에서 파일 다시 선택 안내**

**6. cURL Options**

- `--compressed`, `--location`, `--insecure`, `--http2`, `--resolve` 등
- v1.4.1에서는 "표시 + 일부만 API Tester에 맵핑" (아래 매핑 규칙 참조)

**7. Parse Warnings / Unsupported**

- 지원 불가/부분 지원 케이스를 목록으로 명확히 표시
- 예: `--data @file`, `-K config`, 변수 `$TOKEN`, `$(...)`, 복잡한 quoting 등

### 4.2 파싱 범위 (지원 플래그) 요구사항

#### 4.2.1 최소 지원 (필수)

**URL**

- 마지막 URL 토큰 또는 `curl 'https://...'` 형태

**Method**

- `-X/--request`
- Body가 존재하고 `-X`가 없으면 기본 `POST`로 추론 (단, `-G`가 있으면 GET 우선)

**Headers**

- `-H/--header` 반복 지원

**Cookies**

- `-b/--cookie` (string 형태만)
- `-H "Cookie: ..."`도 인식

**Body**

- `-d/--data`, `--data-raw`, `--data-binary`, `--data-urlencode`
- `-F/--form` (텍스트 필드만 완전 지원, 파일은 부분 지원/경고)

**기타 옵션 (표시만)**

- `-L/--location` (redirect)
- `--compressed`
- `-k/--insecure`
- `-u/--user` (Basic auth로 변환 가능)

#### 4.2.2 토큰화/따옴표 처리 (필수)

- 단일/이중 따옴표 지원
- 백슬래시 이스케이프 지원 (최소한 `\"`, `\'`, `\\`, 라인 컨티뉴에이션 `\`+개행)
- 단, **쉘 실행 의미 (변수 치환/command substitution)는 금지**하고 "원문 문자열"로 처리 + 경고

### 4.3 내부 데이터 모델 (표준화)

```typescript
type CurlParseResult = {
  original: string;
  normalized: string; // 라인 컨티뉴 제거, 토큰 정리된 형태 (선택)
  request: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string; // raw
    urlDecoded?: string; // display용
    query: Array<{ key: string; value: string; enabled: boolean }>;
    headers: Array<{
      key: string;
      value: string;
      enabled: boolean;
      sensitive?: boolean;
    }>;
    cookies?: {
      raw: string;
      items: Array<{ key: string; value: string; sensitive?: boolean }>;
      source: 'cookie-flag' | 'cookie-header';
    };
    body?: {
      kind: 'none' | 'text' | 'json' | 'urlencoded' | 'multipart';
      text?: string; // raw/json
      urlencodedItems?: Array<{ key: string; value: string }>;
      multipartItems?: Array<
        | { kind: 'field'; key: string; value: string }
        | {
            kind: 'file';
            key: string;
            filename?: string;
            path?: string;
            note: 'unsupported-file-path';
          }
      >;
    };
    options: {
      followRedirects?: boolean; // -L
      insecureTLS?: boolean; // -k
      compressed?: boolean;
      basicAuth?: { user: string; password: string }; // -u (가능한 경우)
    };
  };
  warnings: Array<{ code: string; message: string }>;
};
```

### 4.4 "Open in API Tester" 연동 요구사항

#### 4.4.1 동작

- 버튼 클릭 시 API Tester로 라우팅 전환하며, 파싱된 요청 데이터로 폼을 자동 채운다.
- 이동 시 **현재 URL의 i18n prefix 유지** (예: `/ko-KR/curl` → `/ko-KR/api`)

#### 4.4.2 데이터 전달 방식

**권장: 앱 내부 상태 전달**

- 예: store/context 사용 + fallback으로 sessionStorage
- URL에 민감 데이터가 남지 않음

**대안: 기존 share payload 포맷 재사용**

- "민감정보 제외" 기본 적용

#### 4.4.3 민감정보 정책

- 기본값: Cookie/Authorization은 **API Tester로 전달하되**, "저장/공유"에서는 기본 제외
- 단, 사용자가 "Hide sensitive values"를 ON 했더라도 **실제 전달 값은 유지** (표시만 마스킹)
- 대신 "민감정보 포함됨" 배지로 명확히 안내

---

## 5. 신규 기능 2: API Tester 고도화 (URL 입력창 cURL 붙여넣기)

### 5.1 UX 요구사항

- API Tester의 URL 입력창에서 사용자가 붙여넣기 했을 때:
  - 입력 텍스트가 `curl` 커맨드로 판단되면:
    1. URL 입력 대신 **cURL 파싱을 수행**
    2. Method/URL/Headers/Query/Body를 즉시 폼에 반영
    3. Toast로 "cURL parsed and applied" 표시
- 일반 URL 붙여넣기는 기존대로 동작해야 함.

### 5.2 cURL 감지 규칙 (필수)

- `trimStart()` 기준으로 다음 중 하나면 cURL로 간주:
  - `curl ` 로 시작
  - 줄바꿈 포함 + 첫 토큰이 `curl`
- 감지 후 파싱 실패 시:
  - URL 입력을 원문 그대로 넣지 말고
  - "cURL parse failed" 에러 + "Paste as URL" 보조 버튼 제공 (사용자가 원하면 URL로 넣을 수 있게)

### 5.3 파싱 적용 매핑 규칙

`CurlParseResult.request` → API Tester form state 로 매핑

**필수 매핑**

- `method` → method
- `url/query` → URL + query table
- `headers` (쿠키 포함) → headers table
- `body.kind`:
  - `json` → Body (JSON)
  - `text` → Body (raw)
  - `urlencoded` → Body (urlencoded)
  - `multipart` → Body (multipart) (file은 미지원/placeholder)

**옵션 매핑 (가능한 것만)**

- `followRedirects` (-L) → "Follow redirects" 옵션
- `insecureTLS` (-k) → (브라우저 fetch는 TLS 검증 비활성화 불가)
  - **적용 불가 경고** + "Extension 모드/로컬 환경에서만 의미" 안내

### 5.4 API Tester 폼 상태 변화 규칙

- cURL 적용 시:
  - 기존 입력값을 덮어쓴다.
  - 단, 사용자가 이미 입력한 값이 있을 때는 "Undo (1회)" 제공 (권장)
- 로컬스토리지 저장:
  - 기존 정책대로 "마지막 상태"는 저장하되 민감항목 저장은 기본 OFF

---

## 6. i18n 요구사항

### 6.1 v1.3.0 i18n 정책 준수

- 모든 UI 텍스트는 i18n 리소스에서 참조
- 하드코딩된 문자열 리터럴 금지
- 새 UI 요소 추가 시 모든 로케일 파일에 키를 동시에 추가

### 6.2 신규 문자열 키 추가 범위 (예시)

**cURL Parser 관련**:

- `tool.curl.title`
- `tool.curl.pasteHint`
- `tool.curl.openInApiTester`
- `tool.curl.parse`
- `tool.curl.clear`
- `tool.curl.copyNormalized`
- `tool.curl.requestSummary`
- `tool.curl.queryParams`
- `tool.curl.headers`
- `tool.curl.cookies`
- `tool.curl.body`
- `tool.curl.options`
- `tool.curl.warnings`

**경고 메시지**:

- `curl.warning.unsupportedFile`
- `curl.warning.shellExpansion`
- `curl.warning.configFile`
- `curl.warning.variableSubstitution`

**API Tester cURL 붙여넣기 관련**:

- `api.curlPaste.applied`
- `api.curlPaste.failed`
- `api.curlPaste.pasteAsUrl`
- `api.curlPaste.undo`

### 6.3 지원 언어

- en-US (기본)
- ko-KR
- ja-JP
- zh-CN
- es-ES

---

## 7. 성능 요구사항

### 7.1 파싱 성능

- cURL 파싱은 기본적으로 가볍지만, body가 큰 케이스를 고려:
  - 파싱은 debounce (150~300ms)
  - JSON pretty/렌더는 worker 또는 lazy 렌더 (최소 "접기 상태에서는 파싱만")

### 7.2 UI 프리징 금지

- 특히 모바일에서 UI 프리징 금지
- 큰 body 처리 시 Web Worker 고려 (v1.1.0+ 패턴 참조)

---

## 8. 테스트/수용 기준 (AC)

### 8.1 cURL Parser

- [ ] `curl https://example.com` → GET + URL 정상 추출
- [ ] `-X POST -H ... -d '{"a":1}'` → method/headers/json body 정상
- [ ] `-H 'Cookie: a=b; c=d'` 또는 `-b 'a=b; c=d'` → cookie 테이블 정상 파싱
- [ ] `--data-urlencode 'q=hello%20world'` → 표시 디코드 옵션 정상
- [ ] `-F 'k=v' -F 'file=@/path/a.png'` → 텍스트 필드 적용 + 파일은 경고/placeholder
- [ ] "Open in API Tester"로 전환 시 값이 동일하게 이관
- [ ] 민감정보 마스킹 옵션 정상 동작
- [ ] 여러 줄 `\` 라인 컨티뉴에이션 정상 파싱
- [ ] 따옴표 처리 (단일/이중) 정상 동작

### 8.2 API Tester cURL 붙여넣기

- [ ] URL 입력창에 cURL 붙여넣으면 자동 파싱되어 폼이 채워짐
- [ ] 일반 URL 붙여넣기는 그대로 URL 입력됨
- [ ] 파싱 실패 시 사용자에게 오류 + "Paste as URL" 대안 제공
- [ ] i18n prefix 유지 (예: `/ko-KR/api`)
- [ ] Undo 기능 정상 동작 (기존 값이 있을 때)

### 8.3 보안 및 프라이버시

- [ ] 민감정보가 LocalStorage에 저장되지 않음 (기본 설정)
- [ ] 공유 링크에 민감정보가 포함되지 않음 (기본 설정)
- [ ] "Hide sensitive values" 옵션 정상 동작 (표시만 마스킹)

---

## 9. 구현 메모 (Agent 지침)

### 9.1 파서 구현 원칙

- **쉘 실행 금지**: 브라우저 내 순수 파싱만 수행
- **토큰화**: 간이 shell-like tokenizer 구현
  - 싱글/더블쿼트, 백슬래시, 라인컨티뉴 처리
- **변수 치환 금지**: `$TOKEN`, `$(...)` 등은 원문 문자열로 처리 + 경고

### 9.2 코드 구조

**공유 유틸리티**:

- `src/lib/curl/parseCurl.ts` (core 파싱 로직)
- `src/lib/curl/types.ts` (타입 정의)

**cURL Parser Tool**:

- `src/tools/curl-parser/index.tsx` (UI 컴포넌트)
- `src/tools/curl-parser/types.ts` (도구별 타입)

**API Tester 통합**:

- `src/tools/api-tester/pasteHandler.ts` (cURL 붙여넣기 핸들러)
- 기존 API Tester 컴포넌트에 통합

### 9.3 데이터 전달 방식

**cURL Parser → API Tester**:

- 권장: 앱 내부 상태 전달 (store/context)
- Fallback: sessionStorage
- URL fragment 공유는 민감정보 제외 기본 적용

### 9.4 민감정보 처리

- **마스킹**: UI 레벨에서만 (실제 값은 state에 유지 가능)
- **저장/공유**: 기본 제외, 명시적 토글 필요
- **전달**: API Tester로는 전달하되, "민감정보 포함됨" 배지 표시

### 9.5 경고 처리

**지원 불가 케이스**:

- `--data @file`: 파일 경로만 표시, 수동 입력 유도
- `-K config`: 설정 파일 경고, 수동 입력 유도
- `$TOKEN`, `$(...)`: 쉘 변수 경고, 원문 그대로 처리
- `-F file=@path`: 파일 경로 경고, API Tester에서 다시 선택 안내

**부분 지원 케이스**:

- `-k/--insecure`: 표시만, 브라우저에서는 적용 불가 안내
- `--resolve`: 표시만, API Tester에서 수동 설정 안내

### 9.6 SEO 최적화

- `vite-plugin-generate-routes.ts`에 cURL Parser 도구 정보 추가
- SEO 메타 태그 자동 생성
- sitemap.xml에 경로 추가

---

## 10. 참고 사항

### 10.1 기존 도구 패턴 준수

- `useToolState` 훅 사용 (localStorage + URL 공유)
- `ToolHeader`, `EditorPanel` 등 공통 컴포넌트 활용
- i18n 리소스 구조 준수

### 10.2 API Tester 기존 기능 유지

- cURL 붙여넣기는 기존 기능에 추가하는 형태
- 기존 "Copy as cURL" 기능과 상호 보완

### 10.3 확장 가능성

- 향후 "API Utilities" 카테고리로 묶을 수 있도록 경로 구조 고려
- 다른 HTTP 클라이언트 포맷 지원 (Postman Collection, Insomnia 등)은 향후 고려

---

## 11. 문서 업데이트 체크리스트

구현 완료 후 다음 문서들을 업데이트해야 합니다:

- [ ] `RELEASE_NOTES.md`: v1.4.1 릴리스 노트 추가
- [ ] `IMPLEMENTATION_PLAN_v1.4.1.md`: 구현 계획 문서 생성
- [ ] `TEST_CHECKLIST.md`: 테스트 체크리스트 추가
- [ ] `README.md`: cURL Parser 도구 소개 추가
- [ ] `AGENTS.md`: SEO 최적화 가이드 업데이트 (필요시)

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-06-17
