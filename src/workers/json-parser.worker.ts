// JSON 파서 Worker
// 큰 JSON 데이터를 파싱할 때 UI 프리징을 방지하기 위해 백그라운드에서 처리

interface ParseRequest {
  input: string;
  indent: 2 | 4;
  sortKeys: boolean;
  requestId?: number | string; // v1.2.0: Request ID for response ordering
}

interface ParseResponse {
  success: boolean;
  data?: unknown;
  formatted?: string;
  minified?: string;
  error?: string;
  requestId?: number | string; // v1.2.0: Request ID for response ordering
}

// JSON 키 정렬 함수
function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(value).sort();
    for (const key of keys) {
      sorted[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

// Worker 메시지 핸들러
self.onmessage = (e: MessageEvent<ParseRequest>) => {
  const { input, indent, sortKeys, requestId } = e.data;

  try {
    // 테스트용: 타임아웃 테스트를 위한 인위적 지연 (15초)
    // 실제 프로덕션에서는 제거해야 함
    const isTimeoutTest = input.includes('__TIMEOUT_TEST__');
    if (isTimeoutTest) {
      // 15초 대기하여 타임아웃 발생시키기
      const startTime = Date.now();
      while (Date.now() - startTime < 15_000) {
        // Busy wait
      }
    }

    // JSON 파싱
    const parsed = JSON.parse(input);
    
    // 키 정렬 (옵션)
    const normalized = sortKeys ? sortJsonKeys(parsed) : parsed;
    
    // 포맷팅
    const formatted = JSON.stringify(normalized, null, indent);
    const minified = JSON.stringify(normalized);

    const response: ParseResponse = {
      success: true,
      data: normalized,
      formatted,
      minified,
      requestId, // Include requestId in response
    };

    self.postMessage(response);
  } catch (error) {
    const response: ParseResponse = {
      success: false,
      error: (error as Error).message,
      requestId, // Include requestId in error response
    };

    self.postMessage(response);
  }
};



