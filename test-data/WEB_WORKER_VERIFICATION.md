# Web Worker 검증 가이드

이 문서는 생성된 테스트 데이터 파일을 사용하여 Web Worker가 올바르게 활성화되는지 검증하는 방법을 설명합니다.

## 검증 가능 여부

✅ **예, 모든 테스트 데이터 파일로 Web Worker 활성화를 검증할 수 있습니다.**

### 검증 결과 요약

| 도구 | 파일 | 크기/줄 수 | Worker 경계 | Worker 활성화 |
|------|------|-----------|------------|--------------|
| JSON Viewer | `large-json.json` | 2.34MB (73,754줄) | >1MB 또는 >10,000줄 | ✅ 예상됨 |
| YAML Converter | `large-yaml.yaml` | 604KB (22,914줄) | >500KB 또는 >10,000줄 | ✅ 예상됨 |
| Text Diff | `large-text-1.txt` | 2.46MB (10,502줄) | >500KB 또는 >10,000줄 | ✅ 예상됨 |
| Text Diff | `large-text-2.txt` | 2.48MB (10,502줄) | >500KB 또는 >10,000줄 | ✅ 예상됨 |

## 검증 방법

### 방법 1: 브라우저 DevTools 사용 (권장)

1. **테스트 데이터 파일 로드**
   - 각 도구 페이지에서 해당 테스트 데이터 파일을 로드합니다.
   - 예: JSON Viewer에서 `test-data/large-json.json` 파일을 드래그 앤 드롭

2. **DevTools 열기**
   - `F12` 또는 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
   - 또는 브라우저 메뉴 → 개발자 도구

3. **Sources 탭에서 Worker 확인**
   - DevTools의 **Sources** 탭 클릭
   - 왼쪽 사이드바에서 **Workers** 섹션 확인
   - 다음 Worker 파일 중 하나가 표시되어야 합니다:
     - `json-parser.worker.ts` (JSON Viewer)
     - `yaml-converter.worker.ts` (YAML Converter)
     - `diff-calculator.worker.ts` (Text Diff)

4. **Worker 상태 확인**
   - Worker가 활성화되어 있으면 목록에 표시됩니다
   - Worker를 클릭하면 Worker의 콘솔과 디버깅 정보를 볼 수 있습니다

### 방법 2: Console에서 Worker 리소스 확인

1. **Console 탭 열기**
   - DevTools의 **Console** 탭 클릭

2. **Worker 리소스 확인**
   ```javascript
   // 모든 리소스 중 Worker 스크립트 필터링
   performance.getEntriesByType('resource')
     .filter(r => r.name.includes('worker'))
     .forEach(r => console.log('Worker:', r.name, 'Size:', r.transferSize, 'bytes'));
   ```

3. **예상 결과**
   - JSON Viewer: `json-parser.worker.ts` 리소스가 로드됨
   - YAML Converter: `yaml-converter.worker.ts` 리소스가 로드됨
   - Text Diff: `diff-calculator.worker.ts` 리소스가 로드됨

### 방법 3: Network 탭에서 확인

1. **Network 탭 열기**
   - DevTools의 **Network** 탭 클릭
   - 페이지 새로고침 또는 파일 로드

2. **Worker 스크립트 필터링**
   - 필터에 `worker` 입력
   - Worker 스크립트 파일이 로드되는지 확인

3. **확인 사항**
   - 파일 크기 (transfer size)
   - 로드 시간
   - 상태 코드 (200 OK)

### 방법 4: UI 동작으로 확인

1. **로딩 인디케이터 확인**
   - 대형 데이터 로드 시 로딩 스피너나 인디케이터가 표시되어야 합니다
   - Worker 처리 중에는 UI가 반응해야 합니다

2. **UI 프리징 확인**
   - Worker가 활성화되면 UI가 멈추지 않고 반응해야 합니다
   - 스크롤, 클릭 등이 정상적으로 작동해야 합니다

3. **처리 시간 확인**
   - Worker를 사용하지 않으면 UI가 멈추고 처리 시간이 길어집니다
   - Worker를 사용하면 백그라운드에서 처리되어 UI가 반응합니다

## 각 도구별 검증 체크리스트

### JSON Viewer (`large-json.json`)

- [ ] 파일 로드 (2.34MB)
- [ ] DevTools → Sources → Workers에서 `json-parser.worker.ts` 확인
- [ ] 로딩 인디케이터 표시 확인
- [ ] UI 프리징 없이 처리되는지 확인
- [ ] Tree View가 정상적으로 렌더링되는지 확인

### YAML Converter (`large-yaml.yaml`)

- [ ] 파일 로드 (604KB)
- [ ] DevTools → Sources → Workers에서 `yaml-converter.worker.ts` 확인
- [ ] 로딩 인디케이터 표시 확인
- [ ] UI 프리징 없이 처리되는지 확인
- [ ] JSON 변환이 정상적으로 완료되는지 확인

### Text Diff (`large-text-1.txt`, `large-text-2.txt`)

- [ ] 두 파일 모두 로드 (각각 10,500줄)
- [ ] DevTools → Sources → Workers에서 `diff-calculator.worker.ts` 확인
- [ ] 로딩 인디케이터 표시 확인
- [ ] UI 프리징 없이 처리되는지 확인
- [ ] Diff 결과가 정상적으로 표시되는지 확인

## 문제 해결

### Worker가 표시되지 않는 경우

1. **파일 크기 확인**
   - 파일이 실제로 Worker 경계선을 넘었는지 확인
   - Console에서 다음 코드 실행:
     ```javascript
     const text = document.querySelector('textarea').value;
     const size = new Blob([text]).size;
     const lines = text.split('\n').length;
     console.log('Size:', size, 'bytes', 'Lines:', lines);
     ```

2. **Worker 지원 확인**
   - Console에서 다음 코드 실행:
     ```javascript
     console.log('Worker supported:', typeof Worker !== 'undefined');
     ```

3. **에러 확인**
   - Console 탭에서 에러 메시지 확인
   - Network 탭에서 Worker 스크립트 로드 실패 확인

### Worker가 활성화되었지만 UI가 멈추는 경우

1. **Worker 처리 시간 확인**
   - 매우 큰 데이터의 경우 Worker 처리에도 시간이 걸릴 수 있습니다
   - 로딩 인디케이터가 표시되는지 확인

2. **메모리 사용량 확인**
   - DevTools → Performance 또는 Memory 탭에서 확인
   - 메모리 부족으로 인한 문제일 수 있습니다

## 참고

- Worker 경계선은 코드에서 정의되어 있습니다:
  - JSON: `src/tools/json/index.tsx` - `shouldUseWorkerForText(input, 1_000_000, 10_000)`
  - YAML: `src/tools/yaml/index.tsx` - `shouldUseWorkerForText(source, 500_000, 10_000)`
  - Diff: `src/tools/diff/index.tsx` - `shouldUseWorkerForText(text, 500_000, 10_000)`

- 모든 테스트 데이터 파일은 이 경계선을 넘어서 생성되어 Worker 활성화를 보장합니다.

