/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileDiff } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';
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
  useTitle('Text Diff');
  const { state, updateState, resetState, shareState } = useToolState<DiffToolState>('diff', DEFAULT_STATE);
  const debouncedLeft = useDebouncedValue(state.left, 250);
  const debouncedRight = useDebouncedValue(state.right, 250);

  const diffs = useMemo(() => {
    const dmp = new DiffMatchPatch();
    dmp.Diff_Timeout = 1;
    const rawDiffs = dmp.diff_main(debouncedLeft, debouncedRight);
    dmp.diff_cleanupSemantic(rawDiffs);
    return applyIgnoreOptions(rawDiffs, state.ignoreWhitespace, state.ignoreCase);
  }, [debouncedLeft, debouncedRight, state.ignoreWhitespace, state.ignoreCase]);

  const stats = useMemo(() => {
    return diffs.reduce(
      (acc, [op, text]) => {
        if (op === 1) acc.added += text.length;
        if (op === -1) acc.removed += text.length;
        return acc;
      },
      { added: 0, removed: 0 },
    );
  }, [diffs]);

  const hasDiff = diffs.some(([op]) => op !== 0);

  const unifiedExport = useMemo(() => {
    return diffs.map(([op, text]) => {
      const prefix = op === 0 ? ' ' : op === 1 ? '+' : '-';
      return `${prefix}${text}`;
    }).join('');
  }, [diffs]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      <ToolHeader 
        title="Text Diff" 
        description="Spot differences between two text blocks instantly."
        onReset={() => resetState()}
        onShare={shareState}
      />

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <EditorPanel 
            title="Original"
            value={state.left}
            onChange={(val) => updateState({ left: val })}
            className="h-60"
          />
          <EditorPanel 
            title="Modified"
            value={state.right}
            onChange={(val) => updateState({ right: val })}
            className="h-60"
          />
        </div>

        <ActionBar className="flex flex-wrap items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
          <div className="inline-flex items-center rounded-lg border bg-gray-50 p-1 text-sm font-medium">
            {(['split', 'unified'] as const).map((view) => (
              <button
                key={view}
                className={`rounded-md px-3 py-1.5 ${state.view === view ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => updateState({ view })}
              >
                {view === 'split' ? 'Split View' : 'Unified View'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <label 
              className="flex items-center gap-2"
              title="Treat changes that only add or remove whitespace as no-ops."
            >
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={state.ignoreWhitespace}
                onChange={(e) => updateState({ ignoreWhitespace: e.target.checked })}
              />
              <span>Ignore Whitespace</span>
            </label>
            <label 
              className="flex items-center gap-2"
              title="Compare both inputs case-insensitively."
            >
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={state.ignoreCase}
                onChange={(e) => updateState({ ignoreCase: e.target.checked })}
              />
              <span>Ignore Case</span>
            </label>
            <button
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50"
              disabled={!hasDiff}
              onClick={() => hasDiff && copyToClipboard(unifiedExport, 'Copied unified diff output.')}
            >
              Copy Unified
            </button>
          </div>
        </ActionBar>

        <div className="rounded-lg border bg-white shadow-inner">
          <div className="flex items-center justify-between border-b px-4 py-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Diff Result</span>
            <div className="space-x-4 text-xs uppercase tracking-wide">
              <span className="text-green-600">+{stats.added} chars</span>
              <span className="text-red-600">-{stats.removed} chars</span>
            </div>
          </div>

          {!hasDiff && (
            <p className="p-4 text-center text-sm text-gray-500">Both inputs are identical.</p>
          )}

          {hasDiff && state.view === 'split' && (
            <div className="grid gap-0 border-t lg:grid-cols-2">
              <DiffPane label="Original" type="left" diffs={diffs} />
              <DiffPane label="Modified" type="right" diffs={diffs} />
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

const DiffPane: React.FC<{ label: string; type: 'left' | 'right'; diffs: Diff[] }> = ({ label, type, diffs }) => {
  return (
    <div className="min-h-[240px] border-gray-100">
      <div className="border-b bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
      <pre className="h-full whitespace-pre-wrap break-words p-4 font-mono text-sm text-gray-800">
        {diffs.map(([op, text], idx) => {
          if (type === 'left' && op === 1) return null;
          if (type === 'right' && op === -1) return null;
          const highlight = op === 0
            ? ''
            : op === -1
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800';
          return (
            <span key={`${type}-${idx}`} className={highlight}>{text || '\n'}</span>
          );
        })}
      </pre>
    </div>
  );
};

const UnifiedPane: React.FC<{ diffs: Diff[] }> = ({ diffs }) => (
  <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm text-gray-800">
    {diffs.map(([op, text], idx) => {
      const style = op === 0 ? '' : op === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 line-through';
      const prefix = op === 0 ? '' : op === 1 ? '+ ' : '- ';
      return (
        <span key={idx} className={style}>
          {prefix}{text || '\n'}
        </span>
      );
    })}
  </pre>
);

function applyIgnoreOptions(diffs: Diff[], ignoreWhitespace: boolean, ignoreCase: boolean) {
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
  defaultState: DEFAULT_STATE,
  Component: DiffTool,
};
