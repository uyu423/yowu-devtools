import React, { useEffect, useRef } from 'react';
import { useI18n } from '@/hooks/useI18nHooks';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleAdsenseProps {
  className?: string;
}

export const GoogleAdsense: React.FC<GoogleAdsenseProps> = ({ className }) => {
  const { t } = useI18n();
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Load AdSense script only once
    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com"]'
    );
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2516647367332809';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize ad
    const initAd = () => {
      if (isAdLoaded.current || !adRef.current) return;
      
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isAdLoaded.current = true;
      } catch (error) {
        console.error('AdSense initialization error:', error);
      }
    };

    // Wait for script to load and then initialize
    const timer = setTimeout(initAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            maxHeight: '90px',
            background: isDark ? '#1f2937' : '#f9fafb',
          }}
          data-ad-format="horizontal"
          data-ad-client="ca-pub-2516647367332809"
          data-ad-slot="1679105600"
        />
      </div>
      <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        {t('ads.disclaimer')}
      </p>
    </div>
  );
};

