/**
 * StatusCodeChart - Status code distribution visualization
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';

interface StatusCodeChartProps {
  statusCodes: Record<number, number>;
}

// Status code color mapping
const getStatusColor = (code: number): string => {
  if (code >= 200 && code < 300) return 'bg-emerald-500';
  if (code >= 300 && code < 400) return 'bg-blue-500';
  if (code >= 400 && code < 500) return 'bg-amber-500';
  if (code >= 500) return 'bg-red-500';
  return 'bg-gray-500';
};

const getStatusTextColor = (code: number): string => {
  if (code >= 200 && code < 300) return 'text-emerald-600 dark:text-emerald-400';
  if (code >= 300 && code < 400) return 'text-blue-600 dark:text-blue-400';
  if (code >= 400 && code < 500) return 'text-amber-600 dark:text-amber-400';
  if (code >= 500) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

export const StatusCodeChart: React.FC<StatusCodeChartProps> = ({
  statusCodes,
}) => {
  const { t } = useI18n();

  const entries = Object.entries(statusCodes)
    .map(([code, count]) => ({ code: Number(code), count }))
    .sort((a, b) => a.code - b.code);

  const total = entries.reduce((sum, e) => sum + e.count, 0);

  if (entries.length === 0) {
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

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700'
    )}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {t('tool.apiBurstTest.results.statusCodes')}
      </h3>

      {/* Stacked bar */}
      <div className="h-6 rounded-lg overflow-hidden flex mb-4">
        {entries.map(({ code, count }) => {
          const width = (count / total) * 100;
          return (
            <div
              key={code}
              className={cn(getStatusColor(code), 'transition-all duration-300')}
              style={{ width: `${width}%` }}
              title={`${code}: ${count} (${width.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {entries.map(({ code, count }) => {
          const percent = ((count / total) * 100).toFixed(1);
          return (
            <div key={code} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded', getStatusColor(code))} />
                <span className={cn('font-mono text-sm font-semibold', getStatusTextColor(code))}>
                  [{code}]
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {count.toLocaleString()} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusCodeChart;

