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

  const shareState = useCallback(async () => {
    try {
      // Apply filter if provided, otherwise use full state
      const stateToShare = options?.shareStateFilter
        ? options.shareStateFilter(state)
        : state;
      const envelope: ShareEnvelope<Partial<T>> = {
        v: 1,
        tool: toolId,
        state: stateToShare,
      };
      const encoded = compressToEncodedURIComponent(JSON.stringify(envelope));
      // Query parameter must be before hash to be readable by location.search
      // BrowserRouter doesn't use hash routing, so we can use query parameter directly
      const shareUrl = `${window.location.origin}${location.pathname}?d=${encoded}`;
      await navigator.clipboard?.writeText(shareUrl);
      toast.success('Share link copied.');
      return shareUrl;
    } catch (error) {
      console.error(error);
      toast.error('Unable to copy share link.');
      return null;
    }
  }, [location.pathname, state, toolId, options]);

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
    shareState,
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
