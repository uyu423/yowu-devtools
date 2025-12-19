import { useCallback, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { toast } from 'sonner';
import { getToolById } from '../tools';
import { useI18n } from './useI18nHooks';
import { MAX_SHARE_URL_LENGTH } from '@/lib/constants';

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

/**
 * Check if location.state has meaningful data (not empty object)
 */
function hasValidLocationState(locationState: unknown): boolean {
  if (!locationState || typeof locationState !== 'object') {
    return false;
  }
  // Empty object {} is not valid state data
  return Object.keys(locationState as object).length > 0;
}

function getInitialState<T>(
  toolId: string,
  defaultState: T,
  search: string,
  locationState?: unknown
): T {
  if (typeof window === 'undefined') {
    return cloneState(defaultState);
  }

  // Priority 1: Check location.state (direct navigation from API Tester)
  // Skip empty objects that may result from history.replaceState({})
  if (hasValidLocationState(locationState)) {
    try {
      const stateData = locationState as Partial<T> & { tool?: string };
      // Validate that it's for the correct tool (if toolId is in state)
      if ('tool' in stateData && stateData.tool === toolId) {
        // Remove tool field before merging
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tool, ...rest } = stateData;
        return { ...cloneState(defaultState), ...rest };
      } else if (!('tool' in stateData)) {
        // If no tool field, assume it's direct state data
        return { ...cloneState(defaultState), ...stateData };
      }
    } catch {
      // ignore invalid state
    }
  }

  // Priority 2: Check URL parameter (shared link)
  const params = new URLSearchParams(search);
  const payload = params.get('d');
  if (payload) {
    // Don't show error toast during initialization - will be handled by useEffect if needed
    const decoded = decodePayload<T>(payload, toolId, '');
    if (decoded) {
      return { ...cloneState(defaultState), ...decoded };
    }
  }

  // Priority 3: Check localStorage (saved state)
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
  const { t } = useI18n();
  const location = useLocation();
  const [state, setState] = useState<T>(() =>
    getInitialState(toolId, defaultState, location.search, location.state)
  );

  // Track if we've already applied location.state to prevent re-applying
  // after history.replaceState clears it
  const appliedLocationStateRef = useRef(false);

  // Update state when URL search params or location state change
  // Priority: location.state > URL param > localStorage
  useEffect(() => {
    // Priority 1: Check location.state (direct navigation from API Tester)
    // Skip if we've already applied it or if it's an empty object
    if (hasValidLocationState(location.state) && !appliedLocationStateRef.current) {
      try {
        const stateData = location.state as Partial<T> & { tool?: string };
        // Validate that it's for the correct tool (if toolId is in state)
        if ('tool' in stateData && stateData.tool === toolId) {
          // Remove tool field before merging
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { tool, ...rest } = stateData;
          setState({ ...cloneState(defaultState), ...rest });
          // Mark as applied and clear location.state to prevent re-applying on re-render
          appliedLocationStateRef.current = true;
          window.history.replaceState({}, '', location.pathname + location.search);
          return;
        } else if (!('tool' in stateData)) {
          // If no tool field, assume it's direct state data
          setState({ ...cloneState(defaultState), ...stateData });
          // Mark as applied and clear location.state
          appliedLocationStateRef.current = true;
          window.history.replaceState({}, '', location.pathname + location.search);
          return;
        }
      } catch {
        // ignore invalid state
      }
    }

    // Priority 2: Check URL parameter (shared link)
    const params = new URLSearchParams(location.search);
    const payload = params.get('d');
    if (payload) {
      const decoded = decodePayload<T>(payload, toolId, t('common.sharedUrlInvalid'));
      if (decoded) {
        setState({ ...cloneState(defaultState), ...decoded });
        return;
      }
    }

    // Priority 3: Restore from localStorage if available
    // Only restore from localStorage if:
    // - there's no URL param
    // - we haven't already applied location.state (to prevent overwriting state from navigation)
    if (!payload && !appliedLocationStateRef.current) {
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
  }, [location.search, location.state, toolId, t]);

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
      toast.success(t('common.shareLinkCopied'));
      return shareUrl;
    } catch (error) {
      console.error(error);
      toast.error(t('common.unableToCopyShareLink'));
      return null;
    }
  }, [generateShareUrl, t]);

  // Share via Web Share API (mobile)
  const shareViaWebShare = useCallback(async () => {
    try {
      const shareUrl = generateShareUrl();
      const tool = getToolById(toolId);
      const toolTitle = tool?.title || toolId;

      // Format share text with title at top, privacy message, then URL at the end
      // Include URL in text instead of separate 'url' parameter to control the order
      const shareTitle = `🔗 ${toolTitle} - tools.yowu.dev`;
      const shareText = `${shareTitle}\n\nAll processing happens in your browser - your data stays private. 🛡️\n\n${shareUrl}`;

      if (navigator.share && typeof navigator.share === 'function') {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
        toast.success(t('common.sharedSuccessfully'));
        return shareUrl;
      } else {
        // Fallback to clipboard if Web Share API not available
        await navigator.clipboard?.writeText(shareUrl);
        toast.success(t('common.shareLinkCopied'));
        return shareUrl;
      }
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      console.error(error);
      toast.error(t('common.unableToShare'));
      return null;
    }
  }, [generateShareUrl, toolId, t]);

  // Get share state info (for ShareModal)
  const getShareStateInfo = useCallback(() => {
    const stateToShare = options?.shareStateFilter
      ? options.shareStateFilter(state)
      : state;

    const includedFields = Object.keys(stateToShare);
    const excludedFields = options?.shareStateFilter
      ? Object.keys(state).filter((key) => !(key in stateToShare))
      : [];

    // Calculate share URL length
    const shareUrl = generateShareUrl();
    const urlLength = shareUrl.length;
    const isUrlTooLong = urlLength > MAX_SHARE_URL_LENGTH;

    return {
      includedFields,
      excludedFields,
      stateToShare,
      urlLength,
      maxUrlLength: MAX_SHARE_URL_LENGTH,
      isUrlTooLong,
    };
  }, [state, options, generateShareUrl]);

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
    generateShareUrl, // Generate share URL without copying/sharing
    copyShareLink, // PC: Copy to clipboard immediately
    shareViaWebShare, // Mobile: Use Web Share API
    getShareStateInfo, // v1.2.0: Get share state info for ShareModal
  } as const;
}

function decodePayload<T>(encoded: string, toolId: string, errorMessage?: string) {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const payload = JSON.parse(json) as ShareEnvelope<Partial<T>>;
    if (payload.tool !== toolId) return null;
    return payload.state as Partial<T>;
  } catch (error) {
    console.error('Failed to decode shared payload', error);
    // Only show toast if errorMessage is provided and not empty
    if (errorMessage) {
      toast.error(errorMessage);
    }
    return null;
  }
}
