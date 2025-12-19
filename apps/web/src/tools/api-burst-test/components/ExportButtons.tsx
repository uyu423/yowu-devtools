/**
 * ExportButtons - Export results as JSON/CSV or copy summary
 */

import React, { useState } from 'react';
import { Copy, FileJson, FileSpreadsheet, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import type { BurstTestResults } from '../types';
import { formatDuration, formatBytes } from '../types';

interface ExportButtonsProps {
  results: BurstTestResults | null;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  results,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    if (!results) return;

    const summary = `
Summary:
  Total:        ${formatDuration(results.totalTimeMs)}
  Slowest:      ${formatDuration(results.latency.max)}
  Fastest:      ${formatDuration(results.latency.min)}
  Average:      ${formatDuration(results.latency.avg)}
  Requests/sec: ${results.rps.toFixed(4)}

  Total data:   ${formatBytes(results.totalDataBytes)}
  Size/request: ${formatBytes(results.avgSizeBytes)}

Latency distribution:
  50% in ${formatDuration(results.latency.p50)}
  90% in ${formatDuration(results.latency.p90)}
  95% in ${formatDuration(results.latency.p95)}
  99% in ${formatDuration(results.latency.p99)}

Status code distribution:
${Object.entries(results.statusCodes)
  .map(([code, count]) => `  [${code}] ${count} responses`)
  .join('\n')}
`.trim();

    await copyToClipboard(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    if (!results) return;

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burst-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!results) return;

    const csvRows = [
      ['Metric', 'Value'],
      ['Total Requests', results.totalRequests],
      ['Success Requests', results.successRequests],
      ['Failed Requests', results.failedRequests],
      ['Total Time (ms)', results.totalTimeMs.toFixed(2)],
      ['RPS', results.rps.toFixed(4)],
      ['Total Data (bytes)', results.totalDataBytes],
      ['Avg Size (bytes)', results.avgSizeBytes],
      ['Latency Avg (ms)', results.latency.avg.toFixed(2)],
      ['Latency Min (ms)', results.latency.min.toFixed(2)],
      ['Latency Max (ms)', results.latency.max.toFixed(2)],
      ['Latency p50 (ms)', results.latency.p50.toFixed(2)],
      ['Latency p90 (ms)', results.latency.p90.toFixed(2)],
      ['Latency p95 (ms)', results.latency.p95.toFixed(2)],
      ['Latency p99 (ms)', results.latency.p99.toFixed(2)],
      ...Object.entries(results.statusCodes).map(([code, count]) => [`Status ${code}`, count]),
      ['Errors - Timeout', results.errors.timeout],
      ['Errors - CORS', results.errors.cors],
      ['Errors - Network', results.errors.network],
      ['Errors - Aborted', results.errors.aborted],
      ['Errors - HTTP 4xx', results.errors.http4xx],
      ['Errors - HTTP 5xx', results.errors.http5xx],
    ];

    const csv = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burst-test-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const disabled = !results;

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {/* Copy Summary */}
      <button
        onClick={handleCopySummary}
        disabled={disabled}
        title={t('tool.apiBurstTest.export.copySummary')}
        className={cn(
          'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg',
          'border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">{t('common.copied')}</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{t('tool.apiBurstTest.export.copySummary')}</span>
          </>
        )}
      </button>

      {/* Export JSON */}
      <button
        onClick={handleExportJson}
        disabled={disabled}
        title={t('tool.apiBurstTest.export.json')}
        className={cn(
          'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg',
          'border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <FileJson className="w-4 h-4" />
        <span>{t('tool.apiBurstTest.export.json')}</span>
      </button>

      {/* Export CSV */}
      <button
        onClick={handleExportCsv}
        disabled={disabled}
        title={t('tool.apiBurstTest.export.csv')}
        className={cn(
          'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-sm rounded-lg',
          'border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>{t('tool.apiBurstTest.export.csv')}</span>
      </button>
    </div>
  );
};

export default ExportButtons;

