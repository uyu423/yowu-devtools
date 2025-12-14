import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<Theme, 'system'>;

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (nextTheme: Theme) => void;
}

const THEME_STORAGE_KEY = 'yowu-devtools:theme';
const THEME_CLASSES: ResolvedTheme[] = ['light', 'dark'];

const ThemeContext = createContext<ThemeContextValue | null>(null);

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
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === 'system' ? getSystemPreference() : theme
  );

  // Sync DOM + localStorage whenever theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    const nextResolved = theme === 'system' ? getSystemPreference() : theme;
    setResolvedTheme(nextResolved);
    applyThemeClass(nextResolved);
  }, [theme]);

  // Subscribe to system preference only when theme === 'system'
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      const nextResolved = event.matches ? 'dark' : 'light';
      setResolvedTheme(nextResolved);
      applyThemeClass(nextResolved);
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useProvideTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useResolvedTheme() {
  return useTheme().resolvedTheme;
}
