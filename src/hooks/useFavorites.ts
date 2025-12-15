import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'yowu-devtools:v1:app:favorites';
const SYNC_EVENT_NAME = 'favorites-changed';

/**
 * Hook for managing favorite tools.
 * Favorites are persisted in localStorage and synchronized across tabs and components.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    STORAGE_KEY,
    [],
    { syncEventName: SYNC_EVENT_NAME }
  );

  const toggleFavorite = useCallback(
    (toolId: string) => {
      setFavorites((prev) => {
        const isFavorite = prev.includes(toolId);
        return isFavorite
          ? prev.filter((id) => id !== toolId) // Remove
          : [...prev, toolId]; // Add (maintain registration order)
      });
    },
    [setFavorites]
  );

  const addFavorite = useCallback(
    (toolId: string) => {
      setFavorites((prev) => {
        if (prev.includes(toolId)) return prev;
        return [...prev, toolId];
      });
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (toolId: string) => {
      setFavorites((prev) => prev.filter((id) => id !== toolId));
    },
    [setFavorites]
  );

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return {
    favorites,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  } as const;
}
