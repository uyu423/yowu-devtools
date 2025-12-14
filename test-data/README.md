# Test Data Directory

이 디렉토리는 대형 입력 케이스 테스트를 위한 테스트 데이터 파일들을 포함합니다.

## 파일 목록

### JSON 테스트 데이터
- **`large-json.json`**: 대형 JSON 파일 (약 40MB)
  - 10,000개의 중첩된 객체를 포함
  - 깊은 중첩 구조 (5단계)
  - 큰 배열 및 객체 속성
  - JSON Viewer, YAML Converter 테스트에 사용

### YAML 테스트 데이터
- **`large-yaml.yaml`**: 대형 YAML 파일 (약 20MB)
  - 5,000개의 아이템을 포함
  - 복잡한 중첩 구조
  - YAML Converter, JSON Converter 테스트에 사용

### 텍스트 Diff 테스트 데이터
- **`large-text-1.txt`**: 대형 텍스트 파일 1 (약 1MB)
  - 10,000줄 이상의 텍스트
  - Text Diff 테스트의 원본 파일로 사용
  
- **`large-text-2.txt`**: 대형 텍스트 파일 2 (약 1MB)
  - `large-text-1.txt`와 유사하지만 일부 수정된 버전
  - 100줄마다 수정된 라인 포함
  - 200줄마다 새로 추가된 라인 포함
  - Text Diff 테스트의 수정된 파일로 사용

### Base64 테스트 데이터
- **`large-base64.txt`**: 대형 Base64 인코딩된 데이터 (약 1MB)
  - Base64 Encode/Decode 테스트에 사용
  - 큰 데이터의 인코딩/디코딩 성능 테스트

## 사용 방법

### 브라우저에서 파일 로드

1. **파일 선택**:
   - 각 도구의 입력 필드에서 파일을 직접 드래그 앤 드롭하거나
   - 파일 선택 버튼을 통해 `test-data/` 디렉토리의 파일을 선택

2. **프로그래밍 방식**:
   ```javascript
   // 예시: JSON Viewer에서 큰 JSON 파일 로드
   const fileInput = document.querySelector('input[type="file"]');
   const file = new File([await fetch('/test-data/large-json.json').then(r => r.blob())], 'large-json.json');
   const dataTransfer = new DataTransfer();
   dataTransfer.items.add(file);
   fileInput.files = dataTransfer.files;
   fileInput.dispatchEvent(new Event('change', { bubbles: true }));
   ```

### 테스트 시나리오

1. **JSON Viewer**:
   - `large-json.json` 파일 로드
   - 파싱 성능 확인
   - Tree View 렌더링 성능 확인
   - Web Worker 사용 여부 확인 (1MB 이상일 때)

2. **YAML Converter**:
   - `large-yaml.yaml` 파일 로드
   - JSON 변환 성능 확인
   - Web Worker 사용 여부 확인 (500KB 이상일 때)

3. **Text Diff**:
   - `large-text-1.txt`와 `large-text-2.txt` 로드
   - Diff 계산 성능 확인
   - Web Worker 사용 여부 확인 (10,000줄 이상일 때)

4. **Base64 Converter**:
   - `large-base64.txt` 파일 로드
   - 디코딩 성능 확인

## 파일 크기 정보

모든 파일은 Web Worker 동작 경계선 근처로 생성되어 있습니다:

- `large-json.json`: ~2.3MB (JSON 파싱 Worker 경계: >1MB 또는 >10,000줄)
  - 약 150개 아이템
  - 깊은 중첩 구조 포함
  - Worker 활성화 확인용
  
- `large-yaml.yaml`: ~604KB (YAML 변환 Worker 경계: >500KB 또는 >10,000줄)
  - 약 90개 아이템
  - Worker 활성화 확인용

- `large-text-1.txt`: ~10,500줄, ~2.5MB (Text Diff Worker 경계: >10,000줄)
  - Text Diff 테스트의 원본 파일
  - Worker 활성화 확인용

- `large-text-2.txt`: ~10,500줄, ~2.5MB (Text Diff Worker 경계: >10,000줄)
  - `large-text-1.txt`와 유사하지만 일부 수정된 버전
  - 100줄마다 수정된 라인 포함
  - 200줄마다 새로 추가된 라인 포함
  - Worker 활성화 확인용

- `large-base64.txt`: ~1.4MB (일반적인 대용량 테스트용)
  - Base64 Encode/Decode 테스트에 사용

**참고**: 모든 파일은 Web Worker가 활성화되는 경계선을 약간 넘어서 생성되어, Worker 동작을 테스트할 수 있습니다.

## 주의사항

- 파일 크기가 크므로 브라우저 메모리 사용량에 주의하세요.
- Web Worker가 활성화되어 있는지 확인하세요 (큰 데이터 처리 시).
- 이 파일들은 Git에 포함되어 있어 프로젝트 클론 시 자동으로 사용할 수 있습니다.

## 파일 생성 스크립트

필요시 `test-data/` 디렉토리에서 다음 명령으로 파일을 재생성할 수 있습니다:

```bash
# JSON 파일 생성
node -e "..." # (생성 스크립트는 프로젝트 루트의 package.json에 정의)

# YAML 파일 생성
# (생성 스크립트는 프로젝트 루트의 package.json에 정의)

# 텍스트 파일 생성
# (생성 스크립트는 프로젝트 루트의 package.json에 정의)
```

