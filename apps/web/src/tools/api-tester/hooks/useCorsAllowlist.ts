/**
 * useCorsAllowlist - Hook for managing CORS bypass allowlist by origin
 * 
 * Stores allowed origins in localStorage to automatically use extension
 * for CORS bypass without showing the modal repeatedly.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'yowu-devtools:v1:api-cors-allowlist';

interface UseCorsAllowlistReturn {
  /** Set of allowed origins */
  allowedOrigins: Set<string>;
  /** Check if origin is allowed */
  isAllowed: (url: string) => boolean;
  /** Add origin to allowlist */
  addOrigin: (url: string) => void;
  /** Remove origin from allowlist */
  removeOrigin: (origin: string) => void;
  /** Clear all allowed origins */
  clearAllowlist: () => void;
  /** Get origin from URL */
  getOrigin: (url: string) => string | null;
}

/**
 * Extract origin from URL string
 */
const extractOrigin = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return null;
  }
};

/**
 * Load allowlist from localStorage
 */
const loadAllowlist = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed to load CORS allowlist:', e);
  }
  return new Set();
};

/**
 * Save allowlist to localStorage
 */
const saveAllowlist = (allowlist: Set<string>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...allowlist]));
  } catch (e) {
    console.error('Failed to save CORS allowlist:', e);
  }
};

export const useCorsAllowlist = (): UseCorsAllowlistReturn => {
  const [allowedOrigins, setAllowedOrigins] = useState<Set<string>>(() => loadAllowlist());

  // Save to localStorage when allowlist changes
  useEffect(() => {
    saveAllowlist(allowedOrigins);
  }, [allowedOrigins]);

  /**
   * Get origin from URL
   */
  const getOrigin = useCallback((url: string): string | null => {
    return extractOrigin(url);
  }, []);

  /**
   * Check if origin is allowed for CORS bypass
   */
  const isAllowed = useCallback((url: string): boolean => {
    const origin = extractOrigin(url);
    if (!origin) return false;
    return allowedOrigins.has(origin);
  }, [allowedOrigins]);

  /**
   * Add origin to allowlist
   */
  const addOrigin = useCallback((url: string): void => {
    const origin = extractOrigin(url);
    if (!origin) return;
    
    setAllowedOrigins((prev) => {
      const next = new Set(prev);
      next.add(origin);
      return next;
    });
  }, []);

  /**
   * Remove origin from allowlist
   */
  const removeOrigin = useCallback((origin: string): void => {
    setAllowedOrigins((prev) => {
      const next = new Set(prev);
      next.delete(origin);
      return next;
    });
  }, []);

  /**
   * Clear all allowed origins
   */
  const clearAllowlist = useCallback((): void => {
    setAllowedOrigins(new Set());
  }, []);

  return {
    allowedOrigins,
    isAllowed,
    addOrigin,
    removeOrigin,
    clearAllowlist,
    getOrigin,
  };
};

export default useCorsAllowlist;

