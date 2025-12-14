import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'yowu-devtools:v1:app:recentTools';
const MAX_RECENT_TOOLS = 5;

export interface RecentTool {
  toolId: string;
  timestamp: number;
}

function getRecentTools(): RecentTool[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw) as RecentTool[];
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch {
    return [];
  }
}

function saveRecentTools(tools: RecentTool[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  } catch (error) {
    console.error('Failed to save recent tools:', error);
  }
}

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(() => getRecentTools());

  const addRecentTool = useCallback((toolId: string) => {
    setRecentTools((prev) => {
      // 기존 항목에서 같은 toolId 제거
      const filtered = prev.filter((tool) => tool.toolId !== toolId);
      
      // 새 항목을 맨 앞에 추가
      const updated: RecentTool[] = [
        { toolId, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_TOOLS); // 최대 개수 제한
      
      saveRecentTools(updated);
      return updated;
    });
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    saveRecentTools([]);
  }, []);

  // localStorage 변경 감지 (다른 탭에서 변경된 경우)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRecentTools(getRecentTools());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    recentTools,
    addRecentTool,
    clearRecentTools,
  } as const;
}

