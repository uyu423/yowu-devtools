import type { ReactNode } from 'react';
import { ThemeProviderInternal } from '@/hooks/useTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProviderInternal>{children}</ThemeProviderInternal>;
}

