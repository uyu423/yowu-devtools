/* eslint-disable react-refresh/only-export-components */
/**
 * API Tester Tool
 *
 * A powerful API testing tool with CORS bypass support via Chrome Extension.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Globe, Check, Terminal, Cookie } from 'lucide-react';
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
import { COMMON_HEADERS, COMMON_CONTENT_TYPES, BODY_SUPPORTED_METHODS } from './types';
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
  CollapsibleSection,
  CorsModal,
} from './components';
import { useRequestExecutor, useApiHistory, useCorsAllowlist } from './hooks';

const DEFAULT_STATE: ApiTesterState = {
  method: 'GET',
  url: '',
  queryParams: [createKeyValueItem()],
  headers: [createKeyValueItem('Content-Type', 'application/json')],
  body: { kind: 'none' },
  timeoutMs: 30000,
  followRedirects: true,
  credentials: 'omit',
  includeCookies: false,
  selectedMode: 'direct',
  activeTab: 'params',
  responseTab: 'body',
};

const ApiTesterTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.apiTester.title'));

  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<ApiTesterState>('api-tester', DEFAULT_STATE, {
      // Only include essential fields for API request reproduction
      shareStateFilter: ({ method, url, queryParams, headers, body }) => {
        // Filter enabled items only for queryParams and headers
        const enabledQueryParams = queryParams.filter((p) => p.enabled && p.key);
        const enabledHeaders = headers.filter((h) => h.enabled && h.key);

        // Build minimal share state
        const shareState: Record<string, unknown> = {
          method,
          url,
        };

        // Only include queryParams if there are enabled items
        if (enabledQueryParams.length > 0) {
          shareState.queryParams = enabledQueryParams.map(({ key, value }) => ({ key, value }));
        }

        // Only include headers if there are enabled items (excluding default Content-Type)
        const nonDefaultHeaders = enabledHeaders.filter(
          (h) => !(h.key === 'Content-Type' && h.value === 'application/json')
        );
        if (nonDefaultHeaders.length > 0) {
          shareState.headers = nonDefaultHeaders.map(({ key, value }) => ({ key, value }));
        }

        // Only include body if it's not 'none'
        if (body.kind !== 'none') {
          if (body.kind === 'urlencoded') {
            const enabledItems = body.items.filter((i) => i.enabled && i.key);
            if (enabledItems.length > 0) {
              shareState.body = {
                kind: 'urlencoded',
                items: enabledItems.map(({ key, value }) => ({ key, value })),
              };
            }
          } else if (body.kind === 'multipart') {
            // For multipart, only include text items (files are too large for URL)
            const textItems = body.items.filter((i) => i.type === 'text' && i.key);
            if (textItems.length > 0) {
              shareState.body = {
                kind: 'multipart',
                items: textItems.map(({ key, textValue }) => ({ key, textValue })),
              };
            }
          } else {
            // text or json - include as is
            shareState.body = body;
          }
        }

        return shareState;
      },
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

  const { isAllowed: isCorsAllowed, addOrigin: addCorsOrigin } = useCorsAllowlist();

  // UI state
  const [showHistory, setShowHistory] = useState(true); // Default expanded
  const [curlCopied, setCurlCopied] = useState(false);
  const [queryExpanded, setQueryExpanded] = useState(true);
  const [headersExpanded, setHeadersExpanded] = useState(false);
  const [corsModalOpen, setCorsModalOpen] = useState(false);
  const [pendingCorsRetry, setPendingCorsRetry] = useState(false);

  // Check if response has CORS error (only for direct/cors mode requests)
  const hasCorsError = response?.error?.code === 'CORS_ERROR' && response?.method === 'cors';

  // Show CORS modal when CORS error detected
  // Using a ref-based approach to avoid setState in effect
  const prevHasCorsError = React.useRef(false);
  useEffect(() => {
    console.log('[API Tester] CORS modal check:', {
      hasCorsError,
      prevHasCorsError: prevHasCorsError.current,
      responseMethod: response?.method,
      pendingCorsRetry,
    });
    
    // Only show modal when CORS error transitions from false to true
    if (hasCorsError && !prevHasCorsError.current && !pendingCorsRetry) {
      console.log('[API Tester] Opening CORS modal');
      // Use timeout to avoid setState directly in effect
      const timeoutId = setTimeout(() => setCorsModalOpen(true), 0);
      return () => clearTimeout(timeoutId);
    }
    prevHasCorsError.current = hasCorsError;
  }, [hasCorsError, response?.method, pendingCorsRetry]);

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
      if (!BODY_SUPPORTED_METHODS.includes(method)) {
        updateState({ body: { kind: 'none' } });
      }
    },
    [updateState]
  );

  // Execute request with auto mode selection
  const executeWithAutoMode = useCallback(async (requestState: ApiTesterState, forceExtension: boolean = false) => {
    const mode = forceExtension ? 'extension' : 'direct';
    console.log('[API Tester] Executing request with mode:', mode, 'url:', requestState.url);
    
    const result = await executeRequest({ ...requestState, selectedMode: mode });
    console.log('[API Tester] Request result:', result);

    // Add to history
    addHistory(requestState, {
      status: result.status,
      statusText: result.statusText,
      timingMs: result.timingMs,
    });

    return result;
  }, [executeRequest, addHistory]);

  // Handle send request with automatic CORS bypass for allowed origins
  const handleSend = useCallback(async () => {
    if (!state.url.trim()) return;
    setPendingCorsRetry(false);
    
    // Check if this origin is in the CORS allowlist
    const shouldUseExtension = isCorsAllowed(state.url) && extensionStatus === 'connected';
    
    if (shouldUseExtension) {
      console.log('[API Tester] Origin in CORS allowlist, using extension automatically');
    }
    
    await executeWithAutoMode(state, shouldUseExtension);
  }, [state, executeWithAutoMode, isCorsAllowed, extensionStatus]);

  // Handle retry with extension (from modal)
  const handleRetryWithExtension = useCallback(async (rememberChoice: boolean) => {
    console.log('[API Tester] Retrying with extension, remember:', rememberChoice);
    setCorsModalOpen(false);
    setPendingCorsRetry(true);
    
    // Add to allowlist if user wants to remember
    if (rememberChoice && state.url) {
      addCorsOrigin(state.url);
    }
    
    clearResponse();
    await executeWithAutoMode(state, true);
  }, [state, executeWithAutoMode, clearResponse, addCorsOrigin]);

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

  // Count active query params and headers
  const activeQueryCount = state.queryParams.filter((p) => p.key && p.enabled).length;
  const activeHeaderCount = state.headers.filter((h) => h.key && h.enabled).length;
  const supportsBody = BODY_SUPPORTED_METHODS.includes(state.method);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <ToolHeader
          title={t('tool.apiTester.title')}
          description={t('tool.apiTester.description')}
          onReset={resetState}
          onShare={handleShare}
        />
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

            {/* Extension status, Include Cookies, and Copy as cURL */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <ExtensionStatus status={extensionStatus} onRetry={checkExtension} />
                
                {/* Include Cookies checkbox - only show when extension is available */}
                {extensionStatus === 'connected' && (
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.includeCookies}
                      onChange={(e) => updateState({ includeCookies: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      disabled={isLoading}
                    />
                    <Cookie className="w-4 h-4" />
                    <span>Include Cookies</span>
                  </label>
                )}
              </div>
              
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
            {/* Request builder - vertical sections */}
            <div className="flex-1 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
              <div className="flex-1 overflow-auto">
                {/* Query Parameters Section */}
                <CollapsibleSection
                  title="Query Parameters"
                  count={activeQueryCount}
                  isOpen={queryExpanded}
                  onToggle={() => setQueryExpanded(!queryExpanded)}
                >
                  <KeyValueEditor
                    items={state.queryParams}
                    onChange={(queryParams) => updateState({ queryParams })}
                    keyPlaceholder="Parameter"
                    valuePlaceholder="Value"
                    disabled={isLoading}
                  />
                </CollapsibleSection>

                {/* Headers Section */}
                <CollapsibleSection
                  title="Headers"
                  count={activeHeaderCount}
                  isOpen={headersExpanded}
                  onToggle={() => setHeadersExpanded(!headersExpanded)}
                >
                  <KeyValueEditor
                    items={state.headers}
                    onChange={(headers) => updateState({ headers })}
                    keyPlaceholder="Header"
                    valuePlaceholder="Value"
                    keyAutocomplete={COMMON_HEADERS}
                    valueAutocomplete={COMMON_CONTENT_TYPES}
                    disabled={isLoading}
                  />
                </CollapsibleSection>

                {/* Body Section - only for methods that support it */}
                {supportsBody && (
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Request Body
                    </h3>
                    <BodyEditor
                      body={state.body}
                      onChange={(body) => updateState({ body })}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Response viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
              <ResponseViewer response={response} isLoading={isLoading} />
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
          onToggle={() => setShowHistory(!showHistory)}
        />
      </div>

      {/* CORS Error Modal */}
      <CorsModal
        isOpen={corsModalOpen}
        onClose={() => setCorsModalOpen(false)}
        onRetryWithExtension={handleRetryWithExtension}
        extensionStatus={extensionStatus}
        targetUrl={state.url}
      />

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
