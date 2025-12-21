import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useTheme } from '../useThemeHooks';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

// Helper to stub matchMedia and capture listeners
function setupMatchMedia() {
  type Listener = (event: MediaQueryListEvent) => void;
  let listeners: Listener[] = [];
  let currentMatches = false;

  const mock = vi.fn().mockImplementation((query: string) => ({
    matches: currentMatches,
    media: query,
    onchange: null,
    addEventListener: (_event: string, handler: Listener) => {
      listeners.push(handler);
    },
    removeEventListener: (_event: string, handler: Listener) => {
      listeners = listeners.filter((listener) => listener !== handler);
    },
    dispatchEvent: () => true,
    addListener: () => {},
    removeListener: () => {},
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mock,
  });

  const emitChange = (matches: boolean) => {
    currentMatches = matches;
    listeners.forEach((listener) =>
      listener({ matches, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent)
    );
  };

  return { emitChange };
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reacts to system preference changes only when theme is set to system', () => {
    const { emitChange } = setupMatchMedia();

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Defaults to system theme with resolved light preference
    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');

    act(() => {
      emitChange(true);
    });
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    // Further system changes should be ignored when not in system mode
    act(() => {
      emitChange(false);
    });
    expect(result.current.resolvedTheme).toBe('light');
  });
});
