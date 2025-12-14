# Browser Test Checklist - tools.yowu.dev

이 문서는 사용자 시나리오 기반 브라우저 테스트 체크리스트입니다. 각 기능을 실제 브라우저에서 테스트하여 동작을 검증합니다.

## 테스트 환경

- **브라우저**: Chrome/Edge (최신 버전), Firefox, Safari
- **환경**: 로컬 개발 서버 (`npm run dev`) 및 프로덕션 배포 환경
- **디바이스**: 데스크탑, 모바일 (반응형 테스트)

## 테스트 방법

- `chrome-devtools` 혹은 `playwright` MCP 도구를 사용하여 직접 테스트

## 테스트 데이터 디렉토리

대형 입력 케이스 테스트를 위해 `test-data/` 디렉토리에 테스트 데이터 파일들이 준비되어 있습니다.

### 사용 가능한 테스트 데이터

- **`test-data/large-json.json`**: 대형 JSON 파일 (약 40-80MB)
  - 10,000개의 중첩된 객체 포함
  - JSON Viewer, YAML Converter 테스트에 사용
- **`test-data/large-yaml.yaml`**: 대형 YAML 파일 (약 20MB)

  - 5,000개의 아이템 포함
  - YAML Converter 테스트에 사용

- **`test-data/large-text-1.txt`**: 대형 텍스트 파일 1 (약 1MB)

  - 10,000줄 이상의 텍스트
  - Text Diff 테스트의 원본 파일로 사용

- **`test-data/large-text-2.txt`**: 대형 텍스트 파일 2 (약 1MB)

  - `large-text-1.txt`와 유사하지만 일부 수정된 버전
  - Text Diff 테스트의 수정된 파일로 사용

- **`test-data/large-base64.txt`**: 대형 Base64 인코딩된 데이터 (약 1MB)
  - Base64 Encode/Decode 테스트에 사용

### 테스트 데이터 사용 방법

#### 방법 1: 파일 드래그 앤 드롭

1. 브라우저에서 도구 페이지 열기
2. 입력 필드에 `test-data/` 디렉토리의 파일을 드래그 앤 드롭
3. 파일이 자동으로 로드되어 처리되는지 확인

#### 방법 2: 파일 선택 버튼 (지원되는 경우)

1. 도구의 입력 필드에서 파일 선택 버튼 클릭
2. `test-data/` 디렉토리에서 해당 파일 선택
3. 파일이 로드되어 처리되는지 확인

#### 방법 3: 프로그래밍 방식 (MCP 브라우저 테스트)

```javascript
// 예시: JSON Viewer에서 큰 JSON 파일 로드
// 방법 A: fetch로 파일 읽어서 입력 필드에 직접 입력
const fileContent = await fetch('/test-data/large-json.json').then((r) =>
  r.text()
);
document.querySelector('textarea').value = fileContent;
// 입력 이벤트 트리거 (필요시)
document
  .querySelector('textarea')
  .dispatchEvent(new Event('input', { bubbles: true }));

// 방법 B: File API 사용 (파일 입력이 지원되는 경우)
const fileInput = document.querySelector('input[type="file"]');
const response = await fetch('/test-data/large-json.json');
const blob = await response.blob();
const file = new File([blob], 'large-json.json', { type: 'application/json' });
const dataTransfer = new DataTransfer();
dataTransfer.items.add(file);
fileInput.files = dataTransfer.files;
fileInput.dispatchEvent(new Event('change', { bubbles: true }));
```

### 대형 입력 케이스 테스트 시나리오

#### US-01: JSON Pretty Viewer (대형 데이터)

- [ ] `test-data/large-json.json` 파일 로드 (약 2.3MB, Worker 경계: >1MB)
- [ ] 파싱 성능 확인 (1MB 이상일 때 Web Worker 사용 여부)
- [ ] Tree View 렌더링 성능 확인
- [ ] UI 프리징 없이 처리되는지 확인
- [ ] 브라우저 DevTools → Sources → Workers에서 Worker 활성화 확인

#### US-05: YAML ↔ JSON 변환 (대형 데이터)

- [ ] `test-data/large-yaml.yaml` 파일 로드 (약 604KB, Worker 경계: >500KB)
- [ ] JSON 변환 성능 확인 (500KB 이상일 때 Web Worker 사용 여부)
- [ ] UI 프리징 없이 처리되는지 확인
- [ ] 브라우저 DevTools → Sources → Workers에서 Worker 활성화 확인

#### US-06: Text Diff (대형 데이터)

- [ ] `test-data/large-text-1.txt`와 `large-text-2.txt` 로드 (약 10,500줄, Worker 경계: >10,000줄)
- [ ] Diff 계산 성능 확인 (10,000줄 이상일 때 Web Worker 사용 여부)
- [ ] UI 프리징 없이 처리되는지 확인
- [ ] 브라우저 DevTools → Sources → Workers에서 Worker 활성화 확인

#### US-03: Base64 Encode/Decode (대형 데이터)

- [ ] `test-data/large-base64.txt` 파일 로드 (약 1.4MB)
- [ ] 디코딩 성능 확인
- [ ] UI 프리징 없이 처리되는지 확인

### 주의사항

- 테스트 데이터 파일들은 Git에 포함되어 있어 프로젝트 클론 시 자동으로 사용할 수 있습니다.
- 파일 크기가 크므로 브라우저 메모리 사용량에 주의하세요.
- Web Worker가 활성화되어 있는지 확인하세요 (큰 데이터 처리 시).
- 테스트 데이터 파일 상세 정보는 `test-data/README.md`를 참조하세요.

---

## 1. 기본 기능 테스트

### US-01: JSON Pretty Viewer

**시나리오**: 개발 중 JSON을 붙여넣고 트리로 탐색/검색/복사하고 싶다.

- [ ] **JSON 입력 및 파싱**

  - [ ] 유효한 JSON 입력 시 파싱 성공 확인
  - [ ] 잘못된 JSON 입력 시 에러 메시지 표시 확인
  - [ ] 에러 메시지에 줄 번호/컬럼 정보 포함 확인

- [ ] **Tree View**

  - [ ] Tree 모드에서 JSON 구조가 트리 형태로 표시되는지 확인
  - [ ] 노드 확장/축소 동작 확인
  - [ ] 다크 모드에서도 트리 뷰가 올바르게 표시되는지 확인

- [ ] **Pretty/Pretty/Minified 모드**

  - [ ] Pretty 모드에서 포맷된 JSON 표시 확인
  - [ ] Minified 모드에서 압축된 JSON 표시 확인
  - [ ] 모드 전환 시 즉시 업데이트되는지 확인

- [ ] **Sample Data 로드**

  - [ ] Sample Data 버튼 클릭 시 예제 JSON 로드 확인
  - [ ] 로드된 데이터가 즉시 파싱되어 표시되는지 확인

- [ ] **대형 데이터 처리 (Web Worker)**

  - [ ] `test-data/large-json.json` 파일 로드 (약 2.3MB, Worker 경계: >1MB)
  - [ ] 파싱 시 UI 프리징 없이 처리되는지 확인
  - [ ] **Web Worker 활성화 검증**:
    - [ ] 브라우저 DevTools 열기 (F12)
    - [ ] Sources 탭 → Workers 섹션 확인
    - [ ] `json-parser.worker.ts` Worker가 생성되었는지 확인
    - [ ] 또는 Console에서 `performance.getEntriesByType('resource')` 실행하여 worker 스크립트 로드 확인
  - [ ] Tree View 렌더링 성능 확인
  - [ ] 로딩 인디케이터가 표시되는지 확인 (Worker 처리 중)

- [ ] **검색 기능**

  - [ ] 검색어 입력 시 해당 키/값 하이라이트 확인
  - [ ] 검색 결과가 실시간으로 업데이트되는지 확인

- [ ] **복사 기능**

  - [ ] Copy Pretty 버튼 클릭 시 포맷된 JSON 복사 확인
  - [ ] Copy Minified 버튼 클릭 시 압축된 JSON 복사 확인
  - [ ] 복사 성공 시 Toast 알림 표시 확인

- [ ] **옵션 기능**

  - [ ] Indent 옵션 변경 시 포맷 변경 확인 (2칸/4칸)
  - [ ] Sort Keys 옵션 토글 시 키 정렬 확인

- [ ] **Web Worker 성능 테스트**
  - [ ] 1MB 이상의 큰 JSON 입력 시 Worker 사용 확인
  - [ ] 로딩 인디케이터 표시 확인
  - [ ] UI가 프리징되지 않는지 확인

---

### US-02: URL Encode/Decode

**시나리오**: URL 파라미터를 encode/decode해서 바로 복사하고 싶다.

- [ ] **인코딩**

  - [ ] 일반 텍스트 입력 시 URL 인코딩 결과 확인
  - [ ] 특수문자(`&`, `=`, `?`, `#` 등) 올바르게 인코딩되는지 확인
  - [ ] 한글/이모지 등 유니코드 문자 인코딩 확인

- [ ] **디코딩**

  - [ ] 인코딩된 URL 입력 시 디코딩 결과 확인
  - [ ] 잘못된 인코딩 입력 시 에러 처리 확인

- [ ] **실시간 변환**

  - [ ] 입력 시 즉시 변환 결과 표시 확인 (Debounce 동작)
  - [ ] 입력 중 UI가 반응하는지 확인

- [ ] **Swap 기능**

  - [ ] Swap 버튼 클릭 시 입력/출력 교체 확인
  - [ ] 교체 후 즉시 재변환되는지 확인

- [ ] **대형 데이터 처리**

  - [ ] `test-data/large-base64.txt` 파일 로드 (약 1MB)
  - [ ] 디코딩 성능 확인
  - [ ] UI 프리징 없이 처리되는지 확인

- [ ] **복사 기능**
  - [ ] Copy 버튼 클릭 시 결과 복사 확인
  - [ ] 복사 성공 시 Toast 알림 확인

---

### US-03: Base64 Encode/Decode

**시나리오**: Base64를 인코딩/디코딩해서 결과를 바로 복사하고 싶다.

- [ ] **인코딩**

  - [ ] 일반 텍스트 입력 시 Base64 인코딩 결과 확인
  - [ ] UTF-8 문자(한글, 이모지) 올바르게 인코딩되는지 확인
  - [ ] URL Safe 옵션 토글 시 `-`, `_` 사용 확인

- [ ] **디코딩**

  - [ ] Base64 문자열 입력 시 디코딩 결과 확인
  - [ ] 잘못된 Base64 입력 시 에러 처리 확인

- [ ] **실시간 변환**

  - [ ] 입력 시 즉시 변환 결과 표시 확인
  - [ ] 옵션 변경 시 즉시 재변환되는지 확인

- [ ] **Swap 기능**

  - [ ] Swap 버튼 클릭 시 입력/출력 교체 확인

- [ ] **복사 기능**
  - [ ] Copy 버튼 클릭 시 결과 복사 확인
  - [ ] Toast 알림 확인

---

### US-04: Epoch/ISO 시간 변환

**시나리오**: epoch(ms/s) ↔ ISO 시간을 KST/UTC로 빠르게 바꾸고 싶다.

- [ ] **Epoch → ISO 변환**

  - [ ] 밀리초 타임스탬프 입력 시 ISO 형식 변환 확인
  - [ ] 초 단위 타임스탬프 입력 시 ISO 형식 변환 확인
  - [ ] KST/UTC 표시 확인

- [ ] **ISO → Epoch 변환**

  - [ ] ISO 형식 시간 입력 시 Epoch 변환 확인
  - [ ] 다양한 ISO 형식 지원 확인

- [ ] **Set to Now 기능**

  - [ ] "Set to Now" 버튼 클릭 시 현재 시간 설정 확인
  - [ ] 설정 후 즉시 변환되는지 확인

- [ ] **실시간 변환**

  - [ ] 입력 변경 시 즉시 변환 결과 업데이트 확인

- [ ] **복사 기능**
  - [ ] Copy 버튼 클릭 시 결과 복사 확인

---

### US-05: YAML ↔ JSON 변환

**시나리오**: YAML과 JSON을 상호 변환하고, 오류가 나면 어느 줄/컬럼인지 보고 싶다.

- [ ] **YAML → JSON 변환**

  - [ ] 유효한 YAML 입력 시 JSON 변환 확인
  - [ ] Indent 옵션(2칸/4칸) 적용 확인
  - [ ] 복잡한 YAML 구조 변환 확인

- [ ] **JSON → YAML 변환**

  - [ ] 유효한 JSON 입력 시 YAML 변환 확인
  - [ ] 다양한 JSON 구조 변환 확인

- [ ] **에러 처리**

  - [ ] 잘못된 YAML 입력 시 에러 메시지 표시 확인
  - [ ] 에러 메시지에 줄 번호/컬럼 정보 포함 확인
  - [ ] 잘못된 JSON 입력 시 에러 메시지 표시 확인

- [ ] **대형 데이터 처리 (Web Worker)**

  - [ ] `test-data/large-yaml.yaml` 파일 로드 (약 604KB, Worker 경계: >500KB)
  - [ ] JSON 변환 시 UI 프리징 없이 처리되는지 확인
  - [ ] **Web Worker 활성화 검증**:
    - [ ] 브라우저 DevTools 열기 (F12)
    - [ ] Sources 탭 → Workers 섹션 확인
    - [ ] `yaml-converter.worker.ts` Worker가 생성되었는지 확인
    - [ ] 또는 Console에서 `performance.getEntriesByType('resource')` 실행하여 worker 스크립트 로드 확인
  - [ ] 변환 성능 확인
  - [ ] 로딩 인디케이터가 표시되는지 확인 (Worker 처리 중)

- [ ] **실시간 변환**

  - [ ] 입력 변경 시 즉시 변환 결과 업데이트 확인

- [ ] **Web Worker 성능 테스트**

  - [ ] 큰 YAML/JSON 파일 처리 시 Worker 사용 확인
  - [ ] UI 프리징 없는지 확인

- [ ] **복사 기능**
  - [ ] Copy 버튼 클릭 시 결과 복사 확인

---

### US-06: Text Diff

**시나리오**: 두 텍스트 차이를 모바일에서도 보기 쉽게 비교하고 싶다.

- [ ] **Diff 계산**

  - [ ] 두 텍스트 입력 시 차이점 표시 확인
  - [ ] 추가된 라인(녹색), 삭제된 라인(빨간색) 표시 확인
  - [ ] 변경된 라인 표시 확인

- [ ] **옵션 기능**

  - [ ] Ignore Whitespace 옵션 토글 시 공백 무시 확인
  - [ ] Ignore Case 옵션 토글 시 대소문자 무시 확인

- [ ] **모바일 반응형**

  - [ ] 모바일 화면에서도 Diff 결과가 읽기 쉽게 표시되는지 확인
  - [ ] 좌우 스크롤 없이 전체 내용 확인 가능한지 확인

- [ ] **Web Worker 성능 테스트**

  - [ ] 큰 텍스트(10,000줄 이상) 비교 시 Worker 사용 확인
  - [ ] UI 프리징 없는지 확인

- [ ] **대형 데이터 처리 (Web Worker)**

  - [ ] `test-data/large-text-1.txt`와 `large-text-2.txt` 파일 로드 (약 10,500줄, Worker 경계: >10,000줄)
  - [ ] Diff 계산 시 UI 프리징 없이 처리되는지 확인
  - [ ] **Web Worker 활성화 검증**:
    - [ ] 브라우저 DevTools 열기 (F12)
    - [ ] Sources 탭 → Workers 섹션 확인
    - [ ] `diff-calculator.worker.ts` Worker가 생성되었는지 확인
    - [ ] 또는 Console에서 `performance.getEntriesByType('resource')` 실행하여 worker 스크립트 로드 확인
  - [ ] Diff 계산 성능 확인
  - [ ] 로딩 인디케이터가 표시되는지 확인 (Worker 처리 중)

- [ ] **복사 기능**
  - [ ] Copy 버튼 클릭 시 Diff 결과 복사 확인

---

### US-07: CRON 표현식

**시나리오**: cron을 넣으면 사람이 읽는 설명과 다음 실행 시각들을 확인하고 싶다.

- [ ] **CRON 파싱**

  - [ ] 유효한 CRON 표현식 입력 시 파싱 성공 확인
  - [ ] 잘못된 CRON 표현식 입력 시 에러 메시지 표시 확인

- [ ] **Human Readable Description**

  - [ ] CRON 표현식에 대한 사람이 읽기 쉬운 설명 표시 확인
  - [ ] 다양한 CRON 패턴에 대한 설명 확인

- [ ] **Next Run Times**

  - [ ] 다음 실행 시각 목록 표시 확인
  - [ ] 여러 개의 다음 실행 시각이 올바르게 계산되는지 확인

- [ ] **실시간 업데이트**
  - [ ] CRON 표현식 변경 시 즉시 설명/시각 업데이트 확인

---

### US-08: URL 공유

**시나리오**: 지금 입력한 상태 그대로 링크로 공유하고, 받은 사람도 그대로 재현되면 좋겠다.

- [ ] **공유 링크 생성**

  - [ ] Share 버튼 클릭 시 공유 링크 생성 확인
  - [ ] 생성된 URL에 상태 정보 포함 확인 (URL fragment)
  - [ ] URL 길이가 적절한지 확인 (너무 길지 않음)

- [ ] **상태 복원**

  - [ ] 공유 링크를 새 탭에서 열었을 때 상태 복원 확인
  - [ ] 입력값이 정확히 복원되는지 확인
  - [ ] 옵션 설정이 복원되는지 확인

- [ ] **도구별 공유 테스트**

  - [ ] JSON 도구: 입력, indent, sortKeys, viewMode 복원 확인
  - [ ] URL/Base64 도구: 입력값 복원 확인
  - [ ] YAML 도구: 입력값 및 방향 복원 확인
  - [ ] Diff 도구: 좌우 텍스트 복원 확인
  - [ ] Time 도구: 입력값 복원 확인
  - [ ] Cron 도구: CRON 표현식 복원 확인
  - [ ] JWT 도구: 토큰/모드 복원 확인

- [ ] **URL 최적화**
  - [ ] UI 전용 상태(search 등)는 URL에 포함되지 않는지 확인
  - [ ] 공유 링크 길이가 최소화되었는지 확인

---

### US-09: 상태 자동 저장/복원

**시나리오**: 다시 접속했을 때 마지막 작업 상태가 복원되면 좋겠다.

- [ ] **localStorage 저장**

  - [ ] 도구 사용 중 상태 변경 시 localStorage에 저장 확인
  - [ ] 브라우저 DevTools → Application → Local Storage에서 확인

- [ ] **상태 복원**

  - [ ] 페이지 새로고침 후 마지막 상태 복원 확인
  - [ ] 다른 도구로 이동 후 다시 돌아왔을 때 상태 복원 확인
  - [ ] 브라우저 종료 후 재접속 시 상태 복원 확인

- [ ] **도구별 상태 저장/복원**

  - [ ] 각 도구의 입력값, 옵션 설정이 저장/복원되는지 확인

- [ ] **Reset 기능**
  - [ ] Reset 버튼 클릭 시 기본 상태로 초기화 확인
  - [ ] 초기화 후 localStorage도 업데이트되는지 확인

---

### US-10: 동적 페이지 타이틀

**시나리오**: 각 도구 페이지로 진입 시 브라우저 탭 타이틀이 바뀌어 여러 탭을 띄워놓고 작업할 때 식별하기 쉬워야 한다.

- [ ] **타이틀 변경**

  - [ ] 메인 페이지: "Developer Tools - JSON, Cron, Base64 | tools.yowu.dev"
  - [ ] JSON 도구: "JSON Viewer - Dev Tool | tools.yowu.dev"
  - [ ] URL 도구: "URL Encoder - Dev Tool | tools.yowu.dev"
  - [ ] Base64 도구: "Base64 - Dev Tool | tools.yowu.dev"
  - [ ] Time 도구: "Time Converter - Dev Tool | tools.yowu.dev"
  - [ ] YAML 도구: "YAML Converter - Dev Tool | tools.yowu.dev"
  - [ ] Diff 도구: "Text Diff - Dev Tool | tools.yowu.dev"
  - [ ] Cron 도구: "Cron Parser - Dev Tool | tools.yowu.dev"
  - [ ] JWT 도구: "JWT Decoder" 또는 "JWT Encoder" (모드에 따라)

- [ ] **탭 식별**
  - [ ] 여러 도구를 각각 다른 탭에서 열었을 때 타이틀로 구분 가능한지 확인

---

### US-11: 사이드바 네비게이션

**시나리오**: 사이드바에서 `yowu.dev` 로고를 클릭해 개발자 블로그로 이동할 수 있다.

- [ ] **로고 클릭**

  - [ ] 로고 클릭 시 `https://yowu.dev/`로 이동 확인
  - [ ] 새 탭에서 열리는지 확인 (`target="_blank"`)

- [ ] **사이드바 기본 기능**
  - [ ] 도구 메뉴 클릭 시 해당 도구 페이지로 이동 확인
  - [ ] 현재 활성화된 도구 하이라이트 확인
  - [ ] 모바일에서 사이드바 열기/닫기 동작 확인

---

### US-12: 최근 사용한 도구 (v1.1.0)

**시나리오**: 사이드바에서 최근 사용한 도구를 빠르게 접근하고 싶다.

- [ ] **최근 도구 기록**

  - [ ] 도구 페이지 진입 시 **즉시** 최근 도구 목록에 추가되는지 확인 (페이지 로드와 동시에)
  - [ ] 사이드바에 **즉시 반영**되어 표시되는지 확인 (새로고침 불필요)
  - [ ] 같은 도구 재방문 시 목록 상단으로 이동하는지 확인
  - [ ] **최대 3개까지만** 표시되는지 확인 (4개 이상 방문 시 가장 오래된 항목 제거)
  - [ ] 3개 제한이 올바르게 동작하는지 확인 (새 도구 추가 시 기존 항목 제거)

- [ ] **최근 도구 표시**

  - [ ] 사이드바에 "Recent" 섹션 표시 확인
  - [ ] 최신 도구가 상단에 표시되는지 확인
  - [ ] 최근 도구 클릭 시 해당 도구 페이지로 이동 확인

- [ ] **즐겨찾기와 중복**

  - [ ] 즐겨찾기에 등록된 도구도 최근 도구에 표시되는지 확인
  - [ ] 두 섹션 모두에 표시되어도 문제없는지 확인

- [ ] **localStorage 저장**
  - [ ] 브라우저 종료 후 재접속 시 최근 도구 목록 복원 확인

---

### US-13: 즐겨찾기 기능 (v1.1.0)

**시나리오**: 자주 쓰는 도구를 즐겨찾기로 등록해 상단에 고정하고 싶다.

- [ ] **즐겨찾기 추가/제거**

  - [ ] 도구 메뉴 항목의 별 아이콘 클릭 시 즐겨찾기 추가 확인
  - [ ] 이미 즐겨찾기인 경우 별 아이콘 클릭 시 제거 확인
  - [ ] 별 아이콘 상태 변경 확인 (채워짐/비어있음)

- [ ] **즐겨찾기 표시**

  - [ ] 사이드바 상단에 "Favorites" 섹션 표시 확인
  - [ ] 즐겨찾기로 등록된 도구만 표시되는지 확인
  - [ ] 등록 순서대로 표시되는지 확인

- [ ] **즐겨찾기 클릭**

  - [ ] 즐겨찾기 도구 클릭 시 해당 도구 페이지로 이동 확인

- [ ] **localStorage 저장**
  - [ ] 브라우저 종료 후 재접속 시 즐겨찾기 목록 복원 확인

---

### US-14: JWT 디코딩/인코딩 (v1.1.0)

**시나리오**: JWT 토큰을 디코딩해서 payload를 확인하고 싶다.

- [ ] **JWT 디코딩**

  - [ ] 유효한 JWT 토큰 입력 시 Header, Payload, Signature 분리 확인
  - [ ] Header JSON 표시 확인
  - [ ] Payload JSON 표시 확인
  - [ ] Signature 표시 확인
  - [ ] Raw 값 표시 확인

- [ ] **서명 검증**

  - [ ] Secret Key 입력 시 서명 검증 결과 표시 확인
  - [ ] HMAC 알고리즘 검증 확인 (HS256, HS384, HS512)
  - [ ] 검증 성공/실패 메시지 확인

- [ ] **토큰 유효성 검사**

  - [ ] 만료된 토큰의 경우 만료 메시지 표시 확인
  - [ ] `exp` 클레임 확인

- [ ] **JWT 인코딩**

  - [ ] Encode 모드로 전환 확인
  - [ ] Header JSON 입력 확인
  - [ ] Payload JSON 입력 확인
  - [ ] Algorithm 선택 확인
  - [ ] Secret Key 입력 후 서명된 토큰 생성 확인

- [ ] **모드 전환**

  - [ ] Decode/Encode 모드 전환 시 UI 변경 확인
  - [ ] 페이지 타이틀 변경 확인 ("JWT Decoder" / "JWT Encoder")

- [ ] **복사 기능**
  - [ ] Header JSON 복사 확인
  - [ ] Payload JSON 복사 확인
  - [ ] Signature 복사 확인
  - [ ] 생성된 토큰 복사 확인

---

### US-15: Web App 지원 (v1.1.0)

**시나리오**: Chrome 앱으로 등록해 독립 창에서 사용하고 싶다.

- [ ] **Manifest 확인**

  - [ ] Chrome DevTools → Application → Manifest에서 manifest.json 로드 확인
  - [ ] 앱 이름, 아이콘, 테마 색상 확인
  - [ ] Start URL, Display 모드 확인

- [ ] **설치 프롬프트**

  - [ ] Chrome 주소창에 설치 아이콘 표시 확인
  - [ ] 설치 프롬프트 표시 확인 (필요시)
  - [ ] 설치 버튼 클릭 시 앱 설치 확인

- [ ] **독립 창 실행**

  - [ ] 설치된 앱 실행 시 독립 창으로 열리는지 확인
  - [ ] `chrome://apps`에서 앱 확인

- [ ] **Service Worker**

  - [ ] Chrome DevTools → Application → Service Workers에서 등록 확인
  - [ ] Service Worker 상태가 "activated"인지 확인

- [ ] **오프라인 동작**

  - [ ] 네트워크 연결 차단 후 페이지 접속 시 오프라인 폴백 페이지 표시 확인
  - [ ] 오프라인 상태에서도 기본 기능 동작 확인 (캐시된 리소스 사용)

- [ ] **업데이트 알림**
  - [ ] 새 버전 배포 후 업데이트 알림 표시 확인
  - [ ] "Update now" 버튼 클릭 시 업데이트 및 새로고침 확인

---

### US-16: Web Worker 성능 최적화 (v1.1.0)

**시나리오**: 큰 JSON이나 텍스트를 처리할 때 UI가 멈추지 않았으면 좋겠다.

- [ ] **JSON 파싱 (큰 파일)**

  - [ ] 1MB 이상의 JSON 입력 시 Worker 사용 확인
  - [ ] 10,000줄 이상의 JSON 입력 시 Worker 사용 확인
  - [ ] 로딩 인디케이터 표시 확인
  - [ ] UI가 프리징되지 않고 반응하는지 확인
  - [ ] 파싱 완료 후 결과 표시 확인

- [ ] **Text Diff (큰 텍스트)**

  - [ ] 10,000줄 이상의 텍스트 비교 시 Worker 사용 확인
  - [ ] UI 프리징 없는지 확인
  - [ ] Diff 결과 정확도 확인

- [ ] **YAML 변환 (큰 파일)**

  - [ ] 큰 YAML/JSON 파일 변환 시 Worker 사용 확인
  - [ ] UI 프리징 없는지 확인

- [ ] **Worker 폴백**
  - [ ] Worker 미지원 브라우저에서도 정상 동작하는지 확인
  - [ ] 작은 데이터는 Worker 없이 처리되는지 확인

---

## 2. 공통 기능 테스트

### 테마 전환

- [ ] **시스템 테마**

  - [ ] System 모드 선택 시 OS 테마 따라가는지 확인
  - [ ] OS 테마 변경 시 앱 테마도 변경되는지 확인

- [ ] **라이트/다크 모드**

  - [ ] Light 모드 선택 시 라이트 테마 적용 확인
  - [ ] Dark 모드 선택 시 다크 테마 적용 확인
  - [ ] 모든 도구에서 테마 일관성 확인

- [ ] **테마 저장**
  - [ ] 테마 선택 후 페이지 새로고침 시 선택한 테마 유지 확인

### Toast 알림

- [ ] **복사 성공 알림**

  - [ ] Copy 버튼 클릭 시 "Copied" Toast 표시 확인
  - [ ] Toast가 자동으로 사라지는지 확인

- [ ] **에러 알림**
  - [ ] 에러 발생 시 Toast 알림 표시 확인

### 반응형 디자인

- [ ] **데스크탑 (1920x1080)**

  - [ ] 레이아웃이 올바르게 표시되는지 확인
  - [ ] 사이드바가 항상 표시되는지 확인

- [ ] **태블릿 (768x1024)**

  - [ ] 레이아웃이 적절히 조정되는지 확인
  - [ ] 사이드바가 Drawer 형태로 동작하는지 확인

- [ ] **모바일 (375x667)**
  - [ ] 모바일 레이아웃 확인
  - [ ] 햄버거 메뉴로 사이드바 열기/닫기 확인
  - [ ] 터치 인터랙션 동작 확인

### 키보드 단축키

- [ ] **기본 단축키**
  - [ ] `Alt+T`: Toast 알림 영역 포커스 (접근성)
  - [ ] 각 도구별 단축키 동작 확인 (있는 경우)

### SEO 및 메타 태그

- [ ] **메인 페이지**

  - [ ] `<title>` 태그 확인
  - [ ] `<meta name="description">` 확인
  - [ ] Open Graph 태그 확인
  - [ ] Twitter Card 태그 확인

- [ ] **도구별 페이지**

  - [ ] 각 도구 페이지의 고유한 `<title>` 확인
  - [ ] 도구별 메타 태그 확인
  - [ ] Canonical URL 확인

- [ ] **sitemap.xml**

  - [ ] `dist/sitemap.xml` 생성 확인
  - [ ] 모든 도구 경로 포함 확인

- [ ] **robots.txt**
  - [ ] `dist/robots.txt` 생성 확인
  - [ ] 올바른 내용 확인

---

## 3. 브라우저 호환성 테스트

### Chrome/Edge (Chromium)

- [ ] 모든 기능 정상 동작 확인
- [ ] Service Worker 등록 확인
- [ ] PWA 설치 기능 확인

### Firefox

- [ ] 모든 기능 정상 동작 확인
- [ ] Service Worker 지원 확인 (Firefox 44+)
- [ ] PWA 기능 제한 확인 (Firefox는 PWA 설치 제한적)

### Safari

- [ ] 모든 기능 정상 동작 확인
- [ ] Service Worker 지원 확인 (Safari 11.1+)
- [ ] PWA 기능 확인 (iOS Safari)

---

## 4. 성능 테스트

- [ ] **초기 로딩**

  - [ ] 첫 페이지 로딩 시간 확인 (< 3초 목표)
  - [ ] 리소스 크기 확인 (번들 크기 최적화)

- [ ] **큰 데이터 처리**

  - [ ] 10MB JSON 파일 처리 시간 확인
  - [ ] UI 반응성 확인 (프리징 없음)

- [ ] **메모리 사용량**
  - [ ] 큰 데이터 처리 시 메모리 사용량 확인
  - [ ] 메모리 누수 없는지 확인

---

## 5. 접근성 테스트

- [ ] **키보드 네비게이션**

  - [ ] Tab 키로 모든 인터랙티브 요소 접근 가능한지 확인
  - [ ] Enter/Space로 버튼 클릭 가능한지 확인

- [ ] **스크린 리더**

  - [ ] 주요 요소에 적절한 ARIA 레이블 확인
  - [ ] 에러 메시지가 스크린 리더로 읽히는지 확인

- [ ] **색상 대비**
  - [ ] 텍스트와 배경 색상 대비 확인 (WCAG AA 기준)
  - [ ] 다크 모드에서도 대비 확인

---

## 6. 보안 테스트

- [ ] **클라이언트 사이드 처리**

  - [ ] 네트워크 탭에서 외부 서버로 데이터 전송 없는지 확인
  - [ ] 모든 처리가 브라우저 내에서 이루어지는지 확인

- [ ] **XSS 방지**

  - [ ] 사용자 입력이 안전하게 처리되는지 확인
  - [ ] JSON 파싱 시 악성 코드 실행되지 않는지 확인

- [ ] **localStorage 보안**
  - [ ] 민감한 정보가 localStorage에 저장되지 않는지 확인
  - [ ] 공유 링크에 민감한 정보 포함되지 않는지 확인

---

## 7. 에러 처리 테스트

- [ ] **네트워크 에러**

  - [ ] 오프라인 상태에서 기본 기능 동작 확인
  - [ ] 오프라인 폴백 페이지 표시 확인

- [ ] **입력 에러**

  - [ ] 잘못된 입력에 대한 명확한 에러 메시지 확인
  - [ ] 에러 발생 시 앱이 크래시하지 않는지 확인

- [ ] **localStorage 에러**
  - [ ] localStorage 사용 불가 시 앱이 정상 동작하는지 확인
  - [ ] 쿠키 차단 시에도 기본 기능 동작 확인

---

## 테스트 결과 기록

### 테스트 환경

- 날짜: \***\*\_\_\_\*\***
- 브라우저: \***\*\_\_\_\*\***
- 버전: \***\*\_\_\_\*\***
- OS: \***\*\_\_\_\*\***

### 통과/실패 요약

- 총 테스트 항목: \***\*\_\_\_\*\***
- 통과: \***\*\_\_\_\*\***
- 실패: \***\*\_\_\_\*\***
- 건너뜀: \***\*\_\_\_\*\***

### 발견된 이슈 기록 방법

**중요**: 테스트 중 발견된 문제나 버그는 이 체크리스트에 기록하지 않고, 별도의 버전별 이슈 문서에 기록합니다.

- **파일 위치**: `TEST_ISSUES_v{버전}.md` (예: `TEST_ISSUES_v1.1.0.md`)
- **기록 내용**:
  - 발견된 버그/문제점
  - 재현 단계
  - 예상 동작 vs 실제 동작
  - 우선순위 (Critical/High/Medium/Low)
  - 관련된 테스트 항목 (US-XX)
- **파일 생성 시점**: 테스트 중 문제 발견 시 즉시 생성
- **파일 업데이트**: 추가 문제 발견 시 계속 업데이트

**예시 파일 구조**:

```markdown
# Test Issues - v1.1.0

## Critical Issues

- [ ] US-XX: 문제 설명...

## High Priority Issues

- [ ] US-YY: 문제 설명...

## Medium Priority Issues

- [ ] US-ZZ: 문제 설명...
```

### 발견된 이슈

1. ***
2. ***
3. ***

---

## 참고 사항

- 각 테스트 항목은 실제 사용자 시나리오를 기반으로 작성되었습니다.
- 테스트 시 실제 사용자처럼 다양한 입력값을 사용해보세요.
- 발견된 버그나 개선사항은 별도의 버전별 이슈 문서(`TEST_ISSUES_v{버전}.md`)에 기록하세요.
- 정기적으로 이 체크리스트를 업데이트하여 새로운 기능을 반영하세요.
