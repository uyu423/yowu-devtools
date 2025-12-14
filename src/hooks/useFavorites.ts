import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'yowu-devtools:v1:app:favorites';

function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const isFavorite = prev.includes(toolId);
      const updated = isFavorite
        ? prev.filter((id) => id !== toolId) // 제거
        : [...prev, toolId]; // 추가 (등록 순서 유지)
      
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const addFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      if (prev.includes(toolId)) return prev;
      const updated = [...prev, toolId];
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((id) => id !== toolId);
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  // localStorage 변경 감지 (다른 탭에서 변경된 경우)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(getFavorites());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    favorites,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  } as const;
}

