/**
 * ExportButtons - Export results as JSON/CSV or copy summary/hey command
 */

import React, { useState } from 'react';
import { Copy, FileJson, FileSpreadsheet, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import type { ApiBurstTestState, BurstTestResults } from '../types';
import { formatDuration, formatBytes } from '../types';

interface ExportButtonsProps {
  results: BurstTestResults | null;
  state: ApiBurstTestState;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  results,
  state,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState<'summary' | 'hey' | null>(null);

  // Generate hey CLI command from current state
  const generateHeyCommand = (): string => {
    const parts = ['hey'];
    
    // Concurrency
    parts.push(`-c ${state.concurrency}`);
    
    // Load mode
    if (state.loadMode.type === 'requests') {
      parts.push(`-n ${state.loadMode.n}`);
    } else {
      parts.push(`-z ${state.loadMode.durationMs / 1000}s`);
    }
    
    // Rate limit (QPS)
    if (state.rateLimit.type !== 'none') {
      parts.push(`-q ${state.rateLimit.qps}`);
    }
    
    // Timeout
    parts.push(`-t ${state.timeoutMs / 1000}`);
    
    // Method (default is GET, so only add if different)
    if (state.method !== 'GET') {
      parts.push(`-m ${state.method}`);
    }
    
    // Headers
    state.headers
      .filter(h => h.enabled && h.key)
      .forEach(h => {
        parts.push(`-H "${h.key}: ${h.value}"`);
      });
    
    // Body
    if (state.body.text && !['GET', 'HEAD'].includes(state.method)) {
      // Escape quotes in body
      const escapedBody = state.body.text.replace(/"/g, '\\"');
      parts.push(`-d "${escapedBody}"`);
    }
    
    // Basic auth
    if (state.auth?.username) {
      parts.push(`-a ${state.auth.username}:${state.auth.password || ''}`);
    }
    
    // URL (with query params)
    let url = state.url;
    const enabledParams = state.params.filter(p => p.enabled && p.key);
    if (enabledParams.length > 0) {
      const queryString = enabledParams
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    parts.push(`"${url}"`);
    
    return parts.join(' ');
  };

  const handleCopyHeyCommand = async () => {
    const command = generateHeyCommand();
    await copyToClipboard(command);
    setCopied('hey');
    setTimeout(() => setCopied(null), 2000);
  };

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
    setCopied('summary');
    setTimeout(() => setCopied(null), 2000);
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
      {/* Copy hey CLI Command */}
      <Tooltip content={t('tool.apiBurstTest.export.copyHeyCommand')}>
        <button
          onClick={handleCopyHeyCommand}
          disabled={!state.url}
          className={cn(
            'flex items-center justify-center p-2 text-sm rounded-lg',
            'border border-gray-300 dark:border-gray-600',
            'text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {copied === 'hey' ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Terminal className="w-4 h-4" />
          )}
        </button>
      </Tooltip>

      {/* Copy Summary */}
      <Tooltip content={t('tool.apiBurstTest.export.copySummary')}>
        <button
          onClick={handleCopySummary}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center p-2 text-sm rounded-lg',
            'border border-gray-300 dark:border-gray-600',
            'text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {copied === 'summary' ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </Tooltip>

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

