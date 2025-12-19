/**
 * DetailedSummary - Detailed test results summary
 * Shows: Total time, Slowest, Fastest, Average, Total data, Size/request
 */

import React from 'react';
import { Timer, Gauge, Database, FileText, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { BurstTestResults } from '../types';
import { formatDuration, formatBytes, formatNumber } from '../types';

interface DetailedSummaryProps {
  results: BurstTestResults;
}

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const StatItem: React.FC<StatItemProps> = ({
  icon: Icon,
  label,
  value,
  subValue,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className={cn('text-sm font-semibold', variantClasses[variant])}>
          {value}
          {subValue && (
            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const DetailedSummary: React.FC<DetailedSummaryProps> = ({ results }) => {
  const { t } = useI18n();

  const successRate = results.totalRequests > 0
    ? ((results.successRequests / results.totalRequests) * 100).toFixed(1)
    : '0.0';

  const failureRate = results.totalRequests > 0
    ? ((results.failedRequests / results.totalRequests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700'
    )}>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {t('tool.apiBurstTest.results.detailedSummary')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-gray-100 dark:divide-gray-700">
        {/* Left column - Time stats */}
        <div className="space-y-1">
          <StatItem
            icon={Timer}
            label={t('tool.apiBurstTest.results.totalTime')}
            value={formatDuration(results.totalTimeMs)}
          />
          <StatItem
            icon={TrendingDown}
            label={t('tool.apiBurstTest.results.fastest')}
            value={formatDuration(results.latency.min)}
            variant="success"
          />
          <StatItem
            icon={TrendingUp}
            label={t('tool.apiBurstTest.results.slowest')}
            value={formatDuration(results.latency.max)}
            variant="warning"
          />
          <StatItem
            icon={Activity}
            label={t('tool.apiBurstTest.results.average')}
            value={formatDuration(results.latency.avg)}
          />
        </div>

        {/* Right column - Data stats */}
        <div className="space-y-1 pt-2 sm:pt-0">
          <StatItem
            icon={Gauge}
            label={t('tool.apiBurstTest.results.requestsPerSec')}
            value={results.rps.toFixed(2)}
            subValue="req/s"
          />
          <StatItem
            icon={Database}
            label={t('tool.apiBurstTest.results.totalData')}
            value={formatBytes(results.totalDataBytes)}
          />
          <StatItem
            icon={FileText}
            label={t('tool.apiBurstTest.results.sizePerRequest')}
            value={formatBytes(results.avgSizeBytes)}
          />
          <StatItem
            icon={Activity}
            label={t('tool.apiBurstTest.results.successFailure')}
            value={`${formatNumber(results.successRequests)} / ${formatNumber(results.failedRequests)}`}
            subValue={`(${successRate}% / ${failureRate}%)`}
            variant={parseFloat(failureRate) > 0 ? 'error' : 'success'}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailedSummary;

