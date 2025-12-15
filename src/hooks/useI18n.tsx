import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { I18nContext, type I18nContextValue } from './i18nContext';
import type { LocaleCode } from '@/lib/constants';
import { I18N } from '@/i18n';
import { detectLocale, saveLocale } from '@/lib/i18nUtils';

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'common.copy') -> obj.common.copy
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let value: unknown = obj;
  for (const key of keys) {
    if (value === undefined || value === null || typeof value !== 'object') {
      return path; // Fallback to key if not found
    }
    value = (value as Record<string, unknown>)[key];
  }
  return typeof value === 'string' ? value : path;
}

function useProvideI18n(): I18nContextValue {
  const location = useLocation();
  
  // Detect locale from URL or localStorage or browser (recalculate on pathname change)
  const locale = useMemo<LocaleCode>(() => 
    detectLocale(location.pathname),
    [location.pathname]
  );

  // Save locale to localStorage when it changes
  useEffect(() => {
    saveLocale(locale);
  }, [locale]);

  // Translation function
  const t = useCallback((key: string): string => {
    const resource = I18N[locale];
    if (!resource) {
      console.warn(`[i18n] Locale ${locale} not found, falling back to en-US`);
      return getNestedValue(I18N['en-US'], key);
    }
    
    const value = getNestedValue(resource, key);
    if (value === key) {
      // Key not found, try fallback to en-US
      const fallbackValue = getNestedValue(I18N['en-US'], key);
      if (fallbackValue !== key) {
        console.warn(`[i18n] Key "${key}" not found in ${locale}, using en-US fallback`);
        return fallbackValue;
      }
      console.warn(`[i18n] Key "${key}" not found in any locale`);
    }
    return value;
  }, [locale]);

  // Set locale (will be saved to localStorage by useEffect above)
  // Note: URL locale prefix update will be handled by routing logic in Phase 8.4
  const setLocale = useCallback((newLocale: LocaleCode) => {
    saveLocale(newLocale);
    // TODO: Navigate to new locale URL (will be implemented in Phase 8.4)
    // For now, just save to localStorage - page refresh will pick it up
  }, []);

  // Get current resources
  const resources = useMemo(() => I18N[locale], [locale]);

  return useMemo(
    () => ({
      locale,
      t,
      setLocale,
      resources,
    }),
    [locale, t, setLocale, resources]
  );
}

// Internal I18nProvider - exported for use in I18nProvider component file
export function I18nProviderInternal({ children }: { children: React.ReactNode }) {
  const value = useProvideI18n();
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

