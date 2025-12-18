/* eslint-disable react-refresh/only-export-components */
/**
 * API Tester Tool
 *
 * A powerful API testing tool with CORS bypass support via Chrome Extension.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Globe, Check, Terminal, Cookie, HelpCircle, GitCompare, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ToolDefinition } from '@/tools/types';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ShareModal } from '@/components/common/ShareModal';
import { AdsenseFooter } from '@/components/common/AdsenseFooter';
import { Tooltip } from '@/components/ui/Tooltip';
import { ResizablePanels } from '@/components/common/ResizablePanels';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';

import type { ApiTesterState, HttpMethod, HistoryItem } from './types';
import { COMMON_HEADERS, COMMON_CONTENT_TYPES, BODY_SUPPORTED_METHODS } from './types';
import { createKeyValueItem, toCurlCommand, parseUrlParams, sanitizeUrlAndParams } from './utils';
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
import { getStoredApiTesterState, clearStoredApiTesterState, convertToApiTesterState } from '@/lib/curl/convertToApiTester';
import { isCurlCommand } from '@/lib/curl/detectCurl';
import { parseCurl } from '@/lib/curl/parseCurl';
import { toast } from 'sonner';

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
  const navigate = useNavigate();
  useTitle(t('tool.apiTester.title'));

  // Check for stored cURL parse result on mount
  const [initialStateFromCurl] = React.useState<Partial<ApiTesterState> | null>(() => {
    const stored = getStoredApiTesterState();
    if (stored) {
      clearStoredApiTesterState();
      return stored;
    }
    return null;
  });

  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<ApiTesterState>('api-tester', DEFAULT_STATE, {
      // Only include essential fields for API request reproduction
      shareStateFilter: ({ method, url, queryParams, headers, body, includeCookies }) => {
        // Filter enabled items only for queryParams and headers
        const enabledQueryParams = queryParams.filter((p) => p.enabled && p.key);
        const enabledHeaders = headers.filter((h) => h.enabled && h.key);

        // Build minimal share state
        const shareState: Record<string, unknown> = {
          method,
          url,
          includeCookies,
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
  const [showHistory, setShowHistory] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [queryExpanded, setQueryExpanded] = useState(true);
  const [headersExpanded, setHeadersExpanded] = useState(false);
  const [corsModalOpen, setCorsModalOpen] = useState(false);
  const [pendingCorsRetry, setPendingCorsRetry] = useState(false);
  const [apiDiffDropdownOpen, setApiDiffDropdownOpen] = useState(false);
  const apiDiffDropdownRef = useRef<HTMLDivElement>(null);

  // Apply stored cURL parse result on mount
  useEffect(() => {
    if (initialStateFromCurl) {
      updateState(initialStateFromCurl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Handle URL paste - detect cURL commands
  const handleUrlPaste = useCallback(
    (pastedText: string) => {
      if (isCurlCommand(pastedText)) {
        try {
          const parseResult = parseCurl(pastedText);
          const apiTesterState = convertToApiTesterState(parseResult);
          
          // Update state with parsed cURL data
          updateState(apiTesterState);
          
          toast.success('cURL parsed and applied');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to parse cURL command';
          toast.error(`cURL parse failed: ${errorMessage}`, {
            action: {
              label: 'Paste as URL',
              onClick: () => {
                updateState({ url: pastedText });
                // Parse query params from URL
                const parsedParams = parseUrlParams(pastedText);
                if (parsedParams.length > 0) {
                  updateState({ queryParams: [...parsedParams, createKeyValueItem()] });
                }
              },
            },
          });
        }
      } else {
        // Not a cURL command, paste as URL
        updateState({ url: pastedText });
        // Parse query params from URL
        const parsedParams = parseUrlParams(pastedText);
        if (parsedParams.length > 0) {
          updateState({ queryParams: [...parsedParams, createKeyValueItem()] });
        }
      }
    },
    [updateState]
  );

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
    
    // Sanitize URL: extract query params from URL and merge with existing params
    const { sanitizedUrl, mergedParams } = sanitizeUrlAndParams(state.url, state.queryParams);
    
    // Update state if URL was sanitized (has query params in URL)
    let requestState = state;
    if (sanitizedUrl !== state.url) {
      updateState({ url: sanitizedUrl, queryParams: mergedParams });
      requestState = { ...state, url: sanitizedUrl, queryParams: mergedParams };
    }
    
    // Check if this origin is in the CORS allowlist
    const shouldUseExtension = isCorsAllowed(requestState.url) && extensionStatus === 'connected';
    
    if (shouldUseExtension) {
      console.log('[API Tester] Origin in CORS allowlist, using extension automatically');
    }
    
    await executeWithAutoMode(requestState, shouldUseExtension);
  }, [state, executeWithAutoMode, isCorsAllowed, extensionStatus, updateState]);

  // Keyboard shortcut: Cmd+Enter (Mac) or Ctrl+Enter (Windows) to send request
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && state.url.trim()) {
          handleSend();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSend, isLoading, state.url]);

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

  // Send to API Diff
  const handleSendToApiDiff = useCallback((targetDomain: 'A' | 'B') => {
    setApiDiffDropdownOpen(false);
    
    // Extract domain and path from URL
    let domain = '';
    let path = '';
    
    try {
      const urlObj = new URL(state.url);
      domain = urlObj.origin;
      path = urlObj.pathname + urlObj.search;
    } catch {
      // If URL parsing fails, use the whole URL as path
      path = state.url;
    }
    
    // Convert headers to key-value pairs format (with new IDs to avoid conflicts)
    const headers = state.headers
      .filter((h) => h.enabled && h.key)
      .map((h) => ({ id: crypto.randomUUID(), key: h.key, value: h.value }));
    
    // Convert query params to key-value pairs format (with new IDs to avoid conflicts)
    const params = state.queryParams
      .filter((p) => p.enabled && p.key)
      .map((p) => ({ id: crypto.randomUUID(), key: p.key, value: p.value }));
    
    // Build body string
    let bodyStr = '';
    if (state.body.kind === 'text' || state.body.kind === 'json') {
      bodyStr = state.body.text || '';
    } else if (state.body.kind === 'urlencoded') {
      const enabledItems = state.body.items.filter((i) => i.enabled && i.key);
      bodyStr = enabledItems.map((i) => `${encodeURIComponent(i.key)}=${encodeURIComponent(i.value)}`).join('&');
    }
    
    // Build state data for API Diff (matching ApiDiffState structure)
    // Use location.state to pass data directly to useToolState
    const apiDiffState = {
      tool: 'api-diff', // Tool identifier for useToolState validation
      method: state.method,
      path,
      params: params.length > 0 ? params : [{ id: crypto.randomUUID(), key: '', value: '' }],
      headers: headers.length > 0 ? headers : [{ id: crypto.randomUUID(), key: '', value: '' }],
      body: bodyStr,
      domainA: targetDomain === 'A' ? domain : '',
      domainB: targetDomain === 'B' ? domain : '',
      includeCookies: state.includeCookies, // Pass the current includeCookies setting
      // Response state (not persisted)
      responseA: null,
      responseB: null,
      isExecuting: false,
      // UI state
      activeTabA: 'body',
      activeTabB: 'body',
    };
    
    // Navigate to API Diff with state
    navigate('/api-diff', { state: apiDiffState });
    toast.success(t('tool.apiTester.sentToApiDiff').replace('{domain}', targetDomain));
  }, [state, navigate, t]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (apiDiffDropdownRef.current && !apiDiffDropdownRef.current.contains(e.target as Node)) {
        setApiDiffDropdownOpen(false);
      }
    };
    
    if (apiDiffDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [apiDiffDropdownOpen]);

  // Count active query params and headers
  const activeQueryCount = state.queryParams.filter((p) => p.key && p.enabled).length;
  const activeHeaderCount = state.headers.filter((h) => h.key && h.enabled).length;
  const supportsBody = BODY_SUPPORTED_METHODS.includes(state.method);

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-[90rem] mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 pb-3 border-b border-gray-200 dark:border-gray-700">
        <ToolHeader
          title={t('tool.apiTester.title')}
          description={t('tool.apiTester.description')}
          onReset={resetState}
          onShare={handleShare}
        />
      </div>

      {/* Main content - full width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* URL bar */}
        <div className="flex-shrink-0 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-4 md:-mx-6 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MethodSelector value={state.method} onChange={handleMethodChange} disabled={isLoading} />
            <UrlInput
              value={state.url}
              onChange={handleUrlChange}
              onPaste={handleUrlPaste}
              placeholder={t('tool.apiTester.urlPlaceholder')}
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
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <ExtensionStatus status={extensionStatus} onRetry={checkExtension} />
              
              {/* Include Cookies checkbox - only show when extension is available */}
              {extensionStatus === 'connected' && (
                <div className="flex items-center gap-1.5">
                  <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.includeCookies}
                      onChange={(e) => updateState({ includeCookies: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      disabled={isLoading}
                    />
                    <Cookie className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('tool.apiTester.includeCookies')}</span>
                  </label>
                  <Tooltip content={t('tool.apiTester.includeCookiesTooltip')} position="bottom" nowrap={false}>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
                  </Tooltip>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCurl}
                className={cn(
                  'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg',
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                  'transition-colors'
                )}
                title="Copy as cURL"
              >
                {curlCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy as cURL</span>
                  </>
                )}
              </button>
              
              {/* Send to API Diff dropdown */}
              <div className="relative" ref={apiDiffDropdownRef}>
                <button
                  onClick={() => setApiDiffDropdownOpen(!apiDiffDropdownOpen)}
                  disabled={!state.url.trim()}
                  className={cn(
                    'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md',
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                    'border border-blue-200 dark:border-blue-800',
                    'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                    'hover:border-blue-300 dark:hover:border-blue-700',
                    'transition-all duration-200',
                    'shadow-sm hover:shadow',
                    !state.url.trim() && 'opacity-50 cursor-not-allowed'
                  )}
                  title={t('tool.apiTester.sendToApiDiff')}
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('tool.apiTester.sendToApiDiff')}</span>
                  <ChevronDown className={cn('w-3 h-3 transition-transform', apiDiffDropdownOpen && 'rotate-180')} />
                </button>
                
                {apiDiffDropdownOpen && (
                  <div className={cn(
                    'absolute right-0 top-full mt-1 z-50',
                    'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
                    'py-1 min-w-40'
                  )}>
                    <button
                      onClick={() => handleSendToApiDiff('A')}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm',
                        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                        'flex items-center gap-2'
                      )}
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">A</span>
                      {t('tool.apiTester.setAsDomainA')}
                    </button>
                    <button
                      onClick={() => handleSendToApiDiff('B')}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm',
                        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                        'flex items-center gap-2'
                      )}
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">B</span>
                      {t('tool.apiTester.setAsDomainB')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Request/Response split - Resizable */}
        <ResizablePanels
          leftPanel={
            <div className="flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700 h-full">
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
          }
          rightPanel={
            <div className="flex flex-col overflow-hidden bg-white dark:bg-gray-900 h-full">
              <ResponseViewer response={response} isLoading={isLoading} />
            </div>
          }
          initialLeftWidth={50}
          minLeftWidth={25}
          maxLeftWidth={75}
          storageKey="api-tester:request-response-split"
        />
      </div>

      {/* History sidebar - Overlay */}
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

      {/* CORS Error Modal */}
      <CorsModal
        isOpen={corsModalOpen}
        onClose={() => setCorsModalOpen(false)}
        onRetryWithExtension={handleRetryWithExtension}
        extensionStatus={extensionStatus}
        targetUrl={state.url}
      />

      <ShareModal {...shareModalProps} />

      <AdsenseFooter />
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
