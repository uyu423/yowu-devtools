/* eslint-disable react-refresh/only-export-components */
/**
 * API Burst Test Tool
 *
 * hey CLI-inspired HTTP load testing tool for browser.
 * Reference: https://github.com/rakyll/hey
 */

import {
  AcknowledgmentModal,
  BodyEditor,
  DetailedSummary,
  ErrorsTable,
  ExportButtons,
  HeadersEditor,
  LatencyDistribution,
  LatencyHistogram,
  LoadModeForm,
  NetworkTimingInfo,
  ParamsEditor,
  PreflightWarning,
  RunControlBar,
  StatusCodeChart,
  SummaryCards,
  TabVisibilityWarning,
  TimeSeriesChart,
  UrlMethodInput,
  WarningBanner,
} from './components';
import type {
  ApiBurstTestState,
  BurstBody,
  BurstHeaderItem,
  BurstHttpMethod,
  BurstParamItem,
  BurstProgress,
  BurstTestResults,
  LoadMode,
  RateLimit,
} from './types';
import { ChevronDown, ChevronUp, Flame, Info } from 'lucide-react';
import { DEFAULT_BURST_STATE, NO_BODY_METHODS } from './types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { runBurstTest, type RequestExecutor } from './core';

import { ShareModal } from '@/components/common/ShareModal';
import { GoogleAdsenseBlock } from '@/components/common/GoogleAdsenseBlock';
import type { ToolDefinition } from '@/tools/types';
import { ToolHeader } from '@/components/common/ToolHeader';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
// Import extension hook from shared hooks
import { useExtension } from '@/hooks/useExtension';
import { useI18n } from '@/hooks/useI18nHooks';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useToolState } from '@/hooks/useToolState';

// Detect OS for keyboard shortcut
const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

const ApiBurstTestTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.apiBurstTest.title'));

  // Tool state (persisted)
  const {
    state,
    updateState,
    resetState,
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
  } = useToolState<ApiBurstTestState>('api-burst-test', DEFAULT_BURST_STATE, {
    shareStateFilter: ({
      url,
      method,
      params,
      headers,
      body,
      concurrency,
      loadMode,
      rateLimit,
      timeoutMs,
      sharePrivacy,
    }) => {
      const shareState: Record<string, unknown> = {
        url,
        method,
        concurrency,
        loadMode,
        rateLimit,
        timeoutMs,
      };

      // Include params if any
      if (params.length > 0) {
        shareState.params = params
          .filter((p) => p.enabled && p.key)
          .map(({ key, value }) => ({ key, value }));
      }

      // Include headers only if privacy allows
      if (sharePrivacy.includeHeaders && headers.length > 0) {
        shareState.headers = headers
          .filter((h) => h.enabled && h.key)
          .map(({ key, value }) => ({ key, value }));
      }

      // Include body if not empty
      if (body.text.trim()) {
        shareState.body = body;
      }

      return shareState;
    },
  });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.apiBurstTest.title'),
  });

  // Chrome extension status
  const {
    status: extensionStatus,
    checkConnection: checkExtension,
    executeRequest,
  } = useExtension({ autoCheck: true });

  // Check if desktop (lg breakpoint = 1024px)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  // UI state - on mobile, collapse sections by default to save space
  const [showAcknowledgment, setShowAcknowledgment] = useState(false);
  const [sessionAcknowledged, setSessionAcknowledged] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<BurstProgress | null>(null);
  const [results, setResults] = useState<BurstTestResults | null>(null);
  const [loadConfigExpanded, setLoadConfigExpanded] = useState(isDesktop);
  const [paramsExpanded, setParamsExpanded] = useState(false);
  const [headersExpanded, setHeadersExpanded] = useState(false);
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [resultsTab, setResultsTab] = useState<'summary' | 'details'>(
    'summary'
  );

  // Abort controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Validation errors
  const validationError = React.useMemo(() => {
    if (state.url.trim() === '') {
      return null; // URL empty is handled by disabling button
    }
    if (
      state.loadMode.type === 'requests' &&
      state.concurrency > state.loadMode.n
    ) {
      return t('tool.apiBurstTest.error.concurrencyExceedsRequests');
    }
    return null;
  }, [state.url, state.loadMode, state.concurrency, t]);

  // Check if can run
  const canRun = state.url.trim() !== '' && !isRunning && !validationError;

  // Check if method supports body
  const methodSupportsBody = !NO_BODY_METHODS.includes(state.method);

  // Create request executor that uses extension when connected
  const createRequestExecutor = useCallback((): RequestExecutor | undefined => {
    if (extensionStatus !== 'connected') {
      return undefined; // Use default fetch
    }

    // Return extension-based executor
    return async (
      url: string,
      options: RequestInit,
      timeoutMs: number
    ): Promise<Response> => {
      // Convert headers from Record to Array format expected by extension
      const headersArray: Array<{
        key: string;
        value: string;
        enabled: boolean;
      }> = [];
      if (options.headers) {
        const h = options.headers as Record<string, string>;
        Object.entries(h).forEach(([key, value]) => {
          headersArray.push({ key, value, enabled: true });
        });
      }

      // Build request body in RequestBody format
      type RequestBody =
        | { kind: 'none' }
        | { kind: 'text'; text: string }
        | { kind: 'json'; text: string };

      let requestBody: RequestBody = { kind: 'none' };
      if (options.body) {
        const bodyStr = String(options.body);
        // Check if it's JSON
        const contentType =
          headersArray.find((h) => h.key.toLowerCase() === 'content-type')
            ?.value || '';
        if (contentType.includes('application/json')) {
          requestBody = { kind: 'json', text: bodyStr };
        } else {
          requestBody = { kind: 'text', text: bodyStr };
        }
      }

      const responseSpec = await executeRequest({
        id: crypto.randomUUID(),
        method: (options.method || 'GET') as
          | 'GET'
          | 'POST'
          | 'PUT'
          | 'DELETE'
          | 'PATCH'
          | 'HEAD'
          | 'OPTIONS',
        url,
        headers: headersArray,
        body: requestBody,
        options: {
          timeoutMs,
          redirect: 'follow',
          credentials: state.includeCookies ? 'include' : 'omit',
          includeCookies: state.includeCookies,
        },
      });

      // Create a Response-like object from extension response
      // responseSpec.body is { kind: 'text' | 'base64', data: string } or undefined
      let bodyData = '';
      if (responseSpec.body) {
        if (responseSpec.body.kind === 'base64') {
          // Decode base64
          bodyData = atob(responseSpec.body.data);
        } else {
          bodyData = responseSpec.body.data;
        }
      }

      return new Response(bodyData, {
        status: responseSpec.status,
        statusText: responseSpec.statusText,
        headers: new Headers(responseSpec.headers || {}),
      });
    };
  }, [extensionStatus, executeRequest, state.includeCookies]);

  // Handlers
  const handleUrlChange = useCallback(
    (url: string) => {
      updateState({ url });
    },
    [updateState]
  );

  const handleMethodChange = useCallback(
    (method: BurstHttpMethod) => {
      updateState({ method });
    },
    [updateState]
  );

  const handleParamsChange = useCallback(
    (params: BurstParamItem[]) => {
      updateState({ params });
    },
    [updateState]
  );

  const handleHeadersChange = useCallback(
    (headers: BurstHeaderItem[]) => {
      updateState({ headers });
    },
    [updateState]
  );

  const handleBodyChange = useCallback(
    (body: BurstBody) => {
      updateState({ body });
    },
    [updateState]
  );

  const handleConcurrencyChange = useCallback(
    (concurrency: number) => {
      updateState({ concurrency });
    },
    [updateState]
  );

  const handleLoadModeChange = useCallback(
    (loadMode: LoadMode) => {
      updateState({ loadMode });
    },
    [updateState]
  );

  const handleRateLimitChange = useCallback(
    (rateLimit: RateLimit) => {
      updateState({ rateLimit });
    },
    [updateState]
  );

  const handleTimeoutChange = useCallback(
    (timeoutMs: number) => {
      updateState({ timeoutMs });
    },
    [updateState]
  );

  // Execute test (internal function without acknowledgment check)
  const executeTest = useCallback(async () => {
    setIsRunning(true);
    setProgress({
      completedRequests: 0,
      totalRequests: state.loadMode.n,
      elapsedMs: 0,
      durationMs: state.loadMode.durationMs,
      currentRps: 0,
      isRunning: true,
      effectiveConcurrency: 0,
    });
    setResults(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Get request executor (extension-based if connected, otherwise default fetch)
      const requestExecutor = createRequestExecutor();

      // Run the burst test using the engine
      const testResults = await runBurstTest({
        state,
        abortController: controller,
        requestExecutor,
        onProgress: (progressUpdate) => {
          setProgress(progressUpdate);
        },
      });

      setResults(testResults);
    } catch (error) {
      console.error('Burst test error:', error);
    } finally {
      setIsRunning(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  }, [state, createRequestExecutor]);

  // Run test (with acknowledgment check)
  const handleRun = useCallback(() => {
    // Check acknowledgment first
    if (!sessionAcknowledged) {
      setShowAcknowledgment(true);
      return;
    }
    executeTest();
  }, [sessionAcknowledged, executeTest]);

  // Stop test
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    resetState();
    setResults(null);
    setProgress(null);
  }, [resetState]);

  // Acknowledgment confirm
  const handleAcknowledgmentConfirm = useCallback(() => {
    setSessionAcknowledged(true);
    setShowAcknowledgment(false);
    // Execute test directly (no need to check acknowledgment again)
    executeTest();
  }, [executeTest]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canRun) {
          handleRun();
        }
      }
      // Escape to stop
      if (e.key === 'Escape' && isRunning) {
        e.preventDefault();
        handleStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canRun, isRunning, handleRun, handleStop]);

  // Warn before closing tab while test is running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but this triggers the dialog
        e.returnValue =
          'Test is still running. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <ToolHeader
          title={t('tool.apiBurstTest.title')}
          description={t('tool.apiBurstTest.description')}
          onReset={handleReset}
          onShare={handleShare}
          beta
        />
      </div>

      {/* Warning Banner - Always visible */}
      <WarningBanner className="mb-4" />

      {/* Tab Visibility Warning - Only visible when test is running and tab is hidden */}
      <TabVisibilityWarning isRunning={isRunning} className="mb-4" />

      {/* Preflight Warning - Shows when settings trigger CORS preflight */}
      {state.url && !isRunning && (
        <PreflightWarning state={state} className="mb-4" />
      )}

      {/* Run Control Bar with Extension Status */}
      <RunControlBar
        isRunning={isRunning}
        canRun={canRun}
        progress={progress}
        loadMode={state.loadMode}
        extensionStatus={extensionStatus}
        includeCookies={state.includeCookies}
        onIncludeCookiesChange={(value) =>
          updateState({ includeCookies: value })
        }
        onRun={handleRun}
        onStop={handleStop}
        onExtensionRetry={checkExtension}
      />

      {/* Main content - 2 column layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 mt-4 min-h-0">
        {/* Left: Request Configuration */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3 lg:gap-4 lg:overflow-y-auto">
          {/* URL and Method */}
          <div
            className={cn(
              'p-4 rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700'
            )}
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('tool.apiBurstTest.target')}
            </h3>
            <UrlMethodInput
              url={state.url}
              method={state.method}
              onUrlChange={handleUrlChange}
              onMethodChange={handleMethodChange}
              disabled={isRunning}
            />
          </div>

          {/* Load Configuration - Collapsible */}
          <div
            className={cn(
              'rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700'
            )}
          >
            <button
              onClick={() => setLoadConfigExpanded(!loadConfigExpanded)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('tool.apiBurstTest.loadConfig')}
              </h3>
              {loadConfigExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {loadConfigExpanded && (
              <div className="px-4 pb-4">
                <LoadModeForm
                  concurrency={state.concurrency}
                  useHttp2={state.useHttp2}
                  loadMode={state.loadMode}
                  rateLimit={state.rateLimit}
                  timeoutMs={state.timeoutMs}
                  bodyHandling={state.bodyHandling}
                  onConcurrencyChange={handleConcurrencyChange}
                  onHttp2Change={(enabled) =>
                    updateState({ useHttp2: enabled })
                  }
                  onLoadModeChange={handleLoadModeChange}
                  onRateLimitChange={handleRateLimitChange}
                  onTimeoutChange={handleTimeoutChange}
                  onBodyHandlingChange={(bodyHandling) =>
                    updateState({ bodyHandling })
                  }
                  disabled={isRunning}
                />
              </div>
            )}
          </div>

          {/* Parameters - Collapsible */}
          <div
            className={cn(
              'rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700'
            )}
          >
            <button
              onClick={() => setParamsExpanded(!paramsExpanded)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('tool.apiBurstTest.params')}
                </h3>
                {state.params.filter((p) => p.enabled && p.key).length > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {state.params.filter((p) => p.enabled && p.key).length}
                  </span>
                )}
              </div>
              {paramsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {paramsExpanded && (
              <div className="px-4 pb-4">
                <ParamsEditor
                  params={state.params}
                  onChange={handleParamsChange}
                  disabled={isRunning}
                />
              </div>
            )}
          </div>

          {/* Headers - Collapsible */}
          <div
            className={cn(
              'rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700'
            )}
          >
            <button
              onClick={() => setHeadersExpanded(!headersExpanded)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('tool.apiBurstTest.headers')}
                </h3>
                {state.headers.filter((h) => h.enabled && h.key).length > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {state.headers.filter((h) => h.enabled && h.key).length}
                  </span>
                )}
              </div>
              {headersExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {headersExpanded && (
              <div className="px-4 pb-4">
                <HeadersEditor
                  headers={state.headers}
                  onChange={handleHeadersChange}
                  disabled={isRunning}
                />
              </div>
            )}
          </div>

          {/* Body - Collapsible */}
          <div
            className={cn(
              'rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700'
            )}
          >
            <button
              onClick={() => setBodyExpanded(!bodyExpanded)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('tool.apiBurstTest.body.label')}
                </h3>
                {!methodSupportsBody && (
                  <Tooltip content={t('tool.apiBurstTest.body.notSupported')}>
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                )}
              </div>
              {bodyExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {bodyExpanded && (
              <div className="px-4 pb-4">
                <BodyEditor
                  body={state.body}
                  onChange={handleBodyChange}
                  disabled={isRunning}
                  methodSupportsBody={methodSupportsBody}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Results */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3 lg:gap-4 lg:overflow-y-auto">
          {/* Results Section */}
          <div
            className={cn(
              'rounded-xl',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'lg:flex-1 lg:overflow-hidden lg:flex lg:flex-col'
            )}
          >
            {/* Results tabs header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1">
                <button
                  onClick={() => setResultsTab('summary')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg',
                    'transition-colors',
                    resultsTab === 'summary'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {t('tool.apiBurstTest.results.summary')}
                </button>
                <button
                  onClick={() => setResultsTab('details')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg',
                    'transition-colors',
                    resultsTab === 'details'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {t('tool.apiBurstTest.results.details')}
                </button>
              </div>
              <ExportButtons results={results} state={state} />
            </div>

            {/* Results content */}
            <div className="p-4 lg:flex-1 lg:overflow-y-auto">
              {results ? (
                resultsTab === 'summary' ? (
                  <div className="space-y-4">
                    <SummaryCards results={results} />
                    <div className="grid grid-cols-1 gap-4">
                      <LatencyHistogram buckets={results.histogramBuckets} />
                      <StatusCodeChart statusCodes={results.statusCodes} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <DetailedSummary results={results} />

                    {/* Network Timing Info */}
                    <NetworkTimingInfo
                      networkTiming={results.networkTiming}
                      toolLatency={results.latency}
                    />

                    {/* Time series graphs */}
                    {results.timeSeries.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TimeSeriesChart
                          data={results.timeSeries}
                          metric="rps"
                        />
                        <TimeSeriesChart
                          data={results.timeSeries}
                          metric="latency"
                        />
                      </div>
                    )}

                    <LatencyDistribution latency={results.latency} />
                    <ErrorsTable
                      errors={results.errors}
                      totalRequests={results.totalRequests}
                    />
                  </div>
                )
              ) : (
                /* Empty state */
                <div
                  className={cn(
                    'flex items-center justify-center p-8 rounded-xl',
                    'bg-gray-50 dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700 border-dashed'
                  )}
                >
                  <div className="text-center">
                    <Flame className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('tool.apiBurstTest.emptyState')}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {isMac ? '\u2318\u21B5' : 'Ctrl+Enter'}{' '}
                      {t('tool.apiBurstTest.toRun')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgment Modal */}
      <AcknowledgmentModal
        isOpen={showAcknowledgment}
        onConfirm={handleAcknowledgmentConfirm}
        onCancel={() => setShowAcknowledgment(false)}
      />

      <ShareModal {...shareModalProps} />

      <GoogleAdsenseBlock />
    </div>
  );
};

export const apiBurstTestTool: ToolDefinition<ApiBurstTestState> = {
  id: 'api-burst-test',
  title: 'API Burst Test',
  description: 'HTTP load testing with latency distribution and RPS metrics',
  icon: Flame,
  path: '/api-burst-test',
  i18nKey: 'apiBurstTest',
  keywords: [
    'api',
    'load',
    'test',
    'performance',
    'benchmark',
    'stress',
    'burst',
    'hey',
    'http',
  ],
  category: 'tester',
  beta: true,
  defaultState: DEFAULT_BURST_STATE,
  Component: ApiBurstTestTool,
};

export default apiBurstTestTool;
