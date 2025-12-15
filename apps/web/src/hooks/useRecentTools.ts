import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'yowu-devtools:v1:app:recentTools';
const MAX_RECENT_TOOLS = 3;

export interface RecentTool {
  toolId: string;
  timestamp: number;
}

/**
 * Hook for managing recently used tools.
 * Recent tools are persisted in localStorage and synchronized across tabs.
 */
export function useRecentTools() {
  const [recentTools, setRecentTools] = useLocalStorage<RecentTool[]>(
    STORAGE_KEY,
    []
  );

  const addRecentTool = useCallback(
    (toolId: string) => {
      setRecentTools((prev) => {
        // Remove existing entry with the same toolId
        const filtered = prev.filter((tool) => tool.toolId !== toolId);

        // Add new entry at the beginning
        const updated: RecentTool[] = [
          { toolId, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENT_TOOLS); // Limit to max count

        return updated;
      });
    },
    [setRecentTools]
  );

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
  }, [setRecentTools]);

  return {
    recentTools,
    addRecentTool,
    clearRecentTools,
  } as const;
}
