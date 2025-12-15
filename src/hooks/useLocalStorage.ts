import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Options for useLocalStorage hook
 */
interface UseLocalStorageOptions {
  /**
   * Custom event name for cross-component synchronization within the same tab.
   * If provided, a custom event will be dispatched when the value changes.
   */
  syncEventName?: string;
}

/**
 * A hook for managing localStorage with React state synchronization.
 * Supports cross-tab synchronization via storage events and
 * cross-component synchronization within the same tab via custom events.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no value exists in localStorage
 * @param options - Optional configuration
 *
 * @example
 * ```tsx
 * const [favorites, setFavorites] = useLocalStorage<string[]>(
 *   'app:favorites',
 *   [],
 *   { syncEventName: 'favorites-changed' }
 * );
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions
) {
  // Extract syncEventName for stable dependency reference
  const syncEventName = options?.syncEventName;

  // Use ref to track if this instance triggered the change
  // to avoid infinite loops when syncing
  const isLocalUpdate = useRef(false);

  // Read from localStorage on mount
  const readFromStorage = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;

      const parsed = JSON.parse(raw) as T;
      return parsed;
    } catch {
      console.error(`Failed to parse localStorage key "${key}"`);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readFromStorage);

  // Write to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Mark as local update
        isLocalUpdate.current = true;

        // Save to state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(valueToStore));

          // Dispatch custom event for same-tab synchronization
          if (syncEventName) {
            window.dispatchEvent(
              new CustomEvent(syncEventName, { detail: valueToStore })
            );
          }
        }

        // Reset flag after a small delay
        setTimeout(() => {
          isLocalUpdate.current = false;
        }, 0);
      } catch (error) {
        console.error(`Failed to save to localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, syncEventName]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        if (syncEventName) {
          window.dispatchEvent(
            new CustomEvent(syncEventName, { detail: initialValue })
          );
        }
      }
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncEventName]);

  // Listen for changes from other tabs (storage event)
  // and from other components in the same tab (custom event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && !isLocalUpdate.current) {
        setStoredValue(readFromStorage());
      }
    };

    const handleCustomEvent = (e: Event) => {
      if (isLocalUpdate.current) return;

      const customEvent = e as CustomEvent<T>;
      if (customEvent.detail !== undefined) {
        setStoredValue(customEvent.detail);
      } else {
        setStoredValue(readFromStorage());
      }
    };

    // Listen for cross-tab changes
    window.addEventListener('storage', handleStorageChange);

    // Listen for same-tab changes from other components
    if (syncEventName) {
      window.addEventListener(syncEventName, handleCustomEvent);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncEventName) {
        window.removeEventListener(syncEventName, handleCustomEvent);
      }
    };
  }, [key, syncEventName, readFromStorage]);

  return [storedValue, setValue, removeValue] as const;
}
