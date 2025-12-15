import React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { SUPPORTED_LOCALES, type LocaleCode } from '@/lib/constants';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
}) => {
  const { locale, setLocale, t } = useI18n();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as LocaleCode;
    setLocale(newLocale);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
      <select
        value={locale}
        onChange={handleChange}
        className={cn(
          'flex-1 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-md',
          'py-1.5 px-2 text-gray-700 dark:text-gray-300',
          'focus:ring-2 focus:ring-blue-500 focus:outline-none',
          'cursor-pointer transition-colors'
        )}
        title={t('sidebar.selectLanguage')}
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};

