# Test Issues - v1.1.0

이 문서는 v1.1.0 버전 테스트 중 발견된 이슈들을 기록합니다.

## Critical Issues

없음

## High Priority Issues

### US-08: URL 공유 기능 - 상태 복원 실패

**발견일**: 2025-01-27  
**관련 테스트 항목**: US-08 (URL 공유)  
**우선순위**: High

#### 문제 설명

`Share State` 버튼으로 생성된 URL로 이동 시 이전에 저장된 도구 상태(입력 값, 옵션 등)가 올바르게 복원되지 않습니다.

#### 재현 단계

1. JSON Viewer 페이지(`/json`)에서 임의의 JSON을 입력합니다.
   예: `{"test": "value", "number": 123}`
2. `Share State` 버튼을 클릭하여 URL을 복사합니다.
3. `Reset Tool` 버튼을 클릭하여 상태를 초기화합니다.
4. 복사된 URL을 새 탭에서 열거나 주소창에 붙여넣어 이동합니다.

#### 예상 동작

- 복사된 URL로 이동 시 이전에 입력했던 JSON과 설정 옵션들이 모두 복원되어 표시되어야 합니다.

#### 실제 동작

- JSON 입력 필드가 비어 있습니다.
- 설정 옵션(Indent, Sort Keys 등)도 기본값으로 초기화되어 있습니다.
- 상태가 전혀 복원되지 않습니다.

#### 원인 분석

`src/hooks/useToolState.ts`의 `shareState` 함수에서 URL을 생성할 때 해시(`#`) 뒤에 쿼리 파라미터를 배치하고 있습니다:

```typescript
const shareUrl = `${baseUrl}#${location.pathname}?d=${encoded}`;
// 생성 예: http://localhost:5173/json#/json?d=encoded_data
```

하지만 `useLocation().search`는 해시 앞의 쿼리 파라미터만 읽을 수 있으므로, 해시 뒤의 `?d=` 파라미터를 읽지 못합니다.

#### 해결 방안

1. **쿼리 파라미터를 해시 앞에 배치**:
   ```typescript
   const shareUrl = `${window.location.origin}${location.pathname}?d=${encoded}`;
   // 생성 예: http://localhost:5173/json?d=encoded_data
   ```

2. **또는 해시와 쿼리를 함께 사용하되 쿼리를 앞에 배치**:
   ```typescript
   const shareUrl = `${baseUrl}?d=${encoded}#${location.pathname}`;
   // 생성 예: http://localhost:5173/json?d=encoded_data#/json
   ```

3. **해시를 완전히 제거** (권장):
   - BrowserRouter를 사용하므로 해시가 필요하지 않습니다.
   - 쿼리 파라미터만 사용하는 것이 가장 간단하고 명확합니다.

#### 영향 범위

- 모든 도구의 URL 공유 기능이 영향을 받습니다.
- JSON Viewer, YAML Converter, Text Diff, URL Encoder, Base64 Converter, Time Converter, Cron Parser, JWT Decoder 모두 동일한 문제가 있습니다.

#### 관련 파일

- `src/hooks/useToolState.ts` (97-119줄, `shareState` 함수)
- `SAS.md` (209-235줄, URL 공유 규격)

#### 참고

- SAS.md에는 `/#/<toolId>?d=<payload>` 형식이 권장되어 있지만, 실제로는 쿼리 파라미터가 해시 앞에 있어야 `location.search`로 읽을 수 있습니다.
- BrowserRouter는 해시 라우팅을 사용하지 않으므로, 해시 없이 쿼리 파라미터만 사용하는 것이 더 적절합니다.

---

## Medium Priority Issues

없음

## Low Priority Issues

없음

---

## 해결된 이슈

### US-08: URL 공유 기능 - 상태 복원 실패 ✅

**해결일**: 2025-01-27  
**해결 방법**: 
1. `shareState` 함수에서 쿼리 파라미터를 해시 앞에 배치하도록 수정
2. `useEffect`를 추가하여 URL 파라미터 변경 시 상태를 업데이트하도록 수정

**수정 내용**:
- `src/hooks/useToolState.ts`의 `shareState` 함수 수정
  - 해시(`#`) 뒤에 쿼리 파라미터를 배치하던 것을 쿼리 파라미터만 사용하도록 변경
  - `location.search`로 읽을 수 있도록 URL 형식 변경
- `useEffect` 추가하여 `location.search` 변경 시 상태 복원
  - URL 파라미터가 있을 때 `decodePayload`로 디코딩하여 상태 업데이트
  - URL 파라미터가 없을 때 localStorage에서 상태 복원

**수정 전**:
```typescript
const shareUrl = `${baseUrl}#${location.pathname}?d=${encoded}`;
// 생성 예: http://localhost:5173/json#/json?d=encoded_data
// 문제: 해시 뒤의 쿼리 파라미터는 location.search로 읽히지 않음
```

**수정 후**:
```typescript
const shareUrl = `${window.location.origin}${location.pathname}?d=${encoded}`;
// 생성 예: http://localhost:5173/json?d=encoded_data

// useEffect 추가
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const payload = params.get('d');
  if (payload) {
    const decoded = decodePayload<T>(payload, toolId);
    if (decoded) {
      setState({ ...cloneState(defaultState), ...decoded });
    }
  }
}, [location.search, toolId]);
```

**검증 완료**: ✅
- 실제 브라우저에서 테스트 완료
- JSON 입력, `sortKeys`, `indent` 옵션이 모두 정상적으로 복원됨
- Share State 버튼으로 생성한 URL로 이동 시 상태가 올바르게 복원됨

