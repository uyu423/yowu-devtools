/**
 * WarningBanner - Responsible use notice banner (always visible)
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';

interface WarningBannerProps {
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ className }) => {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg',
        'bg-amber-50 dark:bg-amber-900/20',
        'border-l-4 border-amber-500',
        className
      )}
    >
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          {t('tool.apiBurstTest.warning.responsibleUse')}
        </h4>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          {t('tool.apiBurstTest.warning.responsibleUseDesc')}
        </p>
      </div>
    </div>
  );
};

export default WarningBanner;

