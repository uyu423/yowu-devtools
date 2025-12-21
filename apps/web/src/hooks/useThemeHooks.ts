import { useContext } from 'react';
import { ThemeContext } from './themeContext';
import type { ThemeContextValue } from './useTheme';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useResolvedTheme() {
  return useTheme().resolvedTheme;
}

