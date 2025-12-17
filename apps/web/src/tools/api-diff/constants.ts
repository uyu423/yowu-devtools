/**
 * API Response Diff Tool - Constants
 */

import type { ApiDiffState, KeyValuePair } from './types';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create empty key-value pair
export const createEmptyKeyValue = (): KeyValuePair => ({
  id: generateId(),
  key: '',
  value: '',
});

// Default state
export const DEFAULT_STATE: ApiDiffState = {
  // Request configuration
  method: 'GET',
  path: '/api/v1/example',
  params: [createEmptyKeyValue()],
  headers: [createEmptyKeyValue()],
  body: '',
  domainA: '',
  domainB: '',

  // Response state
  responseA: null,
  responseB: null,
  isExecuting: false,

  // UI state
  activeTabA: 'body',
  activeTabB: 'body',
};

// HTTP Methods
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

// Default timeout (ms)
export const DEFAULT_TIMEOUT_MS = 10000;

// History max items
export const MAX_HISTORY_ITEMS = 30;

// Diff table height constraints
export const DIFF_TABLE_MIN_HEIGHT = 100;
export const DIFF_TABLE_MAX_HEIGHT = 600;
export const DIFF_TABLE_DEFAULT_HEIGHT = 230;

// LocalStorage keys
export const STORAGE_KEY_HISTORY = 'yowu-devtools:v1:api-diff:history';
export const STORAGE_KEY_DIFF_TABLE_HEIGHT = 'yowu-devtools:v1:api-diff:diffTableHeight';

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
