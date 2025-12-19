/**
 * WarningBanner - Collapsible warning banners for responsible use and browser limitations
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { HARD_LIMITS } from '../types';

const STORAGE_KEY_RESPONSIBLE = 'yowu-devtools:v1:api-burst-test:responsibleUseDismissed';
const STORAGE_KEY_LIMITATIONS = 'yowu-devtools:v1:api-burst-test:limitationsDismissed';

interface CollapsibleBannerProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant: 'warning' | 'info';
  storageKey: string;
  defaultCollapsed?: boolean;
}

const CollapsibleBanner: React.FC<CollapsibleBannerProps> = ({
  title,
  icon,
  children,
  variant,
  storageKey,
  defaultCollapsed = false,
}) => {
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? stored === 'true' : defaultCollapsed;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, isCollapsed.toString());
  }, [isCollapsed, storageKey]);

  const colorClasses = {
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-500',
      borderCollapsed: 'border-amber-200 dark:border-amber-800/50',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      icon: 'text-amber-600 dark:text-amber-400',
      title: 'text-amber-800 dark:text-amber-200',
      text: 'text-amber-700 dark:text-amber-300',
      button: 'text-amber-500 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-800/50',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-500',
      borderCollapsed: 'border-blue-200 dark:border-blue-800/50',
      hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
      text: 'text-blue-700 dark:text-blue-300',
      button: 'text-blue-500 dark:text-blue-400 hover:bg-blue-200/50 dark:hover:bg-blue-800/50',
    },
  };

  const colors = colorClasses[variant];

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg w-full',
          colors.bg,
          'border',
          colors.borderCollapsed,
          colors.hoverBg,
          'transition-colors cursor-pointer',
          'text-left'
        )}
      >
        <span className={cn('flex-shrink-0', colors.icon)}>{icon}</span>
        <span className={cn('text-xs font-medium flex-1', colors.text)}>{title}</span>
        <ChevronDown className={cn('w-4 h-4', colors.icon)} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg relative',
        colors.bg,
        'border-l-4',
        colors.border
      )}
    >
      <span className={cn('flex-shrink-0 mt-0.5', colors.icon)}>{icon}</span>
      <div className="flex-1 min-w-0 pr-8">
        <h4 className={cn('text-sm font-semibold', colors.title)}>{title}</h4>
        <div className={cn('mt-1 text-sm leading-relaxed', colors.text)}>{children}</div>
      </div>
      <button
        onClick={() => setIsCollapsed(true)}
        className={cn(
          'absolute top-3 right-3',
          'p-1 rounded-md',
          colors.button,
          'transition-colors'
        )}
        title={t('common.minimize')}
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
};

interface WarningBannerProps {
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ className }) => {
  const { t } = useI18n();

  return (
    <div className={cn('space-y-2', className)}>
      {/* Responsible Use Warning */}
      <CollapsibleBanner
        title={t('tool.apiBurstTest.warning.responsibleUse')}
        icon={<AlertTriangle className="w-5 h-5" />}
        variant="warning"
        storageKey={STORAGE_KEY_RESPONSIBLE}
        defaultCollapsed={false}
      >
        <p>{t('tool.apiBurstTest.warning.responsibleUseDesc')}</p>
      </CollapsibleBanner>

      {/* Browser Limitations Info */}
      <CollapsibleBanner
        title={t('tool.apiBurstTest.warning.browserLimitations')}
        icon={<Info className="w-5 h-5" />}
        variant="info"
        storageKey={STORAGE_KEY_LIMITATIONS}
        defaultCollapsed={true}
      >
        <ul className="list-disc list-inside space-y-1">
          <li>
            {t('tool.apiBurstTest.warning.maxConnections')
              .replace('{max}', String(HARD_LIMITS.MAX_CONCURRENCY_HTTP1))
              .replace('{maxHttp2}', String(HARD_LIMITS.MAX_CONCURRENCY_HTTP2))}
          </li>
          <li className="font-medium">{t('tool.apiBurstTest.warning.performanceGap')}</li>
        </ul>
      </CollapsibleBanner>
    </div>
  );
};

export default WarningBanner;
