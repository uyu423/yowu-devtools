/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileDiff, Copy, ChevronDown } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { FileInput } from '@/components/common/FileInput';
import { FileDownload } from '@/components/common/FileDownload';
import { ModeToggle } from '@/components/common/ModeToggle';
import { getMimeType } from '@/lib/fileUtils';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolSetup } from '@/hooks/useToolSetup';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useWebWorker, shouldUseWorkerForText } from '@/hooks/useWebWorker';
import { copyToClipboard } from '@/lib/clipboard';
import { ShareModal } from '@/components/common/ShareModal';
import DiffMatchPatch from 'diff-match-patch';
import type { Diff } from 'diff-match-patch';

interface DiffToolState {
  left: string;
  right: string;
  view: 'split' | 'unified' | 'hunk';
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  contextLines: number;
}

const DEFAULT_STATE: DiffToolState = {
  left: '',
  right: '',
  view: 'hunk',
  ignoreWhitespace: false,
  ignoreCase: false,
  contextLines: 3,
};

const DiffTool: React.FC = () => {
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<DiffToolState>('diff', 'diff', DEFAULT_STATE);

  const debouncedLeft = useDebouncedValue(state.left, 250);
  const debouncedRight = useDebouncedValue(state.right, 250);

  // Worker 사용 여부 결정 (디바운싱 전 state.left/right를 기준으로 결정하여 붙여넣기 시 즉시 Worker 모드 전환)
  const shouldUseWorker = React.useMemo(() => {
    const leftShouldUse = shouldUseWorkerForText(state.left, 500_000, 10_000);
    const rightShouldUse = shouldUseWorkerForText(state.right, 500_000, 10_000);
    return leftShouldUse || rightShouldUse;
  }, [state.left, state.right]);

  // Request ID for Worker response ordering (v1.2.0)
  const [requestId, setRequestId] = React.useState<number | undefined>(undefined);
  
  // Generate request ID when inputs change
  React.useEffect(() => {
    if (shouldUseWorker && (!!debouncedLeft || !!debouncedRight)) {
      setRequestId((prev) => (prev ?? 0) + 1);
    }
  }, [shouldUseWorker, debouncedLeft, debouncedRight]);

  // Worker를 사용한 diff 계산
  const { result: workerResult, isProcessing } = useWebWorker<
    { left: string; right: string; ignoreWhitespace: boolean; ignoreCase: boolean },
    { success: boolean; diffs?: Diff[]; error?: string }
  >({
    workerUrl: new URL('../workers/diff-calculator.worker.ts', import.meta.url),
    shouldUseWorker: shouldUseWorker && (!!debouncedLeft || !!debouncedRight),
    request: shouldUseWorker && (!!debouncedLeft || !!debouncedRight)
      ? {
          left: debouncedLeft,
          right: debouncedRight,
          ignoreWhitespace: state.ignoreWhitespace,
          ignoreCase: state.ignoreCase,
        }
      : null,
    requestId,
    timeout: 10_000, // 10 seconds timeout
  });

  // 메인 스레드 diff 계산 (작은 데이터용)
  const mainThreadDiffs = useMemo(() => {
    if (shouldUseWorker) {
      return [];
    }

    const dmp = new DiffMatchPatch();
    dmp.Diff_Timeout = 1;
    const rawDiffs = dmp.diff_main(debouncedLeft, debouncedRight);
    dmp.diff_cleanupSemantic(rawDiffs);
    return applyIgnoreOptions(
      rawDiffs,
      state.ignoreWhitespace,
      state.ignoreCase
    );
  }, [
    debouncedLeft,
    debouncedRight,
    state.ignoreWhitespace,
    state.ignoreCase,
    shouldUseWorker,
  ]);

  // 최종 diff 결과 (Worker 또는 메인 스레드)
  const diffs = React.useMemo(() => {
    if (shouldUseWorker) {
      if (!workerResult || !workerResult.success || !workerResult.diffs) {
        return [];
      }
      return workerResult.diffs;
    }
    return mainThreadDiffs;
  }, [shouldUseWorker, workerResult, mainThreadDiffs]);

  const stats = useMemo(() => {
    return diffs.reduce(
      (acc, [op, text]) => {
        if (op === 1) acc.added += text.length;
        if (op === -1) acc.removed += text.length;
        return acc;
      },
      { added: 0, removed: 0 }
    );
  }, [diffs]);

  // 라인 기반 diff 계산 (hunk view용) - diff-match-patch의 라인 모드 사용
  const lineDiff = useMemo(() => {
    if (!debouncedLeft && !debouncedRight) return [];
    return computeLineDiff(debouncedLeft, debouncedRight, state.ignoreWhitespace, state.ignoreCase);
  }, [debouncedLeft, debouncedRight, state.ignoreWhitespace, state.ignoreCase]);

  // 라인 기반 통계 (hunk view용)
  const lineStats = useMemo(() => {
    return lineDiff.reduce(
      (acc, line) => {
        if (line.type === 'add') acc.added++;
        if (line.type === 'remove') acc.removed++;
        return acc;
      },
      { added: 0, removed: 0 }
    );
  }, [lineDiff]);

  const hasDiff = diffs.some(([op]) => op !== 0);

  const unifiedExport = useMemo(() => {
    return diffs
      .map(([op, text]) => {
        const prefix = op === 0 ? ' ' : op === 1 ? '+' : '-';
        return `${prefix}${text}`;
      })
      .join('');
  }, [diffs]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader
        title={t('tool.diff.title')}
        description={t('tool.diff.description')}
        onReset={() => resetState()}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col">
            <EditorPanel
              title={t('tool.diff.original')}
              value={state.left}
              onChange={(val) => updateState({ left: val })}
              resizable
              minHeight={150}
              maxHeight={600}
              heightStorageKey="diff-left-height"
            />
            <div className="mt-3">
              <FileInput
                onFileLoad={(content) => {
                  updateState({ left: content });
                }}
                accept=".txt,text/plain"
                maxSize={50 * 1024 * 1024} // 50MB
                className="w-full"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <EditorPanel
              title={t('tool.diff.modified')}
              value={state.right}
              onChange={(val) => updateState({ right: val })}
              resizable
              minHeight={150}
              maxHeight={600}
              heightStorageKey="diff-right-height"
            />
            <div className="mt-3">
              <FileInput
                onFileLoad={(content) => {
                  updateState({ right: content });
                }}
                accept=".txt,text/plain"
                maxSize={50 * 1024 * 1024} // 50MB
                className="w-full"
              />
            </div>
          </div>
        </div>

        <ActionBar className="flex flex-wrap items-center justify-between rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <ModeToggle
            options={[
              { value: 'split' as const, label: t('tool.diff.splitView') },
              { value: 'unified' as const, label: t('tool.diff.unifiedView') },
              { value: 'hunk' as const, label: t('tool.diff.hunkView') },
            ]}
            value={state.view}
            onChange={(view) => updateState({ view })}
            variant="pill"
          />

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                checked={state.ignoreWhitespace}
                onChange={(e) =>
                  updateState({ ignoreWhitespace: e.target.checked })
                }
              />
              <OptionLabel tooltip={t('tool.diff.ignoreWhitespaceTooltip')}>
                {t('tool.diff.ignoreWhitespace')}
              </OptionLabel>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                checked={state.ignoreCase}
                onChange={(e) => updateState({ ignoreCase: e.target.checked })}
              />
              <OptionLabel tooltip={t('tool.diff.ignoreCaseTooltip')}>
                {t('tool.diff.ignoreCase')}
              </OptionLabel>
            </label>
            {state.view === 'hunk' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <OptionLabel tooltip={t('tool.diff.contextLinesTooltip')}>
                  {t('tool.diff.contextLines')}
                </OptionLabel>
                <select
                  value={state.contextLines}
                  onChange={(e) =>
                    updateState({ contextLines: Number(e.target.value) })
                  }
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                >
                  <option value={1}>1</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </label>
            )}
            <FileDownload
              content={unifiedExport}
              fileName="diff.txt"
              mimeType={getMimeType('txt')}
              disabled={!hasDiff}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('tool.diff.downloadUnified')}
            </FileDownload>
          </div>
        </ActionBar>

        <div className="rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner">
          <div className="flex items-center justify-between border-b dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-white">
              {t('tool.diff.diffResult')}
            </span>
            <div className="space-x-4 text-xs uppercase tracking-wide">
              {state.view === 'hunk' ? (
                <>
                  <span className="text-green-600 dark:text-green-400">
                    {t('tool.diff.addedLines').replace(
                      '{n}',
                      String(lineStats.added)
                    )}
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {t('tool.diff.removedLines').replace(
                      '{n}',
                      String(lineStats.removed)
                    )}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-green-600 dark:text-green-400">
                    {t('tool.diff.addedChars').replace(
                      '{n}',
                      String(stats.added)
                    )}
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {t('tool.diff.removedChars').replace(
                      '{n}',
                      String(stats.removed)
                    )}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() =>
                hasDiff &&
                copyToClipboard(unifiedExport, t('tool.diff.copiedUnifiedDiff'))
              }
              disabled={!hasDiff}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('common.copy')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {isProcessing && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
                {t('tool.diff.calculatingDiff')}
              </div>
            </div>
          )}
          {!isProcessing && !hasDiff && (
            <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('tool.diff.bothIdentical')}
            </p>
          )}

          {hasDiff && state.view === 'split' && (
            <div className="grid gap-0 border-t lg:grid-cols-2">
              <DiffPane label={t('tool.diff.original')} type="left" diffs={diffs} />
              <DiffPane label={t('tool.diff.modified')} type="right" diffs={diffs} />
            </div>
          )}

          {hasDiff && state.view === 'unified' && (
            <div className="border-t">
              <UnifiedPane diffs={diffs} />
            </div>
          )}

          {hasDiff && state.view === 'hunk' && (
            <div className="border-t">
              <HunkPane
                lineDiff={lineDiff}
                contextLines={state.contextLines}
                expandText={t('tool.diff.expandCollapsed')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DiffPane: React.FC<{
  label: string;
  type: 'left' | 'right';
  diffs: Diff[];
}> = ({ label, type, diffs }) => {
  return (
    <div className="min-h-[240px] border-gray-100 dark:border-gray-700">
      <div className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <pre className="h-full whitespace-pre-wrap break-words p-4 font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
        {diffs.map(([op, text], idx) => {
          if (type === 'left' && op === 1) return null;
          if (type === 'right' && op === -1) return null;
          const highlight =
            op === 0
              ? ''
              : op === -1
              ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-white'
              : 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-white';
          return (
            <span key={`${type}-${idx}`} className={highlight}>
              {text || '\n'}
            </span>
          );
        })}
      </pre>
    </div>
  );
};

const UnifiedPane: React.FC<{ diffs: Diff[] }> = ({ diffs }) => (
  <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
    {diffs.map(([op, text], idx) => {
      const style =
        op === 0
          ? ''
          : op === 1
          ? 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-white'
          : 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-white line-through';
      const prefix = op === 0 ? '' : op === 1 ? '+ ' : '- ';
      return (
        <span key={idx} className={style}>
          {prefix}
          {text || '\n'}
        </span>
      );
    })}
  </pre>
);

// ===== Hunk View Types and Functions =====

interface LineDiffEntry {
  type: 'same' | 'add' | 'remove';
  content: string;
  leftLineNum: number | null;
  rightLineNum: number | null;
}

interface Hunk {
  startLeft: number;
  startRight: number;
  countLeft: number;
  countRight: number;
  lines: LineDiffEntry[];
}

/**
 * 라인 단위 diff 계산 - diff-match-patch의 라인 모드 사용
 */
function computeLineDiff(
  left: string,
  right: string,
  ignoreWhitespace: boolean,
  ignoreCase: boolean
): LineDiffEntry[] {
  if (!left && !right) return [];

  // 옵션 적용
  let processedLeft = left;
  let processedRight = right;
  
  if (ignoreCase) {
    processedLeft = processedLeft.toLowerCase();
    processedRight = processedRight.toLowerCase();
  }

  // 라인 배열로 분할 (원본 유지)
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  
  // 비교용 라인 배열 (옵션 적용)
  const processedLeftLines = processedLeft.split('\n');
  const processedRightLines = processedRight.split('\n');

  // 공백 무시 옵션 적용
  const normalizeForComparison = (line: string) => {
    if (ignoreWhitespace) {
      return line.replace(/\s+/g, ' ').trim();
    }
    return line;
  };

  // LCS (Longest Common Subsequence) 기반 라인 diff 알고리즘
  const result: LineDiffEntry[] = [];
  
  // 간단한 Myers diff 알고리즘 구현 (라인 단위)
  const n = processedLeftLines.length;
  const m = processedRightLines.length;
  
  // DP 테이블 생성
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(0));
  
  // LCS 길이 계산
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const leftNorm = normalizeForComparison(processedLeftLines[i - 1]);
      const rightNorm = normalizeForComparison(processedRightLines[j - 1]);
      
      if (leftNorm === rightNorm) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // 역추적하여 diff 생성
  const diffLines: Array<{ type: 'same' | 'add' | 'remove'; leftIdx: number; rightIdx: number }> = [];
  
  let i = n;
  let j = m;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const leftNorm = normalizeForComparison(processedLeftLines[i - 1]);
      const rightNorm = normalizeForComparison(processedRightLines[j - 1]);
      
      if (leftNorm === rightNorm) {
        diffLines.unshift({ type: 'same', leftIdx: i - 1, rightIdx: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        diffLines.unshift({ type: 'remove', leftIdx: i - 1, rightIdx: -1 });
        i--;
      } else {
        diffLines.unshift({ type: 'add', leftIdx: -1, rightIdx: j - 1 });
        j--;
      }
    } else if (i > 0) {
      diffLines.unshift({ type: 'remove', leftIdx: i - 1, rightIdx: -1 });
      i--;
    } else {
      diffLines.unshift({ type: 'add', leftIdx: -1, rightIdx: j - 1 });
      j--;
    }
  }
  
  // 라인 번호 계산하면서 결과 생성
  let leftLineNum = 1;
  let rightLineNum = 1;
  
  for (const diff of diffLines) {
    if (diff.type === 'same') {
      result.push({
        type: 'same',
        content: leftLines[diff.leftIdx], // 원본 라인 사용
        leftLineNum: leftLineNum,
        rightLineNum: rightLineNum,
      });
      leftLineNum++;
      rightLineNum++;
    } else if (diff.type === 'remove') {
      result.push({
        type: 'remove',
        content: leftLines[diff.leftIdx], // 원본 라인 사용
        leftLineNum: leftLineNum,
        rightLineNum: null,
      });
      leftLineNum++;
    } else if (diff.type === 'add') {
      result.push({
        type: 'add',
        content: rightLines[diff.rightIdx], // 원본 라인 사용
        leftLineNum: null,
        rightLineNum: rightLineNum,
      });
      rightLineNum++;
    }
  }
  
  return result;
}

/**
 * 라인 diff를 hunk들로 그룹화
 */
function groupIntoHunks(
  lineDiff: LineDiffEntry[],
  contextLines: number
): Hunk[] {
  if (lineDiff.length === 0) return [];

  // 변경된 라인들의 인덱스 찾기
  const changedIndices: number[] = [];
  lineDiff.forEach((line, idx) => {
    if (line.type !== 'same') {
      changedIndices.push(idx);
    }
  });

  if (changedIndices.length === 0) return [];

  // 변경 영역들을 그룹화 (context로 연결되는 영역들은 하나의 hunk로)
  const ranges: { start: number; end: number }[] = [];
  let currentRange: { start: number; end: number } | null = null;

  for (const idx of changedIndices) {
    const rangeStart = Math.max(0, idx - contextLines);
    const rangeEnd = Math.min(lineDiff.length - 1, idx + contextLines);

    if (currentRange === null) {
      currentRange = { start: rangeStart, end: rangeEnd };
    } else if (rangeStart <= currentRange.end + 1) {
      // 범위가 겹치거나 인접함
      currentRange.end = Math.max(currentRange.end, rangeEnd);
    } else {
      // 새로운 범위 시작
      ranges.push(currentRange);
      currentRange = { start: rangeStart, end: rangeEnd };
    }
  }
  if (currentRange) {
    ranges.push(currentRange);
  }

  // 각 범위를 hunk로 변환
  return ranges.map((range) => {
    const lines = lineDiff.slice(range.start, range.end + 1);

    // hunk의 시작 라인 번호 계산
    let startLeft = 1;
    let startRight = 1;
    for (let i = 0; i < range.start; i++) {
      const line = lineDiff[i];
      if (line.type === 'same' || line.type === 'remove') {
        startLeft++;
      }
      if (line.type === 'same' || line.type === 'add') {
        startRight++;
      }
    }

    // hunk의 라인 수 계산
    let countLeft = 0;
    let countRight = 0;
    for (const line of lines) {
      if (line.type === 'same' || line.type === 'remove') {
        countLeft++;
      }
      if (line.type === 'same' || line.type === 'add') {
        countRight++;
      }
    }

    return {
      startLeft,
      startRight,
      countLeft,
      countRight,
      lines,
    };
  });
}

const HunkPane: React.FC<{
  lineDiff: LineDiffEntry[];
  contextLines: number;
  expandText: string;
}> = ({ lineDiff, contextLines, expandText }) => {
  const hunks = useMemo(
    () => groupIntoHunks(lineDiff, contextLines),
    [lineDiff, contextLines]
  );

  // 확장 상태 관리
  const [expandedGaps, setExpandedGaps] = React.useState<Set<string>>(
    new Set()
  );

  const toggleGap = (gapKey: string) => {
    setExpandedGaps((prev) => {
      const next = new Set(prev);
      if (next.has(gapKey)) {
        next.delete(gapKey);
      } else {
        next.add(gapKey);
      }
      return next;
    });
  };

  // 전체 라인 수 (라인 번호 너비 계산용)
  const maxLineNum = Math.max(
    ...lineDiff
      .map((l) => [l.leftLineNum, l.rightLineNum])
      .flat()
      .filter((n): n is number => n !== null),
    1
  );
  const lineNumWidth = String(maxLineNum).length;

  // 각 hunk 사이의 숨겨진 라인 수 계산
  const hiddenLinesBetweenHunks: number[] = [];
  if (hunks.length > 0) {
    // 첫 hunk 전에 숨겨진 라인
    let firstHunkStartIdx = 0;
    for (let i = 0; i < lineDiff.length; i++) {
      if (lineDiff[i] === hunks[0].lines[0]) {
        firstHunkStartIdx = i;
        break;
      }
    }
    hiddenLinesBetweenHunks.push(firstHunkStartIdx);

    // hunk 사이에 숨겨진 라인
    let prevEndIdx = firstHunkStartIdx + hunks[0].lines.length;
    for (let i = 1; i < hunks.length; i++) {
      let currentStartIdx = 0;
      for (let j = prevEndIdx; j < lineDiff.length; j++) {
        if (lineDiff[j] === hunks[i].lines[0]) {
          currentStartIdx = j;
          break;
        }
      }
      hiddenLinesBetweenHunks.push(currentStartIdx - prevEndIdx);
      prevEndIdx = currentStartIdx + hunks[i].lines.length;
    }

    // 마지막 hunk 이후 숨겨진 라인
    hiddenLinesBetweenHunks.push(lineDiff.length - prevEndIdx);
  }

  return (
    <div className="font-mono text-sm bg-white dark:bg-gray-800 overflow-x-auto">
      {hunks.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No differences found
        </div>
      ) : (
        hunks.map((hunk, hunkIdx) => (
          <React.Fragment key={hunkIdx}>
            {/* 이전 hunk와의 간격 (숨겨진 라인) */}
            {hiddenLinesBetweenHunks[hunkIdx] > 0 && (
              <CollapsedSection
                hiddenCount={hiddenLinesBetweenHunks[hunkIdx]}
                expandText={expandText}
                gapKey={`before-${hunkIdx}`}
                isExpanded={expandedGaps.has(`before-${hunkIdx}`)}
                onToggle={toggleGap}
                lineDiff={lineDiff}
                startIdx={
                  hunkIdx === 0
                    ? 0
                    : findHunkEndIndex(lineDiff, hunks[hunkIdx - 1])
                }
                lineNumWidth={lineNumWidth}
              />
            )}

            {/* Hunk 헤더 */}
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1 border-y border-blue-200 dark:border-blue-800 text-xs">
              @@ -{hunk.startLeft},{hunk.countLeft} +{hunk.startRight},
              {hunk.countRight} @@
            </div>

            {/* Hunk 라인들 */}
            {hunk.lines.map((line, lineIdx) => (
              <HunkLine
                key={lineIdx}
                line={line}
                lineNumWidth={lineNumWidth}
              />
            ))}
          </React.Fragment>
        ))
      )}

      {/* 마지막 hunk 이후 숨겨진 라인 */}
      {hunks.length > 0 && hiddenLinesBetweenHunks[hunks.length] > 0 && (
        <CollapsedSection
          hiddenCount={hiddenLinesBetweenHunks[hunks.length]}
          expandText={expandText}
          gapKey={`after-${hunks.length - 1}`}
          isExpanded={expandedGaps.has(`after-${hunks.length - 1}`)}
          onToggle={toggleGap}
          lineDiff={lineDiff}
          startIdx={findHunkEndIndex(lineDiff, hunks[hunks.length - 1])}
          lineNumWidth={lineNumWidth}
        />
      )}
    </div>
  );
};

function findHunkEndIndex(lineDiff: LineDiffEntry[], hunk: Hunk): number {
  const lastLine = hunk.lines[hunk.lines.length - 1];
  for (let i = 0; i < lineDiff.length; i++) {
    if (lineDiff[i] === lastLine) {
      return i + 1;
    }
  }
  return 0;
}

const HunkLine: React.FC<{
  line: LineDiffEntry;
  lineNumWidth: number;
}> = ({ line, lineNumWidth }) => {
  const bgClass =
    line.type === 'add'
      ? 'bg-green-50 dark:bg-green-900/30'
      : line.type === 'remove'
      ? 'bg-red-50 dark:bg-red-900/30'
      : '';

  const textClass =
    line.type === 'add'
      ? 'text-green-800 dark:text-green-200'
      : line.type === 'remove'
      ? 'text-red-800 dark:text-red-200'
      : 'text-gray-800 dark:text-gray-200';

  const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';

  return (
    <div className={`flex ${bgClass} hover:bg-opacity-70`}>
      {/* 왼쪽 라인 번호 */}
      <div className="flex-shrink-0 select-none text-gray-400 dark:text-gray-500 text-right border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 min-w-[3rem]">
        {line.leftLineNum?.toString().padStart(lineNumWidth, ' ') || ''}
      </div>
      {/* 오른쪽 라인 번호 */}
      <div className="flex-shrink-0 select-none text-gray-400 dark:text-gray-500 text-right border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-2 py-0.5 min-w-[3rem]">
        {line.rightLineNum?.toString().padStart(lineNumWidth, ' ') || ''}
      </div>
      {/* 접두사 (+, -, 공백) */}
      <div
        className={`flex-shrink-0 w-5 text-center py-0.5 font-bold ${textClass}`}
      >
        {prefix}
      </div>
      {/* 라인 내용 */}
      <div
        className={`flex-1 whitespace-pre-wrap break-all py-0.5 pr-4 ${textClass}`}
      >
        {line.content || ' '}
      </div>
    </div>
  );
};

const CollapsedSection: React.FC<{
  hiddenCount: number;
  expandText: string;
  gapKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  lineDiff: LineDiffEntry[];
  startIdx: number;
  lineNumWidth: number;
}> = ({
  hiddenCount,
  expandText,
  gapKey,
  isExpanded,
  onToggle,
  lineDiff,
  startIdx,
  lineNumWidth,
}) => {
  if (hiddenCount <= 0) return null;

  if (isExpanded) {
    // 확장된 상태: 숨겨진 라인들 표시
    const hiddenLines = lineDiff.slice(startIdx, startIdx + hiddenCount);
    return (
      <div>
        <button
          onClick={() => onToggle(gapKey)}
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs py-1 flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-180" />
          <span>Collapse</span>
        </button>
        {hiddenLines.map((line, idx) => (
          <HunkLine key={idx} line={line} lineNumWidth={lineNumWidth} />
        ))}
      </div>
    );
  }

  // 축소된 상태: 확장 버튼 표시
  return (
    <button
      onClick={() => onToggle(gapKey)}
      className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 text-xs py-1 flex items-center justify-center gap-1 transition-colors"
    >
      <ChevronDown className="w-3 h-3" />
      <span>{expandText.replace('{n}', String(hiddenCount))}</span>
    </button>
  );
};

function applyIgnoreOptions(
  diffs: Diff[],
  ignoreWhitespace: boolean,
  ignoreCase: boolean
) {
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

export const diffTool: ToolDefinition<DiffToolState> = {
  id: 'diff',
  title: 'Text Diff',
  description: 'Compare two texts',
  path: '/diff',
  icon: FileDiff,
  keywords: ['diff', 'compare', 'difference', 'text', 'unified', 'side'],
  category: 'viewer',
  defaultState: DEFAULT_STATE,
  Component: DiffTool,
};
