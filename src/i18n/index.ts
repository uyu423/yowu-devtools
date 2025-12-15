// i18n resources index
import type { LocaleCode } from '@/lib/constants';
import { enUS } from './en-US';
import { koKR } from './ko-KR';
import { jaJP } from './ja-JP';
import { zhCN } from './zh-CN';
import { esES } from './es-ES';

// Type derived from en-US (source of truth)
export type I18nResource = typeof enUS;

export type I18nResources = Record<LocaleCode, I18nResource>;

export const I18N: I18nResources = {
  'en-US': enUS,
  'ko-KR': koKR as unknown as I18nResource,
  'ja-JP': jaJP as unknown as I18nResource,
  'zh-CN': zhCN as unknown as I18nResource,
  'es-ES': esES as unknown as I18nResource,
};

export { enUS, koKR, jaJP, zhCN, esES };
