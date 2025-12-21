/**
 * Convert cURL parse result to API Tester state
 */

import type { CurlParseResult } from './types';
import type { ApiTesterState } from '@/tools/api-tester/types';
import { createKeyValueItem } from '@/tools/api-tester/utils';

const STORAGE_KEY = 'yowu-devtools:v1:curl-to-api-tester';

/**
 * Convert CurlParseResult to API Tester state
 */
export function convertToApiTesterState(result: CurlParseResult): Partial<ApiTesterState> {
  const { request } = result;

  const state: Partial<ApiTesterState> = {
    method: request.method,
    url: request.url,
    queryParams: request.query.map((q) => createKeyValueItem(q.key, q.value, q.enabled)),
    headers: request.headers.map((h) => createKeyValueItem(h.key, h.value, h.enabled)),
    followRedirects: request.options.followRedirects ?? true,
  };

  // Add cookies to headers if present
  if (request.cookies) {
    const cookieHeader = request.cookies.items
      .map((item) => `${item.key}=${item.value}`)
      .join('; ');
    state.headers = [
      ...(state.headers || []),
      createKeyValueItem('Cookie', cookieHeader, true),
    ];
  }

  // Convert body
  if (request.body) {
    switch (request.body.kind) {
      case 'none':
        state.body = { kind: 'none' };
        break;
      case 'text':
        state.body = { kind: 'text', text: request.body.text || '' };
        break;
      case 'json':
        state.body = { kind: 'json', text: request.body.text || '' };
        break;
      case 'urlencoded':
        state.body = {
          kind: 'urlencoded',
          items: (request.body.urlencodedItems || []).map((item) =>
            createKeyValueItem(item.key, item.value, true)
          ),
        };
        break;
      case 'multipart': {
        // Only include text fields (files are not supported)
        const textItems = (request.body.multipartItems || []).filter(
          (item) => item.kind === 'field'
        );
        if (textItems.length > 0) {
          state.body = {
            kind: 'multipart',
            items: textItems.map((item) => ({
              id: crypto.randomUUID(),
              key: item.key,
              type: 'text' as const,
              textValue: item.value,
            })),
          };
        } else {
          state.body = { kind: 'none' };
        }
        break;
      }
    }
  } else {
    state.body = { kind: 'none' };
  }

  return state;
}

/**
 * Store cURL parse result for API Tester
 */
export function storeForApiTester(result: CurlParseResult): void {
  const state = convertToApiTesterState(result);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

/**
 * Get stored API Tester state
 */
export function getStoredApiTesterState(): Partial<ApiTesterState> | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored API Tester state
 */
export function clearStoredApiTesterState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

