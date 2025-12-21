/**
 * TabVisibilityWarning - Warns user when tab is hidden during test
 *
 * Browser throttles background tabs, which affects timing accuracy.
 * This component monitors document.visibilityState and shows a warning.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';

interface TabVisibilityWarningProps {
  isRunning: boolean;
  className?: string;
}

export const TabVisibilityWarning: React.FC<TabVisibilityWarningProps> = ({
  isRunning,
  className,
}) => {
  const { t } = useI18n();
  const [isHidden, setIsHidden] = useState(() => {
    // Initialize with current visibility state only if running
    if (typeof document !== 'undefined') {
      return document.visibilityState === 'hidden';
    }
    return false;
  });

  useEffect(() => {
    if (!isRunning) {
      // Don't need to track visibility when not running
      return;
    }

    const handleVisibilityChange = () => {
      setIsHidden(document.visibilityState === 'hidden');
    };

    // Subscribe to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  // Don't show if not running or tab is visible
  if (!isRunning || !isHidden) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-red-50 dark:bg-red-900/20',
        'border border-red-200 dark:border-red-800',
        'animate-pulse',
        className
      )}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <Eye className="w-4 h-4 text-red-500 dark:text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
          {t('tool.apiBurstTest.warning.tabHidden')}
        </p>
        <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
          {t('tool.apiBurstTest.warning.tabHiddenDesc')}
        </p>
      </div>
    </div>
  );
};

export default TabVisibilityWarning;

