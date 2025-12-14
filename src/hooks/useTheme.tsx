import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContext';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<Theme, 'system'>;

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (nextTheme: Theme) => void;
}

const THEME_STORAGE_KEY = 'yowu-devtools:theme';
const THEME_CLASSES: ResolvedTheme[] = ['light', 'dark'];


const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
};

const getSystemPreference = (): ResolvedTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyThemeClass = (resolvedTheme: ResolvedTheme) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  THEME_CLASSES.forEach((cls) => root.classList.remove(cls));
  root.classList.add(resolvedTheme);
};

function useProvideTheme(): ThemeContextValue {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  // Track system preference changes to trigger useMemo recalculation
  const [systemPreferenceCounter, setSystemPreferenceCounter] = useState(0);
  
  // Calculate resolved theme using useMemo to avoid setState in effect
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    return theme === 'system' ? getSystemPreference() : theme;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, systemPreferenceCounter]);

  // Sync DOM + localStorage whenever theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    applyThemeClass(resolvedTheme);
  }, [theme, resolvedTheme]);

  // Subscribe to system preference only when theme === 'system'
  // Update counter state in event handler (acceptable, not in effect body)
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Update counter to trigger useMemo recalculation
      // This is in an event handler callback, not directly in effect body
      setSystemPreferenceCounter((prev) => prev + 1);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeValue = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
  }, []);

  return useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeValue,
    }),
    [theme, resolvedTheme, setThemeValue]
  );
}

// Internal ThemeProvider - exported for use in ThemeProvider component file
export function ThemeProviderInternal({ children }: { children: React.ReactNode }) {
  const value = useProvideTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
