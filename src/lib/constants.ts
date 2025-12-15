// App version - read from package.json via Vite's define
export const APP_VERSION = import.meta.env.APP_VERSION || '1.0.0';

// Supported locales for i18n
export type LocaleCode = 'en-US' | 'ko-KR' | 'ja-JP' | 'zh-CN' | 'es-ES';

export interface LocaleInfo {
  code: LocaleCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
];

export const DEFAULT_LOCALE: LocaleCode = 'en-US';

export const LOCALE_STORAGE_KEY = 'yowu.devtools.locale';
