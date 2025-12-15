/**
 * useApiHistory - Hook for managing API request history and favorites
 */

import { useState, useCallback, useEffect } from 'react';
import type { HistoryItem, ApiTesterState } from '../types';
import { generateId } from '../utils';

const HISTORY_STORAGE_KEY = 'yowu-devtools:v1:api-history';
const FAVORITES_STORAGE_KEY = 'yowu-devtools:v1:api-favorites';
const MAX_HISTORY_ITEMS = 30;

interface UseApiHistoryReturn {
  /** History items (most recent first) */
  history: HistoryItem[];
  /** Favorite item IDs */
  favorites: Set<string>;
  /** Add a new history item */
  addHistory: (
    state: ApiTesterState,
    response?: { status?: number; statusText?: string; timingMs?: number }
  ) => HistoryItem;
  /** Remove a history item */
  removeHistory: (id: string) => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Toggle favorite status */
  toggleFavorite: (id: string) => void;
  /** Check if item is favorited */
  isFavorite: (id: string) => boolean;
  /** Rename a history item */
  renameHistory: (id: string, name: string) => void;
  /** Get history item by ID */
  getHistoryItem: (id: string) => HistoryItem | undefined;
  /** Filter history by search term */
  searchHistory: (term: string) => HistoryItem[];
}

/**
 * Load history from localStorage
 */
const loadHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load API history:', e);
  }
  return [];
};

/**
 * Save history to localStorage
 */
const saveHistory = (history: HistoryItem[]): void => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save API history:', e);
  }
};

/**
 * Load favorites from localStorage
 */
const loadFavorites = (): Set<string> => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed to load API favorites:', e);
  }
  return new Set();
};

/**
 * Save favorites to localStorage
 */
const saveFavorites = (favorites: Set<string>): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch (e) {
    console.error('Failed to save API favorites:', e);
  }
};

export const useApiHistory = (): UseApiHistoryReturn => {
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites());

  // Save to localStorage when history changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Save to localStorage when favorites change
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  /**
   * Add a new history item
   */
  const addHistory = useCallback(
    (
      state: ApiTesterState,
      response?: { status?: number; statusText?: string; timingMs?: number }
    ): HistoryItem => {
      const newItem: HistoryItem = {
        id: generateId(),
        timestamp: Date.now(),
        request: {
          method: state.method,
          url: state.url,
          headers: state.headers.filter((h) => h.enabled && h.key),
          body: state.body,
        },
        response: response
          ? {
              status: response.status,
              statusText: response.statusText,
              timingMs: response.timingMs,
            }
          : undefined,
      };

      setHistory((prev) => {
        // Remove duplicates (same method + URL)
        const filtered = prev.filter(
          (item) => !(item.request.method === newItem.request.method && item.request.url === newItem.request.url)
        );
        // Add new item at the beginning and limit to max items
        const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        return newHistory;
      });

      return newItem;
    },
    []
  );

  /**
   * Remove a history item
   */
  const removeHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    // Also remove from favorites if present
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Clear all history (preserves favorites)
   */
  const clearHistory = useCallback(() => {
    // Keep only favorited items
    setHistory((prev) => prev.filter((item) => favorites.has(item.id)));
    // Do not clear favorites - they should be preserved
  }, [favorites]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /**
   * Check if item is favorited
   */
  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  /**
   * Rename a history item
   */
  const renameHistory = useCallback((id: string, name: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: name || undefined } : item))
    );
  }, []);

  /**
   * Get history item by ID
   */
  const getHistoryItem = useCallback(
    (id: string): HistoryItem | undefined => history.find((item) => item.id === id),
    [history]
  );

  /**
   * Filter history by search term
   */
  const searchHistory = useCallback(
    (term: string): HistoryItem[] => {
      if (!term.trim()) return history;
      const lower = term.toLowerCase();
      return history.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.request.url.toLowerCase().includes(lower) ||
          item.request.method.toLowerCase().includes(lower)
      );
    },
    [history]
  );

  return {
    history,
    favorites,
    addHistory,
    removeHistory,
    clearHistory,
    toggleFavorite,
    isFavorite,
    renameHistory,
    getHistoryItem,
    searchHistory,
  };
};

export default useApiHistory;

