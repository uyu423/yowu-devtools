/**
 * ErrorsTable - Error breakdown by type
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { ErrorBreakdown } from '../types';

interface ErrorsTableProps {
  errors: ErrorBreakdown | null;
  totalRequests: number;
}

interface ErrorRow {
  type: keyof ErrorBreakdown;
  label: string;
  count: number;
  color: string;
}

export const ErrorsTable: React.FC<ErrorsTableProps> = ({
  errors,
  totalRequests,
}) => {
  const { t } = useI18n();

  if (!errors) {
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

  const rows: ErrorRow[] = [
    { type: 'timeout', label: t('tool.apiBurstTest.errors.timeout'), count: errors.timeout, color: 'text-amber-600 dark:text-amber-400' },
    { type: 'cors', label: t('tool.apiBurstTest.errors.cors'), count: errors.cors, color: 'text-purple-600 dark:text-purple-400' },
    { type: 'network', label: t('tool.apiBurstTest.errors.network'), count: errors.network, color: 'text-red-600 dark:text-red-400' },
    { type: 'aborted', label: t('tool.apiBurstTest.errors.aborted'), count: errors.aborted, color: 'text-gray-600 dark:text-gray-400' },
    { type: 'http4xx', label: t('tool.apiBurstTest.errors.http4xx'), count: errors.http4xx, color: 'text-amber-600 dark:text-amber-400' },
    { type: 'http5xx', label: t('tool.apiBurstTest.errors.http5xx'), count: errors.http5xx, color: 'text-red-600 dark:text-red-400' },
  ];

  const totalErrors = Object.values(errors).reduce((sum, count) => sum + count, 0);

  if (totalErrors === 0) {
    return (
      <div className={cn(
        'p-6 rounded-xl text-center',
        'bg-emerald-50 dark:bg-emerald-900/20',
        'border border-emerald-200 dark:border-emerald-800'
      )}>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          ✓ {t('tool.apiBurstTest.results.noErrors')}
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
        {t('tool.apiBurstTest.results.errors')}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">
                {t('tool.apiBurstTest.errors.type')}
              </th>
              <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-right">
                {t('tool.apiBurstTest.errors.count')}
              </th>
              <th className="pb-2 font-medium text-gray-500 dark:text-gray-400 text-right">
                {t('tool.apiBurstTest.errors.percentage')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.filter((row) => row.count > 0).map((row) => {
              const percent = totalRequests > 0
                ? ((row.count / totalRequests) * 100).toFixed(2)
                : '0.00';

              return (
                <tr key={row.type} className="border-b border-gray-100 dark:border-gray-800">
                  <td className={cn('py-2', row.color)}>
                    {row.label}
                  </td>
                  <td className="py-2 text-right text-gray-900 dark:text-gray-100">
                    {row.count.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-gray-500 dark:text-gray-400">
                    {percent}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-2 text-gray-700 dark:text-gray-300">
                {t('tool.apiBurstTest.errors.total')}
              </td>
              <td className="pt-2 text-right text-gray-900 dark:text-gray-100">
                {totalErrors.toLocaleString()}
              </td>
              <td className="pt-2 text-right text-gray-500 dark:text-gray-400">
                {totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00'}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ErrorsTable;

