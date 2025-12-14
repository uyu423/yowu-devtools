// Diff 계산 Worker
// 큰 텍스트의 diff 계산 시 UI 프리징을 방지하기 위해 백그라운드에서 처리

import DiffMatchPatch from 'diff-match-patch';
import type { Diff } from 'diff-match-patch';

interface DiffRequest {
  left: string;
  right: string;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

interface DiffResponse {
  success: boolean;
  diffs?: Diff[];
  error?: string;
}

// Ignore 옵션 적용 함수
function applyIgnoreOptions(
  diffs: Diff[],
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): Diff[] {
  if (!ignoreWhitespace && !ignoreCase) return diffs;
  
  const normalize = (text: string) => {
    let result = text;
    if (ignoreWhitespace) {
      result = result.replace(/\s+/g, '');
    }
    if (ignoreCase) {
      result = result.toLowerCase();
    }
    return result;
  };

  const filtered: Diff[] = [];
  for (let i = 0; i < diffs.length; i++) {
    const [op, text] = diffs[i];
    if (op === 0) {
      filtered.push([op, text]);
      continue;
    }

    const normalized = normalize(text);
    if (!normalized.length) {
      filtered.push([0, text]);
      continue;
    }

    const next = diffs[i + 1];
    if (next && next[0] === -op) {
      const normalizedNext = normalize(next[1]);
      if (normalized === normalizedNext) {
        filtered.push([0, op === -1 ? next[1] : text]);
        i++;
        continue;
      }
    }

    filtered.push([op, text]);
  }
  return filtered;
}

// Worker 메시지 핸들러
self.onmessage = (e: MessageEvent<DiffRequest>) => {
  const { left, right, ignoreWhitespace, ignoreCase } = e.data;

  try {
    const dmp = new DiffMatchPatch();
    dmp.Diff_Timeout = 1;
    
    // Diff 계산
    const rawDiffs = dmp.diff_main(left, right);
    dmp.diff_cleanupSemantic(rawDiffs);
    
    // Ignore 옵션 적용
    const diffs = applyIgnoreOptions(
      rawDiffs,
      ignoreWhitespace,
      ignoreCase
    );

    const response: DiffResponse = {
      success: true,
      diffs,
    };

    self.postMessage(response);
  } catch (error) {
    const response: DiffResponse = {
      success: false,
      error: (error as Error).message,
    };

    self.postMessage(response);
  }
};



