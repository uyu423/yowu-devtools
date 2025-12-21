/**
 * NetworkTimingInfo - Display network timing information from Resource Timing API
 *
 * Shows protocol detection, network latency vs tool latency, and queuing time.
 * Helps users understand the difference between tool measurements and actual network latency.
 */

import React from 'react';
import { Globe, Clock, Timer, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import type { NetworkTimingInfo as NetworkTimingInfoType, LatencyMetrics } from '../types';
import { formatDuration } from '../types';

interface NetworkTimingInfoProps {
  networkTiming: NetworkTimingInfoType;
  toolLatency: LatencyMetrics;
  className?: string;
}

export const NetworkTimingInfo: React.FC<NetworkTimingInfoProps> = ({
  networkTiming,
  toolLatency,
  className,
}) => {
  const { t } = useI18n();

  const hasTimingData =
    networkTiming.avgNetworkLatencyMs !== null ||
    networkTiming.avgStalledMs !== null ||
    networkTiming.protocol !== null;

  // Format protocol name for display
  const formatProtocol = (protocol: string | null): string => {
    if (!protocol) return t('tool.apiBurstTest.networkTiming.protocolUnknown');
    // Common protocol mappings
    const protocolMap: Record<string, string> = {
      h2: 'HTTP/2',
      h3: 'HTTP/3',
      'http/1.1': 'HTTP/1.1',
      'http/1.0': 'HTTP/1.0',
    };
    return protocolMap[protocol.toLowerCase()] || protocol.toUpperCase();
  };

  // Determine if there's significant queuing time (> 10ms average)
  const hasSignificantQueuing =
    networkTiming.avgStalledMs !== null && networkTiming.avgStalledMs > 10;

  return (
    <div
      className={cn(
        'p-4 rounded-lg',
        'bg-gray-50 dark:bg-gray-800/50',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('tool.apiBurstTest.networkTiming.title')}
        </h4>
        <Tooltip
          content={t('tool.apiBurstTest.tooltip.networkTiming')}
          position="right"
          nowrap={false}
        >
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
        </Tooltip>
      </div>

      {!hasTimingData ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
          <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('tool.apiBurstTest.networkTiming.noData')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {t('tool.apiBurstTest.networkTiming.noDataNote')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Protocol */}
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('tool.apiBurstTest.networkTiming.protocol')}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatProtocol(networkTiming.protocol)}
            </p>
            {!networkTiming.protocol && (
              <p className="text-xs text-gray-500 mt-1">
                {t('tool.apiBurstTest.networkTiming.protocolNote')}
              </p>
            )}
          </div>

          {/* Tool Latency (Average) */}
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <Timer className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('tool.apiBurstTest.networkTiming.toolLatency')}
              </span>
              <Tooltip
                content={t('tool.apiBurstTest.networkTiming.toolLatencyNote')}
                position="top"
              >
                <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatDuration(toolLatency.avg)}
            </p>
          </div>

          {/* Network Latency (if available) */}
          {networkTiming.avgNetworkLatencyMs !== null && (
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('tool.apiBurstTest.networkTiming.avgNetworkLatency')}
                </span>
              </div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatDuration(networkTiming.avgNetworkLatencyMs)}
              </p>
            </div>
          )}

          {/* Queued/Stalled Time (if available and significant) */}
          {networkTiming.avgStalledMs !== null && (
            <div
              className={cn(
                'p-3 rounded-lg bg-white dark:bg-gray-800 border',
                hasSignificantQueuing
                  ? 'border-amber-300 dark:border-amber-700'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Timer
                  className={cn(
                    'w-3.5 h-3.5',
                    hasSignificantQueuing
                      ? 'text-amber-500'
                      : 'text-gray-500'
                  )}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('tool.apiBurstTest.networkTiming.avgStalled')}
                </span>
                <Tooltip
                  content={t('tool.apiBurstTest.tooltip.stalledTime')}
                  position="top"
                  nowrap={false}
                >
                  <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <p
                className={cn(
                  'text-lg font-bold',
                  hasSignificantQueuing
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                {formatDuration(networkTiming.avgStalledMs)}
              </p>
              {hasSignificantQueuing && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  High queue time
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sample count note */}
      {networkTiming.sampleCount > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('tool.apiBurstTest.networkTiming.sampleCount')}:{' '}
          {networkTiming.sampleCount}
          {!networkTiming.hasTimingAllowOrigin && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              (limited data - missing Timing-Allow-Origin)
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default NetworkTimingInfo;

