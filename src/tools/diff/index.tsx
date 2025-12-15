/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileDiff, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { FileInput } from '@/components/common/FileInput';
import { FileDownload } from '@/components/common/FileDownload';
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
  view: 'split' | 'unified';
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
}

const DEFAULT_STATE: DiffToolState = {
  left: '',
  right: '',
  view: 'split',
  ignoreWhitespace: false,
  ignoreCase: false,
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
              className="h-60"
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
              className="h-60"
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
          <div className="inline-flex items-center rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1 text-sm font-medium">
            {(['split', 'unified'] as const).map((view) => (
              <button
                key={view}
                className={`rounded-md px-3 py-1.5 ${
                  state.view === view
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() => updateState({ view })}
              >
                {view === 'split' ? t('tool.diff.splitView') : t('tool.diff.unifiedView')}
              </button>
            ))}
          </div>

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
              <span className="text-green-600 dark:text-green-400">
                {t('tool.diff.addedChars').replace('{n}', String(stats.added))}
              </span>
              <span className="text-red-600 dark:text-red-400">
                {t('tool.diff.removedChars').replace('{n}', String(stats.removed))}
              </span>
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
