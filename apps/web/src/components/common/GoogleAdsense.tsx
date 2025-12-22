import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { useResolvedTheme } from '@/hooks/useThemeHooks';

interface GoogleAdsenseProps {
  className?: string;
}

// Extend Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export const GoogleAdsense: React.FC<GoogleAdsenseProps> = ({ className }) => {
  const { t } = useI18n();
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const adRef = React.useRef<HTMLModElement>(null);
  const adPushedRef = React.useRef(false);

  React.useEffect(() => {
    // Prevent duplicate ad push in React StrictMode
    if (adPushedRef.current) return;
    adPushedRef.current = true;

    try {
      // Push ad to adsbygoogle queue
      if (
        typeof window !== 'undefined' &&
        window.adsbygoogle &&
        adRef.current
      ) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

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
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            background: isDark ? '#1f2937' : '#f9fafb',
          }}
          data-ad-client="ca-pub-2516647367332809"
          data-ad-slot="1679105600"
          data-ad-format="fluid"
          data-ad-layout-key="-gp-e+1c-4d+81"
        />
        {/* AdSense 인피드 광고 텍스트 크기 스타일링 */}
        <style>{`
          .adsbygoogle a {
            font-size: 16px !important; /* 광고 제목 */
            line-height: 1.5 !important;
          }
          .adsbygoogle .adsbygoogle-description {
            font-size: 14px !important; /* 광고 설명 */
            line-height: 1.5 !important;
          }
          .adsbygoogle .adsbygoogle-url {
            font-size: 12px !important; /* URL/도메인 */
            line-height: 1.4 !important;
          }
          /* AdSense 광고 내부 텍스트 요소 스타일링 */
          .adsbygoogle ins {
            font-size: 16px !important;
          }
          .adsbygoogle a[href*="googleadservices.com"],
          .adsbygoogle a[href*="doubleclick.net"] {
            font-size: 16px !important;
          }
          .adsbygoogle span {
            font-size: 14px !important;
          }
        `}</style>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        {t('ads.disclaimer')}
      </p>
    </div>
  );
};
