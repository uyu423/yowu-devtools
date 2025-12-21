/**
 * LatencyHistogram - hey-style latency distribution histogram
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { HistogramBucket } from '../types';

interface LatencyHistogramProps {
  buckets: HistogramBucket[];
  maxCount?: number;
}

export const LatencyHistogram: React.FC<LatencyHistogramProps> = ({
  buckets,
  maxCount: providedMaxCount,
}) => {
  const { t } = useI18n();

  if (!buckets || buckets.length === 0) {
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

  const maxCount = providedMaxCount ?? Math.max(...buckets.map((b) => b.count));
  const maxBarWidth = 40; // Maximum number of "■" characters (like hey)

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700'
    )}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {t('tool.apiBurstTest.results.histogram')}
      </h3>

      {/* hey-style histogram */}
      <div className="font-mono text-xs space-y-1">
        {buckets.map((bucket, index) => {
          const barLength = maxCount > 0
            ? Math.round((bucket.count / maxCount) * maxBarWidth)
            : 0;
          const bar = '■'.repeat(Math.max(1, barLength));

          return (
            <div key={index} className="flex items-center gap-2">
              {/* Range label */}
              <span className="w-24 text-right text-gray-500 dark:text-gray-400 shrink-0">
                {bucket.label}
              </span>

              {/* Count */}
              <span className="w-12 text-right text-gray-700 dark:text-gray-300 shrink-0">
                [{bucket.count}]
              </span>

              {/* Bar */}
              <span className="text-blue-500 dark:text-blue-400">
                {bar}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LatencyHistogram;

