/**
 * WarningBanner - Responsible use notice banner with browser limitations (collapsible)
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { HARD_LIMITS } from '../types';

const STORAGE_KEY = 'yowu-devtools:v1:api-burst-test:warningDismissed';

interface WarningBannerProps {
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ className }) => {
  const { t } = useI18n();
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Save dismissed state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDismissed.toString());
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleExpand = () => {
    setIsDismissed(false);
  };

  // Minimized state - compact bar
  if (isDismissed) {
    return (
      <button
        onClick={handleExpand}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg w-full',
          'bg-amber-50 dark:bg-amber-900/20',
          'border border-amber-200 dark:border-amber-800/50',
          'hover:bg-amber-100 dark:hover:bg-amber-900/30',
          'transition-colors cursor-pointer',
          'text-left',
          className
        )}
      >
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300 flex-1">
          {t('tool.apiBurstTest.warning.responsibleUse')}
        </span>
        <ChevronDown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
      </button>
    );
  }

  // Expanded state - full banner with two sections
  return (
    <div className={cn('space-y-2', className)}>
      {/* Responsible Use Warning */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg relative',
          'bg-amber-50 dark:bg-amber-900/20',
          'border-l-4 border-amber-500'
        )}
      >
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 pr-8">
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {t('tool.apiBurstTest.warning.responsibleUse')}
          </h4>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
            {t('tool.apiBurstTest.warning.responsibleUseDesc')}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className={cn(
            'absolute top-3 right-3',
            'p-1 rounded-md',
            'text-amber-500 dark:text-amber-400',
            'hover:bg-amber-200/50 dark:hover:bg-amber-800/50',
            'transition-colors'
          )}
          title={t('common.minimize')}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Browser Limitations Info */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-lg',
          'bg-blue-50 dark:bg-blue-900/20',
          'border-l-4 border-blue-500'
        )}
      >
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            {t('tool.apiBurstTest.warning.browserLimitations')}
          </h4>
          <ul className="mt-1 text-sm text-blue-700 dark:text-blue-300 leading-relaxed list-disc list-inside space-y-0.5">
            <li>
              {t('tool.apiBurstTest.warning.maxConnections')
                .replace('{max}', String(HARD_LIMITS.MAX_CONCURRENCY_HTTP1))
                .replace('{maxHttp2}', String(HARD_LIMITS.MAX_CONCURRENCY_HTTP2))}
            </li>
            <li>{t('tool.apiBurstTest.warning.jsOverhead')}</li>
            <li>{t('tool.apiBurstTest.warning.notProduction')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WarningBanner;
