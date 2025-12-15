/* eslint-disable react-refresh/only-export-components */
/**
 * API Tester Tool
 *
 * A powerful API testing tool with CORS bypass support via Chrome Extension.
 */

import React, { useState, useCallback } from 'react';
import { Globe, Check, Terminal, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolDefinition } from '@/tools/types';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ShareModal } from '@/components/common/ShareModal';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';

import type { ApiTesterState, HttpMethod, HistoryItem } from './types';
import { COMMON_HEADERS, COMMON_CONTENT_TYPES } from './types';
import { createKeyValueItem, toCurlCommand, parseUrlParams } from './utils';
import {
  MethodSelector,
  UrlInput,
  SendButton,
  KeyValueEditor,
  BodyEditor,
  ResponseViewer,
  HistorySidebar,
  ExtensionStatus,
  ExtensionModeSelector,
  CorsErrorBanner,
} from './components';
import { useRequestExecutor, useApiHistory } from './hooks';

const DEFAULT_STATE: ApiTesterState = {
  method: 'GET',
  url: '',
  queryParams: [createKeyValueItem()],
  headers: [createKeyValueItem('Content-Type', 'application/json')],
  body: { kind: 'none' },
  timeoutMs: 30000,
  followRedirects: true,
  credentials: 'omit',
  selectedMode: 'direct',
  activeTab: 'params',
  responseTab: 'body',
};

const ApiTesterTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.apiTester.title'));

  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<ApiTesterState>('api-tester', DEFAULT_STATE, {
      // Exclude UI-only state from share
      shareStateFilter: ({
        method,
        url,
        queryParams,
        headers,
        body,
        timeoutMs,
        followRedirects,
        credentials,
        selectedMode,
      }) => ({
        method,
        url,
        queryParams,
        headers,
        body,
        timeoutMs,
        followRedirects,
        credentials,
        selectedMode,
      }),
    });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.apiTester.title'),
  });

  const { response, isLoading, executeRequest, cancelRequest, clearResponse, extensionStatus, checkExtension } =
    useRequestExecutor();

  const { history, favorites, addHistory, removeHistory, clearHistory, toggleFavorite, renameHistory } =
    useApiHistory();

  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);

  // Handle URL change with query param parsing
  const handleUrlChange = useCallback(
    (url: string) => {
      updateState({ url });
      // Parse query params from URL
      const parsedParams = parseUrlParams(url);
      if (parsedParams.length > 0) {
        updateState({ queryParams: [...parsedParams, createKeyValueItem()] });
      }
    },
    [updateState]
  );

  // Handle method change
  const handleMethodChange = useCallback(
    (method: HttpMethod) => {
      updateState({ method });
      // Reset body for methods that don't support it
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        updateState({ body: { kind: 'none' } });
      }
    },
    [updateState]
  );

  // Handle send request
  const handleSend = useCallback(async () => {
    if (!state.url.trim()) return;

    const result = await executeRequest(state);

    // Add to history
    addHistory(state, {
      status: result.status,
      statusText: result.statusText,
      timingMs: result.timingMs,
    });
  }, [state, executeRequest, addHistory]);

  // Handle retry with extension
  const handleRetryWithExtension = useCallback(async () => {
    updateState({ selectedMode: 'extension' });
    // Wait for state update then execute
    setTimeout(() => {
      executeRequest({ ...state, selectedMode: 'extension' });
    }, 0);
  }, [state, updateState, executeRequest]);

  // Handle history item select
  const handleHistorySelect = useCallback(
    (item: HistoryItem) => {
      updateState({
        method: item.request.method,
        url: item.request.url,
        headers:
          item.request.headers.length > 0 ? item.request.headers : [createKeyValueItem('Content-Type', 'application/json')],
        body: item.request.body,
        queryParams: parseUrlParams(item.request.url).length > 0 ? parseUrlParams(item.request.url) : [createKeyValueItem()],
      });
      clearResponse();
    },
    [updateState, clearResponse]
  );

  // Copy as cURL
  const handleCopyCurl = useCallback(async () => {
    const curl = toCurlCommand(state);
    await copyToClipboard(curl);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  }, [state]);

  // Check if response has CORS error
  const hasCorsError = response?.error?.code === 'CORS_ERROR';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <ToolHeader
            title={t('tool.apiTester.title')}
            description={t('tool.apiTester.description')}
            onReset={resetState}
            onShare={handleShare}
          />
          <div className="flex items-center gap-4">
            <ExtensionStatus status={extensionStatus} onRetry={checkExtension} />
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showHistory
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {showHistory ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* URL bar */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <MethodSelector value={state.method} onChange={handleMethodChange} disabled={isLoading} />
              <UrlInput
                value={state.url}
                onChange={handleUrlChange}
                placeholder="https://api.example.com/v1/users"
                disabled={isLoading}
              />
              <SendButton
                onClick={handleSend}
                onCancel={cancelRequest}
                isLoading={isLoading}
                mode={state.selectedMode}
                disabled={!state.url.trim()}
              />
            </div>

            {/* Mode selector and tools */}
            <div className="flex items-center justify-between mt-3">
              <ExtensionModeSelector
                mode={state.selectedMode}
                onChange={(mode) => updateState({ selectedMode: mode })}
                extensionStatus={extensionStatus}
                disabled={isLoading}
              />
              <button
                onClick={handleCopyCurl}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg',
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                  'transition-colors'
                )}
              >
                {curlCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span>Copy as cURL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Request/Response split */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Request builder */}
            <div className="flex-1 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              {/* Tabs */}
              <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {(['params', 'headers', 'body'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => updateState({ activeTab: tab })}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md transition-colors capitalize',
                      state.activeTab === tab
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {tab === 'params'
                      ? `Query (${state.queryParams.filter((p) => p.key).length})`
                      : tab === 'headers'
                      ? `Headers (${state.headers.filter((h) => h.key).length})`
                      : 'Body'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto p-4">
                {state.activeTab === 'params' && (
                  <KeyValueEditor
                    items={state.queryParams}
                    onChange={(queryParams) => updateState({ queryParams })}
                    keyPlaceholder="Parameter"
                    valuePlaceholder="Value"
                    disabled={isLoading}
                  />
                )}

                {state.activeTab === 'headers' && (
                  <KeyValueEditor
                    items={state.headers}
                    onChange={(headers) => updateState({ headers })}
                    keyPlaceholder="Header"
                    valuePlaceholder="Value"
                    keyAutocomplete={COMMON_HEADERS}
                    valueAutocomplete={COMMON_CONTENT_TYPES}
                    disabled={isLoading}
                  />
                )}

                {state.activeTab === 'body' && (
                  <BodyEditor
                    body={state.body}
                    onChange={(body) => updateState({ body })}
                    disabled={isLoading || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(state.method)}
                  />
                )}
              </div>
            </div>

            {/* Response viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
              {hasCorsError && state.selectedMode === 'direct' ? (
                <div className="p-4">
                  <CorsErrorBanner
                    onRetryWithExtension={handleRetryWithExtension}
                    extensionStatus={extensionStatus}
                  />
                </div>
              ) : (
                <ResponseViewer response={response} isLoading={isLoading} />
              )}
            </div>
          </div>
        </div>

        {/* History sidebar */}
        <HistorySidebar
          history={history}
          favorites={favorites}
          onSelect={handleHistorySelect}
          onToggleFavorite={toggleFavorite}
          onDelete={removeHistory}
          onClear={clearHistory}
          onRename={renameHistory}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </div>

      <ShareModal {...shareModalProps} />
    </div>
  );
};

export const apiTesterTool: ToolDefinition<ApiTesterState> = {
  id: 'api-tester',
  title: 'API Tester',
  description: 'Test REST APIs with request builder and CORS bypass',
  icon: Globe,
  path: '/api-tester',
  i18nKey: 'apiTester',
  keywords: ['api', 'rest', 'http', 'request', 'postman', 'fetch', 'curl', 'cors'],
  category: 'tester',
  defaultState: DEFAULT_STATE,
  Component: ApiTesterTool,
};

export default apiTesterTool;

