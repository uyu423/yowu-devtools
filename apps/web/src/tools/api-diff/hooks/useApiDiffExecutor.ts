/**
 * useApiDiffExecutor - Hook for executing API requests for diff comparison
 * Supports both direct fetch and Chrome extension mode
 */

import { useState, useCallback, useRef } from 'react';
import type { ApiDiffState, ResponseSide, HttpMethod, KeyValuePair, ResponseError } from '../types';
import { generateId, DEFAULT_TIMEOUT_MS } from '../constants';
import { useExtension } from '../../api-tester/hooks/useExtension';
import type { RequestSpec } from '@yowu-devtools/shared';

interface UseApiDiffExecutorReturn {
  /** Whether requests are in progress */
  isLoading: boolean;
  /** Execute requests to both domains */
  executeRequests: (state: ApiDiffState, forceExtension?: boolean) => Promise<{
    responseA: ResponseSide;
    responseB: ResponseSide;
  }>;
  /** Cancel current requests */
  cancelRequests: () => void;
  /** Extension status */
  extensionStatus: ReturnType<typeof useExtension>['status'];
  /** Check extension connection */
  checkExtension: () => Promise<boolean>;
  /** Whether extension is available */
  isExtensionAvailable: boolean;
}

/**
 * Build URL from domain, path, and params
 */
const buildUrl = (domain: string, path: string, params: KeyValuePair[]): string => {
  // Ensure domain doesn't have trailing slash
  const cleanDomain = domain.replace(/\/+$/, '');
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Build query string
  const queryParams = params
    .filter((p) => p.key.trim())
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');

  const url = `${cleanDomain}${cleanPath}`;
  return queryParams ? `${url}?${queryParams}` : url;
};

/**
 * Build headers record from key-value pairs
 */
const buildHeaders = (headers: KeyValuePair[], body: string, method: HttpMethod): Record<string, string> => {
  const result: Record<string, string> = {};

  headers.filter((h) => h.key.trim()).forEach((h) => {
    result[h.key] = h.value;
  });

  // Add Content-Type if body exists and not GET
  if (body && method !== 'GET' && !Object.keys(result).some((k) => k.toLowerCase() === 'content-type')) {
    result['Content-Type'] = 'application/json';
  }

  return result;
};

/**
 * Execute direct fetch request
 */
const executeDirectFetch = async (
  url: string,
  method: HttpMethod,
  headers: Record<string, string>,
  body: string | undefined,
  signal: AbortSignal,
  timeoutMs: number
): Promise<ResponseSide> => {
  const startTime = performance.now();

  try {
    const options: RequestInit = {
      method,
      headers,
      signal,
    };

    // Add body for non-GET methods
    if (body && method !== 'GET') {
      options.body = body;
    }

    const timeoutId = setTimeout(() => {
      // The abort will be triggered by AbortController
    }, timeoutMs);

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    const elapsedMs = Math.round(performance.now() - startTime);

    // Extract headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get body as text
    const rawBody = await response.text();
    const sizeBytes = new Blob([rawBody]).size;

    // Try to parse as JSON
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      // Not JSON, that's fine
    }

    return {
      ok: response.ok,
      status: response.status,
      elapsedMs,
      sizeBytes,
      headers: responseHeaders,
      rawBody,
      parsedJson,
    };
  } catch (err) {
    const elapsedMs = Math.round(performance.now() - startTime);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        const error: ResponseError = {
          code: 'TIMEOUT',
          message: `Request timeout after ${timeoutMs}ms`,
        };
        return {
          ok: false,
          status: null,
          elapsedMs,
          sizeBytes: null,
          headers: {},
          rawBody: null,
          error,
        };
      }

      // CORS error check
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        const error: ResponseError = {
          code: 'CORS_ERROR',
          message: 'Request failed due to CORS restrictions.',
          details: 'The browser blocked this request. Use the CORS Bypass extension to make cross-origin requests.',
        };
        return {
          ok: false,
          status: null,
          elapsedMs,
          sizeBytes: null,
          headers: {},
          rawBody: null,
          error,
        };
      }

      const error: ResponseError = {
        code: 'NETWORK_ERROR',
        message: err.message,
      };
      return {
        ok: false,
        status: null,
        elapsedMs,
        sizeBytes: null,
        headers: {},
        rawBody: null,
        error,
      };
    }

    const error: ResponseError = {
      code: 'UNKNOWN',
      message: 'An unknown error occurred',
    };
    return {
      ok: false,
      status: null,
      elapsedMs,
      sizeBytes: null,
      headers: {},
      rawBody: null,
      error,
    };
  }
};

export const useApiDiffExecutor = (): UseApiDiffExecutorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    status: extensionStatus,
    isAvailable: isExtensionAvailable,
    executeRequest: executeViaExtension,
    checkConnection: checkExtension,
    checkPermission,
    requestPermission,
  } = useExtension({ autoCheck: true });

  /**
   * Execute request via extension
   */
  const executeExtensionFetch = useCallback(
    async (
      url: string,
      method: HttpMethod,
      headers: Record<string, string>,
      body: string | undefined,
      timeoutMs: number,
      includeCookies: boolean
    ): Promise<ResponseSide> => {
      const startTime = performance.now();

      try {
        const targetOrigin = new URL(url).origin;

        // Check permission
        const hasPermission = await checkPermission(targetOrigin);
        if (!hasPermission) {
          const granted = await requestPermission(targetOrigin);
          if (!granted) {
            const error: ResponseError = {
              code: 'PERMISSION_DENIED',
              message: `Permission denied for ${targetOrigin}. Please grant permission and try again.`,
            };
            return {
              ok: false,
              status: null,
              elapsedMs: Math.round(performance.now() - startTime),
              sizeBytes: null,
              headers: {},
              rawBody: null,
              error,
            };
          }
        }

        // Build RequestSpec
        const spec: RequestSpec = {
          id: generateId(),
          method,
          url,
          headers: Object.entries(headers).map(([key, value]) => ({
            key,
            value,
            enabled: true,
          })),
          body: body && method !== 'GET' ? { kind: 'json', text: body } : { kind: 'none' },
          options: {
            timeoutMs,
            redirect: 'follow',
            credentials: 'omit',
            includeCookies,
          },
        };

        const result = await executeViaExtension(spec);
        const elapsedMs = result.timingMs || Math.round(performance.now() - startTime);

        // Handle error response
        if (result.error) {
          const error: ResponseError = {
            code: 'NETWORK_ERROR',
            message: result.error.message,
          };
          return {
            ok: false,
            status: result.status || null,
            elapsedMs,
            sizeBytes: null,
            headers: result.headers || {},
            rawBody: null,
            error,
          };
        }

        // Extract body
        let rawBody: string | null = null;
        let sizeBytes: number | null = null;
        let parsedJson: unknown;

        if (result.body) {
          if (result.body.kind === 'text') {
            rawBody = result.body.data;
          } else if (result.body.kind === 'base64') {
            rawBody = atob(result.body.data);
          }

          if (rawBody) {
            sizeBytes = new Blob([rawBody]).size;
            try {
              parsedJson = JSON.parse(rawBody);
            } catch {
              // Not JSON
            }
          }
        }

        return {
          ok: result.ok,
          status: result.status || null,
          elapsedMs,
          sizeBytes,
          headers: result.headers || {},
          rawBody,
          parsedJson,
        };
      } catch (err) {
        const elapsedMs = Math.round(performance.now() - startTime);
        const error: ResponseError = {
          code: 'UNKNOWN',
          message: err instanceof Error ? err.message : 'Extension request failed',
        };
        return {
          ok: false,
          status: null,
          elapsedMs,
          sizeBytes: null,
          headers: {},
          rawBody: null,
          error,
        };
      }
    },
    [executeViaExtension, checkPermission, requestPermission]
  );

  /**
   * Execute single request
   */
  const executeSingleRequest = useCallback(
    async (
      url: string,
      method: HttpMethod,
      headers: Record<string, string>,
      body: string | undefined,
      useExtension: boolean,
      signal: AbortSignal,
      timeoutMs: number,
      includeCookies: boolean
    ): Promise<ResponseSide> => {
      if (useExtension && isExtensionAvailable) {
        const response = await executeExtensionFetch(url, method, headers, body, timeoutMs, includeCookies);
        return { ...response, method: 'extension' };
      }
      const response = await executeDirectFetch(url, method, headers, body, signal, timeoutMs);
      return { ...response, method: 'direct' };
    },
    [isExtensionAvailable, executeExtensionFetch]
  );

  /**
   * Execute requests to both domains
   * @param state The API diff state
   * @param forceExtension If true, always use extension for requests (for CORS bypass)
   */
  const executeRequests = useCallback(
    async (state: ApiDiffState, forceExtension = false): Promise<{ responseA: ResponseSide; responseB: ResponseSide }> => {
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      const headers = buildHeaders(state.headers, state.body, state.method);
      const urlA = buildUrl(state.domainA, state.path, state.params);
      const urlB = buildUrl(state.domainB, state.path, state.params);
      const useExt = forceExtension || isExtensionAvailable;
      const timeoutMs = DEFAULT_TIMEOUT_MS;

      try {
        // Execute both requests in parallel
        const [responseA, responseB] = await Promise.all([
          executeSingleRequest(
            urlA,
            state.method,
            headers,
            state.body || undefined,
            useExt,
            abortControllerRef.current.signal,
            timeoutMs,
            state.includeCookies
          ),
          executeSingleRequest(
            urlB,
            state.method,
            headers,
            state.body || undefined,
            useExt,
            abortControllerRef.current.signal,
            timeoutMs,
            state.includeCookies
          ),
        ]);

        return { responseA, responseB };
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [executeSingleRequest, isExtensionAvailable]
  );

  /**
   * Cancel current requests
   */
  const cancelRequests = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    executeRequests,
    cancelRequests,
    extensionStatus,
    checkExtension,
    isExtensionAvailable,
  };
};

export default useApiDiffExecutor;

