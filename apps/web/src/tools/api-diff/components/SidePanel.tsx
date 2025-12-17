/**
 * Side Panel - A/B 영역 (Response Panel)
 */

import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, AlertCircle } from 'lucide-react';
import type { ResponseSide, ResponseTab, HttpMethod, KeyValuePair } from '../types';
import { getStatusColor, formatBytes, formatMs } from '../types';
import { buildUrl, generateCurl } from '../utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/useI18nHooks';

interface SidePanelProps {
  side: 'A' | 'B';
  domain: string;
  response: ResponseSide | null;
  activeTab: ResponseTab;
  onTabChange: (tab: ResponseTab) => void;
  // For generating cURL
  method: HttpMethod;
  path: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  side,
  domain,
  response,
  activeTab,
  onTabChange,
  method,
  path,
  params,
  headers,
  body,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const url = useMemo(
    () => (domain ? buildUrl(domain, path, params) : ''),
    [domain, path, params]
  );

  const curlCommand = useMemo(
    () => generateCurl(url, method, headers, body),
    [url, method, headers, body]
  );

  const handleCopy = async () => {
    try {
      const textToCopy =
        activeTab === 'curl'
          ? curlCommand
          : response?.rawBody || '';
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!response?.rawBody) return;
    const blob = new Blob([response.rawBody], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `response-${side.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    toast.success('Downloaded');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="mb-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tool.apiDiff.response')} {side}
        </div>
        {domain && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate" title={domain}>
            {domain}
          </div>
        )}
      </div>

      {/* Response Panel */}
      <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* Response Meta */}
        {response && (
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm">
              <span className={cn('font-medium', getStatusColor(response.status))}>
                {response.status || 'Error'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatMs(response.elapsedMs)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatBytes(response.sizeBytes)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Download JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {(['body', 'headers', 'raw', 'curl'] as ResponseTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-3 overflow-auto max-h-[400px]">
          {!response ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              {t('tool.apiDiff.noResponseYet')}
            </div>
          ) : response.error ? (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{response.error}</span>
            </div>
          ) : activeTab === 'body' ? (
            <BodyTab parsedJson={response.parsedJson} notValidJsonText={t('tool.apiDiff.notValidJson')} />
          ) : activeTab === 'headers' ? (
            <HeadersTab headers={response.headers} />
          ) : activeTab === 'raw' ? (
            <RawTab rawBody={response.rawBody} />
          ) : activeTab === 'curl' ? (
            <CurlTab curlCommand={curlCommand} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Body Tab Component
const BodyTab: React.FC<{
  parsedJson: unknown;
  notValidJsonText: string;
}> = ({ parsedJson, notValidJsonText }) => {
  if (parsedJson === undefined) {
    return (
      <div className="text-yellow-600 dark:text-yellow-400">
        {notValidJsonText}
      </div>
    );
  }

  // Simple JSON display for now (TODO: use react-json-tree with diff highlighting)
  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200">
      {JSON.stringify(parsedJson, null, 2)}
    </pre>
  );
};

// Headers Tab Component
const HeadersTab: React.FC<{ headers: Record<string, string> }> = ({
  headers,
}) => {
  const entries = Object.entries(headers);
  if (entries.length === 0) {
    return <div className="text-gray-400">No headers</div>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
            Header
          </th>
          <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr
            key={key}
            className="border-b border-gray-100 dark:border-gray-800"
          >
            <td className="py-1.5 px-2 font-mono text-gray-600 dark:text-gray-400">
              {key}
            </td>
            <td className="py-1.5 px-2 font-mono text-gray-900 dark:text-gray-100 break-all">
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Raw Tab Component
const RawTab: React.FC<{ rawBody: string | null }> = ({ rawBody }) => {
  if (!rawBody) {
    return <div className="text-gray-400">No body</div>;
  }

  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200">
      {rawBody}
    </pre>
  );
};

// cURL Tab Component
const CurlTab: React.FC<{ curlCommand: string }> = ({ curlCommand }) => {
  return (
    <pre className="text-sm font-mono whitespace-pre-wrap break-all text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-3 rounded">
      {curlCommand}
    </pre>
  );
};

export default SidePanel;

