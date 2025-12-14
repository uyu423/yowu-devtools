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

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const isFavorite = prev.includes(toolId);
      const updated = isFavorite
        ? prev.filter((id) => id !== toolId) // 제거
        : [...prev, toolId]; // 추가 (등록 순서 유지)
      
      // localStorage에 저장하고 이벤트 발생
      // 이벤트는 다른 컴포넌트(Sidebar, CommandPalette) 동기화용
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('favorites-changed', { detail: updated }));
        } catch (error) {
          console.error('Failed to save favorites:', error);
        }
      }
      
      return updated;
    });
  }, []);

  const addFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      if (prev.includes(toolId)) return prev;
      const updated = [...prev, toolId];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('favorites-changed', { detail: updated }));
        } catch (error) {
          console.error('Failed to save favorites:', error);
        }
      }
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((id) => id !== toolId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('favorites-changed', { detail: updated }));
        } catch (error) {
          console.error('Failed to save favorites:', error);
        }
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        window.dispatchEvent(new CustomEvent('favorites-changed', { detail: [] }));
      } catch (error) {
        console.error('Failed to save favorites:', error);
      }
    }
  }, []);

  // localStorage 변경 감지 (다른 탭에서 변경된 경우 + 같은 탭에서 변경된 경우)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        // localStorage에서 직접 읽어서 상태 업데이트
        setFavorites(getFavorites());
      }
    };

    const handleFavoritesChanged = (e: Event) => {
      // 커스텀 이벤트의 detail에서 직접 값을 가져와서 상태 업데이트
      // 이렇게 하면 클로저 문제를 피하고 항상 최신 값을 가져올 수 있음
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setFavorites(customEvent.detail);
      } else {
        // detail이 없는 경우 localStorage에서 읽기
        setFavorites(getFavorites());
      }
    };

    // 다른 탭에서 변경된 경우
    window.addEventListener('storage', handleStorageChange);
    // 같은 탭에서 변경된 경우 (다른 컴포넌트에서 변경된 경우 동기화)
    window.addEventListener('favorites-changed', handleFavoritesChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favorites-changed', handleFavoritesChanged);
    };
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



