// i18n utility functions
import type { LocaleCode } from './constants';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_STORAGE_KEY } from './constants';

/**
 * Extract locale from URL path
 * Examples:
 * - /ko-KR/json -> 'ko-KR'
 * - /json -> null
 * - / -> null
 */
export function getLocaleFromUrl(pathname: string): LocaleCode | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const firstSegment = segments[0];
  const locale = SUPPORTED_LOCALES.find((loc) => loc.code === firstSegment);
  return locale ? (locale.code as LocaleCode) : null;
}

/**
 * Get locale from localStorage
 */
export function getStoredLocale(): LocaleCode | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.some((loc) => loc.code === stored)) {
    return stored as LocaleCode;
  }
  return null;
}

/**
 * Find best matching locale from navigator.language
 * Examples:
 * - 'ko' -> 'ko-KR'
 * - 'ko-KR' -> 'ko-KR'
 * - 'ja' -> 'ja-JP'
 * - 'en' -> 'en-US'
 * - 'fr' -> null (not supported)
 */
export function getBestMatchLocale(browserLanguage: string): LocaleCode | null {
  // Exact match
  const exactMatch = SUPPORTED_LOCALES.find(
    (loc) => loc.code === browserLanguage
  );
  if (exactMatch) {
    return exactMatch.code;
  }

  // Language code match (e.g., 'ko' -> 'ko-KR')
  const languageCode = browserLanguage.split('-')[0];
  const languageMatch = SUPPORTED_LOCALES.find(
    (loc) => loc.code.split('-')[0] === languageCode
  );
  if (languageMatch) {
    return languageMatch.code;
  }

  return null;
}

/**
 * Detect locale with priority:
 * 1. URL locale prefix
 * 2. localStorage stored locale
 * 3. navigator.language best match
 * 4. Default locale (en-US)
 */
export function detectLocale(pathname: string): LocaleCode {
  // 1. URL locale prefix (highest priority)
  const urlLocale = getLocaleFromUrl(pathname);
  if (urlLocale) {
    return urlLocale;
  }

  // 2. localStorage stored locale
  const storedLocale = getStoredLocale();
  if (storedLocale) {
    return storedLocale;
  }

  // 3. navigator.language best match
  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserMatch = getBestMatchLocale(navigator.language);
    if (browserMatch) {
      return browserMatch;
    }
  }

  // 4. Default locale (fallback)
  return DEFAULT_LOCALE;
}

/**
 * Save locale to localStorage
 */
export function saveLocale(locale: LocaleCode): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

/**
 * Extract tool path from URL (removes locale prefix if present)
 * Examples:
 * - /ko-KR/json -> /json
 * - /json -> /json
 * - /ko-KR/ -> /
 * - / -> /
 */
export function getToolPathFromUrl(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return '/';
  }

  const firstSegment = segments[0];
  const isLocale = SUPPORTED_LOCALES.some((loc) => loc.code === firstSegment);
  
  if (isLocale) {
    // Remove locale prefix
    const toolSegments = segments.slice(1);
    return toolSegments.length === 0 ? '/' : `/${toolSegments.join('/')}`;
  }

  // No locale prefix, return as is
  return pathname;
}

/**
 * Build URL path with locale prefix
 * Examples:
 * - buildLocalePath('en-US', '/json') -> '/json' (en-US is default, no prefix)
 * - buildLocalePath('ko-KR', '/json') -> '/ko-KR/json'
 * - buildLocalePath('ko-KR', '/') -> '/ko-KR'
 */
export function buildLocalePath(locale: LocaleCode, toolPath: string): string {
  if (locale === DEFAULT_LOCALE) {
    // Default locale (en-US) doesn't need prefix for backward compatibility
    return toolPath;
  }
  
  // Ensure toolPath starts with /
  const normalizedPath = toolPath.startsWith('/') ? toolPath : `/${toolPath}`;
  
  // Handle root path
  if (normalizedPath === '/') {
    return `/${locale}`;
  }
  
  return `/${locale}${normalizedPath}`;
}

