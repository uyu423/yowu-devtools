// Convenience hook for using i18n context
import { useContext } from 'react';
import { I18nContext } from './i18nContext';

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

