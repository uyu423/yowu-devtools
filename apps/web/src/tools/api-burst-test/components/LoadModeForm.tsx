/**
 * LoadModeForm - Configure load mode (requests count or duration)
 */

import React from 'react';
import { Hash, Clock, AlertTriangle, HelpCircle, Zap, FileText, Gauge, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import type { BodyHandlingMode, LoadMode, RateLimit } from '../types';
import { HARD_LIMITS, SOFT_LIMITS, getMaxConcurrency, getConcurrencyWarningThreshold } from '../types';

interface LoadModeFormProps {
  concurrency: number;
  useHttp2: boolean;
  loadMode: LoadMode;
  rateLimit: RateLimit;
  timeoutMs: number;
  bodyHandling: BodyHandlingMode;
  onConcurrencyChange: (value: number) => void;
  onHttp2Change: (enabled: boolean) => void;
  onLoadModeChange: (mode: LoadMode) => void;
  onRateLimitChange: (limit: RateLimit) => void;
  onTimeoutChange: (ms: number) => void;
  onBodyHandlingChange: (mode: BodyHandlingMode) => void;
  disabled?: boolean;
}

export const LoadModeForm: React.FC<LoadModeFormProps> = ({
  concurrency,
  useHttp2,
  loadMode,
  rateLimit,
  timeoutMs,
  bodyHandling,
  onConcurrencyChange,
  onHttp2Change,
  onLoadModeChange,
  onRateLimitChange,
  onTimeoutChange,
  onBodyHandlingChange,
  disabled,
}) => {
  const { t } = useI18n();

  const maxConcurrency = getMaxConcurrency(useHttp2);
  const warnConcurrency = getConcurrencyWarningThreshold(useHttp2);
  const showConcurrencyWarning = concurrency > warnConcurrency;
  const showRequestsWarning = loadMode.type === 'requests' && loadMode.n > SOFT_LIMITS.WARN_TOTAL_REQUESTS;
  const showDurationWarning = loadMode.type === 'duration' && loadMode.durationMs > SOFT_LIMITS.WARN_DURATION_MS;
  const showQpsWarning = rateLimit.type !== 'none' && rateLimit.qps > SOFT_LIMITS.WARN_QPS;

  // Handle HTTP/2 toggle - adjust concurrency if needed
  const handleHttp2Change = (enabled: boolean) => {
    onHttp2Change(enabled);
    // If switching to HTTP/1.1 and concurrency exceeds limit, clamp it
    if (!enabled && concurrency > HARD_LIMITS.MAX_CONCURRENCY_HTTP1) {
      onConcurrencyChange(HARD_LIMITS.MAX_CONCURRENCY_HTTP1);
    }
  };

  return (
    <div className="space-y-4">
      {/* HTTP/2 Mode Toggle */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-lg',
        'bg-gray-50 dark:bg-gray-800/50',
        'border border-gray-200 dark:border-gray-700'
      )}>
        <div className="flex items-center gap-2">
          <Zap className={cn(
            'w-4 h-4',
            useHttp2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          )} />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.apiBurstTest.http2Mode')}
          </label>
          <Tooltip content={t('tool.apiBurstTest.tooltip.http2Mode')} position="right" nowrap={false}>
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        <button
          onClick={() => handleHttp2Change(!useHttp2)}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full',
            'border-2 border-transparent transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            useHttp2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          )}
          role="switch"
          aria-checked={useHttp2}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full',
              'bg-white shadow ring-0 transition duration-200',
              useHttp2 ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {/* Concurrency */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.apiBurstTest.concurrency')}
          </label>
          <Tooltip content={t('tool.apiBurstTest.tooltip.concurrency')}>
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          </Tooltip>
          {showConcurrencyWarning && (
            <Tooltip content={t('tool.apiBurstTest.warning.highConcurrency')}>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </Tooltip>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (max: {maxConcurrency})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={maxConcurrency}
            value={Math.min(concurrency, maxConcurrency)}
            onChange={(e) => onConcurrencyChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              'flex-1 h-2 rounded-lg appearance-none cursor-pointer',
              'bg-gray-200 dark:bg-gray-700',
              showConcurrencyWarning ? 'accent-amber-500' : 'accent-blue-600'
            )}
          />
          <input
            type="number"
            min={1}
            max={maxConcurrency}
            value={concurrency}
            onChange={(e) => onConcurrencyChange(Math.min(maxConcurrency, Math.max(1, Number(e.target.value))))}
            disabled={disabled}
            className={cn(
              'w-20 h-9 px-2 text-center text-sm rounded-lg border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
          />
        </div>
      </div>

      {/* Load Mode Toggle */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          {t('tool.apiBurstTest.loadMode')}
        </label>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <Tooltip content={t('tool.apiBurstTest.tooltip.loadModeRequests')}>
            <button
              onClick={() => onLoadModeChange({ ...loadMode, type: 'requests' })}
              disabled={disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium',
                'transition-colors',
                loadMode.type === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <Hash className="w-4 h-4" />
              {t('tool.apiBurstTest.mode.requests')}
            </button>
          </Tooltip>
          <Tooltip content={t('tool.apiBurstTest.tooltip.loadModeDuration')}>
            <button
              onClick={() => onLoadModeChange({ ...loadMode, type: 'duration' })}
              disabled={disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium',
                'transition-colors border-l border-gray-200 dark:border-gray-700',
                loadMode.type === 'duration'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <Clock className="w-4 h-4" />
              {t('tool.apiBurstTest.mode.duration')}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Load Mode Value */}
      {loadMode.type === 'requests' ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.apiBurstTest.requestsCount')}
            </label>
            {showRequestsWarning && (
              <Tooltip content={t('tool.apiBurstTest.warning.largeRequests')}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </Tooltip>
            )}
          </div>
          <input
            type="number"
            min={1}
            max={HARD_LIMITS.MAX_TOTAL_REQUESTS}
            value={loadMode.n}
            onChange={(e) => onLoadModeChange({
              ...loadMode,
              n: Math.min(HARD_LIMITS.MAX_TOTAL_REQUESTS, Math.max(1, Number(e.target.value)))
            })}
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3 text-sm rounded-lg border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('tool.apiBurstTest.maxRequests')} ({HARD_LIMITS.MAX_TOTAL_REQUESTS.toLocaleString()})
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.apiBurstTest.duration')}
            </label>
            {showDurationWarning && (
              <Tooltip content={t('tool.apiBurstTest.warning.longDuration')}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={HARD_LIMITS.MAX_DURATION_MS / 1000}
              value={loadMode.durationMs / 1000}
              onChange={(e) => onLoadModeChange({
                ...loadMode,
                durationMs: Math.min(HARD_LIMITS.MAX_DURATION_MS, Math.max(1000, Number(e.target.value) * 1000))
              })}
              disabled={disabled}
              className={cn(
                'w-full h-10 px-3 text-sm rounded-lg border',
                'border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'disabled:opacity-50'
              )}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
              {t('tool.apiBurstTest.seconds')}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('tool.apiBurstTest.maxDuration')} ({HARD_LIMITS.MAX_DURATION_MS / 1000}s)
          </p>
        </div>
      )}

      {/* Rate Limit */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          {t('tool.apiBurstTest.rateLimit.label')}
        </label>
        <div className="flex gap-2 mb-2">
          <Tooltip content={t('tool.apiBurstTest.tooltip.rateLimitNone')}>
            <button
              onClick={() => onRateLimitChange({ ...rateLimit, type: 'none' })}
              disabled={disabled}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium rounded-lg',
                'transition-colors',
                rateLimit.type === 'none'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {t('tool.apiBurstTest.rateLimit.none')}
            </button>
          </Tooltip>
          <Tooltip content={t('tool.apiBurstTest.tooltip.rateLimitGlobal')}>
            <button
              onClick={() => onRateLimitChange({ ...rateLimit, type: 'global' })}
              disabled={disabled}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium rounded-lg',
                'transition-colors',
                rateLimit.type === 'global'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {t('tool.apiBurstTest.rateLimit.global')}
            </button>
          </Tooltip>
          <Tooltip content={t('tool.apiBurstTest.tooltip.rateLimitPerWorker')}>
            <button
              onClick={() => onRateLimitChange({ ...rateLimit, type: 'perWorker' })}
              disabled={disabled}
              className={cn(
                'flex-1 px-3 py-2 text-xs font-medium rounded-lg',
                'transition-colors',
                rateLimit.type === 'perWorker'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {t('tool.apiBurstTest.rateLimit.perWorker')}
            </button>
          </Tooltip>
        </div>
        {rateLimit.type !== 'none' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={HARD_LIMITS.MAX_QPS}
              value={rateLimit.qps}
              onChange={(e) => onRateLimitChange({
                ...rateLimit,
                qps: Math.min(HARD_LIMITS.MAX_QPS, Math.max(1, Number(e.target.value)))
              })}
              disabled={disabled}
              className={cn(
                'w-full h-9 px-3 text-sm rounded-lg border',
                'border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'disabled:opacity-50'
              )}
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
              {t('tool.apiBurstTest.qps')}
            </span>
            {showQpsWarning && (
              <Tooltip content={t('tool.apiBurstTest.warning.highQps')}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </Tooltip>
            )}
          </div>
        )}
      </div>

      {/* Timeout */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.apiBurstTest.timeoutSeconds')}
          </label>
          <Tooltip content={t('tool.apiBurstTest.tooltip.timeout')}>
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={HARD_LIMITS.MIN_TIMEOUT_MS / 1000}
            max={HARD_LIMITS.MAX_TIMEOUT_MS / 1000}
            value={timeoutMs / 1000}
            onChange={(e) => onTimeoutChange(
              Math.min(HARD_LIMITS.MAX_TIMEOUT_MS, Math.max(HARD_LIMITS.MIN_TIMEOUT_MS, Number(e.target.value) * 1000))
            )}
            disabled={disabled}
            className={cn(
              'w-full h-9 px-3 text-sm rounded-lg border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
          />
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
            {t('tool.apiBurstTest.seconds')}
          </span>
        </div>
      </div>

      {/* Body Handling Mode */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.apiBurstTest.bodyHandling.label')}
          </label>
          <Tooltip content={t('tool.apiBurstTest.tooltip.bodyHandling')} position="right" nowrap={false}>
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Tooltip content={t('tool.apiBurstTest.tooltip.bodyCancel')}>
            <button
              onClick={() => onBodyHandlingChange('cancel')}
              disabled={disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg',
                'transition-colors',
                bodyHandling === 'cancel'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <Gauge className="w-3.5 h-3.5" />
              {t('tool.apiBurstTest.bodyHandling.cancel')}
            </button>
          </Tooltip>
          <Tooltip content={t('tool.apiBurstTest.tooltip.bodyStream')}>
            <button
              onClick={() => onBodyHandlingChange('stream')}
              disabled={disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg',
                'transition-colors',
                bodyHandling === 'stream'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <Download className="w-3.5 h-3.5" />
              {t('tool.apiBurstTest.bodyHandling.stream')}
            </button>
          </Tooltip>
          <Tooltip content={t('tool.apiBurstTest.tooltip.bodyFull')}>
            <button
              onClick={() => onBodyHandlingChange('full')}
              disabled={disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg',
                'transition-colors',
                bodyHandling === 'full'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              {t('tool.apiBurstTest.bodyHandling.full')}
            </button>
          </Tooltip>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {bodyHandling === 'cancel' && t('tool.apiBurstTest.bodyHandling.cancelDesc')}
          {bodyHandling === 'stream' && t('tool.apiBurstTest.bodyHandling.streamDesc')}
          {bodyHandling === 'full' && t('tool.apiBurstTest.bodyHandling.fullDesc')}
        </p>
      </div>
    </div>
  );
};

export default LoadModeForm;

