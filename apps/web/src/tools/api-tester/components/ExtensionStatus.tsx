/**
 * ExtensionStatus - Shows the status of the Chrome extension as a refined badge
 * 
 * Accessibility: Uses blue for success (colorblind-friendly, avoids red/green confusion)
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Plug, PlugZap, ShieldAlert, RefreshCw } from 'lucide-react';
import type { ExtensionStatus as ExtensionStatusType } from '../types';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';

interface ExtensionStatusProps {
  status: ExtensionStatusType;
  onRetry?: () => void;
  className?: string;
}

interface StatusConfig {
  icon: React.ElementType;
  labelKey: string;
  tooltipKey: string;
  badgeClass: string;
  iconClass: string;
  showPulse?: boolean;
  showSpinner?: boolean;
  clickable?: boolean;
}

const STATUS_CONFIG: Record<ExtensionStatusType, StatusConfig> = {
  checking: {
    icon: RefreshCw,
    labelKey: 'extensionChecking',
    tooltipKey: 'extensionTooltipChecking',
    badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    iconClass: 'text-gray-400 dark:text-gray-500',
    showSpinner: true,
  },
  'not-installed': {
    icon: Plug,
    labelKey: 'extensionNotConnected',
    tooltipKey: 'extensionTooltipNotConnected',
    badgeClass: 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50',
    iconClass: 'text-red-500 dark:text-red-400',
    clickable: true,
  },
  'permission-required': {
    icon: ShieldAlert,
    labelKey: 'extensionPermissionRequired',
    tooltipKey: 'extensionTooltipPermissionRequired',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
  connected: {
    icon: PlugZap,
    labelKey: 'extensionConnected',
    tooltipKey: 'extensionTooltipConnected',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
    iconClass: 'text-blue-500 dark:text-blue-400',
    showPulse: true,
  },
};

export const ExtensionStatus: React.FC<ExtensionStatusProps> = ({
  status,
  onRetry,
  className,
}) => {
  const { t } = useI18n();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const label = useMemo(() => t(`tool.apiTester.${config.labelKey}`), [t, config.labelKey]);
  const tooltip = useMemo(() => t(`tool.apiTester.${config.tooltipKey}`), [t, config.tooltipKey]);

  const handleClick = () => {
    if (config.clickable && onRetry) {
      onRetry();
    }
  };

  return (
    <Tooltip content={tooltip} position="bottom" align="left">
      <button
        onClick={handleClick}
        className={cn(
          'group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
          'transition-all duration-200',
          config.badgeClass,
          config.clickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
          !config.clickable && 'cursor-default',
          className
        )}
      >
        {/* Icon with optional animations */}
        <span className="relative flex items-center justify-center">
          {config.showSpinner ? (
            <Loader2 className={cn('w-3.5 h-3.5 animate-spin', config.iconClass)} />
          ) : (
            <>
              <Icon className={cn('w-3.5 h-3.5', config.iconClass)} />
              {/* Pulse ring for connected state */}
              {config.showPulse && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute w-5 h-5 rounded-full bg-blue-400/30 dark:bg-blue-500/20 animate-ping" />
                </span>
              )}
            </>
          )}
        </span>

        {/* Label */}
        <span>{label}</span>

        {/* Retry hint for not-installed state */}
        {config.clickable && (
          <RefreshCw className={cn(
            'w-3 h-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
            config.iconClass
          )} />
        )}
      </button>
    </Tooltip>
  );
};

export default ExtensionStatus;
