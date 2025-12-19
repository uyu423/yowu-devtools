/**
 * ExtensionStatus - Shows the status of the Chrome extension as a refined badge
 * 
 * Accessibility: Uses blue for success (colorblind-friendly, avoids red/green confusion)
 */

import React, { useMemo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Plug, PlugZap, ShieldAlert, RefreshCw, Download, Smartphone } from 'lucide-react';
import type { ExtensionStatus as ExtensionStatusType } from '../types';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import { EXTENSION_STORE_URL } from '../constants';

// Detect mobile device
const detectMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768);
};

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
  const [isMobile, setIsMobile] = useState(detectMobile);
  
  // Update mobile detection on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const label = useMemo(() => t(`tool.apiTester.${config.labelKey}`), [t, config.labelKey]);
  const tooltip = useMemo(() => t(`tool.apiTester.${config.tooltipKey}`), [t, config.tooltipKey]);
  const mobileTooltip = useMemo(() => t('tool.apiTester.corsMobileNotSupported'), [t]);

  const handleClick = () => {
    if (!isMobile && config.clickable && onRetry) {
      onRetry();
    }
  };

  const isNotInstalled = status === 'not-installed';

  // Mobile: Show disabled state with mobile-specific message
  if (isMobile) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Tooltip content={mobileTooltip} position="bottom" align="left" nowrap={false}>
          <div
            className={cn(
              'group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
              'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
              'border border-gray-200 dark:border-gray-700',
              'cursor-not-allowed opacity-60'
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('tool.apiTester.extensionNotConnected')}</span>
          </div>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Tooltip content={tooltip} position="bottom" align="left" nowrap={false}>
        <button
          onClick={handleClick}
          className={cn(
            'group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
            'transition-all duration-200',
            config.badgeClass,
            config.clickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
            !config.clickable && 'cursor-default'
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

      {/* Install button - only show when extension is not installed (desktop only) */}
      {isNotInstalled && (
        <Tooltip 
          content={t('tool.apiTester.installExtensionTooltip')} 
          position="bottom"
          nowrap={false}
        >
          <a
            href={EXTENSION_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-full',
              'text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'hover:text-blue-600 dark:hover:text-blue-400',
              'transition-all duration-200'
            )}
            aria-label={t('tool.apiTester.installExtension')}
          >
            <Download className="w-4 h-4" />
          </a>
        </Tooltip>
      )}
    </div>
  );
};

export default ExtensionStatus;
