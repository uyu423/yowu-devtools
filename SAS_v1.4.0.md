# yowu-devtools v1.4.0 SRS (Software Requirements Specification)

## API Tester + Companion Chrome Extension

---

## 문서 메타

- **프로젝트명**: tools.yowu.dev (구 yowu-devtools)
- **버전**: v1.4.0
- **기능명**: API Tester + Companion Chrome Extension
- **작성일**: 2024-12-16
- **상태**: 설계 문서 초안

---

## 0. 배경 및 목표

### 0.1 배경

yowu-devtools는 서버 없이 브라우저에서만 동작하는 개발자 도구 모음입니다. 그러나 API 호출 테스터 기능의 경우, **브라우저의 CORS(Cross-Origin Resource Sharing) 정책**으로 인해 순수 웹앱만으로는 Postman과 같은 수준의 경험을 제공하기 어렵습니다.

**CORS 제약 사항**:

- 브라우저의 `fetch` API는 same-origin policy에 의해 다른 도메인의 API 호출이 제한됨
- 서버에서 `Access-Control-Allow-Origin` 헤더를 설정하지 않으면 응답을 읽을 수 없음
- 개발자가 테스트하려는 대부분의 API는 CORS 헤더가 없거나 특정 도메인만 허용

**해결책**:

- **Chrome Extension은 host_permissions를 갖춘 경우 service worker에서 cross-origin 요청이 가능**
- 웹앱 + 확장 프로그램 조합으로 CORS 제약 없는 API 테스트 환경 제공

### 0.2 v1.4.0 목표

1. **웹앱에 API Tester 도구(/api) 추가**

   - Postman 유사 UI/UX
   - 다양한 HTTP 메서드, 헤더, 바디 타입 지원

2. **Companion Chrome Extension을 통한 CORS 우회**

   - Direct Fetch 모드: 일반 fetch 사용 (CORS 허용 API용)
   - Extension Fetch 모드: 확장 프로그램을 통한 요청 (CORS 차단 API용)

3. **최소 권한 원칙 준수**

   - 설치 시: tools.yowu.dev만 연결
   - 호출 대상 도메인: `optional_host_permissions`로 런타임에 사용자 동의

4. **기존 제품 원칙 유지**
   - 서버/로그/트래킹 없음
   - 로컬 저장 + URL fragment 기반 공유
   - i18n 지원

---

## 1. 범위

### 1.1 포함 (In Scope)

#### WebApp

- API Tester Tool UI/로직 (`/api-tester` 경로)
- Direct Fetch 모드 (일반 `fetch`)
- Extension Fetch 모드 (확장 프로그램 통신)
- 요청 히스토리/즐겨찾기/공유 기능
- i18n 지원 (v1.3.0 체계 준수)

#### Chrome Extension (Manifest V3)

- WebApp과의 메시지 통신 (externally_connectable)
- cross-origin fetch 수행
- 런타임 권한 요청/관리 UI (Options 페이지)
- 최소 권한으로 설치, 필요시 권한 확장

#### 프로젝트 구조

- Monorepo 구조로 전환 (웹앱 + 확장 프로그램 통합 관리)

### 1.2 제외 (Out of Scope)

- 팀/클라우드 워크스페이스 동기화
- Postman 컬렉션 완전 호환 (import/export 고급 기능)
- 프록시 서버 운영 (프로젝트 철학과 상충)
- 인증 플로우 자동화 (OAuth 로그인 팝업 등)
- Firefox/Safari 등 다른 브라우저 확장 프로그램 (v1.4.0에서는 Chrome만)

---

## 2. 사용자 시나리오 (User Stories)

### US-V140-01: CORS 허용 API 호출

> 사용자로서, CORS가 허용된 API는 웹앱에서 바로 호출하고 싶다.

**수용 기준**:

- Direct 모드로 요청 시 정상적으로 응답 수신
- 응답 헤더, 바디, 상태 코드 표시

### US-V140-02: CORS 차단 API 우회

> 사용자로서, CORS로 차단된 API를 Extension 모드로 호출하고 싶다.

**수용 기준**:

- Direct 모드 실패 시 "Extension 모드로 재시도" CTA 표시
- Extension 연결 시 자동으로 재호출 가능

### US-V140-03: 도메인 권한 요청

> 사용자로서, 새로운 도메인에 처음 요청 시 권한을 요청받고 싶다.

**수용 기준**:

- 권한 미보유 도메인 요청 시 권한 요청 안내
- 사용자 클릭(유저 제스처)으로 권한 요청 팝업
- 승인 후 즉시 재호출

### US-V140-04: 요청 히스토리/즐겨찾기

> 사용자로서, 이전 요청을 저장하고 빠르게 재실행하고 싶다.

**수용 기준**:

- 최근 30개 요청 히스토리 저장
- 즐겨찾기 등록/삭제 및 이름 변경
- 히스토리에서 클릭 시 폼 자동 채우기

### US-V140-05: 요청 상태 공유

> 사용자로서, 현재 요청 설정을 URL로 공유하고 싶다.

**수용 기준**:

- Share 버튼 클릭 시 공유 링크 생성
- 민감정보(Authorization, Cookie) 포함 여부 선택 가능
- 공유 링크로 접속 시 폼 상태 복원

### US-V140-06: Copy as cURL

> 사용자로서, 현재 요청을 cURL 명령으로 복사하고 싶다.

**수용 기준**:

- Copy as cURL 버튼 클릭 시 클립보드에 복사
- 헤더, 바디 포함
- Cookie는 placeholder로 처리

### US-V140-07: Extension 설치/상태 확인

> 사용자로서, Extension 설치 여부와 연결 상태를 확인하고 싶다.

**수용 기준**:

- Extension 미설치: 설치 안내 링크 표시
- Extension 설치됨: 연결 상태 배지 표시
- 권한 필요: 권한 요청 버튼 표시

---

## 3. WebApp: API Tester 기능 요구사항

### 3.1 라우팅/네비게이션

| 항목      | 값                                                           |
| --------- | ------------------------------------------------------------ |
| Tool ID   | `api-tester`                                                 |
| 기본 경로 | `/api`                                                       |
| i18n 경로 | `/{locale}/api-testser` (예: `/ko-KR/api-tester`)            |
| i18n Key  | `apiTester`                                                  |
| 카테고리  | `tester`                                                     |
| 키워드    | `api`, `rest`, `http`, `request`, `postman`, `fetch`, `curl` |

### 3.2 요청 빌더 (Request Builder)

#### 3.2.1 HTTP 메서드

| 메서드  | 바디 지원 | 설명             |
| ------- | --------- | ---------------- |
| GET     | ❌        | 리소스 조회      |
| POST    | ✅        | 리소스 생성      |
| PUT     | ✅        | 리소스 전체 수정 |
| PATCH   | ✅        | 리소스 부분 수정 |
| DELETE  | ✅ (옵션) | 리소스 삭제      |
| HEAD    | ❌        | 헤더만 조회      |
| OPTIONS | ❌        | 지원 메서드 확인 |

#### 3.2.2 URL 입력

```
[GET ▼] [https://api.example.com/v1/users?page=1        ]
```

- 전체 URL 입력 (스키마 포함)
- Query params는 URL에 직접 입력하거나 별도 테이블로 편집

#### 3.2.3 Query Parameters

| Key     | Value        | Enabled |
| ------- | ------------ | ------- |
| `page`  | `1`          | ✅      |
| `limit` | `10`         | ✅      |
| `sort`  | `created_at` | ❌      |

- key/value 테이블 형태
- 각 항목 활성화/비활성화 토글
- 추가/삭제 버튼

#### 3.2.4 Headers

| Key               | Value              | Enabled |
| ----------------- | ------------------ | ------- |
| `Content-Type`    | `application/json` | ✅      |
| `Authorization`   | `Bearer xxx`       | ✅      |
| `X-Custom-Header` | `value`            | ❌      |

- key/value 테이블 형태
- 대소문자 유지
- 각 항목 활성화/비활성화 토글
- 자주 쓰는 헤더 프리셋 (선택)

#### 3.2.5 Body

| 타입                  | 설명        | Content-Type                        |
| --------------------- | ----------- | ----------------------------------- |
| none                  | 바디 없음   | -                                   |
| raw (text)            | 텍스트 바디 | `text/plain`                        |
| JSON                  | JSON 데이터 | `application/json`                  |
| x-www-form-urlencoded | 폼 데이터   | `application/x-www-form-urlencoded` |
| multipart/form-data   | 파일 업로드 | `multipart/form-data`               |

**JSON 바디 옵션**:

- Pretty/Minify 토글
- JSON 유효성 검사 (실시간)
- 에러 시 라인/컬럼 표시

**form-data 바디**:

- 텍스트 필드: key/value 테이블
- 파일 필드: 파일 선택 UI

#### 3.2.6 요청 옵션

| 옵션             | 기본값 | 설명                     |
| ---------------- | ------ | ------------------------ |
| Timeout (ms)     | 30000  | 요청 타임아웃            |
| Follow Redirects | true   | 리다이렉트 자동 추적     |
| Credentials      | omit   | 쿠키/인증 정보 전송 모드 |

**Credentials 옵션**:

- `omit`: 쿠키 전송 안함 (기본)
- `same-origin`: 같은 origin에만 쿠키 전송
- `include`: 항상 쿠키 전송

> **참고**: Extension 모드에서는 `same-origin` 옵션이 지원되지 않음 (`omit` | `include`만)

### 3.3 응답 뷰어 (Response Viewer)

#### 3.3.1 상단 요약 바

```
[200 OK] [234ms] [1.2 KB] [application/json]
```

- Status Code + Status Text (색상 구분)
  - 2xx: 녹색
  - 3xx: 파란색
  - 4xx: 주황색
  - 5xx: 빨간색
- Duration (ms)
- Response Size (대략)
- Content-Type

#### 3.3.2 Headers 탭

```
content-type: application/json; charset=utf-8
x-request-id: abc-123
cache-control: no-cache
```

- 전체 응답 헤더 표시
- "Copy Headers" 버튼

#### 3.3.3 Body 탭

| Content-Type       | 표시 방식                      |
| ------------------ | ------------------------------ |
| `application/json` | Tree / Pretty / Raw 토글, 검색 |
| `text/*`           | Raw + Search                   |
| `image/*`          | 이미지 미리보기                |
| 기타 binary        | "Download as file" 버튼        |

**JSON 응답**:

- 기존 JSON Viewer 컴포넌트 재사용
- Tree View: 접기/펼치기
- Pretty View: 구문 강조
- Raw View: 원본 텍스트
- Search: 키/값 검색

#### 3.3.4 Copy as cURL

```bash
curl -X POST 'https://api.example.com/v1/users' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer xxx' \
  -d '{"name":"test"}'
```

- 현재 요청 설정을 cURL 명령으로 변환
- Cookie 헤더는 placeholder 처리: `-b '<your cookies>'`
- Windows/Unix 형식 선택 (옵션)

### 3.4 히스토리/저장/공유

#### 3.4.1 LocalStorage 저장

| 키                                 | 내용                           |
| ---------------------------------- | ------------------------------ |
| `yowu-devtools:v1:tool:api-tester` | 마지막 요청 폼 상태            |
| `yowu-devtools:v1:api-history`     | 최근 실행 히스토리 (최대 30개) |
| `yowu-devtools:v1:api-favorites`   | 즐겨찾기 목록                  |

**히스토리 항목 구조**:

```typescript
interface HistoryItem {
  id: string; // UUID
  timestamp: number; // epoch ms
  name?: string; // 사용자 지정 이름
  request: RequestSpec; // 요청 정보
  response?: ResponseSummary; // 응답 요약 (선택)
}
```

#### 3.4.2 공유 링크

**기본 포함 필드**:

- method, url, query params
- headers (민감정보 제외)
- body
- selectedMode (direct/extension)

**기본 제외 필드** (옵션으로 포함 가능):

- `Authorization` 헤더
- `Cookie` 헤더
- API 키 관련 헤더

**공유 시 경고**:

```
⚠️ 이 링크에는 민감한 정보가 포함될 수 있습니다.
민감정보를 제외하고 공유하시겠습니까?

[ ] Authorization 헤더 포함
[ ] Cookie 헤더 포함
[ ] API 키 헤더 포함

[공유 링크 생성] [취소]
```

### 3.5 CORS UX

#### 3.5.1 Direct 모드 실패 시 흐름

```
1. 사용자: "Send" 버튼 클릭 (Direct 모드)
2. 시스템: fetch 실행 → CORS 에러 발생
3. 시스템: 에러 타입 분석
   - TypeError: Failed to fetch → CORS 가능성 높음
   - 다른 에러 → 일반 네트워크 에러
4. 시스템: CORS 가능성 안내 표시
   ┌──────────────────────────────────────────────────────┐
   │ ⚠️ 요청이 실패했습니다.                              │
   │                                                      │
   │ 이 오류는 CORS(Cross-Origin Resource Sharing)       │
   │ 정책으로 인해 발생했을 수 있습니다.                  │
   │                                                      │
   │ 브라우저는 보안상의 이유로 다른 도메인의 API에       │
   │ 직접 요청하는 것을 제한합니다.                       │
   │                                                      │
   │ [Extension 모드로 재시도] [자세히 알아보기]          │
   └──────────────────────────────────────────────────────┘
5. Extension 연결 상태 확인:
   - 미설치: Chrome Web Store 설치 링크
   - 설치됨: "Extension 모드로 재시도" 버튼 활성화
```

#### 3.5.2 Extension 상태 배지

```
┌─────────────────────────────────────────────────┐
│ Mode: [Direct ▼] [Extension ▼]                  │
│                                                 │
│ Extension Status:                               │
│ 🔴 Not Installed [Install]                      │
│ 🟡 Installed (Permission Required) [Grant]     │
│ 🟢 Connected                                    │
└─────────────────────────────────────────────────┘
```

### 3.6 CORS 우회 전략

> **원칙**: Extension 사용은 **최후의 수단**입니다.
> 먼저 브라우저에서 가능한 모든 방법을 시도합니다.

#### 3.6.1 시도 순서

| 순서 | 방법           | 설명                    | 제한사항                     |
| ---- | -------------- | ----------------------- | ---------------------------- |
| 1    | 일반 fetch     | CORS 허용 API 직접 호출 | 서버에서 CORS 헤더 필요      |
| 2    | no-cors mode   | Opaque response로 요청  | 응답 읽기 불가 (상태 확인만) |
| 3    | Extension 모드 | Extension에서 요청 실행 | Extension 설치 필요          |

**no-cors 모드 특성**:

- 응답 body/headers 접근 불가
- 성공/실패 상태 확인만 가능
- 특정 API (헬스 체크 등)에서만 유용

#### 3.6.2 자동 시도 흐름

```
1. 사용자: Send 클릭
2. 시스템: 해당 도메인의 캐시된 성공 방법 확인
   - 캐시 있음 → 캐시된 방법으로 요청
   - 캐시 없음 → 순차 시도 시작

3. 순차 시도:
   3.1 일반 fetch 시도
       - 성공 → 응답 표시, 방법 캐싱
       - CORS 에러 → 3.2로 진행

   3.2 no-cors 시도 (선택적, 설정 가능)
       - 성공 → Opaque 응답 안내, 방법 캐싱
       - 실패 → 3.3으로 진행

   3.3 Extension 권고
       - Extension 설치됨 → "Extension 모드로 재시도" 버튼
       - Extension 미설치 → 설치 안내

4. 성공한 방법 캐싱 (localStorage)
```

#### 3.6.3 성공 방법 캐싱

**localStorage 키**: `yowu-devtools:v1:cors-strategy-cache`

**캐시 구조**:

```typescript
interface CorsStrategyCache {
  [origin: string]: {
    method: 'cors' | 'no-cors' | 'extension';
    cachedAt: number; // epoch ms
    expiresAt: number; // epoch ms
  };
}
```

**캐시 정책**:

| 항목           | 값      | 설명                               |
| -------------- | ------- | ---------------------------------- |
| 기본 만료 시간 | 7일     | 설정에서 변경 가능                 |
| 최대 캐시 항목 | 100개   | LRU 방식으로 오래된 항목 제거      |
| 캐시 무효화    | 실패 시 | 캐시된 방법 실패 시 삭제 후 재시도 |

**캐시 동작**:

1. 요청 전: 캐시 확인 (origin 기준)
2. 캐시 히트:
   - 만료 안됨 → 캐시된 방법 사용
   - 만료됨 → 캐시 삭제 후 순차 시도
3. 캐시 미스: 순차 시도 후 성공 방법 캐싱
4. 실패 처리: 캐시된 방법 실패 시 캐시 삭제, 다음 방법 시도

#### 3.6.4 사용자 설정

**Options 페이지 또는 도구 설정**:

- `자동 우회 시도 활성화` (기본: ON)
- `no-cors 모드 시도` (기본: OFF)
- `캐시 만료 시간` (기본: 7일)
- `캐시 초기화` 버튼

### 3.7 상태 타입 정의

```typescript
interface ApiTesterState {
  // 요청 설정
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body: RequestBody;

  // 옵션
  timeoutMs: number;
  followRedirects: boolean;
  credentials: 'omit' | 'same-origin' | 'include';

  // 모드
  selectedMode: 'direct' | 'extension';

  // UI 상태 (공유에서 제외)
  activeTab: 'params' | 'headers' | 'body';
  responseTab: 'body' | 'headers';
}

type RequestBody =
  | { kind: 'none' }
  | { kind: 'text'; text: string }
  | { kind: 'json'; text: string }
  | { kind: 'urlencoded'; items: Array<{ key: string; value: string }> }
  | { kind: 'multipart'; items: Array<FormDataItem> };

interface FormDataItem {
  key: string;
  type: 'text' | 'file';
  textValue?: string;
  fileName?: string; // 파일은 공유/저장 불가, 이름만 표시
}
```

---

## 4. Chrome Extension 요구사항 (Manifest V3)

### 4.1 기술 스택

| 항목          | 선택                        |
| ------------- | --------------------------- |
| Manifest 버전 | V3 (MV3)                    |
| 백그라운드    | Service Worker              |
| 통신 방식     | externally_connectable      |
| 빌드 도구     | Vite + crxjs 또는 직접 빌드 |
| 언어          | TypeScript                  |

### 4.2 Manifest.json 구조

```json
{
  "manifest_version": 3,
  "name": "Yowu DevTools Companion",
  "version": "1.0.0",
  "description": "Companion extension for tools.yowu.dev",

  "permissions": ["storage"],

  "optional_host_permissions": ["http://*/*", "https://*/*"],

  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },

  "options_page": "options.html",

  "externally_connectable": {
    "matches": ["https://tools.yowu.dev/*", "http://localhost:5173/*"]
  },

  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### 4.3 Extension 활성화 정책

> **중요**: Extension은 평소에 **비활성 상태**로 유지됩니다.
> WebApp에서 메시지가 오면 활성화되고, 작업 완료 후 다시 비활성화됩니다.

#### 4.3.1 Service Worker 이벤트 기반 동작

**MV3 Service Worker 특성**:

- 이벤트 리스너만 등록하고 대기
- 메시지 수신 시에만 활성화
- 작업 완료 후 자동으로 비활성화 (약 30초 idle 후)
- 상태는 chrome.storage에 저장 (메모리에 유지하지 않음)

**활성화 조건**:

- `chrome.runtime.onMessageExternal` 이벤트 수신 시

#### 4.3.2 통신 방식: Externally Connectable

**통신 흐름**:

```
WebApp                          Extension (Service Worker)
  │                                    │
  │ ──── PING ────────────────────────►│ (활성화됨)
  │ ◄──── PONG ────────────────────────│
  │                                    │ (비활성화됨)
  │                                    │
  │ ──── EXECUTE_REQUEST ─────────────►│ (활성화됨)
  │     { url, method, headers, ... }  │
  │ ◄──── Response ────────────────────│
  │     { status, body, headers }      │ (비활성화됨)
```

**메시지 타입**:

| 타입                 | 방향               | 설명             |
| -------------------- | ------------------ | ---------------- |
| `PING`               | WebApp → Extension | 연결 상태 확인   |
| `PONG`               | Extension → WebApp | 연결 확인 응답   |
| `HANDSHAKE`          | WebApp → Extension | 버전/기능 협상   |
| `EXECUTE_REQUEST`    | WebApp → Extension | HTTP 요청 실행   |
| `CHECK_PERMISSION`   | WebApp → Extension | 도메인 권한 확인 |
| `REQUEST_PERMISSION` | WebApp → Extension | 도메인 권한 요청 |
| `REVOKE_PERMISSION`  | WebApp → Extension | 도메인 권한 회수 |

### 4.4 권한/보안 정책

#### 4.4.1 최소 권한 원칙

| 권한 유형        | 설치 시 | 런타임 요청  |
| ---------------- | ------- | ------------ |
| `storage`        | ✅      | -            |
| 특정 도메인 host | ❌      | ✅ (사용 시) |

#### 4.4.2 런타임 권한 요청 흐름

```
1. WebApp: 새 도메인(api.example.com) 요청 전송
2. Extension: 해당 도메인 권한 확인
   - 권한 있음 → 요청 실행
   - 권한 없음 → 권한 필요 응답 반환
3. WebApp: "이 도메인에 대한 권한이 필요합니다" 안내
4. 사용자: "권한 요청" 버튼 클릭 (⚠️ 반드시 유저 제스처 필요)
5. Extension: chrome.permissions.request() 호출
6. Chrome: 권한 요청 팝업 표시
7. 사용자: 승인/거부
8. Extension → WebApp: 권한 부여 결과 전달
9. 승인됨: 요청 재실행
```

#### 4.4.3 보안 검증

**필수 검증 항목**:

- **Origin 검증**: 허용된 도메인(tools.yowu.dev, localhost:5173)만 메시지 수신
- **URL 형식 검증**: 유효한 URL인지 확인
- **HTTP 메서드 검증**: 허용된 메서드인지 확인
- **금지 헤더 필터링**: Host, Content-Length, Transfer-Encoding 등 제거

**주의사항**:

- `chrome.permissions.request()`는 반드시 **사용자 제스처(버튼 클릭 등) 핸들러** 내에서 호출해야 함
- Service Worker에서 직접 호출 불가

### 4.5 Request Executor

#### 4.5.1 기능

| 기능              | 지원                                         |
| ----------------- | -------------------------------------------- |
| HTTP 메서드       | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS |
| Headers           | ✅ (금지 헤더 제외)                          |
| Query Params      | ✅ (URL에 포함)                              |
| Body - JSON       | ✅                                           |
| Body - Text       | ✅                                           |
| Body - URLEncoded | ✅                                           |
| Body - FormData   | ✅ (파일 포함)                               |
| Timeout           | ✅ (AbortController)                         |
| Redirect          | ✅ (follow/manual)                           |
| Credentials       | ✅ (omit/include)                            |

#### 4.5.2 구현 요점

**처리 흐름**:

1. AbortController로 Timeout 처리
2. RequestSpec에서 fetch 옵션 구성
3. fetch 실행 및 응답 처리
4. 응답 타입에 따라 text 또는 base64로 변환
5. ResponseSpec 반환

**에러 처리**:

- Timeout: `AbortError` 캐치하여 `TIMEOUT` 코드 반환
- 네트워크 에러: `NETWORK_ERROR` 코드 반환

### 4.6 Options 페이지

#### 4.6.1 기능

- **승인된 도메인 목록 표시**: 현재 권한이 부여된 도메인 목록
- **도메인 제거**: 개별 도메인 권한 회수
- **전체 초기화**: 모든 도메인 권한 회수

#### 4.6.2 UI 구조

```
┌─────────────────────────────────────────────────────────┐
│ Yowu DevTools Companion - Settings                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Granted Domains                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://api.example.com      [Remove]               │ │
│ │ https://jsonplaceholder.typicode.com  [Remove]      │ │
│ │ https://httpbin.org          [Remove]               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Remove All Permissions]                                │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ About                                                   │
│ This extension enables tools.yowu.dev to make API      │
│ requests that would otherwise be blocked by CORS.      │
│                                                         │
│ Privacy                                                 │
│ • No data is sent to any server                        │
│ • Request history is stored locally in your browser    │
│ • Domain permissions can be revoked at any time        │
│                                                         │
│ Version: 1.0.0                                          │
│ [Visit tools.yowu.dev] [Report Issue]                   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. WebApp ↔ Extension 메시지 스키마

### 5.1 RequestSpec

```typescript
interface RequestSpec {
  id: string; // UUID (요청 식별용)
  method: string; // HTTP 메서드
  url: string; // 전체 URL (쿼리 포함)
  headers: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
  body:
    | { kind: 'none' }
    | { kind: 'text'; text: string }
    | { kind: 'json'; text: string }
    | { kind: 'urlencoded'; items: Array<{ key: string; value: string }> }
    | {
        kind: 'multipart';
        items: Array<{
          key: string;
          type: 'text' | 'file';
          textValue?: string;
          fileData?: string; // Base64 encoded
          fileName?: string;
          mimeType?: string;
        }>;
      };
  options: {
    timeoutMs: number;
    redirect: 'follow' | 'manual';
    credentials: 'omit' | 'include';
  };
}
```

### 5.2 ResponseSpec

```typescript
interface ResponseSpec {
  id: string; // 요청 ID와 매칭
  ok: boolean; // response.ok
  status?: number; // HTTP 상태 코드
  statusText?: string; // HTTP 상태 텍스트
  headers?: Record<string, string>; // 응답 헤더
  body?: {
    kind: 'text' | 'base64';
    data: string;
  };
  timingMs?: number; // 소요 시간 (ms)
  error?: {
    code: string; // 에러 코드
    message: string; // 에러 메시지
  };
}
```

### 5.3 메시지 타입

```typescript
// WebApp → Extension
type WebAppMessage =
  | { type: 'PING' }
  | { type: 'EXECUTE_REQUEST'; payload: RequestSpec }
  | { type: 'CHECK_PERMISSION'; payload: { origin: string } }
  | { type: 'REQUEST_PERMISSION'; payload: { origin: string } }
  | { type: 'GET_GRANTED_ORIGINS' }
  | { type: 'REVOKE_PERMISSION'; payload: { origin: string } };

// Extension → WebApp
type ExtensionResponse =
  | { type: 'PONG' }
  | { payload: ResponseSpec }
  | { payload: { granted: boolean } }
  | { payload: { origins: string[] } }
  | { error: { code: string; message: string } };
```

---

## 6. Monorepo 구조 및 빌드

### 6.1 Monorepo 도구 비교

현재 가장 트렌디하고 안정적인 monorepo 관리 도구들:

| 도구                | 장점                                              | 단점                            | 적합성     |
| ------------------- | ------------------------------------------------- | ------------------------------- | ---------- |
| **pnpm workspaces** | 빠른 설치, 디스크 효율적, 네이티브 workspace 지원 | 빌드 캐싱/병렬화 별도 설정 필요 | ⭐⭐⭐⭐   |
| **Turborepo**       | 빌드 캐싱, 병렬 실행, Vercel 지원                 | 설정 복잡도 증가                | ⭐⭐⭐⭐⭐ |
| **Nx**              | 강력한 기능, 풍부한 플러그인                      | 학습 곡선 높음, 오버킬 가능성   | ⭐⭐⭐     |
| **npm workspaces**  | 추가 도구 불필요, 심플                            | pnpm보다 느림, 기능 제한적      | ⭐⭐⭐     |

### 6.2 권장 구조: pnpm workspaces + Turborepo

**이유**:

- **pnpm**: 빠른 설치, 디스크 효율, phantom dependency 방지
- **Turborepo**: 빌드 캐싱, 작업 병렬화, 간단한 설정

### 6.3 프로젝트 구조

```
yowu-devtools/
├── .github/
│   └── workflows/
│       ├── deploy-web.yml           # 웹앱 배포
│       └── build-extension.yml      # 확장 빌드 (수동 배포)
├── apps/
│   ├── web/                         # 기존 웹앱 (이동)
│   │   ├── src/
│   │   │   ├── tools/
│   │   │   │   └── api-tester/      # 신규 도구
│   │   │   └── ...
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── extension/                   # Chrome Extension
│       ├── src/
│       │   ├── service-worker.ts
│       │   ├── options/
│       │   │   ├── options.html
│       │   │   └── options.ts
│       │   └── shared/
│       │       └── types.ts
│       ├── public/
│       │   └── icons/
│       ├── manifest.json
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   └── shared/                      # 공유 타입/유틸
│       ├── src/
│       │   ├── types/
│       │   │   └── api-tester.ts    # RequestSpec, ResponseSpec 등
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
├── package.json                     # Root package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

### 6.4 Root package.json

```json
{
  "name": "yowu-devtools",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@yowu-devtools/web",
    "dev:extension": "turbo run dev --filter=@yowu-devtools/extension",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=@yowu-devtools/web",
    "build:extension": "turbo run build --filter=@yowu-devtools/extension",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### 6.5 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 6.6 turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 6.7 패키지 의존성

**apps/web/package.json**:

```json
{
  "name": "@yowu-devtools/web",
  "version": "1.4.0",
  "dependencies": {
    "@yowu-devtools/shared": "workspace:*",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
    // ... 기존 의존성
  }
}
```

**apps/extension/package.json**:

```json
{
  "name": "@yowu-devtools/extension",
  "version": "1.0.0",
  "dependencies": {
    "@yowu-devtools/shared": "workspace:*"
  },
  "devDependencies": {
    "vite": "^7.2.4",
    "@crxjs/vite-plugin": "^2.0.0-beta.25",
    "typescript": "~5.9.3"
  }
}
```

**packages/shared/package.json**:

```json
{
  "name": "@yowu-devtools/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts"
  }
}
```

### 6.8 마이그레이션 전략

**Phase 1: Monorepo 구조 설정**

1. pnpm으로 패키지 매니저 전환
2. apps/web으로 기존 코드 이동
3. packages/shared 생성
4. Turborepo 설정

**Phase 2: Extension 개발**

1. apps/extension 디렉토리 생성
2. Manifest V3 설정
3. Service Worker 구현
4. Options 페이지 구현

**Phase 3: WebApp 통합**

1. API Tester 도구 개발
2. Extension 통신 로직 구현
3. 테스트 및 검증

### 6.9 로컬 개발 환경 테스트 방법

#### 6.9.1 개발 환경 구성 개요

로컬에서 WebApp과 Extension을 함께 테스트할 수 있도록 다음 구성을 사용합니다:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Local Development                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌───────────────────────────────┐│
│  │   WebApp (Vite)  │  ←───── │   Chrome Extension (Unpacked) ││
│  │  localhost:5173  │  MSG    │   개발자 모드 로드            ││
│  └──────────────────┘         └───────────────────────────────┘│
│                                                                 │
│  externally_connectable.matches:                               │
│  - "https://tools.yowu.dev/*"                                  │
│  - "http://localhost:5173/*"  ← 개발용                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.9.2 Extension 개발자 모드 로드

**1단계: Extension 빌드**

```bash
# apps/extension 디렉토리에서
pnpm run build
# 또는 watch 모드로 실시간 반영
pnpm run dev
```

**2단계: Chrome에 로드**

1. Chrome에서 `chrome://extensions/` 열기
2. 우측 상단 "개발자 모드" 토글 활성화
3. "압축 해제된 확장 프로그램 로드" 클릭
4. `apps/extension/dist` 폴더 선택

**3단계: Extension ID 확인 및 환경변수 설정**

Extension 로드 후 표시되는 ID를 복사하여 환경변수에 설정:

```bash
# apps/web/.env.local
VITE_EXTENSION_ID=abcdefghijklmnopqrstuvwxyz123456
```

> **참고**: 개발 모드에서 로드한 Extension의 ID는 `key` 필드 없이는 로드할 때마다 변경됩니다.
> 고정 ID를 위해 manifest.json에 `key` 필드를 설정할 수 있습니다. (아래 참조)

#### 6.9.3 고정 Extension ID 설정 (권장)

개발 중 Extension ID가 변경되지 않도록 manifest.json에 `key` 필드 추가:

```json
{
  "manifest_version": 3,
  "name": "Yowu DevTools Companion",
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
}
```

**key 생성 방법**:

```bash
# 개인 키 생성
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem

# 공개 키 추출 (manifest.json의 key 값)
openssl rsa -in key.pem -pubout -outform DER | base64 -w0

# Extension ID 계산
openssl rsa -in key.pem -pubout -outform DER | shasum -a 256 | head -c 32 | tr '0-9a-f' 'a-p'
```

#### 6.9.4 개발 워크플로우

**동시 개발 실행**:

```bash
# 루트에서 모든 패키지 동시 실행
pnpm run dev

# 또는 개별 실행
# 터미널 1: WebApp
cd apps/web && pnpm run dev

# 터미널 2: Extension (watch 모드)
cd apps/extension && pnpm run dev
```

**Extension 변경 시 새로고침**:

| 변경 내용           | 필요한 동작                                |
| ------------------- | ------------------------------------------ |
| Service Worker 코드 | chrome://extensions에서 새로고침 버튼 클릭 |
| Options 페이지      | 페이지 새로고침                            |
| manifest.json       | Extension 새로고침                         |
| WebApp 코드         | Vite HMR 자동 반영                         |

#### 6.9.5 터보레포 개발 스크립트

**주요 스크립트**:

| 명령어                 | 설명                         |
| ---------------------- | ---------------------------- |
| `pnpm dev`             | WebApp + Extension 동시 개발 |
| `pnpm dev:web`         | WebApp만 개발                |
| `pnpm dev:extension`   | Extension만 개발             |
| `pnpm build`           | 전체 빌드                    |
| `pnpm build:extension` | Extension만 빌드             |

#### 6.9.6 디버깅

**WebApp 디버깅**:

- Chrome DevTools → Network 탭에서 CORS 에러 확인
- Console에서 Extension 통신 로그 확인

**Extension 디버깅**:

- `chrome://extensions/` → "검사" 클릭 → Service Worker DevTools 열기
- Background script console.log 확인

**통합 디버깅 팁**:

```typescript
// WebApp에서 디버깅용 로그
if (import.meta.env.DEV) {
  console.log('[API Tester] Sending to extension:', message);
}

// Extension에서 디버깅용 로그
console.log('[Extension] Received message:', message, 'from:', sender.origin);
```

#### 6.9.7 테스트용 API 엔드포인트

| 용도        | URL                                          | 설명                        |
| ----------- | -------------------------------------------- | --------------------------- |
| CORS 허용   | `https://jsonplaceholder.typicode.com/posts` | 브라우저에서 직접 호출 가능 |
| CORS 차단   | `https://httpbin.org/get`                    | Extension 모드 필요         |
| 에러 테스트 | `https://httpbin.org/status/500`             | 서버 에러 응답              |
| 지연 테스트 | `https://httpbin.org/delay/3`                | 3초 지연                    |
| POST 테스트 | `https://httpbin.org/post`                   | Echo back request           |

---

## 7. UI/UX 요구사항

### 7.1 레이아웃 (스크린샷 기반)

> 참고: 아래 레이아웃은 Postman 스타일을 참고하되, History 패널을 **오른쪽 사이드바**로 배치합니다.

**데스크탑 (≥1280px) - 3단 레이아웃**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar]│           API Tester                                  [+Environment▼] [Save▼]  │
├──────────┼─────────────────────────────────────────────────────────────────────────────────┤
│          │ ┌─────────────────────────────────────────────────────────────────┐ ┌──────────┐│
│  Tools   │ │ METHOD │ SCHEME://HOST[:PORT][PATH][?QUERY]        │ [✈ Send ▼] │ │ HISTORY  ││
│          │ │ [GET▼] │ https://api.example.com/v1/users?page=1   │            │ │ ┌────────┤│
│          │ └────────┴────────────────────────────────────────────┴────────────┘ │ │ Search ││
│          │                                                                      │ ├────────┤│
│          │ ┌────────────────────────────────────────────────────────────────────┤ │GET /v1/││
│          │ │ [▸ Query Parameters [2]]    [+Add header] [+Add auth]             ││ │200 120ms│
│          │ ├────────────────────────────────────────────────────────────────────┤ ├────────┤│
│          │ │ [Headers ▸]                                                       ││ │POST /v2│
│          │ │ ┌─────────────────┬─────────────────────────┬─────────┐           ││ │201 89ms││
│          │ │ │ Key             │ Value                   │ Enabled │           ││ ├────────┤│
│          │ │ ├─────────────────┼─────────────────────────┼─────────┤           ││ │ ...    ││
│          │ │ │ Content-Type    │ application/json        │   ☑     │           ││ │        ││
│          │ │ │ Authorization   │ Bearer xxx              │   ☑     │           ││ ├────────┤│
│          │ │ │ [+ Add header]                                      │           ││ │FAVORITES│
│          │ │ └─────────────────┴─────────────────────────┴─────────┘           ││ ├────────┤│
│          │ ├────────────────────────────────────────────────────────────────────┤ │⭐ Users││
│          │ │ [▸ Body ⓘ]        [none ▼] XHR does not allow payloads for GET   ││ │⭐ Login││
│          │ └────────────────────────────────────────────────────────────────────┘ └────────┘│
│          │─────────────────────────────────────────────────────────────────────────────────│
│          │ Response                                     Cache Detected · Elapsed: 120ms   │
│          │ ┌───────────────────────────────────────────────────────────────────────────────┤
│          │ │ 200                                                                          ││
│          │ ├───────────────────────────────────────────────────────────────────────────────┤
│          │ │ [HEADERS ▸]              [pretty▼] │ [▸ BODY ⓘ]                    [pretty▼]││
│          │ │ ┌─────────────────────────────────┐ │ ┌─────────────────────────────────────┐││
│          │ │ │ date: Mon, 15 Dec 2025...       │ │ │ ▼ [                                │││
│          │ │ │ content-type: application/json  │ │ │   ▼ {                              │││
│          │ │ │ vary: Accept-Encoding...        │ │ │     channelProductId: 10285392795  │││
│          │ │ │ content-encoding: gzip          │ │ │     channelMeta: ▸ {...}           │││
│          │ │ │                                 │ │ │     productMeta: ▸ {...}           │││
│          │ │ │ [▸ Complete Request Headers]    │ │ │   }                                │││
│          │ │ └─────────────────────────────────┘ │ └─────────────────────────────────────┘││
│          │ ├─────────────────────────────────────┴───────────────────────────────────────┤│
│          │ │ [HISTORY] [ASSERTIONS] [HTTP] [DESCRIPTION] ⊙Top ⊙Bottom ⊙Collapse ⊙Open    ││
│          │ │ GET /v1/home/products?channelProductIds=10285392795 HTTP/1.1                ││
│          │ │ Host: beta-shopv-server-api.io.naver.com                                    ││
│          │ └─────────────────────────────────────────────────────────────────────────────┘│
└──────────┴────────────────────────────────────────────────────────────────────────────────┘
```

**데스크탑 (1024px - 1279px) - History 접힘 가능**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Sidebar] │ API Tester                              [History ⎕] [Share]   │
├───────────┼────────────────────────────────────────────────────────────────┤
│           │ ┌──────────────────────────────────────────────────────────┐   │
│  Tools    │ │ [GET ▼] [https://api.example.com/users     ] [✈ Send]   │   │
│           │ └──────────────────────────────────────────────────────────┘   │
│           │                                                                │
│           │ ┌──────────────────────────────────────────────────────────┐   │
│           │ │ Request                                                   │   │
│           │ │ [Params] [Headers] [Body] [Options]                      │   │
│           │ │ ┌─────────────────────────────────────────────────────┐  │   │
│           │ │ │ Key         │ Value          │ Enabled              │  │   │
│           │ │ │ page        │ 1              │ ☑                    │  │   │
│           │ │ │ limit       │ 10             │ ☑                    │  │   │
│           │ │ └─────────────────────────────────────────────────────┘  │   │
│           │ └──────────────────────────────────────────────────────────┘   │
│           │                                                                │
│           │ ┌──────────────────────────────────────────────────────────┐   │
│           │ │ Response  [200 OK]  120ms  2.5KB                         │   │
│           │ │ [Body] [Headers] [Raw]                                   │   │
│           │ │ ┌─────────────────────────────────────────────────────┐  │   │
│           │ │ │ ▼ { "users": [...], "total": 100 }                  │  │   │
│           │ │ └─────────────────────────────────────────────────────┘  │   │
│           │ └──────────────────────────────────────────────────────────┘   │
└───────────┴────────────────────────────────────────────────────────────────┘
```

**태블릿/모바일 (<1024px) - 단일 컬럼**:

```
┌────────────────────────────────────────┐
│ [≡] API Tester      [History] [Share] │
├────────────────────────────────────────┤
│ [GET ▼]                                │
│ [https://api.example.com/users       ] │
│                          [✈ Send]      │
├────────────────────────────────────────┤
│ [Params] [Headers] [Body] [Options]    │
├────────────────────────────────────────┤
│ Key         │ Value      │ ☑           │
│ page        │ 1          │ ☑           │
│ limit       │ 10         │ ☑           │
│ [+ Add Parameter]                      │
├────────────────────────────────────────┤
│ Response [200 OK] 120ms 2.5KB          │
├────────────────────────────────────────┤
│ [Body] [Headers] [Raw]                 │
│ ┌──────────────────────────────────┐   │
│ │ ▼ { "users": [...] }             │   │
│ └──────────────────────────────────┘   │
└────────────────────────────────────────┘

[History 모달 - 하단에서 슬라이드 업]
┌────────────────────────────────────────┐
│ History                    [✕ Close]   │
├────────────────────────────────────────┤
│ [🔍 Search requests...]                │
├────────────────────────────────────────┤
│ ⭐ FAVORITES                           │
│ ├── GET /users (My Users API)          │
│ └── POST /login                        │
├────────────────────────────────────────┤
│ 📋 RECENT                              │
│ ├── GET /v1/products  [200] 120ms      │
│ ├── POST /v2/orders   [201] 89ms       │
│ └── GET /v1/users     [200] 156ms      │
├────────────────────────────────────────┤
│ [Clear History]                        │
└────────────────────────────────────────┘
```

### 7.2 UI 컴포넌트 상세

#### 7.2.1 Request Builder 영역

| 컴포넌트        | 설명                                              | 위치        |
| --------------- | ------------------------------------------------- | ----------- |
| Method Selector | 드롭다운 (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS) | 좌측 상단   |
| URL Input       | 전체 URL 입력, 자동 파싱                          | 메서드 우측 |
| Send Button     | 요청 실행 버튼, 드롭다운 메뉴 포함                | URL 우측    |
| Params Tab      | Query Parameter 편집기                            | 탭 영역     |
| Headers Tab     | Header 편집기                                     | 탭 영역     |
| Body Tab        | Body 타입 선택 및 편집기                          | 탭 영역     |
| Options Tab     | Timeout, Redirect, Credentials 설정               | 탭 영역     |

#### 7.2.2 Response Viewer 영역

| 컴포넌트     | 설명                 | 위치       |
| ------------ | -------------------- | ---------- |
| Status Badge | 상태 코드 (색상화)   | 응답 헤더  |
| Timing       | 요청 소요 시간 (ms)  | 응답 헤더  |
| Size         | 응답 바디 크기       | 응답 헤더  |
| Headers Tab  | 응답 헤더 목록       | 좌측 패널  |
| Body Tab     | 응답 바디 뷰어       | 우측 패널  |
| View Toggle  | Tree/Pretty/Raw 전환 | Body 탭 내 |
| Search       | JSON 내 검색         | Body 탭 내 |

#### 7.2.3 History Sidebar (오른쪽)

| 컴포넌트          | 설명                                        |
| ----------------- | ------------------------------------------- |
| Search Input      | 요청 URL/메서드 검색                        |
| Favorites Section | 즐겨찾기된 요청 목록                        |
| Recent Section    | 최근 요청 히스토리 (최대 30개)              |
| History Item      | 메서드, URL 경로, 상태 코드, 소요 시간 표시 |
| Context Menu      | 즐겨찾기 추가/제거, 이름 변경, 삭제         |
| Clear Button      | 히스토리 전체 삭제                          |

#### 7.2.4 반응형 브레이크포인트

| 브레이크포인트  | 레이아웃                       | History 표시            |
| --------------- | ------------------------------ | ----------------------- |
| ≥1280px         | 3단 (Sidebar + Main + History) | 항상 표시               |
| 1024px - 1279px | 2단 + 접힘 가능                | 토글 버튼으로 표시/숨김 |
| <1024px         | 단일 컬럼                      | 모달/드로어로 표시      |

### 7.2 Extension 상태 표시

| 상태               | 아이콘 | 텍스트              | 액션           |
| ------------------ | ------ | ------------------- | -------------- |
| 미설치             | 🔴     | Not Installed       | [Install] 버튼 |
| 설치됨 (연결 대기) | 🟡     | Connecting...       | -              |
| 권한 필요          | 🟡     | Permission Required | [Grant] 버튼   |
| 연결됨             | 🟢     | Connected           | -              |

### 7.3 단축키

| 단축키                 | 동작                 |
| ---------------------- | -------------------- |
| `Ctrl/Cmd + Enter`     | Send 요청            |
| `Esc`                  | 요청 취소            |
| `Ctrl/Cmd + L`         | URL 입력 필드 포커스 |
| `Ctrl/Cmd + Shift + C` | Copy as cURL         |

### 7.4 다크모드 지원

- 기존 테마 시스템 활용
- Extension Options 페이지도 다크모드 지원
- 상태 배지 색상 다크모드 대응

---

## 8. Extension 확장성 및 하위호환 아키텍처

> **중요**: Extension은 추후 다른 기능 (예: Cookie 관리, Proxy 설정, GraphQL 지원 등)이 추가될 수 있으므로, 확장 가능하고 하위 호환성을 보장하는 아키텍처로 설계합니다.

### 8.1 메시지 프로토콜 버전 관리

#### 8.1.1 버전 관리 전략

모든 메시지에 프로토콜 버전을 포함하여 하위 호환성을 보장합니다:

```typescript
// 프로토콜 버전 상수
const PROTOCOL_VERSION = '1.0';

// 모든 메시지의 기본 형태
interface BaseMessage {
  version: string; // 프로토콜 버전 (필수)
  type: string; // 메시지 타입
  id: string; // 요청 ID (응답 매칭용)
  timestamp: number; // 메시지 생성 시간
}

// 예시: EXECUTE_REQUEST 메시지
interface ExecuteRequestMessage extends BaseMessage {
  type: 'EXECUTE_REQUEST';
  payload: RequestSpec;
}
```

#### 8.1.2 버전 호환성 매트릭스

| WebApp 버전 | Extension 버전 | 호환성       | 동작                         |
| ----------- | -------------- | ------------ | ---------------------------- |
| 1.0         | 1.0            | ✅ 완전 호환 | 정상 동작                    |
| 1.0         | 1.1            | ✅ 하위 호환 | Extension이 v1.0 메시지 처리 |
| 1.1         | 1.0            | ⚠️ 부분 호환 | 신규 기능 비활성화           |
| 1.x         | 2.0            | ❌ 비호환    | 업그레이드 안내              |

#### 8.1.3 버전 협상 (Version Negotiation)

```typescript
// WebApp → Extension: 초기 연결 시 버전 확인
interface HandshakeMessage extends BaseMessage {
  type: 'HANDSHAKE';
  payload: {
    webappVersion: string; // WebApp 버전
    protocolVersion: string; // 지원 프로토콜 버전
    supportedFeatures: string[]; // 지원 기능 목록
  };
}

// Extension → WebApp: 버전 응답
interface HandshakeResponse {
  type: 'HANDSHAKE_ACK';
  payload: {
    extensionVersion: string; // Extension 버전
    protocolVersion: string; // Extension 프로토콜 버전
    supportedFeatures: string[]; // Extension 지원 기능
    compatibilityMode: boolean; // 호환 모드 여부
  };
}

// 사용 예시
async function initializeExtensionConnection(): Promise<ConnectionInfo> {
  const handshake = await sendMessage({
    version: PROTOCOL_VERSION,
    type: 'HANDSHAKE',
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    payload: {
      webappVersion: '1.4.0',
      protocolVersion: '1.0',
      supportedFeatures: ['http-request', 'permission-management'],
    },
  });

  // 버전 호환성 확인
  if (handshake.payload.protocolVersion !== PROTOCOL_VERSION) {
    if (isCompatible(PROTOCOL_VERSION, handshake.payload.protocolVersion)) {
      console.warn('Protocol version mismatch, running in compatibility mode');
    } else {
      throw new Error('Incompatible extension version. Please update.');
    }
  }

  return handshake.payload;
}
```

### 8.2 Feature Flag 시스템

#### 8.2.1 Feature Registry

Extension이 지원하는 기능을 동적으로 확인할 수 있는 시스템:

```typescript
// 기능 정의
const FEATURES = {
  // v1.0 기능
  'http-request': '1.0',
  'permission-management': '1.0',

  // v1.1 예정 기능
  'cookie-management': '1.1',
  'websocket-support': '1.1',

  // v1.2 예정 기능
  'graphql-support': '1.2',
  'proxy-configuration': '1.2',
} as const;

type FeatureId = keyof typeof FEATURES;

// 기능 확인 메시지
interface CheckFeaturesMessage extends BaseMessage {
  type: 'CHECK_FEATURES';
  payload: {
    features: FeatureId[];
  };
}

interface CheckFeaturesResponse {
  type: 'FEATURES_STATUS';
  payload: {
    supported: FeatureId[];
    unsupported: FeatureId[];
  };
}
```

#### 8.2.2 WebApp에서 기능 활성화

```typescript
// hooks/useExtensionFeatures.ts
export function useExtensionFeatures() {
  const [features, setFeatures] = useState<Set<FeatureId>>(new Set());

  useEffect(() => {
    checkExtensionFeatures().then((supportedFeatures) => {
      setFeatures(new Set(supportedFeatures));
    });
  }, []);

  const hasFeature = (feature: FeatureId): boolean => {
    return features.has(feature);
  };

  return { features, hasFeature };
}

// 컴포넌트에서 사용
function ApiTester() {
  const { hasFeature } = useExtensionFeatures();

  return (
    <div>
      {/* 기본 HTTP 요청 기능 */}
      <RequestBuilder />

      {/* Cookie 관리 (v1.1+) */}
      {hasFeature('cookie-management') && <CookieManager />}

      {/* GraphQL 지원 (v1.2+) */}
      {hasFeature('graphql-support') && <GraphQLTab />}
    </div>
  );
}
```

### 8.3 플러그인 아키텍처

#### 8.3.1 Message Handler 레지스트리

Extension 내부에서 메시지 핸들러를 플러그인처럼 등록:

```typescript
// types/handler.ts
interface MessageHandler<T extends BaseMessage = BaseMessage, R = unknown> {
  type: string;
  version: string;
  handle: (message: T, sender: chrome.runtime.MessageSender) => Promise<R>;
}

// handlers/registry.ts
class HandlerRegistry {
  private handlers = new Map<string, MessageHandler[]>();

  register(handler: MessageHandler): void {
    const existing = this.handlers.get(handler.type) || [];
    existing.push(handler);
    // 버전 순으로 정렬 (최신 버전 우선)
    existing.sort((a, b) => compareVersions(b.version, a.version));
    this.handlers.set(handler.type, existing);
  }

  getHandler(type: string, version: string): MessageHandler | undefined {
    const handlers = this.handlers.get(type) || [];
    // 요청 버전과 호환되는 가장 최신 핸들러 반환
    return handlers.find((h) => isVersionCompatible(version, h.version));
  }
}

export const registry = new HandlerRegistry();

// 핸들러 등록 예시
registry.register({
  type: 'EXECUTE_REQUEST',
  version: '1.0',
  handle: async (message, sender) => {
    // v1.0 구현
  },
});

registry.register({
  type: 'EXECUTE_REQUEST',
  version: '1.1',
  handle: async (message, sender) => {
    // v1.1 구현 (Cookie 지원 추가 등)
  },
});
```

#### 8.3.2 Service Worker 구조

```typescript
// service-worker.ts
import { registry } from './handlers/registry';
import './handlers/http'; // HTTP 요청 핸들러
import './handlers/permissions'; // 권한 관리 핸들러
// 추후 추가
// import './handlers/cookies';    // Cookie 관리 핸들러
// import './handlers/websocket';  // WebSocket 핸들러

chrome.runtime.onMessageExternal.addListener(
  (message: BaseMessage, sender, sendResponse) => {
    if (!isAllowedOrigin(sender.origin)) {
      sendResponse({
        error: { code: 'FORBIDDEN', message: 'Origin not allowed' },
      });
      return true;
    }

    // 버전에 맞는 핸들러 찾기
    const handler = registry.getHandler(message.type, message.version);

    if (!handler) {
      sendResponse({
        error: {
          code: 'UNSUPPORTED_MESSAGE',
          message: `Unsupported message type: ${message.type} (v${message.version})`,
        },
      });
      return true;
    }

    // 핸들러 실행
    handler
      .handle(message, sender)
      .then((result) => sendResponse({ payload: result }))
      .catch((error) =>
        sendResponse({
          error: { code: 'HANDLER_ERROR', message: error.message },
        })
      );

    return true; // 비동기 응답
  }
);
```

### 8.4 하위 호환성 전략

#### 8.4.1 Deprecation 정책

```typescript
// 메시지 응답에 deprecation 경고 포함
interface ResponseWithWarnings {
  payload: unknown;
  warnings?: Array<{
    code: 'DEPRECATED' | 'UPGRADE_RECOMMENDED';
    message: string;
    details?: {
      feature: string;
      deprecatedIn: string;
      removedIn: string;
      replacement?: string;
    };
  }>;
}

// 핸들러에서 deprecation 경고 추가
async function handleLegacyRequest(
  message: LegacyMessage
): Promise<ResponseWithWarnings> {
  const result = await processRequest(message);

  return {
    payload: result,
    warnings: [
      {
        code: 'DEPRECATED',
        message: 'This message format is deprecated.',
        details: {
          feature: 'legacy-request-format',
          deprecatedIn: '1.1',
          removedIn: '2.0',
          replacement: 'EXECUTE_REQUEST v1.1',
        },
      },
    ],
  };
}
```

#### 8.4.2 Migration 가이드

| 버전 전환 | 변경 사항         | Migration 방법                   |
| --------- | ----------------- | -------------------------------- |
| 1.0 → 1.1 | Cookie 지원 추가  | 선택적 기능, 기존 코드 영향 없음 |
| 1.1 → 1.2 | GraphQL 지원 추가 | 선택적 기능, 기존 코드 영향 없음 |
| 1.x → 2.0 | 메시지 포맷 변경  | v1.x 호환 레이어 6개월 유지      |

### 8.5 확장 가능한 타입 시스템

#### 8.5.1 Union Type으로 메시지 확장

```typescript
// packages/shared/types/messages.ts

// 기본 메시지 타입 (v1.0)
type CoreMessages =
  | { type: 'PING' }
  | { type: 'HANDSHAKE'; payload: HandshakePayload }
  | { type: 'EXECUTE_REQUEST'; payload: RequestSpec }
  | { type: 'CHECK_PERMISSION'; payload: { origin: string } }
  | { type: 'REQUEST_PERMISSION'; payload: { origin: string } }
  | { type: 'GET_GRANTED_ORIGINS' }
  | { type: 'REVOKE_PERMISSION'; payload: { origin: string } }
  | { type: 'CHECK_FEATURES'; payload: { features: string[] } };

// v1.1 추가 메시지 (예정)
type CookieMessages =
  | { type: 'GET_COOKIES'; payload: { url: string } }
  | { type: 'SET_COOKIE'; payload: { url: string; cookie: CookieSpec } }
  | { type: 'DELETE_COOKIE'; payload: { url: string; name: string } };

// v1.2 추가 메시지 (예정)
type GraphQLMessages = { type: 'EXECUTE_GRAPHQL'; payload: GraphQLRequest };

// 버전별 메시지 타입
export type WebAppMessageV1_0 = BaseMessage & CoreMessages;
export type WebAppMessageV1_1 =
  | WebAppMessageV1_0
  | (BaseMessage & CookieMessages);
export type WebAppMessageV1_2 =
  | WebAppMessageV1_1
  | (BaseMessage & GraphQLMessages);

// 현재 버전 (alias)
export type WebAppMessage = WebAppMessageV1_0;
```

### 8.6 향후 확장 로드맵

| 버전 | 기능           | 설명                                 |
| ---- | -------------- | ------------------------------------ |
| 1.0  | HTTP 요청      | 기본 REST API 호출                   |
| 1.1  | Cookie 관리    | 요청에 Cookie 포함, Cookie 조회/설정 |
| 1.1  | WebSocket 지원 | WebSocket 연결 및 메시지 송수신      |
| 1.2  | GraphQL 지원   | GraphQL 쿼리/뮤테이션 전용 UI        |
| 1.2  | Proxy 설정     | 요청에 프록시 적용                   |
| 2.0  | 컬렉션 동기화  | 요청 컬렉션 클라우드 동기화 (선택적) |

---

## 9. i18n 요구사항

### 8.1 새 번역 키

```typescript
// src/i18n/en-US.ts
export const enUS = {
  // ... 기존 키
  tool: {
    // ... 기존 도구
    apiTester: {
      title: 'API Tester',
      description: 'Test REST APIs with CORS bypass support',
      placeholder: 'Enter request URL...',

      // Request Builder
      method: 'Method',
      url: 'URL',
      queryParams: 'Query Params',
      headers: 'Headers',
      body: 'Body',

      // Body types
      bodyNone: 'none',
      bodyText: 'raw (text)',
      bodyJson: 'JSON',
      bodyUrlencoded: 'x-www-form-urlencoded',
      bodyFormData: 'form-data',

      // Options
      timeout: 'Timeout',
      followRedirects: 'Follow Redirects',
      credentials: 'Credentials',
      credentialsOmit: 'omit',
      credentialsSameOrigin: 'same-origin',
      credentialsInclude: 'include',

      // Mode
      directMode: 'Direct',
      extensionMode: 'Extension',

      // Actions
      send: 'Send',
      cancel: 'Cancel',
      copyAsCurl: 'Copy as cURL',

      // Response
      status: 'Status',
      duration: 'Duration',
      size: 'Size',
      responseBody: 'Body',
      responseHeaders: 'Headers',

      // Extension status
      extensionNotInstalled: 'Extension not installed',
      extensionConnecting: 'Connecting...',
      extensionPermissionRequired: 'Permission required',
      extensionConnected: 'Connected',
      installExtension: 'Install Extension',
      grantPermission: 'Grant Permission',

      // CORS
      corsError: 'This request may have failed due to CORS policy.',
      corsExplanation:
        'Browsers restrict cross-origin requests for security. Try using Extension mode to bypass this limitation.',
      retryWithExtension: 'Retry with Extension',

      // History
      history: 'History',
      favorites: 'Favorites',
      clearHistory: 'Clear History',

      // Share
      sensitiveDataWarning: 'This link may contain sensitive information.',
      includeAuth: 'Include Authorization header',
      includeCookie: 'Include Cookie header',

      // Errors
      invalidUrl: 'Invalid URL format',
      invalidJson: 'Invalid JSON format',
      requestTimeout: 'Request timed out',
      networkError: 'Network error',
    },
  },
  meta: {
    apiTester: {
      title: 'API Tester - Free Online REST API Testing Tool | tools.yowu.dev',
      description:
        'Free online API tester with CORS bypass support via Chrome Extension. Test REST APIs with custom headers, body, and authentication. All processing happens in your browser.',
    },
  },
};
```

### 8.2 i18n 적용 범위

- WebApp API Tester UI 전체
- Extension Options 페이지 (선택사항, v1.4.0에서는 영어만)
- 에러 메시지
- Toast 알림
- SEO 메타 태그

---

## 9. 테스트/수용 기준 (Acceptance Criteria)

### 9.1 WebApp

| ID      | 테스트 항목                 | 수용 기준                                              |
| ------- | --------------------------- | ------------------------------------------------------ |
| AC-W-01 | Direct 모드 - CORS 허용 API | 정상적으로 응답 수신 및 표시                           |
| AC-W-02 | Direct 모드 - CORS 차단 API | CORS 에러 안내 + Extension 재시도 CTA                  |
| AC-W-03 | Extension 모드 - 권한 있음  | cross-origin 요청 성공                                 |
| AC-W-04 | Extension 모드 - 권한 없음  | 권한 요청 안내 표시                                    |
| AC-W-05 | 다양한 HTTP 메서드          | GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS 모두 동작 |
| AC-W-06 | 다양한 Body 타입            | none, text, JSON, urlencoded, form-data 모두 동작      |
| AC-W-07 | JSON 응답 뷰어              | Tree/Pretty/Raw 토글, 검색 동작                        |
| AC-W-08 | Copy as cURL                | 클립보드에 올바른 cURL 명령 복사                       |
| AC-W-09 | 히스토리 저장               | 최근 30개 요청 저장 및 복원                            |
| AC-W-10 | 즐겨찾기                    | 등록/삭제/이름 변경 동작                               |
| AC-W-11 | 공유 링크                   | 링크 생성 및 복원 동작, 민감정보 경고                  |
| AC-W-12 | i18n                        | 모든 UI 텍스트 번역 적용                               |
| AC-W-13 | 반응형                      | 데스크탑/모바일 레이아웃 정상                          |
| AC-W-14 | 다크모드                    | 라이트/다크 테마 정상                                  |

### 9.2 Extension

| ID      | 테스트 항목               | 수용 기준                             |
| ------- | ------------------------- | ------------------------------------- |
| AC-E-01 | 설치                      | Chrome Web Store에서 설치 가능        |
| AC-E-02 | externally_connectable    | tools.yowu.dev에서만 메시지 수신      |
| AC-E-03 | 외부 origin 차단          | 허용되지 않은 origin 메시지 거부      |
| AC-E-04 | optional_host_permissions | 런타임 권한 요청 동작                 |
| AC-E-05 | cross-origin fetch        | 권한 있는 도메인 요청 성공            |
| AC-E-06 | Options 페이지            | 승인 도메인 목록 표시, 권한 제거 동작 |
| AC-E-07 | 입력 검증                 | 잘못된 입력에 대한 에러 반환          |
| AC-E-08 | 타임아웃                  | 설정된 타임아웃 적용                  |

### 9.3 통합 테스트

| ID      | 테스트 항목    | 수용 기준                             |
| ------- | -------------- | ------------------------------------- |
| AC-I-01 | PING/PONG      | WebApp에서 Extension 연결 상태 확인   |
| AC-I-02 | 권한 요청 흐름 | 버튼 클릭 → 권한 팝업 → 승인 → 재시도 |
| AC-I-03 | 에러 전파      | Extension 에러가 WebApp에 정상 표시   |
| AC-I-04 | 파일 업로드    | form-data 파일 전송 동작              |

---

## 10. 보안 고려사항

### 10.1 위협 모델

| 위협                                | 대응                                        |
| ----------------------------------- | ------------------------------------------- |
| 악성 origin이 Extension 메시지 전송 | externally_connectable로 허용 origin만 수신 |
| 조작된 메시지로 공격                | 모든 입력 검증/정규화                       |
| 민감정보 유출                       | 공유 시 민감정보 경고, 기본 제외            |
| 권한 과다 요청                      | optional_host_permissions로 필요시에만 요청 |

### 10.2 보안 원칙

1. **최소 권한**: 설치 시 최소 권한, 런타임에 필요시 요청
2. **입력 검증**: 모든 외부 입력 검증
3. **Sender 검증**: 허용된 origin만 메시지 수신
4. **민감정보 보호**: 기본적으로 민감정보 공유 제외

### 10.3 Privacy

- 서버로 데이터 전송 없음
- 히스토리는 로컬에만 저장
- 분석/추적 없음
- 사용자가 권한 언제든 회수 가능

---

## 11. 릴리스 계획

### 11.1 v1.4.0 릴리스 노트 초안

```markdown
## v1.4.0 - API Tester + Companion Chrome Extension

### 🚀 New Features

- **API Tester Tool** (`/api`)

  - Test REST APIs directly from your browser
  - Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
  - Multiple body types: JSON, text, form-data, URL-encoded
  - Custom headers and query parameters
  - Response viewer with JSON tree view, syntax highlighting, and search
  - Request history and favorites
  - Copy as cURL command

- **Companion Chrome Extension**
  - Bypass CORS restrictions for API testing
  - Minimal permissions with runtime permission requests
  - Secure communication between web app and extension
  - Options page to manage granted domains

### 🔧 Improvements

- **Monorepo Structure**: Project restructured for better maintainability
- **Shared Types**: Common types between web app and extension

### 📦 Installation

The API Tester works in two modes:

1. **Direct Mode**: For CORS-enabled APIs (no extension needed)
2. **Extension Mode**: For CORS-blocked APIs (requires Companion Extension)

Install the Companion Extension from Chrome Web Store: [Link]
```

### 11.2 배포 전략

**WebApp**:

- 기존 GitHub Pages 배포 유지
- GitHub Actions 워크플로우 업데이트

**Extension**:

- v1.4.0에서는 수동 빌드 + 수동 배포
- Chrome Web Store 게시 준비
- 향후 자동 빌드 파이프라인 구축

---

## 12. 참고 자료

### 12.1 Chrome Extension 문서

- [Cross-origin network requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [chrome.permissions API](https://developer.chrome.com/docs/extensions/reference/api/permissions)
- [Message passing](https://developer.chrome.com/docs/extensions/develop/concepts/messaging)
- [externally_connectable](https://developer.chrome.com/docs/extensions/reference/manifest/externally-connectable)
- [Security best practices](https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure)

### 12.2 Monorepo 도구

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/repo)
- [Nx](https://nx.dev/)

### 12.3 관련 프로젝트

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Hoppscotch](https://hoppscotch.io/)

---

## 부록 A: Extension 빌드 설정

### A.1 vite.config.ts (Extension)

```typescript
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        options: 'src/options/options.html',
      },
    },
  },
});
```

### A.2 빌드 명령

```bash
# 개발 모드 (HMR)
pnpm --filter @yowu-devtools/extension dev

# 프로덕션 빌드
pnpm --filter @yowu-devtools/extension build

# 빌드 결과물: apps/extension/dist/
```

---

## 부록 B: 마이그레이션 체크리스트

### B.1 Monorepo 전환

- [ ] pnpm 설치 및 설정
- [ ] pnpm-workspace.yaml 생성
- [ ] turbo.json 생성
- [ ] apps/web으로 기존 코드 이동
- [ ] packages/shared 생성
- [ ] package.json 업데이트
- [ ] tsconfig 업데이트
- [ ] GitHub Actions 워크플로우 업데이트
- [ ] 빌드 테스트

### B.2 Extension 개발

- [ ] apps/extension 디렉토리 생성
- [ ] manifest.json 작성
- [ ] Service Worker 구현
- [ ] Options 페이지 구현
- [ ] 통신 로직 구현
- [ ] 권한 관리 구현
- [ ] 빌드 설정
- [ ] Chrome 개발자 모드 테스트

### B.3 WebApp API Tester

- [ ] src/tools/api-tester 생성
- [ ] 상태 타입 정의
- [ ] 요청 빌더 UI 구현
- [ ] 응답 뷰어 구현
- [ ] Extension 통신 훅 구현
- [ ] 히스토리/즐겨찾기 구현
- [ ] 공유 기능 구현
- [ ] Copy as cURL 구현
- [ ] i18n 키 등록
- [ ] SEO 설정

### B.4 테스트

- [ ] Direct 모드 테스트
- [ ] Extension 모드 테스트
- [ ] 권한 요청 흐름 테스트
- [ ] 다양한 API 엔드포인트 테스트
- [ ] 에러 케이스 테스트
- [ ] 반응형 테스트
- [ ] 다크모드 테스트

---

_문서 끝_
