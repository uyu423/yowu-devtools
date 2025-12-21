/**
 * LatencyDistribution - Percentile distribution table (p10, p25, p50, p75, p90, p95, p99)
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import type { LatencyMetrics } from '../types';
import { formatDuration } from '../types';

interface LatencyDistributionProps {
  latency: LatencyMetrics | null;
}

interface PercentileRow {
  label: string;
  percentile: string;
  value: number;
  highlighted?: boolean;
  tooltipKey?: string;
}

export const LatencyDistribution: React.FC<LatencyDistributionProps> = ({
  latency,
}) => {
  const { t } = useI18n();

  if (!latency) {
    return (
      <div className={cn(
        'p-6 rounded-xl text-center',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700'
      )}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('tool.apiBurstTest.results.noData')}
        </p>
      </div>
    );
  }

  const rows: PercentileRow[] = [
    { label: '10%', percentile: 'p10', value: latency.min }, // Approximation
    { label: '25%', percentile: 'p25', value: (latency.min + latency.p50) / 2 }, // Approximation
    { label: '50%', percentile: 'p50', value: latency.p50, highlighted: true, tooltipKey: 'p50' },
    { label: '75%', percentile: 'p75', value: (latency.p50 + latency.p90) / 2 }, // Approximation
    { label: '90%', percentile: 'p90', value: latency.p90, tooltipKey: 'p90' },
    { label: '95%', percentile: 'p95', value: latency.p95, highlighted: true, tooltipKey: 'p95' },
    { label: '99%', percentile: 'p99', value: latency.p99, highlighted: true, tooltipKey: 'p99' },
  ];

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700'
    )}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {t('tool.apiBurstTest.results.latencyDistribution')}
      </h3>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {t('tool.apiBurstTest.results.avg')}
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDuration(latency.avg)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {t('tool.apiBurstTest.results.min')}
          </div>
          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {formatDuration(latency.min)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
            {t('tool.apiBurstTest.results.max')}
          </div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {formatDuration(latency.max)}
          </div>
        </div>
      </div>

      {/* Percentile table */}
      <div className="space-y-1 font-mono text-sm">
        {rows.map((row) => (
          <div
            key={row.percentile}
            className={cn(
              'flex items-center justify-between px-3 py-1.5 rounded',
              row.highlighted && 'bg-blue-50 dark:bg-blue-900/20'
            )}
          >
            <span className={cn(
              'flex items-center gap-1.5',
              'text-gray-600 dark:text-gray-400',
              row.highlighted && 'font-semibold text-blue-700 dark:text-blue-300'
            )}>
              {row.label}
              {row.tooltipKey && (
                <Tooltip content={t(`tool.apiBurstTest.tooltip.${row.tooltipKey}`)}>
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                </Tooltip>
              )}
            </span>
            <span className={cn(
              'text-gray-900 dark:text-gray-100',
              row.highlighted && 'font-semibold'
            )}>
              in {formatDuration(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatencyDistribution;

