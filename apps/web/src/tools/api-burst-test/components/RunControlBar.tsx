/**
 * RunControlBar - Control buttons (Run/Stop/Reset) with progress indicator
 */

import React from 'react';
import { Play, Square, Loader2, Cookie, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import { ExtensionStatus } from '@/components/common/ExtensionStatus';
import type { ExtensionStatus as ExtensionStatusType } from '@/lib/extension';
import type { BurstProgress, LoadMode } from '../types';
import { formatNumber, formatDuration } from '../types';

interface RunControlBarProps {
  isRunning: boolean;
  canRun: boolean;
  progress: BurstProgress | null;
  loadMode: LoadMode;
  extensionStatus: ExtensionStatusType;
  includeCookies: boolean;
  onIncludeCookiesChange: (value: boolean) => void;
  onRun: () => void;
  onStop: () => void;
  onExtensionRetry?: () => void;
}

// Detect OS for keyboard shortcut display
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const runShortcut = isMac ? '⌘↵' : 'Ctrl+Enter';

export const RunControlBar: React.FC<RunControlBarProps> = ({
  isRunning,
  canRun,
  progress,
  loadMode,
  extensionStatus,
  includeCookies,
  onIncludeCookiesChange,
  onRun,
  onStop,
  onExtensionRetry,
}) => {
  const { t } = useI18n();

  // Calculate progress percentage
  const progressPercent = progress
    ? loadMode.type === 'requests'
      ? (progress.completedRequests / progress.totalRequests) * 100
      : (progress.elapsedMs / progress.durationMs) * 100
    : 0;

  // Progress text
  const progressText = progress
    ? loadMode.type === 'requests'
      ? `${formatNumber(progress.completedRequests)} / ${formatNumber(progress.totalRequests)}`
      : `${formatDuration(progress.elapsedMs)} / ${formatDuration(progress.durationMs)}`
    : '';

  return (
    <div className={cn(
      'sticky top-0 z-10',
      'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
      'border-b border-gray-200 dark:border-gray-700',
      '-mx-4 md:-mx-6 px-4 md:px-6 py-3'
    )}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Run/Stop buttons + Extension Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Tooltip content={runShortcut}>
                <button
                  onClick={onRun}
                  disabled={!canRun}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2.5 rounded-lg',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'font-medium text-sm',
                    'transition-colors',
                    'disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed'
                  )}
                >
                  <Play className="w-4 h-4" />
                  {t('tool.apiBurstTest.run')}
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={onStop}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-lg',
                  'bg-red-600 hover:bg-red-700 text-white',
                  'font-medium text-sm',
                  'transition-colors'
                )}
              >
                <Square className="w-4 h-4" />
                {t('tool.apiBurstTest.stop')}
              </button>
            )}
          </div>
          
          {/* Extension Status Badge */}
          <ExtensionStatus
            status={extensionStatus}
            onRetry={onExtensionRetry}
          />
          
          {/* Include Cookies checkbox - only show when extension is connected */}
          {extensionStatus === 'connected' && (
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCookies}
                  onChange={(e) => onIncludeCookiesChange(e.target.checked)}
                  disabled={isRunning}
                  className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <Cookie className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('tool.apiBurstTest.includeCookies')}</span>
              </label>
              <Tooltip content={t('tool.apiBurstTest.includeCookiesTooltip')} position="bottom" nowrap={false}>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
              </Tooltip>
            </div>
          )}
        </div>

        {/* Right: Progress info */}
        {isRunning && progress && (
          <div className="flex items-center gap-3 text-sm">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">
              {progressText}
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              ({progress.currentRps.toFixed(1)} {t('tool.apiBurstTest.rpsUnit')})
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default RunControlBar;

