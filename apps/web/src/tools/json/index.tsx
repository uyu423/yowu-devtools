/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useCallback } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { FileJson, ListTree, Rows4, Text, Copy, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { FileInput } from '@/components/common/FileInput';
import { FileDownload } from '@/components/common/FileDownload';
import { ShareModal } from '@/components/common/ShareModal';
import { ResizablePanels } from '@/components/common/ResizablePanels';
import { getMimeType } from '@/lib/fileUtils';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import { useWebWorker, shouldUseWorkerForText } from '@/hooks/useWebWorker';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import 'react-json-view-lite/dist/index.css';

/**
 * Custom JSON Tree Viewer with clickable URL support
 */
const JsonTreeView: React.FC<{
  data: unknown;
  expandLevel: number | typeof Infinity;
  isDark: boolean;
}> = React.memo(({ data, expandLevel, isDark }) => {
  return (
    <JsonNode
      data={data}
      depth={0}
      expandLevel={expandLevel}
      isDark={isDark}
      isLast={true}
    />
  );
});
JsonTreeView.displayName = 'JsonTreeView';

/**
 * Recursive JSON Node component with URL link support
 */
const JsonNode: React.FC<{
  data: unknown;
  depth: number;
  expandLevel: number | typeof Infinity;
  isDark: boolean;
  fieldName?: string;
  isLast?: boolean;
}> = React.memo(({ data, depth, expandLevel, isDark, fieldName, isLast = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(() => 
    expandLevel === Infinity || depth < expandLevel
  );

  // Update expanded state when expandLevel changes
  React.useEffect(() => {
    setIsExpanded(expandLevel === Infinity || depth < expandLevel);
  }, [expandLevel, depth]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const indent = depth * 16;

  // Null value
  if (data === null) {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-500 dark:text-gray-400">null</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Undefined value
  if (data === undefined) {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className="text-gray-500 dark:text-gray-400">undefined</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // String value with URL detection
  if (typeof data === 'string') {
    const isUrl = /^https?:\/\//i.test(data);
    return (
      <div className="flex items-start flex-wrap" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        {isUrl ? (
          <a
            href={data}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            "{data}"
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <span className={`break-all ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            "{data}"
          </span>
        )}
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Number value
  if (typeof data === 'number') {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>{data}</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Boolean value
  if (typeof data === 'boolean') {
    return (
      <div className="flex items-start" style={{ paddingLeft: indent }}>
        {fieldName !== undefined && (
          <>
            <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
            <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
          </>
        )}
        <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>{data.toString()}</span>
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  // Array value
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="flex items-start" style={{ paddingLeft: indent }}>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">[]</span>
          {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
        </div>
      );
    }

    return (
      <div>
        <div
          className="flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded"
          style={{ paddingLeft: indent }}
          onClick={toggleExpand}
        >
          <span className="text-gray-500 dark:text-gray-400 select-none mr-1 w-3 inline-block">
            {isExpanded ? '▾' : '▸'}
          </span>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">[</span>
          {!isExpanded && (
            <>
              <span className="text-gray-500 dark:text-gray-400 mx-1">...</span>
              <span className="text-gray-600 dark:text-gray-300">]</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">
                ({data.length} items)
              </span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </>
          )}
        </div>
        {isExpanded && (
          <>
            {data.map((item, index) => (
              <JsonNode
                key={index}
                data={item}
                depth={depth + 1}
                expandLevel={expandLevel}
                isDark={isDark}
                isLast={index === data.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-gray-600 dark:text-gray-300 ml-4">]</span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // Object value
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return (
        <div className="flex items-start" style={{ paddingLeft: indent }}>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">{'{}'}</span>
          {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
        </div>
      );
    }

    return (
      <div>
        <div
          className="flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded"
          style={{ paddingLeft: indent }}
          onClick={toggleExpand}
        >
          <span className="text-gray-500 dark:text-gray-400 select-none mr-1 w-3 inline-block">
            {isExpanded ? '▾' : '▸'}
          </span>
          {fieldName !== undefined && (
            <>
              <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
            </>
          )}
          <span className="text-gray-600 dark:text-gray-300">{'{'}</span>
          {!isExpanded && (
            <>
              <span className="text-gray-500 dark:text-gray-400 mx-1">...</span>
              <span className="text-gray-600 dark:text-gray-300">{'}'}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">
                ({entries.length} keys)
              </span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </>
          )}
        </div>
        {isExpanded && (
          <>
            {entries.map(([key, value], index) => (
              <JsonNode
                key={key}
                data={value}
                depth={depth + 1}
                expandLevel={expandLevel}
                isDark={isDark}
                fieldName={key}
                isLast={index === entries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-gray-600 dark:text-gray-300 ml-4">{'}'}</span>
              {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // Other values
  return (
    <div className="flex items-start" style={{ paddingLeft: indent }}>
      {fieldName !== undefined && (
        <>
          <span className="text-gray-700 dark:text-gray-300">"{fieldName}"</span>
          <span className="text-gray-500 dark:text-gray-400 mx-1">:</span>
        </>
      )}
      <span className="text-gray-600 dark:text-gray-300">{String(data)}</span>
      {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
    </div>
  );
});
JsonNode.displayName = 'JsonNode';

interface JsonToolState {
  input: string;
  indent: 2 | 4;
  sortKeys: boolean;
  viewMode: 'tree' | 'pretty' | 'minified';
  expandLevel: number | typeof Infinity;
  search: string;
}

const DEFAULT_STATE: JsonToolState = {
  input: '',
  indent: 2,
  sortKeys: false,
  viewMode: 'tree',
  expandLevel: 5,
  search: '',
};

const JsonTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.json.title'));
  const resolvedTheme = useResolvedTheme();
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<JsonToolState>('json', DEFAULT_STATE, {
      // Exclude 'search' field as it's UI-only state
      shareStateFilter: ({
        input,
        indent,
        sortKeys,
        viewMode,
        expandLevel,
      }) => ({
        input,
        indent,
        sortKeys,
        viewMode,
        expandLevel,
      }),
    });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.json.title'),
  });
  
  const [isRightPanelExpanded, setIsRightPanelExpanded] = React.useState(false);
  const debouncedInput = useDebouncedValue(state.input, 300);

  // Worker 사용 여부 결정 (디바운싱 전 state.input을 기준으로 결정하여 붙여넣기 시 즉시 Worker 모드 전환)
  const shouldUseWorker = React.useMemo(
    () => shouldUseWorkerForText(state.input, 1_000_000, 10_000),
    [state.input]
  );

  const isDark = resolvedTheme === 'dark';

  // Request ID for Worker response ordering (v1.2.0)
  const [requestId, setRequestId] = React.useState<number | undefined>(undefined);
  
  // Generate request ID when input changes
  React.useEffect(() => {
    if (shouldUseWorker && debouncedInput.trim()) {
      setRequestId((prev) => (prev ?? 0) + 1);
    }
  }, [shouldUseWorker, debouncedInput]);

  // Worker를 사용한 파싱
  const { result: workerResult, isProcessing } = useWebWorker<
    { input: string; indent: 2 | 4; sortKeys: boolean },
    { success: boolean; data?: unknown; formatted?: string; minified?: string; error?: string }
  >({
    workerUrl: new URL('../workers/json-parser.worker.ts', import.meta.url),
    shouldUseWorker: shouldUseWorker && !!debouncedInput.trim(),
    request: shouldUseWorker && debouncedInput.trim()
      ? {
          input: debouncedInput,
          indent: state.indent,
          sortKeys: state.sortKeys,
        }
      : null,
    requestId,
    timeout: 10_000, // 10 seconds timeout
  });

  // Worker 결과를 파싱 결과 형식으로 변환
  const workerParseResult = React.useMemo(() => {
    if (!workerResult) {
      return {
        data: null,
        formatted: '',
        minified: '',
        error: null as string | null,
      };
    }

    if (workerResult.success) {
      return {
        data: workerResult.data ?? null,
        formatted: workerResult.formatted ?? '',
        minified: workerResult.minified ?? '',
        error: null,
      };
    }

    return {
      data: null,
      formatted: '',
      minified: '',
      error: workerResult.error ?? 'Unknown error',
    };
  }, [workerResult]);

  // 메인 스레드 파싱 (작은 데이터용)
  const mainThreadParseResult = useMemo(() => {
    if (!debouncedInput.trim() || shouldUseWorker) {
      return {
        data: null,
        formatted: '',
        minified: '',
        error: null as string | null,
      };
    }

    try {
      const parsed = JSON.parse(debouncedInput);
      const normalized = state.sortKeys ? sortJsonKeys(parsed) : parsed;
      const formatted = JSON.stringify(normalized, null, state.indent);
      const minified = JSON.stringify(normalized);
      return { data: normalized, formatted, minified, error: null };
    } catch (error) {
      return {
        data: null,
        formatted: '',
        minified: '',
        error: (error as Error).message,
      };
    }
  }, [debouncedInput, state.indent, state.sortKeys, shouldUseWorker]);

  // 최종 파싱 결과 (Worker 또는 메인 스레드)
  const parseResult = shouldUseWorker ? workerParseResult : mainThreadParseResult;

  const highlightedPretty = useMemo(() => {
    if (!parseResult.formatted) return '';
    return highlightMatches(parseResult.formatted, state.search);
  }, [parseResult.formatted, state.search]);

  const hasInput = Boolean(state.input.trim());
  const isValid = !!parseResult.data && !parseResult.error;

  return (
    <div className="flex h-full flex-col p-4 md:p-6 max-w-[90rem] mx-auto overflow-hidden">
      <ToolHeader
        title={t('tool.json.title')}
        description={t('tool.json.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <ResizablePanels
        storageKey="json-panel-width"
        initialLeftWidth={50}
        minLeftWidth={25}
        maxLeftWidth={75}
        expandRightPanel={isRightPanelExpanded}
        leftPanel={
          <div className="flex flex-col flex-1 min-h-0">
            <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 shrink-0">
              <label className="flex items-center gap-2">
                <OptionLabel
                  tooltip={t('tool.json.indentTooltip')}
                  className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  {t('common.indent')}
                </OptionLabel>
                <select
                  className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 text-sm"
                  value={state.indent}
                  onChange={(e) =>
                    updateState({ indent: Number(e.target.value) as 2 | 4 })
                  }
                >
                  <option value={2}>{t('common.spaces2')}</option>
                  <option value={4}>{t('common.spaces4')}</option>
                </select>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.sortKeys}
                  onChange={(e) => updateState({ sortKeys: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                />
                <OptionLabel tooltip={t('tool.json.sortKeysTooltip')}>
                  {t('tool.json.sortKeys')}
                </OptionLabel>
              </label>

              <label className="flex items-center gap-2">
                <OptionLabel
                  tooltip={t('tool.json.treeDepthTooltip')}
                  className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  {t('tool.json.treeDepth')}
                </OptionLabel>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={
                    state.expandLevel === Infinity
                      ? 6
                      : Math.min(state.expandLevel, 6)
                  }
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    updateState({ expandLevel: value });
                  }}
                />
                <span className="tabular-nums text-xs text-gray-500 dark:text-gray-400 min-w-[3ch] text-right">
                  {state.expandLevel === Infinity ? '∞' : state.expandLevel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateState({
                      expandLevel: state.expandLevel === Infinity ? 6 : Infinity,
                    })
                  }
                  className={`text-xs px-2 py-0.5 rounded transition ${
                    state.expandLevel === Infinity
                      ? 'bg-blue-600 dark:bg-blue-700 text-white'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }`}
                  title={
                    state.expandLevel === Infinity
                      ? t('tool.json.setToLevel').replace('{n}', '6')
                      : t('tool.json.expandAllLevels')
                  }
                >
                  ∞
                </button>
              </label>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <EditorPanel
                title={t('tool.json.inputTitle')}
                value={state.input}
                onChange={(val) => updateState({ input: val })}
                mode="json"
                placeholder={t('tool.json.inputPlaceholder')}
                status={
                  !hasInput ? 'default' : parseResult.error ? 'error' : 'success'
                }
                className="flex-1 min-h-0"
              />
              <div className="mt-3">
                <FileInput
                  onFileLoad={(content) => {
                    updateState({ input: content });
                  }}
                  accept=".json,application/json"
                  maxSize={50 * 1024 * 1024} // 50MB
                  className="w-full"
                />
              </div>
            </div>
          </div>
        }
        rightPanel={
          <div className="flex flex-col flex-1 min-h-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex gap-1 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-1 text-sm font-medium shadow-sm">
                {[
                  { key: 'tree', label: t('tool.json.viewTree'), icon: ListTree },
                  { key: 'pretty', label: t('tool.json.viewPretty'), icon: Rows4 },
                  { key: 'minified', label: t('tool.json.viewMinified'), icon: Text },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${
                      state.viewMode === key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    onClick={() =>
                      updateState({ viewMode: key as JsonToolState['viewMode'] })
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              {state.viewMode === 'pretty' && (
                <input
                  type="text"
                  value={state.search}
                  onChange={(e) => updateState({ search: e.target.value })}
                  placeholder={t('tool.json.searchPlaceholder')}
                  className="h-9 w-full max-w-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
              )}
            </div>

            <div className="flex-1 min-h-0 flex flex-col rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-inner overflow-hidden">
              {!hasInput && (
                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tool.json.pasteJsonHint')}
                  </p>
                </div>
              )}
              {isProcessing && (
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
                    {t('tool.json.processingLargeJson')}
                  </div>
                </div>
              )}
              {!isProcessing && parseResult.error && (
                <div className="p-4">
                  <ErrorBanner
                    message={t('tool.json.jsonParsingFailed')}
                    details={parseResult.error}
                  />
                </div>
              )}
              {!parseResult.error &&
                state.viewMode === 'tree' &&
                parseResult.data && (
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('tool.json.treeView')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            isValid &&
                            copyToClipboard(parseResult.formatted, t('tool.json.copiedJson'))
                          }
                          disabled={!isValid}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('tool.json.copyJson')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsRightPanelExpanded(!isRightPanelExpanded)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title={isRightPanelExpanded ? t('common.exitFullscreen') : t('common.fullscreen')}
                        >
                          {isRightPanelExpanded ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto p-4 json-tree-view text-sm font-mono">
                      <JsonTreeView
                        key={`json-view-${isDark ? 'dark' : 'light'}-${state.expandLevel}`}
                        data={parseResult.data}
                        expandLevel={state.expandLevel}
                        isDark={isDark}
                      />
                    </div>
                  </div>
                )}
              {!parseResult.error &&
                state.viewMode !== 'tree' &&
                parseResult.formatted && (
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {state.viewMode === 'pretty' ? t('tool.json.prettyJson') : t('tool.json.minifiedJson')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            isValid &&
                            copyToClipboard(
                              state.viewMode === 'pretty'
                                ? parseResult.formatted
                                : parseResult.minified,
                              state.viewMode === 'pretty'
                                ? t('tool.json.copiedPrettyJson')
                                : t('tool.json.copiedMinifiedJson')
                            )
                          }
                          disabled={!isValid}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={`${t('common.copy')} ${state.viewMode === 'pretty' ? t('tool.json.viewPretty') : t('tool.json.viewMinified')} JSON`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsRightPanelExpanded(!isRightPanelExpanded)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title={isRightPanelExpanded ? t('common.exitFullscreen') : t('common.fullscreen')}
                        >
                          {isRightPanelExpanded ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <pre
                      className="flex-1 min-h-0 overflow-auto whitespace-pre-wrap break-all font-mono text-sm text-gray-800 dark:text-gray-200 p-4 m-0"
                      dangerouslySetInnerHTML={{
                        __html:
                          state.viewMode === 'pretty'
                            ? highlightedPretty
                            : escapeHtml(parseResult.minified),
                      }}
                    />
                  </div>
                )}
            </div>
          </div>
        }
      />

      <ActionBar className="mt-6 flex-wrap justify-end border-t dark:border-gray-700 pt-4 shrink-0">
        <div className="flex flex-wrap gap-2">
          <FileDownload
            content={parseResult.formatted || ''}
            fileName="output.json"
            mimeType={getMimeType('json')}
            disabled={!isValid}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('tool.json.downloadPretty')}
          </FileDownload>
          <FileDownload
            content={parseResult.minified || ''}
            fileName="output.min.json"
            mimeType={getMimeType('json')}
            disabled={!isValid}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('tool.json.downloadMinified')}
          </FileDownload>
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
    result += `<mark class="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-yellow-100">${escapeHtml(
      match[0]
    )}</mark>`;
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
  keywords: ['json', 'viewer', 'formatter', 'prettify', 'parse', 'tree', 'beautify'],
  category: 'viewer',
  defaultState: DEFAULT_STATE,
  Component: JsonTool,
};
