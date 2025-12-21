import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'yowu-devtools:v1:app:sidebarCollapsed';

// External store for sidebar collapse state
let sidebarCollapsed = false;
const listeners = new Set<() => void>();

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY);
  sidebarCollapsed = stored === 'true';
}

function getSnapshot(): boolean {
  return sidebarCollapsed;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSidebarCollapsed(value: boolean): void {
  sidebarCollapsed = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(value));
  }
  listeners.forEach((listener) => listener());
}

export function useSidebarCollapse() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setSidebarCollapsed(value);
  }, []);

  return {
    isCollapsed,
    toggleCollapse,
    setCollapsed,
  };
}

