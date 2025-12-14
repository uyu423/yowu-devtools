/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileJson, ListTree, Rows4, Text } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface JsonToolState {
  input: string;
  indent: 2 | 4;
  sortKeys: boolean;
  viewMode: 'tree' | 'pretty' | 'minified';
  expandLevel: number;
  search: string;
}

const DEFAULT_STATE: JsonToolState = {
  input: '',
  indent: 2,
  sortKeys: false,
  viewMode: 'tree',
  expandLevel: 2,
  search: '',
};

const SAMPLE_JSON = `{
  "product": {
    "id": 42781,
    "name": "Yowu DevTools",
    "tags": ["web", "utilities", "shareable"],
    "meta": {
      "owner": "@yowu",
      "features": {
        "theme": true,
        "shortcuts": ["Ctrl+K", "Cmd+Enter"],
        "tools": 7
      }
    }
  }
}`;

const jsonViewStyles = {
  ...defaultStyles,
  container: `${defaultStyles.container} text-sm font-mono text-gray-900`,
  childFieldsContainer: `${defaultStyles.childFieldsContainer ?? ''} child-fields-container`,
};

const JsonTool: React.FC = () => {
  useTitle('JSON Viewer');
  const { state, updateState, resetState, shareState } = useToolState<JsonToolState>('json', DEFAULT_STATE);
  const debouncedInput = useDebouncedValue(state.input, 300);

  const parseResult = useMemo(() => {
    if (!debouncedInput.trim()) {
      return { data: null, formatted: '', minified: '', error: null as string | null };
    }

    try {
      const parsed = JSON.parse(debouncedInput);
      const normalized = state.sortKeys ? sortJsonKeys(parsed) : parsed;
      const formatted = JSON.stringify(normalized, null, state.indent);
      const minified = JSON.stringify(normalized);
      return { data: normalized, formatted, minified, error: null };
    } catch (error) {
      return { data: null, formatted: '', minified: '', error: (error as Error).message };
    }
  }, [debouncedInput, state.indent, state.sortKeys]);

  const highlightedPretty = useMemo(() => {
    if (!parseResult.formatted) return '';
    return highlightMatches(parseResult.formatted, state.search);
  }, [parseResult.formatted, state.search]);

  const hasInput = Boolean(state.input.trim());
  const isValid = !!parseResult.data && !parseResult.error;

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      <ToolHeader 
        title="JSON Pretty Viewer" 
        description="Format JSON instantly and explore the structure as a tree."
        onReset={resetState}
        onShare={shareState}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 min-h-[360px]">
          <EditorPanel 
            title="Input JSON"
            value={state.input}
            onChange={(val) => updateState({ input: val })}
            mode="json"
            placeholder='{"key": "value"}'
            status={!hasInput ? 'default' : parseResult.error ? 'error' : 'success'}
            className="h-full"
          />

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Indent</span>
              <select 
                className="rounded-md border border-gray-200 px-2 py-1 text-sm"
                value={state.indent}
                onChange={(e) => updateState({ indent: Number(e.target.value) as 2 | 4 })}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={state.sortKeys}
                onChange={(e) => updateState({ sortKeys: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span>Sort keys</span>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Tree Depth</span>
              <input 
                type="range"
                min={1}
                max={6}
                value={state.expandLevel}
                onChange={(e) => updateState({ expandLevel: Number(e.target.value) })}
              />
              <span className="tabular-nums text-xs text-gray-500">{state.expandLevel}</span>
            </label>
          </div>
        </div>

        <div className="flex-1 min-h-[360px]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1 rounded-lg border bg-white p-1 text-sm font-medium shadow-sm">
              {[
                { key: 'tree', label: 'Tree', icon: ListTree },
                { key: 'pretty', label: 'Pretty', icon: Rows4 },
                { key: 'minified', label: 'Minified', icon: Text },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${state.viewMode === key ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => updateState({ viewMode: key as JsonToolState['viewMode'] })}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <input 
              type="text"
              value={state.search}
              onChange={(e) => updateState({ search: e.target.value })}
              placeholder="Search..."
              className="h-9 w-full max-w-xs rounded-md border border-gray-200 px-3 text-sm"
            />
          </div>

          <div className="h-full rounded-md border bg-white p-4 shadow-inner">
            {!hasInput && (
              <p className="text-sm text-gray-500">Paste JSON on the left to preview the result.</p>
            )}
            {parseResult.error && (
              <ErrorBanner message="JSON parsing failed" details={parseResult.error} />
            )}
            {!parseResult.error && state.viewMode === 'tree' && parseResult.data && (
              <div className="h-full overflow-auto">
                <JsonView 
                  data={parseResult.data}
                  shouldExpandNode={(level) => level < state.expandLevel}
                  style={jsonViewStyles}
                />
              </div>
            )}
            {!parseResult.error && state.viewMode !== 'tree' && parseResult.formatted && (
              <pre 
                className="h-full overflow-auto whitespace-pre-wrap break-all font-mono text-sm text-gray-800"
                dangerouslySetInnerHTML={{ __html: state.viewMode === 'pretty' ? highlightedPretty : escapeHtml(parseResult.minified) }}
              />
            )}
          </div>
        </div>
      </div>

      <ActionBar className="mt-6 flex-wrap justify-between border-t pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!isValid}
            onClick={() => isValid && updateState({ input: parseResult.formatted })}
          >
            Format
          </button>
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            disabled={!isValid}
            onClick={() => isValid && updateState({ input: parseResult.minified })}
          >
            Minify
          </button>
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            onClick={() => updateState({ input: SAMPLE_JSON })}
          >
            Sample Data
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            disabled={!isValid}
            onClick={() => isValid && copyToClipboard(parseResult.formatted, 'Copied pretty JSON.')}
          >
            Copy Pretty
          </button>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            disabled={!isValid}
            onClick={() => isValid && copyToClipboard(parseResult.minified, 'Copied minified JSON.')}
          >
            Copy Minified
          </button>
        </div>
      </ActionBar>
    </div>
  );
};

function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightMatches(value: string, query: string) {
  if (!query.trim()) return escapeHtml(value);
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'gi');
  let lastIndex = 0;
  let result = '';
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const before = value.slice(lastIndex, match.index);
    result += escapeHtml(before);
    result += `<mark class="bg-yellow-200 text-gray-900">${escapeHtml(match[0])}</mark>`;
    lastIndex = regex.lastIndex;
  }

  result += escapeHtml(value.slice(lastIndex));
  return result;
}

export const jsonTool: ToolDefinition<JsonToolState> = {
  id: 'json',
  title: 'JSON Viewer',
  description: 'Pretty print and traverse JSON',
  path: '/json',
  icon: FileJson,
  defaultState: DEFAULT_STATE,
  Component: JsonTool,
};
