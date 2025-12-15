/**
 * ResponseViewer - Display API response with status, headers, and body
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Download, Check, Clock, Database, FileType } from 'lucide-react';
import type { ResponseData } from '../types';
import { getStatusColor, formatBytes } from '../types';
import { parseResponseBody } from '../utils';
import { copyToClipboard } from '@/lib/clipboard';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import 'react-json-view-lite/dist/index.css';

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading?: boolean;
}

type ViewMode = 'tree' | 'pretty' | 'raw';
type TabType = 'body' | 'headers';

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('body');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [copied, setCopied] = useState(false);
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  const jsonViewStyles = useMemo(
    () => ({
      ...defaultStyles,
      container: `${defaultStyles.container} text-sm font-mono ${
        isDark ? 'text-gray-100' : 'text-gray-900'
      }`,
    }),
    [isDark]
  );

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (data: string, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse response body
  const parsedBody = useMemo(() => {
    if (!response?.body) return null;
    const contentType = response.headers?.['content-type'];
    return parseResponseBody(response.body, contentType);
  }, [response]);

  // Calculate body size
  const bodySize = useMemo(() => {
    const body = response?.body;
    if (!body?.data) return 0;
    return body.kind === 'base64'
      ? Math.ceil((body.data.length * 3) / 4) // Approximate decoded size
      : new Blob([body.data]).size;
  }, [response]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600" />
          <span>Sending request...</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <span>Send a request to see the response</span>
      </div>
    );
  }

  // Error response
  if (response.error) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4 text-red-600 dark:text-red-400">
          <span className="font-semibold">Error</span>
          {response.timingMs !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {response.timingMs}ms
            </span>
          )}
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="font-mono text-sm text-red-700 dark:text-red-300">
            {response.error.code}
          </div>
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {response.error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {/* Status code */}
        <div className={cn('font-semibold', getStatusColor(response.status))}>
          {response.status} {response.statusText}
        </div>

        {/* Timing */}
        {response.timingMs !== undefined && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{response.timingMs}ms</span>
          </div>
        )}

        {/* Size */}
        {bodySize > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Database className="w-4 h-4" />
            <span>{formatBytes(bodySize)}</span>
          </div>
        )}

        {/* Content-Type */}
        {response.headers?.['content-type'] && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <FileType className="w-4 h-4" />
            <span className="truncate max-w-xs">
              {response.headers['content-type'].split(';')[0]}
            </span>
          </div>
        )}

        {/* Method badge */}
        {response.method && (
          <div className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            via {response.method}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('body')}
          className={cn(
            'px-3 py-1 text-sm rounded-md transition-colors',
            activeTab === 'body'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          Body
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={cn(
            'px-3 py-1 text-sm rounded-md transition-colors',
            activeTab === 'headers'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          Headers ({Object.keys(response.headers || {}).length})
        </button>

        {/* View mode (only for body tab with JSON) */}
        {activeTab === 'body' && parsedBody?.type === 'json' && (
          <div className="ml-auto flex items-center gap-1">
            {(['tree', 'pretty', 'raw'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  viewMode === mode
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={() => {
            if (activeTab === 'body' && response.body?.kind === 'text') {
              handleCopy(response.body.data);
            } else if (activeTab === 'headers') {
              const headersText = Object.entries(response.headers || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n');
              handleCopy(headersText);
            }
          }}
          className={cn(
            'ml-2 p-1.5 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            copied && 'text-emerald-500 dark:text-emerald-400'
          )}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'body' && (
          <div className="p-4">
            {parsedBody?.type === 'json' && (
              <>
                {viewMode === 'tree' && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-auto">
                    <JsonView data={parsedBody.data as object | unknown[]} style={jsonViewStyles} />
                  </div>
                )}
                {viewMode === 'pretty' && (
                  <CodeMirror
                    value={JSON.stringify(parsedBody.data, null, 2)}
                    height="400px"
                    extensions={[]}
                    theme={isDark ? oneDark : undefined}
                    editable={false}
                    basicSetup={{ lineNumbers: true, foldGutter: true }}
                  />
                )}
                {viewMode === 'raw' && (
                  <pre className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap">
                    {response.body?.data}
                  </pre>
                )}
              </>
            )}

            {parsedBody?.type === 'text' && (
              <pre className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap">
                {parsedBody.data as string}
              </pre>
            )}

            {parsedBody?.type === 'image' && (
              <div className="flex justify-center p-4">
                <img
                  src={parsedBody.data as string}
                  alt="Response"
                  className="max-w-full max-h-96 rounded-lg shadow"
                />
              </div>
            )}

            {parsedBody?.type === 'binary' && (
              <div className="flex flex-col items-center gap-4 p-8">
                <div className="text-gray-500 dark:text-gray-400">
                  Binary response ({formatBytes(bodySize)})
                </div>
                <button
                  onClick={() => {
                    const binary = atob(response.body?.data || '');
                    handleDownload(
                      binary,
                      'response.bin',
                      response.headers?.['content-type'] || 'application/octet-stream'
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <div className="p-4">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {key}
                    </td>
                    <td className="py-2 font-mono text-gray-900 dark:text-gray-100 break-all">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;

