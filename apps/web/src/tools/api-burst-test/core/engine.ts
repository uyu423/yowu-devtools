/**
 * Burst Test Engine
 * 
 * Core execution engine for HTTP load testing.
 * Implements concurrent request execution with rate limiting.
 */

import type {
  ApiBurstTestState,
  BurstProgress,
  BurstTestResults,
  ErrorBreakdown,
  HistogramBucket,
  LatencyMetrics,
  RequestSample,
  TimeSeriesPoint,
} from '../types';
import { HARD_LIMITS, NO_BODY_METHODS, getMaxConcurrency } from '../types';
import {
  ReservoirSampler,
  RunningStats,
  calculateLatencyMetrics,
  calculateRps,
  generateHistogramBuckets,
} from './metrics';
import {
  classifyError,
  classifyHttpStatus,
  createEmptyErrorBreakdown,
} from './errors';

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: BurstProgress) => void;

/**
 * Request executor function type (for extension integration)
 */
export type RequestExecutor = (
  url: string,
  options: RequestInit,
  timeoutMs: number
) => Promise<Response>;

/**
 * Engine configuration
 */
export interface BurstEngineConfig {
  /** State containing all request configuration */
  state: ApiBurstTestState;
  /** Callback for progress updates */
  onProgress?: ProgressCallback;
  /** Custom request executor (for extension-based requests) */
  requestExecutor?: RequestExecutor;
  /** AbortController for cancellation */
  abortController: AbortController;
}

/**
 * Token Bucket Rate Limiter
 * Implements a simple token bucket algorithm for rate limiting
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per ms

  constructor(qps: number) {
    this.capacity = qps;
    this.tokens = qps;
    this.refillRate = qps / 1000; // Convert to per-ms
    this.lastRefill = performance.now();
  }

  /**
   * Try to consume a token, waiting if necessary
   * Returns the delay in ms before the token was acquired
   */
  async acquire(): Promise<number> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return 0;
    }

    // Calculate wait time for next token
    const waitMs = (1 - this.tokens) / this.refillRate;
    await this.sleep(waitMs);
    this.refill();
    this.tokens -= 1;
    return waitMs;
  }

  private refill(): void {
    const now = performance.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Default fetch-based request executor with timeout
 */
async function defaultRequestExecutor(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  // Create timeout abort controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  // Combine with existing signal if present
  const signal = options.signal;
  if (signal) {
    signal.addEventListener('abort', () => timeoutController.abort());
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: timeoutController.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build request headers from state
 */
function buildHeaders(state: ApiBurstTestState): Record<string, string> {
  const headers: Record<string, string> = {};

  // Add enabled headers from state
  state.headers
    .filter(h => h.enabled && h.key)
    .forEach(h => {
      headers[h.key] = h.value;
    });

  // Add Content-Type for body if not already set
  const methodSupportsBody = !NO_BODY_METHODS.includes(state.method);
  if (methodSupportsBody && state.body.text.trim()) {
    if (!headers['Content-Type']) {
      if (state.body.mode === 'json') {
        headers['Content-Type'] = 'application/json';
      } else if (state.body.mode === 'form') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
  }

  // Add Basic Auth
  if (state.auth) {
    headers['Authorization'] = `Basic ${btoa(`${state.auth.username}:${state.auth.password}`)}`;
  }

  return headers;
}

/**
 * Build URL with query parameters
 */
function buildUrl(state: ApiBurstTestState): string {
  const enabledParams = state.params.filter(p => p.enabled && p.key);
  if (enabledParams.length === 0) return state.url;

  try {
    const url = new URL(state.url);
    enabledParams.forEach(p => {
      url.searchParams.append(p.key, p.value);
    });
    return url.toString();
  } catch {
    // Fallback for invalid URLs
    const queryString = enabledParams
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return state.url + (state.url.includes('?') ? '&' : '?') + queryString;
  }
}

/**
 * Execute a single request and return metrics
 */
async function executeRequest(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  executor: RequestExecutor,
  abortSignal: AbortSignal
): Promise<{
  latencyMs: number;
  status: number | null;
  errorType: keyof ErrorBreakdown | null;
  dataBytes: number;
}> {
  const startTime = performance.now();
  let status: number | null = null;
  let errorType: keyof ErrorBreakdown | null = null;
  let dataBytes = 0;

  try {
    if (abortSignal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const response = await executor(
      url,
      { ...options, signal: abortSignal },
      timeoutMs
    );

    status = response.status;

    // Check for HTTP errors
    const httpError = classifyHttpStatus(status);
    if (httpError) {
      errorType = httpError;
    }

    // Read response body to get size (and ensure request completes)
    try {
      const text = await response.text();
      dataBytes = new Blob([text]).size;
    } catch {
      // Body read error, ignore size
    }
  } catch (error) {
    const classified = classifyError(error, abortSignal.aborted);
    errorType = classified.type;
  }

  const latencyMs = performance.now() - startTime;

  return {
    latencyMs,
    status,
    errorType,
    dataBytes,
  };
}

/**
 * Run the burst test
 */
export async function runBurstTest(config: BurstEngineConfig): Promise<BurstTestResults> {
  const { state, onProgress, abortController } = config;
  const executor = config.requestExecutor || defaultRequestExecutor;

  // Build request configuration
  const url = buildUrl(state);
  const headers = buildHeaders(state);
  const methodSupportsBody = !NO_BODY_METHODS.includes(state.method);

  const requestOptions: RequestInit = {
    method: state.method,
    headers,
  };

  // Add body if method supports it
  if (methodSupportsBody && state.body.text.trim()) {
    requestOptions.body = state.body.text;
  }

  // Initialize metrics collectors
  const latencySampler = new ReservoirSampler(HARD_LIMITS.MAX_SAMPLES);
  const latencyStats = new RunningStats();
  const statusCodes: Record<number, number> = {};
  const errors = createEmptyErrorBreakdown();
  const samples: RequestSample[] = [];

  let completedRequests = 0;
  let successRequests = 0;
  let failedRequests = 0;
  let totalDataBytes = 0;
  let peakRps = 0;

  // Time series collection (every second)
  const timeSeries: TimeSeriesPoint[] = [];
  let lastTimeSeriesUpdate = 0;
  let lastTimeSeriesRequests = 0;
  const recentLatencies: number[] = []; // For calculating avg latency per interval

  // Determine test parameters
  const isRequestsMode = state.loadMode.type === 'requests';
  const targetRequests = isRequestsMode
    ? Math.min(state.loadMode.n, HARD_LIMITS.MAX_TOTAL_REQUESTS)
    : HARD_LIMITS.MAX_TOTAL_REQUESTS; // Upper bound for duration mode
  const maxDurationMs = Math.min(state.loadMode.durationMs, HARD_LIMITS.MAX_DURATION_MS);
  const concurrency = Math.min(state.concurrency, getMaxConcurrency(state.useHttp2));
  const timeoutMs = Math.max(
    HARD_LIMITS.MIN_TIMEOUT_MS,
    Math.min(state.timeoutMs, HARD_LIMITS.MAX_TIMEOUT_MS)
  );

  // Setup rate limiter if enabled
  let rateLimiter: TokenBucket | null = null;
  if (state.rateLimit.type !== 'none') {
    const qps = Math.min(state.rateLimit.qps, HARD_LIMITS.MAX_QPS);
    // For perWorker mode, each worker gets the full QPS
    // For global mode, divide by concurrency
    const effectiveQps = state.rateLimit.type === 'perWorker'
      ? qps
      : qps / concurrency;
    rateLimiter = new TokenBucket(effectiveQps);
  }

  const startTime = performance.now();
  const startTimestamp = Date.now();

  // Progress update function with time series collection
  const updateProgress = (): void => {
    const elapsedMs = performance.now() - startTime;
    const currentRps = calculateRps(completedRequests, elapsedMs);

    // Track peak RPS
    if (currentRps > peakRps) {
      peakRps = currentRps;
    }

    // Collect time series data every second
    const secondElapsed = Math.floor(elapsedMs / 1000);
    if (secondElapsed > lastTimeSeriesUpdate && completedRequests > lastTimeSeriesRequests) {
      const intervalRequests = completedRequests - lastTimeSeriesRequests;
      const intervalRps = intervalRequests; // requests in this 1-second interval
      const avgLatency = recentLatencies.length > 0
        ? recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length
        : 0;
      
      timeSeries.push({
        timestamp: secondElapsed * 1000,
        rps: intervalRps,
        avgLatencyMs: avgLatency,
        errorCount: failedRequests,
      });

      lastTimeSeriesUpdate = secondElapsed;
      lastTimeSeriesRequests = completedRequests;
      recentLatencies.length = 0; // Clear for next interval
    }

    if (!onProgress) return;

    onProgress({
      completedRequests,
      totalRequests: isRequestsMode ? targetRequests : completedRequests,
      elapsedMs,
      durationMs: maxDurationMs,
      currentRps,
      isRunning: true,
    });
  };

  // Worker function for concurrent execution
  const worker = async (): Promise<void> => {
    while (!abortController.signal.aborted) {
      // Check termination conditions
      if (isRequestsMode && completedRequests >= targetRequests) {
        break;
      }
      if (!isRequestsMode && performance.now() - startTime >= maxDurationMs) {
        break;
      }

      // Rate limiting
      if (rateLimiter) {
        await rateLimiter.acquire();
      }

      // Check again after rate limit wait
      if (abortController.signal.aborted) break;

      // Execute request
      const result = await executeRequest(
        url,
        requestOptions,
        timeoutMs,
        executor,
        abortController.signal
      );

      // Update metrics
      completedRequests++;
      latencySampler.add(result.latencyMs);
      latencyStats.add(result.latencyMs);
      totalDataBytes += result.dataBytes;
      recentLatencies.push(result.latencyMs); // For time series avg latency

      if (result.status !== null) {
        statusCodes[result.status] = (statusCodes[result.status] || 0) + 1;
      }

      if (result.errorType) {
        errors[result.errorType]++;
        failedRequests++;
      } else if (result.status && result.status >= 200 && result.status < 300) {
        successRequests++;
      } else if (result.status && result.status >= 400) {
        failedRequests++;
      } else {
        successRequests++;
      }

      // Store sample (limited)
      if (samples.length < HARD_LIMITS.MAX_SAMPLES) {
        samples.push({
          latencyMs: result.latencyMs,
          status: result.status,
          errorType: result.errorType,
          timestamp: performance.now() - startTime,
        });
      }

      // Update progress
      updateProgress();
    }
  };

  // Start concurrent workers
  const workers = Array(concurrency)
    .fill(null)
    .map(() => worker());

  // Wait for all workers to complete
  await Promise.all(workers);

  const totalTimeMs = performance.now() - startTime;
  const endTimestamp = Date.now();

  // Calculate final metrics
  const latencySamples = latencySampler.getSamples();
  const latency: LatencyMetrics = calculateLatencyMetrics(latencySamples);
  const histogramBuckets: HistogramBucket[] = generateHistogramBuckets(latencySamples);
  const rps = calculateRps(completedRequests, totalTimeMs);

  // Ensure peakRps is at least as high as average rps
  if (peakRps < rps) {
    peakRps = rps;
  }

  return {
    totalRequests: completedRequests,
    successRequests,
    failedRequests,
    totalTimeMs,
    rps,
    peakRps,
    totalDataBytes,
    avgSizeBytes: completedRequests > 0 ? totalDataBytes / completedRequests : 0,
    startTime: startTimestamp,
    endTime: endTimestamp,
    latency,
    histogramBuckets,
    timeSeries,
    statusCodes,
    errors,
  };
}

