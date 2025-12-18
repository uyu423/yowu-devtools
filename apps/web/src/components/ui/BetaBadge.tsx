import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { Tooltip } from '@/components/ui/Tooltip';

interface BetaBadgeProps {
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Additional class names */
  className?: string;
  /** Dot only mode (for collapsed sidebar) */
  dotOnly?: boolean;
}

/**
 * Beta badge component with minimal dot + text design.
 * Used to indicate experimental features that may be unstable.
 */
export const BetaBadge: React.FC<BetaBadgeProps> = ({
  size = 'sm',
  showTooltip = false,
  className,
  dotOnly = false,
}) => {
  const { t } = useI18n();

  // Dot only mode - just a small indicator dot
  if (dotOnly) {
    return (
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500',
          'ring-1 ring-white dark:ring-gray-900',
          className
        )}
      />
    );
  }

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        'text-violet-600 dark:text-violet-400',
        size === 'sm' && 'text-[9px]',
        size === 'md' && 'text-[10px]',
        showTooltip && 'cursor-help',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
      <span className="uppercase tracking-wide">{t('sidebar.beta')}</span>
    </span>
  );

  if (showTooltip) {
    return (
      <Tooltip content={t('sidebar.betaTooltip')} position="bottom">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

