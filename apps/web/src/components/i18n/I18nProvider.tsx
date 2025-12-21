import React from 'react';
import { I18nProviderInternal } from '@/hooks/useI18n';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nProviderInternal>{children}</I18nProviderInternal>;
};

