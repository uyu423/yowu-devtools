import React from 'react';
import AdSense from 'react-adsense';

import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { useResolvedTheme } from '@/hooks/useThemeHooks';

interface GoogleAdsenseProps {
  className?: string;
}

export const GoogleAdsense: React.FC<GoogleAdsenseProps> = ({ className }) => {
  const { t } = useI18n();
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={className}>
      <div
        className={cn(
          'max-h-24 overflow-hidden rounded-lg border p-2',
          isDark
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <AdSense.Google
          client="ca-pub-2516647367332809"
          slot="1679105600"
          style={{
            display: 'block',
            maxHeight: '90px',
            background: isDark ? '#1f2937' : '#f9fafb',
          }}
          format="horizontal"
          responsive="true"
        />
      </div>
      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        {t('ads.disclaimer')}
      </p>
    </div>
  );
};
