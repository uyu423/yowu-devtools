import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Delay before showing progress bar (ms)
const SHOW_DELAY_MS = 250;

type ProgressState = 'idle' | 'loading' | 'completing';

interface NavigationProgressState {
  state: ProgressState;
  /** Whether the progress bar was actually shown (passed the delay threshold) */
  wasShown: boolean;
}

/**
 * Hook to track navigation progress for route transitions.
 * 
 * Key implementation details:
 * - Uses timestamp to track if SHOW_DELAY_MS has passed
 * - If navigation completes before delay, wasShown=false and we skip the completing animation
 * - CSS animations with transform (GPU accelerated) handle the visual progress
 */
export function useNavigationProgress(): NavigationProgressState {
  const location = useLocation();
  const [state, setState] = useState<ProgressState>('idle');
  const [wasShown, setWasShown] = useState(false);
  
  const prevPathRef = useRef(location.pathname);
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    
    clearTimers();
    startTimeRef.current = performance.now();
    setWasShown(false);
    setState('loading');
  }, [clearTimers]);

  const completeProgress = useCallback(() => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;
    
    clearTimers();
    
    const elapsed = performance.now() - startTimeRef.current;
    const shouldShow = elapsed >= SHOW_DELAY_MS;
    
    if (!shouldShow) {
      // Fast navigation - skip showing entirely
      setState('idle');
      setWasShown(false);
      return;
    }
    
    // Slow navigation - show completion animation
    setWasShown(true);
    setState('completing');

    // Hide after completion animation
    completionTimeoutRef.current = setTimeout(() => {
      setState('idle');
      setWasShown(false);
    }, 500);
  }, [clearTimers]);

  // Listen for internal link clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href) return;
      
      // Skip external links, hash links, and links with modifiers
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        target.getAttribute('target') === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }
      
      const currentPath = window.location.pathname;
      const newPath = href.startsWith('/') ? href : `/${href}`;
      const normalizedCurrentPath = currentPath.replace(/\/$/, '') || '/';
      const normalizedNewPath = newPath.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
      
      if (normalizedCurrentPath !== normalizedNewPath) {
        startProgress();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [startProgress]);

  // Complete progress when route changes
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      requestAnimationFrame(() => {
        completeProgress();
      });
    }
  }, [location.pathname, completeProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return { state, wasShown };
}
