// JSON 파서 Worker
// 큰 JSON 데이터를 파싱할 때 UI 프리징을 방지하기 위해 백그라운드에서 처리

interface ParseRequest {
  input: string;
  indent: 2 | 4;
  sortKeys: boolean;
}

interface ParseResponse {
  success: boolean;
  data?: unknown;
  formatted?: string;
  minified?: string;
  error?: string;
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
  const { input, indent, sortKeys } = e.data;

  try {
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
    };

    self.postMessage(response);
  } catch (error) {
    const response: ParseResponse = {
      success: false,
      error: (error as Error).message,
    };

    self.postMessage(response);
  }
};


