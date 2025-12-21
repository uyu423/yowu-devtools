/**
 * API Burst Test Tool - Types
 * 
 * hey CLI-inspired HTTP load testing tool for browser
 * Reference: https://github.com/rakyll/hey
 */

// HTTP Methods supported for burst testing (simplified from API Tester)
export type BurstHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Body type for request
export type BurstBodyMode = 'raw' | 'json' | 'form';

// Load mode - either fixed number of requests or fixed duration
export type LoadModeType = 'requests' | 'duration';

// Rate limit type
export type RateLimitType = 'none' | 'global' | 'perWorker';

// Body handling mode for performance optimization
// - 'cancel': Cancel body stream immediately (fastest, no body data)
// - 'stream': Read body as stream but don't decode (medium)
// - 'full': Read and decode full body (slowest, required for body size metrics)
export type BodyHandlingMode = 'cancel' | 'stream' | 'full';

// Header item for request configuration
export interface BurstHeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

// Query parameter item for request configuration
export interface BurstParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

// Basic authentication
export interface BasicAuth {
  username: string;
  password: string;
}

// Request body configuration
export interface BurstBody {
  mode: BurstBodyMode;
  text: string;
}

// Load shape configuration
export interface LoadMode {
  type: LoadModeType;
  n: number;  // Total requests (for 'requests' mode)
  durationMs: number;  // Duration in ms (for 'duration' mode)
}

// Rate limiting configuration
export interface RateLimit {
  type: RateLimitType;
  qps: number;  // Queries per second
}

// Share link privacy settings
export interface SharePrivacy {
  includeHeaders: boolean;
  includeAuth: boolean;
}

// Main state for API Burst Test tool
export interface ApiBurstTestState {
  // Request configuration
  url: string;
  method: BurstHttpMethod;
  params: BurstParamItem[];
  headers: BurstHeaderItem[];
  body: BurstBody;
  auth: BasicAuth | null;
  includeCookies: boolean;  // Include cookies in requests (requires extension)
  
  // Load configuration
  concurrency: number;
  useHttp2: boolean;  // Enable HTTP/2 mode for higher concurrency
  loadMode: LoadMode;
  rateLimit: RateLimit;
  timeoutMs: number;
  bodyHandling: BodyHandlingMode;  // How to handle response body (performance optimization)
  
  // Privacy settings
  sharePrivacy: SharePrivacy;
  
  // UI state (excluded from share)
  acknowledged: boolean;  // User acknowledged responsible use
}

// Latency metrics
export interface LatencyMetrics {
  avg: number;
  min: number;
  max: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

// Network timing information from Resource Timing API
export interface NetworkTimingInfo {
  // Detected protocol (h2, h3, http/1.1, or null if not available)
  protocol: string | null;
  // Whether Timing-Allow-Origin was present (needed for accurate cross-origin timing)
  hasTimingAllowOrigin: boolean;
  // Average network latency (excluding browser queuing) when available
  avgNetworkLatencyMs: number | null;
  // Average stalled/queuing time when available
  avgStalledMs: number | null;
  // Sample count for network timing
  sampleCount: number;
}

// Error breakdown by type
export interface ErrorBreakdown {
  timeout: number;
  cors: number;
  network: number;
  aborted: number;
  http4xx: number;
  http5xx: number;
}

// Status code distribution
export type StatusCodeDistribution = Map<number, number>;

// Time series data point for graphs
export interface TimeSeriesPoint {
  timestamp: number;  // ms since test start
  rps: number;        // requests per second at this point
  avgLatencyMs: number;  // average latency at this point
  errorCount: number;    // cumulative errors at this point
}

// Full test results
export interface BurstTestResults {
  // Summary
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  totalTimeMs: number;
  rps: number;
  peakRps: number;      // Maximum RPS observed during test
  totalDataBytes: number;
  avgSizeBytes: number;
  
  // Timing
  startTime: number;    // Unix timestamp when test started
  endTime: number;      // Unix timestamp when test ended
  
  // Latency
  latency: LatencyMetrics;
  
  // Network timing (from Resource Timing API when available)
  networkTiming: NetworkTimingInfo;
  
  // Histogram data for chart (buckets of latency ranges)
  histogramBuckets: HistogramBucket[];
  
  // Time series data for graphs (sampled every second)
  timeSeries: TimeSeriesPoint[];
  
  // Distribution
  statusCodes: Record<number, number>;
  errors: ErrorBreakdown;
}

// Histogram bucket for latency distribution chart
export interface HistogramBucket {
  rangeStart: number;  // ms
  rangeEnd: number;    // ms
  count: number;
  label: string;       // e.g., "0.0-0.5s"
}

// Progress update during test execution
export interface BurstProgress {
  completedRequests: number;
  totalRequests: number;  // For 'requests' mode
  elapsedMs: number;
  durationMs: number;     // For 'duration' mode
  currentRps: number;
  isRunning: boolean;
  // Current effective concurrency (in-flight requests)
  effectiveConcurrency: number;
}

// Preflight warning types
export interface PreflightWarning {
  type: 'authorization' | 'custom-header' | 'content-type' | 'method';
  message: string;
  header?: string;
}

// Per-request sample (limited storage for memory efficiency)
export interface RequestSample {
  latencyMs: number;
  status: number | null;
  errorType: keyof ErrorBreakdown | null;
  timestamp: number;
}

// Hard limits to prevent abuse
// Note: MAX_CONCURRENCY differs by HTTP version
// - HTTP/1.1: Browser limits to 6 concurrent connections per domain
// - HTTP/2: Single connection with multiplexing, allows higher concurrency
export const HARD_LIMITS = {
  MAX_CONCURRENCY_HTTP1: 6,   // Browser HTTP/1.1 limit: max 6 connections per domain
  MAX_CONCURRENCY_HTTP2: 50,  // HTTP/2 multiplexing allows higher concurrency
  MAX_TOTAL_REQUESTS: 10000,
  MAX_DURATION_MS: 60000,  // 60 seconds
  MAX_QPS: 1000,
  MIN_TIMEOUT_MS: 100,
  MAX_TIMEOUT_MS: 60000,
  MAX_BODY_SIZE: 1024 * 1024,  // 1MB
  MAX_HEADERS: 20,
  MAX_PARAMS: 20,
  MAX_SAMPLES: 1000,  // Per-request sample storage limit
} as const;

// Soft limits for warnings
export const SOFT_LIMITS = {
  WARN_CONCURRENCY_HTTP1: 4,   // Warn when approaching HTTP/1.1 browser limit
  WARN_CONCURRENCY_HTTP2: 30,  // Warn for high HTTP/2 concurrency
  WARN_TOTAL_REQUESTS: 1000,
  WARN_DURATION_MS: 30000,  // 30 seconds
  WARN_QPS: 100,
} as const;

// Helper: Get max concurrency based on HTTP version
export function getMaxConcurrency(useHttp2: boolean): number {
  return useHttp2 ? HARD_LIMITS.MAX_CONCURRENCY_HTTP2 : HARD_LIMITS.MAX_CONCURRENCY_HTTP1;
}

// Helper: Get concurrency warning threshold based on HTTP version
export function getConcurrencyWarningThreshold(useHttp2: boolean): number {
  return useHttp2 ? SOFT_LIMITS.WARN_CONCURRENCY_HTTP2 : SOFT_LIMITS.WARN_CONCURRENCY_HTTP1;
}

// Default values
export const DEFAULT_BURST_STATE: ApiBurstTestState = {
  url: '',
  method: 'GET',
  params: [],
  headers: [],
  body: { mode: 'raw', text: '' },
  auth: null,
  includeCookies: false,
  concurrency: 5,  // Default concurrency
  useHttp2: false, // Default to HTTP/1.1 mode
  loadMode: { type: 'requests', n: 100, durationMs: 10000 },
  rateLimit: { type: 'none', qps: 100 },
  timeoutMs: 10000,
  bodyHandling: 'cancel',  // Default to cancel for best performance
  sharePrivacy: { includeHeaders: false, includeAuth: false },
  acknowledged: false,
};

// Methods that don't support body
export const NO_BODY_METHODS: BurstHttpMethod[] = ['GET', 'HEAD'];

// Simple request headers that don't trigger preflight
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests
const SIMPLE_HEADERS = new Set([
  'accept',
  'accept-language',
  'content-language',
  'content-type',
  // Range is simple only with specific conditions, ignoring for simplicity
]);

// Simple content-type values that don't trigger preflight
const SIMPLE_CONTENT_TYPES = new Set([
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
]);

// Simple methods that don't trigger preflight
const SIMPLE_METHODS = new Set(['GET', 'HEAD', 'POST']);

/**
 * Detect headers/settings that will trigger CORS preflight
 * Returns warnings for each preflight-triggering element
 */
export function detectPreflightTriggers(state: ApiBurstTestState): PreflightWarning[] {
  const warnings: PreflightWarning[] = [];
  
  // Check method
  if (!SIMPLE_METHODS.has(state.method)) {
    warnings.push({
      type: 'method',
      message: `HTTP method "${state.method}" triggers preflight`,
    });
  }
  
  // Check headers
  const enabledHeaders = state.headers.filter(h => h.enabled && h.key);
  
  for (const header of enabledHeaders) {
    const headerLower = header.key.toLowerCase();
    
    // Check for Authorization header
    if (headerLower === 'authorization') {
      warnings.push({
        type: 'authorization',
        message: 'Authorization header triggers preflight',
        header: header.key,
      });
      continue;
    }
    
    // Check for non-simple headers
    if (!SIMPLE_HEADERS.has(headerLower)) {
      warnings.push({
        type: 'custom-header',
        message: `Custom header "${header.key}" triggers preflight`,
        header: header.key,
      });
      continue;
    }
    
    // Check Content-Type value
    if (headerLower === 'content-type') {
      const contentType = header.value.toLowerCase().split(';')[0].trim();
      if (!SIMPLE_CONTENT_TYPES.has(contentType)) {
        warnings.push({
          type: 'content-type',
          message: `Content-Type "${header.value}" triggers preflight`,
          header: header.key,
        });
      }
    }
  }
  
  // Check body mode (implicit Content-Type)
  if (state.body.text.trim() && !NO_BODY_METHODS.includes(state.method)) {
    const hasExplicitContentType = enabledHeaders.some(
      h => h.key.toLowerCase() === 'content-type'
    );
    
    if (!hasExplicitContentType && state.body.mode === 'json') {
      warnings.push({
        type: 'content-type',
        message: 'JSON body implies "application/json" Content-Type which triggers preflight',
      });
    }
  }
  
  return warnings;
}

// Helper: Create a new header item
export function createBurstHeaderItem(key = '', value = ''): BurstHeaderItem {
  return {
    id: crypto.randomUUID(),
    key,
    value,
    enabled: true,
  };
}

// Helper: Create a new param item
export function createBurstParamItem(key = '', value = ''): BurstParamItem {
  return {
    id: crypto.randomUUID(),
    key,
    value,
    enabled: true,
  };
}

// Helper: Get method color classes
export const METHOD_COLORS: Record<BurstHttpMethod, string> = {
  GET: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  POST: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  PUT: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  HEAD: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  OPTIONS: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

// Helper: Format duration in human readable format
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

// Helper: Format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper: Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

