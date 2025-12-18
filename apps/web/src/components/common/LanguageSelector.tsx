import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = SUPPORTED_LOCALES.find((loc) => loc.code === locale);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (newLocale: LocaleCode) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-gray-100 dark:bg-gray-800',
          'text-sm text-gray-700 dark:text-gray-300',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'transition-colors cursor-pointer'
        )}
        title={t('sidebar.selectLanguage')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
        <span className="flex-1 text-left truncate">
          {currentLocale?.nativeName || locale}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full left-0 right-0 mb-1 z-50',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            'py-1 overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          role="listbox"
          aria-label={t('sidebar.selectLanguage')}
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => handleSelect(loc.code)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm',
                'text-left transition-colors',
                locale === loc.code
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              role="option"
              aria-selected={locale === loc.code}
            >
              <span className="flex-1">{loc.nativeName}</span>
              {locale === loc.code && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

