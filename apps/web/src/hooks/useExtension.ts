/**
 * useExtension - Hook for communicating with the Yowu DevTools Companion extension
 *
 * This is a shared hook used by multiple tools (API Tester, API Burst Test, etc.)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ExtensionStatus } from '@/lib/extension';
import { EXTENSION_ID as DEFAULT_EXTENSION_ID } from '@/lib/extension';
import type {
  WebAppMessage,
  ExtensionResponse,
  RequestSpec,
  ResponseSpec,
} from '@yowu-devtools/shared';

// Get extension ID from environment or use default from constants
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || DEFAULT_EXTENSION_ID;

interface UseExtensionOptions {
  /** Extension ID override */
  extensionId?: string;
  /** Auto-check connection on mount */
  autoCheck?: boolean;
}

interface UseExtensionReturn {
  /** Current extension status */
  status: ExtensionStatus;
  /** Extension ID being used */
  extensionId: string;
  /** Whether extension is available (connected or permission-required) */
  isAvailable: boolean;
  /** Check extension connection */
  checkConnection: () => Promise<boolean>;
  /** Send a request through the extension */
  executeRequest: (spec: RequestSpec) => Promise<ResponseSpec>;
  /** Check if extension has permission for origin */
  checkPermission: (origin: string) => Promise<boolean>;
  /** Request permission for origin */
  requestPermission: (origin: string) => Promise<boolean>;
  /** Get all granted origins */
  getGrantedOrigins: () => Promise<string[]>;
  /** Error message if any */
  error: string | null;
}

// Chrome Extension API type declaration for WebApp
declare const chrome:
  | {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback: (response: unknown) => void
        ) => void;
        lastError?: { message: string };
      };
    }
  | undefined;

/** Default timeout for extension messages (ms) */
const MESSAGE_TIMEOUT = 3000;
/** Timeout for API requests through extension (ms) */
const REQUEST_TIMEOUT = 60000; // 60 seconds for actual API calls

/** localStorage key for granted origins cache */
const GRANTED_ORIGINS_CACHE_KEY = 'yowu-devtools:v1:extension:grantedOrigins';

/**
 * Get cached granted origins from localStorage
 */
const getCachedGrantedOrigins = (): Set<string> => {
  try {
    const cached = localStorage.getItem(GRANTED_ORIGINS_CACHE_KEY);
    if (cached) {
      return new Set(JSON.parse(cached));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
};

/**
 * Add origin to cached granted origins
 */
const addCachedGrantedOrigin = (origin: string): void => {
  try {
    const cached = getCachedGrantedOrigins();
    cached.add(origin);
    localStorage.setItem(
      GRANTED_ORIGINS_CACHE_KEY,
      JSON.stringify([...cached])
    );
  } catch {
    // Ignore storage errors
  }
};

/**
 * Check if origin is in cached granted origins
 */
const isCachedGrantedOrigin = (origin: string): boolean => {
  return getCachedGrantedOrigins().has(origin);
};

/**
 * Send a message to the extension with timeout
 */
const sendMessage = <T extends ExtensionResponse>(
  extensionId: string,
  message: WebAppMessage,
  timeout: number = MESSAGE_TIMEOUT
): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (!extensionId) {
      reject(new Error('Extension ID not configured'));
      return;
    }

    if (typeof chrome === 'undefined' || !chrome?.runtime?.sendMessage) {
      reject(new Error('Chrome runtime not available'));
      return;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(new Error('Extension did not respond in time'));
    }, timeout);

    try {
      chrome.runtime.sendMessage(extensionId, message, (response: unknown) => {
        clearTimeout(timeoutId);

        if (chrome?.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error('No response from extension'));
          return;
        }
        resolve(response as T);
      });
    } catch (err) {
      clearTimeout(timeoutId);
      reject(err);
    }
  });
};

export const useExtension = (
  options: UseExtensionOptions = {}
): UseExtensionReturn => {
  const { extensionId = EXTENSION_ID, autoCheck = true } = options;

  // Initialize status based on extensionId availability
  const [status, setStatus] = useState<ExtensionStatus>(() =>
    extensionId ? 'checking' : 'not-installed'
  );
  const [error, setError] = useState<string | null>(null);
  const checkInProgress = useRef(false);

  /**
   * Check if extension is connected
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    console.log('[useExtension] checkConnection called, extensionId:', extensionId);

    if (!extensionId) {
      console.log('[useExtension] No extension ID configured');
      setStatus('not-installed');
      setError(
        'Extension ID not configured. Set VITE_EXTENSION_ID in your environment.'
      );
      return false;
    }

    if (checkInProgress.current) {
      console.log('[useExtension] Check already in progress, skipping');
      return false;
    }

    checkInProgress.current = true;
    setStatus('checking');
    setError(null);
    console.log('[useExtension] Sending PING to extension...');

    try {
      const response = await sendMessage<ExtensionResponse>(extensionId, {
        type: 'PING',
        version: '1.0.0',
      });

      console.log('[useExtension] PING response:', response);

      if (response.type === 'PONG') {
        console.log('[useExtension] Extension connected!');
        setStatus('connected');
        checkInProgress.current = false;
        return true;
      }

      console.log('[useExtension] Unexpected response type:', response.type);
      setStatus('not-installed');
      checkInProgress.current = false;
      return false;
    } catch (err) {
      // Extension not installed or not responding
      console.error('[useExtension] PING failed:', err);
      setStatus('not-installed');
      setError(
        err instanceof Error ? err.message : 'Failed to connect to extension'
      );
      checkInProgress.current = false;
      return false;
    }
  }, [extensionId]);

  /**
   * Execute a request through the extension
   */
  const executeRequest = useCallback(
    async (spec: RequestSpec): Promise<ResponseSpec> => {
      if (!extensionId) {
        throw new Error('Extension ID not configured');
      }

      console.log('[useExtension] Executing request via extension:', spec.url);

      // Use longer timeout for actual API requests
      const response = await sendMessage<ExtensionResponse>(
        extensionId,
        {
          type: 'EXECUTE_REQUEST',
          version: '1.0.0',
          payload: spec,
        },
        REQUEST_TIMEOUT
      );

      console.log('[useExtension] Got response:', response.type);

      if (response.type === 'ERROR') {
        console.error('[useExtension] Extension error:', response.error);
        // Create error with details attached
        const error = new Error(response.error.message) as Error & {
          details?: string;
          code?: string;
        };
        error.code = response.error.code;
        error.details = `Error Code: ${response.error.code}\nMessage: ${response.error.message}`;
        throw error;
      }

      if (response.type === 'RESPONSE') {
        return response.payload;
      }

      throw new Error('Unexpected response type');
    },
    [extensionId]
  );

  /**
   * Check if extension has permission for origin
   * First checks localStorage cache, then verifies with extension if not cached
   */
  const checkPermission = useCallback(
    async (origin: string): Promise<boolean> => {
      console.log('[useExtension] checkPermission called for:', origin);

      // First, check localStorage cache
      if (isCachedGrantedOrigin(origin)) {
        console.log(
          '[useExtension] checkPermission: Found in cache, skipping extension check'
        );
        return true;
      }

      if (!extensionId) {
        console.log('[useExtension] checkPermission: No extension ID');
        return false;
      }

      try {
        console.log(
          '[useExtension] checkPermission: Sending CHECK_PERMISSION message...'
        );
        const response = await sendMessage<ExtensionResponse>(extensionId, {
          type: 'CHECK_PERMISSION',
          version: '1.0.0',
          payload: { origin },
        });
        console.log('[useExtension] checkPermission response:', response);

        if (response.type === 'PERMISSION_STATUS') {
          const granted = response.payload.granted;
          console.log('[useExtension] checkPermission: granted =', granted);

          // Cache the granted permission
          if (granted) {
            addCachedGrantedOrigin(origin);
            console.log('[useExtension] checkPermission: Added to cache');
          }

          return granted;
        }

        console.log('[useExtension] checkPermission: Unexpected response type');
        return false;
      } catch (err) {
        console.error('[useExtension] checkPermission error:', err);
        return false;
      }
    },
    [extensionId]
  );

  /**
   * Request permission for origin
   * On success, caches the granted origin in localStorage
   */
  const requestPermission = useCallback(
    async (origin: string): Promise<boolean> => {
      console.log('[useExtension] requestPermission called for:', origin);
      if (!extensionId) {
        console.log('[useExtension] requestPermission: No extension ID');
        return false;
      }

      try {
        console.log(
          '[useExtension] requestPermission: Sending REQUEST_PERMISSION message...'
        );
        const response = await sendMessage<ExtensionResponse>(extensionId, {
          type: 'REQUEST_PERMISSION',
          version: '1.0.0',
          payload: { origin },
        });
        console.log('[useExtension] requestPermission response:', response);

        if (response.type === 'PERMISSION_STATUS') {
          const granted = response.payload.granted;
          console.log('[useExtension] requestPermission: granted =', granted);

          // Cache the granted permission
          if (granted) {
            addCachedGrantedOrigin(origin);
            console.log('[useExtension] requestPermission: Added to cache');
          }

          return granted;
        }

        if (response.type === 'ERROR') {
          console.error(
            '[useExtension] requestPermission: Error from extension:',
            response.error
          );
          setError(response.error.message);
          return false;
        }

        console.log(
          '[useExtension] requestPermission: Unexpected response type'
        );
        return false;
      } catch (err) {
        console.error('[useExtension] requestPermission error:', err);
        setError(
          err instanceof Error ? err.message : 'Permission request failed'
        );
        return false;
      }
    },
    [extensionId]
  );

  /**
   * Get all granted origins
   */
  const getGrantedOrigins = useCallback(async (): Promise<string[]> => {
    if (!extensionId) return [];

    try {
      const response = await sendMessage<ExtensionResponse>(extensionId, {
        type: 'GET_GRANTED_ORIGINS',
        version: '1.0.0',
      });

      if (response.type === 'GRANTED_ORIGINS') {
        return response.payload.origins;
      }

      return [];
    } catch {
      return [];
    }
  }, [extensionId]);

  // Auto-check connection on mount
  useEffect(() => {
    if (!extensionId || !autoCheck) {
      return;
    }

    // Call checkConnection directly - checkInProgress ref prevents duplicate calls in Strict Mode
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  return {
    status,
    extensionId,
    isAvailable: status === 'connected' || status === 'permission-required',
    checkConnection,
    executeRequest,
    checkPermission,
    requestPermission,
    getGrantedOrigins,
    error,
  };
};

export default useExtension;

