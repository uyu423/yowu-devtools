/**
 * API Tester Tool - Types
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type BodyKind = 'none' | 'text' | 'json' | 'urlencoded' | 'multipart';

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface FormDataItem {
  id: string;
  key: string;
  type: 'text' | 'file';
  textValue?: string;
  fileName?: string;
  fileData?: string; // Base64 encoded
  mimeType?: string;
}

export type RequestBody =
  | { kind: 'none' }
  | { kind: 'text'; text: string }
  | { kind: 'json'; text: string }
  | { kind: 'urlencoded'; items: KeyValueItem[] }
  | { kind: 'multipart'; items: FormDataItem[] };

export interface ApiTesterState {
  // Request settings
  method: HttpMethod;
  url: string;
  queryParams: KeyValueItem[];
  headers: KeyValueItem[];
  body: RequestBody;

  // Options
  timeoutMs: number;
  followRedirects: boolean;
  credentials: 'omit' | 'same-origin' | 'include';
  /** Include browser cookies in extension mode requests */
  includeCookies: boolean;

  // Mode
  selectedMode: 'direct' | 'extension';

  // UI state (excluded from share)
  activeTab: 'params' | 'headers' | 'body';
  responseTab: 'body' | 'headers';
}

export interface ResponseData {
  id: string;
  ok: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: {
    kind: 'text' | 'base64';
    data: string;
  };
  timingMs?: number;
  error?: {
    code: string;
    message: string;
    /** Detailed error information for debugging */
    details?: string;
  };
  method?: 'cors' | 'no-cors' | 'extension';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  name?: string;
  request: {
    method: HttpMethod;
    url: string;
    headers: KeyValueItem[];
    body: RequestBody;
  };
  response?: {
    status?: number;
    statusText?: string;
    timingMs?: number;
  };
}

export type ExtensionStatus = 'not-installed' | 'permission-required' | 'connected' | 'checking';

// HTTP Methods that support request body
export const BODY_SUPPORTED_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Common headers for autocomplete
export const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Origin',
  'Referer',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With',
];

// Common Content-Type values
export const COMMON_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
  'text/xml',
  'application/xml',
];

// Status code colors
export const getStatusColor = (status?: number): string => {
  if (!status) return 'text-gray-500';
  if (status >= 200 && status < 300) return 'text-emerald-600 dark:text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
  if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
  if (status >= 500) return 'text-red-600 dark:text-red-400';
  return 'text-gray-500';
};

// Format bytes to human readable
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

