/**
 * ResponseViewer - Display API response with status, headers, and body
 */

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Download, Check, Clock, Database, FileType, ExternalLink } from 'lucide-react';
import type { ResponseData } from '../types';
import { getStatusColor, formatBytes } from '../types';
import { parseResponseBody } from '../utils';
import { copyToClipboard } from '@/lib/clipboard';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading?: boolean;
}

type ViewMode = 'tree' | 'pretty' | 'raw';
type TabType = 'body' | 'headers';

/**
 * Recursively render JSON with clickable links for URLs
 */
const JsonWithLinks: React.FC<{ data: unknown; depth?: number }> = ({ data, depth = 0 }) => {
  if (data === null) return <span className="text-gray-500">null</span>;
  if (data === undefined) return <span className="text-gray-500">undefined</span>;

  if (typeof data === 'string') {
    // Check if it's a URL
    if (/^https?:\/\//i.test(data)) {
      return (
        <a
          href={data}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          "{data}"
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return <span className="text-emerald-600 dark:text-emerald-400">"{data}"</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-purple-600 dark:text-purple-400">{data}</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-orange-600 dark:text-orange-400">{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]</span>;
    return (
      <span>
        {'['}
        <div className="pl-4">
          {data.map((item, index) => (
            <div key={index}>
              <JsonWithLinks data={item} depth={depth + 1} />
              {index < data.length - 1 && ','}
            </div>
          ))}
        </div>
        {']'}
      </span>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) return <span>{'{}'}</span>;
    return (
      <span>
        {'{'}
        <div className="pl-4">
          {entries.map(([key, value], index) => (
            <div key={key}>
              <span className="text-gray-700 dark:text-gray-300">"{key}"</span>
              <span className="text-gray-500">: </span>
              <JsonWithLinks data={value} depth={depth + 1} />
              {index < entries.length - 1 && ','}
            </div>
          ))}
        </div>
        {'}'}
      </span>
    );
  }

  return <span>{String(data)}</span>;
};

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('body');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [copied, setCopied] = useState(false);
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  // Parse response body
  const parsedBody = useMemo(() => {
    if (!response?.body) return null;
    const contentType = response.headers?.['content-type'];
    return parseResponseBody(response.body, contentType);
  }, [response]);

  // Get pretty formatted data for copy
  const getPrettyData = useCallback(() => {
    if (!parsedBody) return '';
    if (parsedBody.type === 'json') {
      return JSON.stringify(parsedBody.data, null, 2);
    }
    if (parsedBody.type === 'text') {
      return parsedBody.data as string;
    }
    return response?.body?.data || '';
  }, [parsedBody, response]);

  const handleCopy = async () => {
    let textToCopy = '';
    
    if (activeTab === 'body') {
      // Always copy pretty formatted data for body
      textToCopy = getPrettyData();
    } else if (activeTab === 'headers') {
      const headersText = Object.entries(response?.headers || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      textToCopy = headersText;
    }
    
    await copyToClipboard(textToCopy);
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

  // Network/CORS error (not HTTP error)
  if (response.error && !response.status) {
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

  // HTTP response (including 4xx, 5xx errors)
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
          onClick={handleCopy}
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
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-auto font-mono text-sm">
                    <JsonWithLinks data={parsedBody.data} />
                  </div>
                )}
                {viewMode === 'pretty' && (
                  <div className="w-full overflow-hidden">
                    <CodeMirror
                      value={JSON.stringify(parsedBody.data, null, 2)}
                      height="auto"
                      maxHeight="600px"
                      extensions={[]}
                      theme={isDark ? oneDark : undefined}
                      editable={false}
                      basicSetup={{ lineNumbers: true, foldGutter: true }}
                      className="w-full [&_.cm-editor]:!max-w-full [&_.cm-scroller]:!overflow-x-auto"
                    />
                  </div>
                )}
                {viewMode === 'raw' && (
                  <pre className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap break-all">
                    {response.body?.data}
                  </pre>
                )}
              </>
            )}

            {parsedBody?.type === 'text' && (
              <pre className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap break-all">
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
