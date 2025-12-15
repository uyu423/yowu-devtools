/**
 * ExtensionStatus - Shows the status of the Chrome extension as a compact badge
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ExtensionStatus as ExtensionStatusType } from '../types';
import { Tooltip } from '@/components/ui/Tooltip';

interface ExtensionStatusProps {
  status: ExtensionStatusType;
  onRetry?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  ExtensionStatusType,
  {
    dotColor: string;
    tooltip: string;
    showSpinner?: boolean;
  }
> = {
  checking: {
    dotColor: 'bg-gray-400',
    tooltip: 'Checking extension connection...',
    showSpinner: true,
  },
  'not-installed': {
    dotColor: 'bg-red-500',
    tooltip: 'Extension not installed or not responding. Click to retry.',
  },
  'permission-required': {
    dotColor: 'bg-yellow-500',
    tooltip: 'Extension connected, but permission required for the target domain.',
  },
  connected: {
    dotColor: 'bg-emerald-500',
    tooltip: 'Extension connected and ready.',
  },
};

export const ExtensionStatus: React.FC<ExtensionStatusProps> = ({
  status,
  onRetry,
  className,
}) => {
  const config = STATUS_CONFIG[status];

  const handleClick = () => {
    if (status === 'not-installed' && onRetry) {
      onRetry();
    }
  };

  return (
    <Tooltip content={config.tooltip}>
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium',
          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
          status === 'not-installed' && 'cursor-pointer',
          status !== 'not-installed' && 'cursor-default',
          className
        )}
      >
        <span>Chrome Extension</span>
        {config.showSpinner ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <span className={cn('w-2.5 h-2.5 rounded-full', config.dotColor)} />
        )}
      </button>
    </Tooltip>
  );
};

export default ExtensionStatus;
