import React from 'react';
import type { LocaleCode } from '@/lib/constants';
import type { I18nResource } from '@/i18n';

export interface I18nContextValue {
  locale: LocaleCode;
  t: (key: string) => string;
  setLocale: (locale: LocaleCode) => void;
  resources: I18nResource;
}

export const I18nContext = React.createContext<I18nContextValue | undefined>(
  undefined
);

