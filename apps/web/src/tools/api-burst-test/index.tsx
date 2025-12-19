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
  ErrorsTable,
  ExportButtons,
  HeadersEditor,
  LatencyDistribution,
  LatencyHistogram,
  LoadModeForm,
  ParamsEditor,
  RunControlBar,
  StatusCodeChart,
  SummaryCards,
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
  HistogramBucket,
  LoadMode,
  RateLimit,
} from './types';
import { ChevronDown, ChevronUp, Flame, Info } from 'lucide-react';
import { DEFAULT_BURST_STATE, NO_BODY_METHODS } from './types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ShareModal } from '@/components/common/ShareModal';
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
  const { status: extensionStatus, checkConnection: checkExtension } =
    useExtension({ autoCheck: true });

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

  // Check if can run
  const canRun = state.url.trim() !== '' && !isRunning;

  // Check if method supports body
  const methodSupportsBody = !NO_BODY_METHODS.includes(state.method);

  // Build URL with params
  const buildUrlWithParams = useCallback(
    (baseUrl: string, params: BurstParamItem[]): string => {
      const enabledParams = params.filter((p) => p.enabled && p.key);
      if (enabledParams.length === 0) return baseUrl;

      try {
        const url = new URL(baseUrl);
        enabledParams.forEach((p) => {
          url.searchParams.append(p.key, p.value);
        });
        return url.toString();
      } catch {
        // If URL parsing fails, append manually
        const queryString = enabledParams
          .map(
            (p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`
          )
          .join('&');
        return baseUrl + (baseUrl.includes('?') ? '&' : '?') + queryString;
      }
    },
    []
  );

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

  // Run test
  const handleRun = useCallback(async () => {
    // Check acknowledgment first
    if (!sessionAcknowledged) {
      setShowAcknowledgment(true);
      return;
    }

    setIsRunning(true);
    setProgress({
      completedRequests: 0,
      totalRequests: state.loadMode.n,
      elapsedMs: 0,
      durationMs: state.loadMode.durationMs,
      currentRps: 0,
      isRunning: true,
    });
    setResults(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build final URL with params
      const finalUrl = buildUrlWithParams(state.url, state.params);

      // Simulate burst test (placeholder - actual implementation would use Web Worker)
      const startTime = performance.now();
      const samples: number[] = [];
      const statusCounts: Record<number, number> = {};
      let completedRequests = 0;
      let successRequests = 0;
      let failedRequests = 0;
      let totalDataBytes = 0;

      const totalRequests =
        state.loadMode.type === 'requests' ? state.loadMode.n : 1000; // Estimate for duration mode
      const concurrency = state.concurrency;

      // Create promise queue for concurrent requests
      const executeRequest = async (): Promise<void> => {
        if (controller.signal.aborted) return;

        const requestStart = performance.now();
        try {
          const headers: Record<string, string> = {};
          state.headers
            .filter((h) => h.enabled && h.key)
            .forEach((h) => {
              headers[h.key] = h.value;
            });

          // Build request options
          const options: RequestInit = {
            method: state.method,
            headers,
            signal: controller.signal,
          };

          // Add body for methods that support it
          if (methodSupportsBody && state.body.text.trim()) {
            options.body = state.body.text;
            if (state.body.mode === 'json' && !headers['Content-Type']) {
              headers['Content-Type'] = 'application/json';
            } else if (state.body.mode === 'form' && !headers['Content-Type']) {
              headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
          }

          // Add basic auth
          if (state.auth) {
            headers['Authorization'] = `Basic ${btoa(
              `${state.auth.username}:${state.auth.password}`
            )}`;
          }

          const response = await fetch(finalUrl, options);
          const latencyMs = performance.now() - requestStart;
          samples.push(latencyMs);

          // Count status codes
          statusCounts[response.status] =
            (statusCounts[response.status] || 0) + 1;

          if (response.ok) {
            successRequests++;
          } else {
            failedRequests++;
          }

          // Get response size
          const text = await response.text();
          totalDataBytes += new Blob([text]).size;
        } catch (error) {
          const latencyMs = performance.now() - requestStart;
          samples.push(latencyMs);
          failedRequests++;

          // Classify error
          if (error instanceof DOMException && error.name === 'AbortError') {
            // Aborted
          } else if (error instanceof TypeError) {
            // Network/CORS error
          }
        }

        completedRequests++;

        // Update progress
        const elapsedMs = performance.now() - startTime;
        const currentRps = completedRequests / (elapsedMs / 1000);
        setProgress({
          completedRequests,
          totalRequests:
            state.loadMode.type === 'requests'
              ? state.loadMode.n
              : totalRequests,
          elapsedMs,
          durationMs: state.loadMode.durationMs,
          currentRps,
          isRunning: true,
        });
      };

      // Execute requests with concurrency
      const runBatch = async () => {
        const isRequestsMode = state.loadMode.type === 'requests';
        const targetRequests = isRequestsMode
          ? state.loadMode.n
          : totalRequests;
        const maxDurationMs = state.loadMode.durationMs;

        while (
          completedRequests < targetRequests &&
          !controller.signal.aborted
        ) {
          // Check duration limit
          if (
            !isRequestsMode &&
            performance.now() - startTime >= maxDurationMs
          ) {
            break;
          }

          // Create batch of concurrent requests
          const batchSize = Math.min(
            concurrency,
            targetRequests - completedRequests
          );
          const batch = Array(batchSize)
            .fill(null)
            .map(() => executeRequest());
          await Promise.all(batch);

          // Rate limiting (simple delay)
          if (state.rateLimit.type !== 'none') {
            const targetDelay = 1000 / state.rateLimit.qps;
            await new Promise((resolve) => setTimeout(resolve, targetDelay));
          }
        }
      };

      await runBatch();

      const totalTimeMs = performance.now() - startTime;

      // Calculate results
      samples.sort((a, b) => a - b);
      const percentile = (p: number) => {
        const index = Math.ceil((p / 100) * samples.length) - 1;
        return samples[Math.max(0, index)] || 0;
      };

      // Generate histogram buckets
      const bucketCount = 10;
      const maxLatency = samples[samples.length - 1] || 1000;
      const bucketSize = maxLatency / bucketCount;
      const histogramBuckets: HistogramBucket[] = [];

      for (let i = 0; i < bucketCount; i++) {
        const rangeStart = i * bucketSize;
        const rangeEnd = (i + 1) * bucketSize;
        const count = samples.filter(
          (s) => s >= rangeStart && s < rangeEnd
        ).length;
        histogramBuckets.push({
          rangeStart,
          rangeEnd,
          count,
          label: `${(rangeStart / 1000).toFixed(3)}s`,
        });
      }

      const finalResults: BurstTestResults = {
        totalRequests: completedRequests,
        successRequests,
        failedRequests,
        totalTimeMs,
        rps: completedRequests / (totalTimeMs / 1000),
        totalDataBytes,
        avgSizeBytes:
          completedRequests > 0 ? totalDataBytes / completedRequests : 0,
        latency: {
          avg:
            samples.length > 0
              ? samples.reduce((a, b) => a + b, 0) / samples.length
              : 0,
          min: samples[0] || 0,
          max: samples[samples.length - 1] || 0,
          p50: percentile(50),
          p90: percentile(90),
          p95: percentile(95),
          p99: percentile(99),
        },
        histogramBuckets,
        statusCodes: statusCounts,
        errors: {
          timeout: 0,
          cors: 0,
          network: 0,
          aborted: 0,
          http4xx: Object.entries(statusCounts)
            .filter(([code]) => Number(code) >= 400 && Number(code) < 500)
            .reduce((sum, [, count]) => sum + count, 0),
          http5xx: Object.entries(statusCounts)
            .filter(([code]) => Number(code) >= 500)
            .reduce((sum, [, count]) => sum + count, 0),
        },
      };

      setResults(finalResults);
    } catch (error) {
      console.error('Burst test error:', error);
    } finally {
      setIsRunning(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  }, [state, sessionAcknowledged, methodSupportsBody, buildUrlWithParams]);

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
    // Trigger run after acknowledgment
    setTimeout(() => handleRun(), 100);
  }, [handleRun]);

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

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <ToolHeader
          title={t('tool.apiBurstTest.title')}
          description={t('tool.apiBurstTest.description')}
          onReset={handleReset}
          onShare={handleShare}
        />
      </div>

      {/* Warning Banner - Always visible */}
      <WarningBanner className="mb-4" />

      {/* Run Control Bar with Extension Status */}
      <RunControlBar
        isRunning={isRunning}
        canRun={canRun}
        progress={progress}
        loadMode={state.loadMode}
        extensionStatus={extensionStatus}
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
                  loadMode={state.loadMode}
                  rateLimit={state.rateLimit}
                  timeoutMs={state.timeoutMs}
                  onConcurrencyChange={handleConcurrencyChange}
                  onLoadModeChange={handleLoadModeChange}
                  onRateLimitChange={handleRateLimitChange}
                  onTimeoutChange={handleTimeoutChange}
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
              <ExportButtons results={results} />
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
  beta: false,
  defaultState: DEFAULT_BURST_STATE,
  Component: ApiBurstTestTool,
};

export default apiBurstTestTool;
