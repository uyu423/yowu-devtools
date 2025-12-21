// i18n resources index
import type { LocaleCode } from '@/lib/constants';
import { enUS, type I18nResource } from './en-US';
import { koKR } from './ko-KR';
import { jaJP } from './ja-JP';
import { zhCN } from './zh-CN';
import { esES } from './es-ES';

// Re-export type from en-US (source of truth)
export type { I18nResource };

export type I18nResources = Record<LocaleCode, I18nResource>;

// Type-safe i18n resources map
// Each locale file uses `satisfies I18nResource` to ensure type compatibility
export const I18N: I18nResources = {
  'en-US': enUS,
  'ko-KR': koKR,
  'ja-JP': jaJP,
  'zh-CN': zhCN,
  'es-ES': esES,
};

export { enUS, koKR, jaJP, zhCN, esES };
