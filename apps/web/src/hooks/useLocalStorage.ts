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

  // Store initialValue in ref to maintain stable reference
  // This prevents infinite loops when initialValue is an object/array
  const initialValueRef = useRef(initialValue);

  // Initialize state with a function to read from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
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
  });

  // Read from localStorage (for event handlers)
  const readFromStorage = useCallback((): T => {
    if (typeof window === 'undefined') return initialValueRef.current;

    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValueRef.current;

      const parsed = JSON.parse(raw) as T;
      return parsed;
    } catch {
      console.error(`Failed to parse localStorage key "${key}"`);
      return initialValueRef.current;
    }
  }, [key]);

  // Write to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Mark as local update
        isLocalUpdate.current = true;

        // Use functional update to avoid stale closure and dependency on storedValue
        setStoredValue((prevValue) => {
          // Allow value to be a function for same API as useState
          const valueToStore =
            value instanceof Function ? value(prevValue) : value;

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

          return valueToStore;
        });

        // Reset flag after a small delay
        setTimeout(() => {
          isLocalUpdate.current = false;
        }, 0);
      } catch (error) {
        console.error(`Failed to save to localStorage key "${key}":`, error);
      }
    },
    [key, syncEventName]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValueRef.current);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
        if (syncEventName) {
          window.dispatchEvent(
            new CustomEvent(syncEventName, { detail: initialValueRef.current })
          );
        }
      }
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }, [key, syncEventName]);

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
