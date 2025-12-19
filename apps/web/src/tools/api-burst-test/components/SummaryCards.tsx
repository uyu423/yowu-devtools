/**
 * SummaryCards - Summary metrics cards (Total Requests, RPS, p95, Error Rate)
 */

import React from 'react';
import { Activity, Clock, AlertCircle, Zap, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import type { BurstTestResults } from '../types';
import { formatNumber, formatDuration } from '../types';

interface SummaryCardsProps {
  results: BurstTestResults | null;
}

interface CardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  suffix?: string;
  color?: 'default' | 'success' | 'error';
  tooltip?: string;
}

/**
 * Get appropriate font size class based on value length
 */
const getFontSizeClass = (value: string): string => {
  const len = value.length;
  if (len <= 5) return 'text-2xl'; // Short values: normal size
  if (len <= 8) return 'text-xl';  // Medium values: slightly smaller
  if (len <= 12) return 'text-lg'; // Long values: smaller
  return 'text-base'; // Very long values: smallest
};

const Card: React.FC<CardProps> = ({ icon: Icon, label, value, suffix, color = 'default', tooltip }) => {
  const colorClasses = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-emerald-600 dark:text-emerald-400',
    error: 'text-red-600 dark:text-red-400',
  };

  const fontSizeClass = getFontSizeClass(value);

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700',
      'shadow-sm',
      'overflow-hidden'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
          {label}
        </span>
        {tooltip && (
          <Tooltip content={tooltip}>
            <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help shrink-0" />
          </Tooltip>
        )}
      </div>
      <div className="flex items-baseline gap-1 min-w-0">
        <span className={cn('font-bold truncate', fontSizeClass, colorClasses[color])}>
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({ results }) => {
  const { t } = useI18n();

  if (!results) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={Activity} label={t('tool.apiBurstTest.results.totalRequests')} value="—" />
        <Card icon={Zap} label={t('tool.apiBurstTest.results.rps')} value="—" suffix="/sec" tooltip={t('tool.apiBurstTest.tooltip.rps')} />
        <Card icon={Clock} label={t('tool.apiBurstTest.results.p95Latency')} value="—" suffix="ms" tooltip={t('tool.apiBurstTest.tooltip.p95')} />
        <Card icon={AlertCircle} label={t('tool.apiBurstTest.results.errorRate')} value="—" suffix="%" tooltip={t('tool.apiBurstTest.tooltip.errorRate')} />
      </div>
    );
  }

  const errorRate = results.totalRequests > 0
    ? ((results.failedRequests / results.totalRequests) * 100).toFixed(1)
    : '0.0';

  const errorColor = parseFloat(errorRate) > 0 ? 'error' : 'success';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        icon={Activity}
        label={t('tool.apiBurstTest.results.totalRequests')}
        value={formatNumber(results.totalRequests)}
      />
      <Card
        icon={Zap}
        label={t('tool.apiBurstTest.results.rps')}
        value={results.rps.toFixed(2)}
        suffix="/sec"
        tooltip={t('tool.apiBurstTest.tooltip.rps')}
      />
      <Card
        icon={Clock}
        label={t('tool.apiBurstTest.results.p95Latency')}
        value={formatDuration(results.latency.p95)}
        tooltip={t('tool.apiBurstTest.tooltip.p95')}
      />
      <Card
        icon={AlertCircle}
        label={t('tool.apiBurstTest.results.errorRate')}
        value={errorRate}
        suffix="%"
        color={errorColor}
        tooltip={t('tool.apiBurstTest.tooltip.errorRate')}
      />
    </div>
  );
};

export default SummaryCards;

