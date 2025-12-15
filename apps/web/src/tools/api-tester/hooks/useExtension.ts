/**
 * useExtension - Hook for communicating with the Yowu DevTools Companion extension
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ExtensionStatus } from '../types';
import type {
  WebAppMessage,
  ExtensionResponse,
  RequestSpec,
  ResponseSpec,
} from '@yowu-devtools/shared';

// Get extension ID from environment or use default
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || '';

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
declare const chrome: {
  runtime?: {
    sendMessage: (
      extensionId: string,
      message: unknown,
      callback: (response: unknown) => void
    ) => void;
    lastError?: { message: string };
  };
} | undefined;

/**
 * Send a message to the extension
 */
const sendMessage = <T extends ExtensionResponse>(
  extensionId: string,
  message: WebAppMessage
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

    try {
      chrome.runtime.sendMessage(extensionId, message, (response: unknown) => {
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
      reject(err);
    }
  });
};

export const useExtension = (options: UseExtensionOptions = {}): UseExtensionReturn => {
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
    if (!extensionId) {
      setStatus('not-installed');
      setError('Extension ID not configured. Set VITE_EXTENSION_ID in your environment.');
      return false;
    }

    if (checkInProgress.current) {
      return status === 'connected';
    }

    checkInProgress.current = true;
    setStatus('checking');
    setError(null);

    try {
      const response = await sendMessage<ExtensionResponse>(extensionId, {
        type: 'PING',
        version: '1.0.0',
      });

      if (response.type === 'PONG') {
        setStatus('connected');
        checkInProgress.current = false;
        return true;
      }

      setStatus('not-installed');
      checkInProgress.current = false;
      return false;
    } catch (err) {
      // Extension not installed or not responding
      setStatus('not-installed');
      setError(err instanceof Error ? err.message : 'Failed to connect to extension');
      checkInProgress.current = false;
      return false;
    }
  }, [extensionId, status]);

  /**
   * Execute a request through the extension
   */
  const executeRequest = useCallback(
    async (spec: RequestSpec): Promise<ResponseSpec> => {
      if (!extensionId) {
        throw new Error('Extension ID not configured');
      }

      const response = await sendMessage<ExtensionResponse>(extensionId, {
        type: 'EXECUTE_REQUEST',
        version: '1.0.0',
        payload: spec,
      });

      if (response.type === 'ERROR') {
        throw new Error(response.error.message);
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
   */
  const checkPermission = useCallback(
    async (origin: string): Promise<boolean> => {
      if (!extensionId) return false;

      try {
        const response = await sendMessage<ExtensionResponse>(extensionId, {
          type: 'CHECK_PERMISSION',
          version: '1.0.0',
          payload: { origin },
        });

        if (response.type === 'PERMISSION_STATUS') {
          return response.payload.granted;
        }

        return false;
      } catch {
        return false;
      }
    },
    [extensionId]
  );

  /**
   * Request permission for origin
   */
  const requestPermission = useCallback(
    async (origin: string): Promise<boolean> => {
      if (!extensionId) return false;

      try {
        const response = await sendMessage<ExtensionResponse>(extensionId, {
          type: 'REQUEST_PERMISSION',
          version: '1.0.0',
          payload: { origin },
        });

        if (response.type === 'PERMISSION_STATUS') {
          return response.payload.granted;
        }

        if (response.type === 'ERROR') {
          setError(response.error.message);
          return false;
        }

        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Permission request failed');
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
    
    // Use timeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      checkConnection();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [autoCheck, extensionId, checkConnection]);

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

