/**
 * useHistory - Hook for managing API Diff execution history
 */

import { useState, useCallback } from 'react';
import type { HistoryItem, ApiDiffState } from '../types';
import { STORAGE_KEY_HISTORY, MAX_HISTORY_ITEMS, generateId } from '../constants';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

interface HistoryStore {
  version: 2;
  items: HistoryItem[];
}

interface UseHistoryReturn {
  /** History items */
  items: HistoryItem[];
  /** Add a new history item */
  addItem: (state: ApiDiffState) => void;
  /** Delete a history item */
  deleteItem: (id: string) => void;
  /** Clear all history */
  clearAll: () => void;
  /** Load state from history item */
  loadItem: (item: HistoryItem) => ApiDiffState | null;
}

/**
 * Encode state to share string (base64 compressed)
 */
export const encodeShare = (state: Partial<ApiDiffState>): string => {
  const shareData = {
    method: state.method,
    path: state.path,
    params: state.params?.filter((p) => p.key.trim() || p.value.trim()),
    headers: state.headers?.filter((h) => h.key.trim() || h.value.trim()),
    body: state.body,
    domainA: state.domainA,
    domainB: state.domainB,
  };
  const json = JSON.stringify(shareData);
  return compressToEncodedURIComponent(json);
};

/**
 * Decode share string to state
 */
export const decodeShare = (encoded: string): Partial<ApiDiffState> | null => {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Generate history item name from state
 */
const generateHistoryName = (state: ApiDiffState): string => {
  const params = state.params.filter((p) => p.key.trim());
  const queryString =
    params.length > 0
      ? '?' + params.map((p) => `${p.key}=${p.value}`).join('&')
      : '';
  const truncatedPath =
    state.path.length > 30 ? state.path.slice(0, 30) + '...' : state.path;
  return `${state.method} ${truncatedPath}${queryString}`;
};

/**
 * Load history from localStorage
 */
const loadHistoryFromStorage = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored) as HistoryStore;
      if (parsed.version === 2 && Array.isArray(parsed.items)) {
        return parsed.items;
      }
    }
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
  }
  return [];
};

export const useHistory = (): UseHistoryReturn => {
  const [items, setItems] = useState<HistoryItem[]>(loadHistoryFromStorage);

  // Save history to localStorage
  const saveHistory = useCallback((newItems: HistoryItem[]) => {
    setItems(newItems);
    try {
      const store: HistoryStore = { version: 2, items: newItems };
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(store));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
  }, []);

  // Add a new history item
  const addItem = useCallback(
    (state: ApiDiffState) => {
      const share = encodeShare(state);
      const name = generateHistoryName(state);

      // Remove duplicate (same share value)
      const filtered = items.filter((item) => item.share !== share);

      // Create new item
      const newItem: HistoryItem = {
        id: generateId(),
        ts: Date.now(),
        name,
        share,
      };

      // Add to front and limit to MAX_HISTORY_ITEMS
      const newItems = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(newItems);
    },
    [items, saveHistory]
  );

  // Delete a history item
  const deleteItem = useCallback(
    (id: string) => {
      const newItems = items.filter((item) => item.id !== id);
      saveHistory(newItems);
    },
    [items, saveHistory]
  );

  // Clear all history
  const clearAll = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Load state from history item
  const loadItem = useCallback((item: HistoryItem): ApiDiffState | null => {
    const decoded = decodeShare(item.share);
    if (!decoded) return null;
    return decoded as ApiDiffState;
  }, []);

  return {
    items,
    addItem,
    deleteItem,
    clearAll,
    loadItem,
  };
};

export default useHistory;

