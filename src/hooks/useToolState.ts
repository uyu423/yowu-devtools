import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
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

export function useToolState<T extends object>(toolId: string, defaultState: T) {
  const location = useLocation();
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return cloneState(defaultState);
    }

    const params = new URLSearchParams(location.search);
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
  });

  const setAndPersist = useCallback((updater: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          `${STORAGE_PREFIX}${toolId}`,
          JSON.stringify({ state: next, updatedAt: Date.now() } satisfies StoredToolState<T>),
        );
      }
      return next;
    });
  }, [toolId]);

  const resetState = useCallback(() => {
    const base = cloneState(defaultState);
    setAndPersist(base);
  }, [defaultState, setAndPersist]);

  const shareState = useCallback(async () => {
    try {
      const envelope: ShareEnvelope<T> = { v: 1, tool: toolId, state };
      const encoded = compressToEncodedURIComponent(JSON.stringify(envelope));
      const baseUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const shareUrl = `${baseUrl}#${location.pathname}?d=${encoded}`;
      await navigator.clipboard?.writeText(shareUrl);
      toast.success('Share link copied.');
      return shareUrl;
    } catch (error) {
      console.error(error);
      toast.error('Unable to copy share link.');
      return null;
    }
  }, [location.pathname, state, toolId]);

  const applyState = useCallback((partial: Partial<T>) => {
    setAndPersist(prev => ({ ...prev, ...partial }));
  }, [setAndPersist]);

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
    const payload = JSON.parse(json) as ShareEnvelope<T>;
    if (payload.tool !== toolId) return null;
    return payload.state;
  } catch (error) {
    console.error('Failed to decode shared payload', error);
    toast.error('Shared URL is invalid. Restoring default state.');
    return null;
  }
}
