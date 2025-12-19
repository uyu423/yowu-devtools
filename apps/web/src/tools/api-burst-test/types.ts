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
  
  // Load configuration
  concurrency: number;
  loadMode: LoadMode;
  rateLimit: RateLimit;
  timeoutMs: number;
  
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

// Full test results
export interface BurstTestResults {
  // Summary
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  totalTimeMs: number;
  rps: number;
  totalDataBytes: number;
  avgSizeBytes: number;
  
  // Latency
  latency: LatencyMetrics;
  
  // Histogram data for chart (buckets of latency ranges)
  histogramBuckets: HistogramBucket[];
  
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
}

// Per-request sample (limited storage for memory efficiency)
export interface RequestSample {
  latencyMs: number;
  status: number | null;
  errorType: keyof ErrorBreakdown | null;
  timestamp: number;
}

// Hard limits to prevent abuse
export const HARD_LIMITS = {
  MAX_CONCURRENCY: 50,
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
  WARN_CONCURRENCY: 20,
  WARN_TOTAL_REQUESTS: 1000,
  WARN_DURATION_MS: 30000,  // 30 seconds
  WARN_QPS: 100,
} as const;

// Default values
export const DEFAULT_BURST_STATE: ApiBurstTestState = {
  url: '',
  method: 'GET',
  params: [],
  headers: [],
  body: { mode: 'raw', text: '' },
  auth: null,
  concurrency: 10,
  loadMode: { type: 'requests', n: 100, durationMs: 10000 },
  rateLimit: { type: 'none', qps: 100 },
  timeoutMs: 10000,
  sharePrivacy: { includeHeaders: false, includeAuth: false },
  acknowledged: false,
};

// Methods that don't support body
export const NO_BODY_METHODS: BurstHttpMethod[] = ['GET', 'HEAD'];

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

