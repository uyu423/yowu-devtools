import { Adsense } from '@ctrl/react-adsense';
import React from 'react';
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
      {/* AdSense 가이드: 고정 높이 컨테이너 사용 금지 - 광고가 자유롭게 크기 조정 가능하도록 함 */}
      <div
        className={cn(
          'rounded-lg border p-2',
          isDark
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        <Adsense
          client="ca-pub-2516647367332809"
          slot="1679105600"
          style={{
            display: 'block',
            background: isDark ? '#1f2937' : '#f9fafb',
          }}
          format="auto"
          responsive="true"
        />
      </div>
      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        {t('ads.disclaimer')}
      </p>
    </div>
  );
};
