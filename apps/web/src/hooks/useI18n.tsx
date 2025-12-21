import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { I18nContext, type I18nContextValue } from './i18nContext';
import type { LocaleCode } from '@/lib/constants';
import { DEFAULT_LOCALE } from '@/lib/constants';
import { I18N } from '@/i18n';
import { detectLocale, saveLocale, getToolPathFromUrl, buildLocalePath, getLocaleFromUrl, getStoredLocale } from '@/lib/i18nUtils';

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
  const navigate = useNavigate();
  
  // Detect locale from URL or localStorage or browser (recalculate on pathname change)
  const locale = useMemo<LocaleCode>(() => 
    detectLocale(location.pathname),
    [location.pathname]
  );

  // Redirect to locale-prefixed URL if needed
  // This ensures URL matches the stored locale preference
  useEffect(() => {
    const urlLocale = getLocaleFromUrl(location.pathname);
    const storedLocale = getStoredLocale();

    // Redirect conditions:
    // 1. URL has no locale prefix (urlLocale is null)
    // 2. localStorage has a stored locale
    // 3. Stored locale is NOT the default locale (en-US)
    // In this case, redirect to the stored locale URL
    // Note: No infinite loop because after redirect, urlLocale will not be null
    if (urlLocale === null && storedLocale && storedLocale !== DEFAULT_LOCALE) {
      const toolPath = getToolPathFromUrl(location.pathname);
      const newPath = buildLocalePath(storedLocale, toolPath);
      const hash = location.hash;
      navigate(`${newPath}${hash}`, { replace: true });
    }
  }, [location.pathname, location.hash, navigate]);

  // Save locale to localStorage when it changes
  useEffect(() => {
    saveLocale(locale);
  }, [locale]);

  // Update document lang attribute when locale changes (for accessibility and SEO)
  useEffect(() => {
    document.documentElement.lang = locale;
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

  // Set locale and update URL
  const setLocale = useCallback((newLocale: LocaleCode) => {
    if (newLocale === locale) {
      return; // No change needed
    }

    // Get current tool path (without locale prefix)
    const toolPath = getToolPathFromUrl(location.pathname);
    
    // Build new path with locale prefix
    const newPath = buildLocalePath(newLocale, toolPath);
    
    // Preserve hash (share payload) if exists
    const hash = location.hash;
    
    // Navigate to new locale URL
    navigate(`${newPath}${hash}`, { replace: true });
    
    // Save to localStorage (will be saved by useEffect above, but save immediately for consistency)
    saveLocale(newLocale);
  }, [locale, location.pathname, location.hash, navigate]);

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

