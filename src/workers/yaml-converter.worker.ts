// YAML 변환 Worker
// 큰 YAML/JSON 데이터를 변환할 때 UI 프리징을 방지하기 위해 백그라운드에서 처리

import YAML from 'yaml';

interface YamlConvertRequest {
  source: string;
  direction: 'yaml2json' | 'json2yaml';
  indent: 2 | 4;
}

interface YamlConvertResponse {
  success: boolean;
  output?: string;
  error?: string;
}

// Worker 메시지 핸들러
self.onmessage = (e: MessageEvent<YamlConvertRequest>) => {
  const { source, direction, indent } = e.data;

  try {
    if (direction === 'yaml2json') {
      const parsed = YAML.parse(source);
      const output = JSON.stringify(parsed, null, indent);
      const response: YamlConvertResponse = {
        success: true,
        output,
      };
      self.postMessage(response);
    } else {
      const parsed = JSON.parse(source);
      const output = YAML.stringify(parsed, { indent });
      const response: YamlConvertResponse = {
        success: true,
        output,
      };
      self.postMessage(response);
    }
  } catch (error) {
    const err = error as YAML.YAMLParseError | Error;
    let errorMessage = err.message;
    
    if ('linePos' in err && Array.isArray(err.linePos)) {
      const pos = err.linePos[0];
      errorMessage = `${err.message} (line ${pos.line}, col ${pos.col})`;
    }

    const response: YamlConvertResponse = {
      success: false,
      error: errorMessage,
    };

    self.postMessage(response);
  }
};


