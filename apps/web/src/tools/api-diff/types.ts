/**
 * API Response Diff Tool - Types
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

// Domain Preset
export interface DomainPreset {
  id: string;
  title: string;
  domain: string;
}

export interface DomainPresetsStore {
  version: 1;
  presets: DomainPreset[];
}

export interface TestCommon {
  method: HttpMethod;
  path: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  timeoutMs: number;
}

export interface TestConfig {
  common: TestCommon;
  domainA: string;
  domainB: string;
}

export interface ResponseError {
  code: 'CORS_ERROR' | 'TIMEOUT' | 'NETWORK_ERROR' | 'PERMISSION_DENIED' | 'UNKNOWN';
  message: string;
  details?: string;
}

export interface ResponseSide {
  ok: boolean;
  status: number | null;
  elapsedMs: number | null;
  sizeBytes: number | null;
  headers: Record<string, string>;
  rawBody: string | null;
  parsedJson?: unknown;
  error?: ResponseError;
  method?: 'direct' | 'extension'; // How the request was made
}

export interface HistoryItem {
  id: string;
  ts: number;
  name: string;
  share: string;
}

export interface DifferentField {
  path: string;
  valueA: unknown;
  valueB: unknown;
}

export interface ComparisonResult {
  isSame: boolean;
  statusSame: boolean;
  bodySame: boolean;
  statusA: number | null;
  statusB: number | null;
  differentFields: DifferentField[];
}

export interface ApiDiffState {
  // Request configuration
  method: HttpMethod;
  path: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  domainA: string;
  domainB: string;

  // Options
  /** Include browser cookies in extension mode requests */
  includeCookies: boolean;

  // Response state (not persisted)
  responseA: ResponseSide | null;
  responseB: ResponseSide | null;
  isExecuting: boolean;

  // UI state (not shared)
  activeTabA: 'body' | 'headers' | 'raw' | 'curl';
  activeTabB: 'body' | 'headers' | 'raw' | 'curl';
}

export type ResponseTab = 'body' | 'headers' | 'raw' | 'curl';

// HTTP Methods that support request body
export const BODY_SUPPORTED_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Status code colors
export const getStatusColor = (status?: number | null): string => {
  if (!status) return 'text-gray-500';
  if (status >= 200 && status < 300) return 'text-emerald-600 dark:text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
  if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
  if (status >= 500) return 'text-red-600 dark:text-red-400';
  return 'text-gray-500';
};

// Format bytes to human readable
export const formatBytes = (bytes: number | null): string => {
  if (bytes === null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format milliseconds
export const formatMs = (ms: number | null): string => {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};
