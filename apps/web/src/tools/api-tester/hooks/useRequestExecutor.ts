/**
 * useRequestExecutor - Hook for executing API requests
 * Implements CORS bypass strategy: direct fetch → extension
 */

import { useState, useCallback, useRef } from 'react';
import type { ApiTesterState, ResponseData } from '../types';
import { buildUrlWithParams, getBaseUrl, getContentTypeForBody, generateId } from '../utils';
import { useExtension } from './useExtension';
import type { RequestSpec } from '@yowu-devtools/shared';

interface UseRequestExecutorReturn {
  /** Current response data */
  response: ResponseData | null;
  /** Whether a request is in progress */
  isLoading: boolean;
  /** Execute a request */
  executeRequest: (state: ApiTesterState) => Promise<ResponseData>;
  /** Cancel current request */
  cancelRequest: () => void;
  /** Clear response */
  clearResponse: () => void;
  /** Extension status */
  extensionStatus: ReturnType<typeof useExtension>['status'];
  /** Check extension connection */
  checkExtension: () => Promise<boolean>;
}

/**
 * Build fetch options from state
 */
const buildFetchOptions = (state: ApiTesterState): RequestInit => {
  const options: RequestInit = {
    method: state.method,
    headers: {},
    credentials: state.credentials,
    redirect: state.followRedirects ? 'follow' : 'manual',
  };

  // Add headers
  const headers: Record<string, string> = {};
  state.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headers[h.key] = h.value;
    });

  // Add Content-Type if not present and body needs it
  const contentType = getContentTypeForBody(state.body);
  if (contentType && !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = contentType;
  }

  options.headers = headers;

  // Add body for methods that support it
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(state.method) && state.body.kind !== 'none') {
    switch (state.body.kind) {
      case 'text':
      case 'json':
        options.body = state.body.text;
        break;
      case 'urlencoded':
        options.body = new URLSearchParams(
          state.body.items.filter((i) => i.enabled && i.key).map((i) => [i.key, i.value])
        );
        break;
      case 'multipart': {
        const formData = new FormData();
        state.body.items.forEach((item) => {
          if (item.type === 'text') {
            formData.append(item.key, item.textValue || '');
          } else if (item.fileData && item.fileName) {
            // Convert base64 to Blob
            const binary = atob(item.fileData);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: item.mimeType || 'application/octet-stream' });
            formData.append(item.key, blob, item.fileName);
          }
        });
        options.body = formData;
        // Don't set Content-Type for multipart, browser will set it with boundary
        delete (options.headers as Record<string, string>)['Content-Type'];
        break;
      }
    }
  }

  return options;
};

/**
 * Convert state to RequestSpec for extension
 */
const buildRequestSpec = (state: ApiTesterState): RequestSpec => {
  const fullUrl = buildUrlWithParams(getBaseUrl(state.url), state.queryParams);

  return {
    id: generateId(),
    method: state.method,
    url: fullUrl,
    headers: state.headers.map((h) => ({
      key: h.key,
      value: h.value,
      enabled: h.enabled,
    })),
    body: state.body as RequestSpec['body'],
    options: {
      timeoutMs: state.timeoutMs,
      redirect: state.followRedirects ? 'follow' : 'manual',
      credentials: state.credentials === 'same-origin' ? 'omit' : state.credentials,
      includeCookies: state.includeCookies,
    },
  };
};

export const useRequestExecutor = (): UseRequestExecutorReturn => {
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    status: extensionStatus,
    executeRequest: executeViaExtension,
    checkConnection: checkExtension,
    checkPermission,
    requestPermission,
  } = useExtension({ autoCheck: true });

  /**
   * Execute request via direct fetch
   */
  const executeDirectFetch = useCallback(
    async (state: ApiTesterState): Promise<ResponseData> => {
      const requestId = generateId();
      const startTime = performance.now();

      // Build URL with query params
      const fullUrl = buildUrlWithParams(getBaseUrl(state.url), state.queryParams);

      // Create AbortController for timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, state.timeoutMs);

      try {
        const options = buildFetchOptions(state);
        options.signal = abortControllerRef.current.signal;

        const res = await fetch(fullUrl, options);
        clearTimeout(timeoutId);

        const timingMs = Math.round(performance.now() - startTime);

        // Extract headers
        const headers: Record<string, string> = {};
        res.headers.forEach((value, key) => {
          headers[key] = value;
        });

        // Get body as text or base64
        const contentType = res.headers.get('content-type') || '';
        let body: ResponseData['body'];

        if (
          contentType.includes('text') ||
          contentType.includes('json') ||
          contentType.includes('xml')
        ) {
          const text = await res.text();
          body = { kind: 'text', data: text };
        } else {
          // Binary data
          const arrayBuffer = await res.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          body = { kind: 'base64', data: btoa(binary) };
        }

        return {
          id: requestId,
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          headers,
          body,
          timingMs,
          method: 'cors',
        };
      } catch (err) {
        clearTimeout(timeoutId);
        const timingMs = Math.round(performance.now() - startTime);

        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            return {
              id: requestId,
              ok: false,
              timingMs,
              method: 'cors',
              error: {
                code: 'TIMEOUT',
                message: `Request timeout after ${state.timeoutMs}ms`,
              },
            };
          }

          // Check if it's likely a CORS error
          if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
            return {
              id: requestId,
              ok: false,
              timingMs,
              method: 'cors',
              error: {
                code: 'CORS_ERROR',
                message:
                  'Request failed. This may be due to CORS restrictions. Try using Extension mode.',
              },
            };
          }

          return {
            id: requestId,
            ok: false,
            timingMs,
            method: 'cors',
            error: {
              code: 'NETWORK_ERROR',
              message: err.message,
            },
          };
        }

        return {
          id: requestId,
          ok: false,
          timingMs,
          method: 'cors',
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
          },
        };
      }
    },
    []
  );

  /**
   * Execute request via extension
   */
  const executeExtensionFetch = useCallback(
    async (state: ApiTesterState): Promise<ResponseData> => {
      console.log('[executeExtensionFetch] Starting extension fetch...');
      const requestId = generateId();
      const startTime = performance.now();

      try {
        // Get target origin
        const url = new URL(buildUrlWithParams(getBaseUrl(state.url), state.queryParams));
        const targetOrigin = url.origin;
        console.log('[executeExtensionFetch] Target origin:', targetOrigin);

        // Check permission
        console.log('[executeExtensionFetch] Checking permission...');
        const hasPermission = await checkPermission(targetOrigin);
        console.log('[executeExtensionFetch] Has permission:', hasPermission);

        if (!hasPermission) {
          // Request permission
          console.log('[executeExtensionFetch] Requesting permission...');
          const granted = await requestPermission(targetOrigin);
          console.log('[executeExtensionFetch] Permission granted:', granted);

          if (!granted) {
            console.log('[executeExtensionFetch] Permission denied, returning error');
            return {
              id: requestId,
              ok: false,
              timingMs: Math.round(performance.now() - startTime),
              method: 'extension',
              error: {
                code: 'PERMISSION_DENIED',
                message: `Permission denied for ${targetOrigin}. Please grant permission and try again.`,
              },
            };
          }
        }

        // Execute request
        console.log('[executeExtensionFetch] Building request spec...');
        const spec = buildRequestSpec(state);
        console.log('[executeExtensionFetch] Request spec:', spec);
        
        console.log('[executeExtensionFetch] Executing via extension...');
        const result = await executeViaExtension(spec);
        console.log('[executeExtensionFetch] Extension result:', result);

        return {
          ...result,
          method: 'extension',
        };
      } catch (err) {
        console.error('[executeExtensionFetch] Error:', err);
        return {
          id: requestId,
          ok: false,
          timingMs: Math.round(performance.now() - startTime),
          method: 'extension',
          error: {
            code: 'EXTENSION_ERROR',
            message: err instanceof Error ? err.message : 'Extension request failed',
          },
        };
      }
    },
    [executeViaExtension, checkPermission, requestPermission]
  );

  /**
   * Execute request based on selected mode
   */
  const executeRequest = useCallback(
    async (state: ApiTesterState): Promise<ResponseData> => {
      console.log('[useRequestExecutor] executeRequest called with mode:', state.selectedMode);
      setIsLoading(true);
      setResponse(null);

      try {
        let result: ResponseData;

        if (state.selectedMode === 'extension') {
          console.log('[useRequestExecutor] Using extension mode');
          result = await executeExtensionFetch(state);
        } else {
          console.log('[useRequestExecutor] Using direct mode');
          result = await executeDirectFetch(state);
        }

        console.log('[useRequestExecutor] Result:', result);
        setResponse(result);
        return result;
      } catch (err) {
        console.error('[useRequestExecutor] Error:', err);
        throw err;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [executeDirectFetch, executeExtensionFetch]
  );

  /**
   * Cancel current request
   */
  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  /**
   * Clear response
   */
  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  return {
    response,
    isLoading,
    executeRequest,
    cancelRequest,
    clearResponse,
    extensionStatus,
    checkExtension,
  };
};

export default useRequestExecutor;

