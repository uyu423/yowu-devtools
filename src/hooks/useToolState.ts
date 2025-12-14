import { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { toast } from 'sonner';

const STORAGE_PREFIX = 'yowu-devtools:v1:tool:';

interface StoredToolState<T> {
  state: T;
  updatedAt: number;
}

interface ShareEnvelope<T> {
  v: number;
  tool: string;
  state: T;
}

function cloneState<T>(state: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state)) as T;
}

function getInitialState<T>(
  toolId: string,
  defaultState: T,
  search: string
): T {
  if (typeof window === 'undefined') {
    return cloneState(defaultState);
  }

  const params = new URLSearchParams(search);
  const payload = params.get('d');
  if (payload) {
    const decoded = decodePayload<T>(payload, toolId);
    if (decoded) {
      return { ...cloneState(defaultState), ...decoded };
    }
  }

  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${toolId}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as StoredToolState<T>;
      if (parsed?.state) {
        return { ...cloneState(defaultState), ...parsed.state };
      }
    } catch {
      // ignore broken storage
    }
  }

  return cloneState(defaultState);
}

export function useToolState<T extends object>(
  toolId: string,
  defaultState: T,
  options?: {
    /**
     * Filter function to select only necessary fields for sharing.
     * This helps reduce URL length by excluding UI-only state or large computed values.
     */
    shareStateFilter?: (state: T) => Partial<T>;
  }
) {
  const location = useLocation();
  const [state, setState] = useState<T>(() =>
    getInitialState(toolId, defaultState, location.search)
  );

  // Update state when URL search params change (e.g., when navigating to shared URL)
  // Using useEffect to sync state with URL params is necessary for shared URL restoration
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payload = params.get('d');
    if (payload) {
      const decoded = decodePayload<T>(payload, toolId);
      if (decoded) {
        setState({ ...cloneState(defaultState), ...decoded });
        return;
      }
    }
    // If no URL param, restore from localStorage if available
    // Only restore from localStorage if there's no URL param to avoid overwriting shared state
    if (!payload) {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${toolId}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredToolState<T>;
          if (parsed?.state) {
            setState({ ...cloneState(defaultState), ...parsed.state });
          }
        } catch {
          // ignore broken storage
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, toolId]);

  const setAndPersist = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof updater === 'function'
            ? (updater as (prev: T) => T)(prev)
            : updater;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            `${STORAGE_PREFIX}${toolId}`,
            JSON.stringify({
              state: next,
              updatedAt: Date.now(),
            } satisfies StoredToolState<T>)
          );
        }
        return next;
      });
    },
    [toolId]
  );

  const resetState = useCallback(() => {
    const base = cloneState(defaultState);
    setAndPersist(base);
  }, [defaultState, setAndPersist]);

  // Generate share URL without copying/sharing
  const generateShareUrl = useCallback(() => {
    const stateToShare = options?.shareStateFilter
      ? options.shareStateFilter(state)
      : state;
    const envelope: ShareEnvelope<Partial<T>> = {
      v: 1,
      tool: toolId,
      state: stateToShare,
    };
    const encoded = compressToEncodedURIComponent(JSON.stringify(envelope));
    return `${window.location.origin}${location.pathname}?d=${encoded}`;
  }, [location.pathname, state, toolId, options]);

  // Copy share link to clipboard (PC)
  const copyShareLink = useCallback(async () => {
    try {
      const shareUrl = generateShareUrl();
      await navigator.clipboard?.writeText(shareUrl);
      toast.success('Share link copied.');
      return shareUrl;
    } catch (error) {
      console.error(error);
      toast.error('Unable to copy share link.');
      return null;
    }
  }, [generateShareUrl]);

  // Share via Web Share API (mobile)
  const shareViaWebShare = useCallback(async () => {
    try {
      const shareUrl = generateShareUrl();
      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({
          title: `Share ${toolId} state`,
          text: `Check out this ${toolId} tool state`,
          url: shareUrl,
        });
        toast.success('Shared successfully.');
        return shareUrl;
      } else {
        // Fallback to clipboard if Web Share API not available
        await navigator.clipboard?.writeText(shareUrl);
        toast.success('Share link copied.');
        return shareUrl;
      }
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      console.error(error);
      toast.error('Unable to share.');
      return null;
    }
  }, [generateShareUrl, toolId]);

  // Legacy shareState function (kept for backward compatibility, but deprecated)
  // Use copyShareLink (PC) or shareViaWebShare (mobile) instead
  const shareState = useCallback(async () => {
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);

    if (isMobile && navigator.share && typeof navigator.share === 'function') {
      return shareViaWebShare();
    } else {
      return copyShareLink();
    }
  }, [copyShareLink, shareViaWebShare]);

  // Get share state info (for ShareModal)
  const getShareStateInfo = useCallback(() => {
    const stateToShare = options?.shareStateFilter
      ? options.shareStateFilter(state)
      : state;
    
    const includedFields = Object.keys(stateToShare);
    const excludedFields = options?.shareStateFilter
      ? Object.keys(state).filter(key => !(key in stateToShare))
      : [];
    
    return {
      includedFields,
      excludedFields,
      stateToShare,
    };
  }, [state, options]);

  const applyState = useCallback(
    (partial: Partial<T>) => {
      setAndPersist((prev) => ({ ...prev, ...partial }));
    },
    [setAndPersist]
  );

  return {
    state,
    setState: setAndPersist,
    updateState: applyState,
    resetState,
    shareState, // Legacy: Use copyShareLink or shareViaWebShare instead
    generateShareUrl, // Generate share URL without copying/sharing
    copyShareLink, // PC: Copy to clipboard immediately
    shareViaWebShare, // Mobile: Use Web Share API
    getShareStateInfo, // v1.2.0: Get share state info for ShareModal
  } as const;
}

function decodePayload<T>(encoded: string, toolId: string) {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload = JSON.parse(json) as ShareEnvelope<Partial<T>>;
    if (payload.tool !== toolId) return null;
    return payload.state as Partial<T>;
  } catch (error) {
    console.error('Failed to decode shared payload', error);
    toast.error('Shared URL is invalid. Restoring default state.');
    return null;
  }
}
