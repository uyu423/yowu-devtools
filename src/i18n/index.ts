// i18n resources index
import type { LocaleCode } from '@/lib/constants';
import { enUS, type I18nResource } from './en-US';
import { koKR } from './ko-KR';
import { jaJP } from './ja-JP';
import { zhCN } from './zh-CN';
import { esES } from './es-ES';

export const I18N: Record<LocaleCode, I18nResource> = {
  'en-US': enUS,
  'ko-KR': koKR,
  'ja-JP': jaJP,
  'zh-CN': zhCN,
  'es-ES': esES,
};

export type { I18nResource } from './en-US';
export { enUS, koKR, jaJP, zhCN, esES };

