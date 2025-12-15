/**
 * ExtensionStatus - Shows the status of the Chrome extension
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import type { ExtensionStatus as ExtensionStatusType } from '../types';

interface ExtensionStatusProps {
  status: ExtensionStatusType;
  onRetry?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  ExtensionStatusType,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
    description?: string;
  }
> = {
  checking: {
    icon: Loader2,
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Checking...',
  },
  'not-installed': {
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    label: 'Not Installed',
    description: 'Extension is not installed or not responding',
  },
  'permission-required': {
    icon: AlertCircle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Permission Required',
    description: 'Click to grant permission for the target domain',
  },
  connected: {
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: 'Connected',
  },
};

// Chrome Web Store URL for the extension (placeholder)
const EXTENSION_STORE_URL = 'https://chromewebstore.google.com';

export const ExtensionStatus: React.FC<ExtensionStatusProps> = ({
  status,
  onRetry,
  className,
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          config.bgColor,
          config.color
        )}
      >
        <Icon className={cn('w-3.5 h-3.5', status === 'checking' && 'animate-spin')} />
        <span>{config.label}</span>
      </div>

      {status === 'not-installed' && (
        <a
          href={EXTENSION_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Install
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {status === 'not-installed' && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * ExtensionModeSelector - Toggle between Direct and Extension mode
 */
interface ExtensionModeSelectorProps {
  mode: 'direct' | 'extension';
  onChange: (mode: 'direct' | 'extension') => void;
  extensionStatus: ExtensionStatusType;
  disabled?: boolean;
}

export const ExtensionModeSelector: React.FC<ExtensionModeSelectorProps> = ({
  mode,
  onChange,
  extensionStatus,
  disabled,
}) => {
  const isExtensionAvailable = extensionStatus === 'connected' || extensionStatus === 'permission-required';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Mode:</span>
      <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => onChange('direct')}
          disabled={disabled}
          className={cn(
            'px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'direct'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          Direct
        </button>
        <button
          onClick={() => onChange('extension')}
          disabled={disabled || !isExtensionAvailable}
          className={cn(
            'px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5',
            mode === 'extension'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            (disabled || !isExtensionAvailable) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Extension
        </button>
      </div>
    </div>
  );
};

/**
 * CorsErrorBanner - Shows when a CORS error is detected
 */
interface CorsErrorBannerProps {
  onRetryWithExtension: () => void;
  extensionStatus: ExtensionStatusType;
}

export const CorsErrorBanner: React.FC<CorsErrorBannerProps> = ({
  onRetryWithExtension,
  extensionStatus,
}) => {
  const isExtensionAvailable = extensionStatus === 'connected' || extensionStatus === 'permission-required';

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Request Failed</h4>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            This error may be caused by CORS (Cross-Origin Resource Sharing) restrictions. Browsers
            block requests to different domains for security reasons.
          </p>
          <div className="mt-3 flex items-center gap-3">
            {isExtensionAvailable ? (
              <button
                onClick={onRetryWithExtension}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Zap className="w-4 h-4" />
                Retry with Extension
              </button>
            ) : (
              <a
                href={EXTENSION_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Install Extension
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
            >
              Learn more about CORS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionStatus;

