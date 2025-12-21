/**
 * Side Panel - A/B 영역 (Response Panel)
 * Similar to API Tester's ResponseViewer
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Check, Copy, Download, AlertCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import type { ResponseSide, ResponseTab, HttpMethod, KeyValuePair, DifferentField } from '../types';
import { getStatusColor, formatBytes, formatMs } from '../types';
import { generateCurl } from '../utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/useI18nHooks';

type ViewMode = 'tree' | 'pretty' | 'raw';

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
  // For diff highlighting
  differentFields?: DifferentField[];
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
  differentFields = [],
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const curlCommand = useMemo(
    () => (domain ? generateCurl(domain, path, method, params, headers, body) : ''),
    [domain, path, method, params, headers, body]
  );

  // Get pretty formatted JSON for copy
  const getPrettyData = useCallback(() => {
    if (!response?.parsedJson) return response?.rawBody || '';
    return JSON.stringify(response.parsedJson, null, 2);
  }, [response]);

  const handleCopy = async () => {
    try {
      let textToCopy = '';
      if (activeTab === 'curl') {
        textToCopy = curlCommand;
      } else if (activeTab === 'body') {
        // Always copy pretty formatted data for body
        textToCopy = getPrettyData();
      } else if (activeTab === 'headers') {
        textToCopy = Object.entries(response?.headers || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
      } else {
        textToCopy = response?.rawBody || '';
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t('common.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.copyFailed'));
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
    toast.success(t('common.downloaded'));
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
        {/* Response Meta - Status bar similar to API Tester */}
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
              {/* Method badge - shows how the request was made */}
              {response.method && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {response.method === 'extension' ? t('tool.apiDiff.viaExtension') : t('tool.apiDiff.viaDirect')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title={t('common.copy')}
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
                title={t('common.downloadJson')}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs + View Mode Selector */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
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
          
          {/* View mode selector - only for body tab with JSON */}
          {activeTab === 'body' && response?.parsedJson !== undefined && (
            <div className="flex items-center gap-1 pr-2">
              {(['tree', 'pretty', 'raw'] as ViewMode[]).map((mode) => (
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
                  {t(`tool.apiDiff.view${mode.charAt(0).toUpperCase() + mode.slice(1)}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-3">
          {!response ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              {t('tool.apiDiff.noResponseYet')}
            </div>
          ) : response.error && !response.status ? (
            // Network/CORS error (not HTTP error)
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{t('common.error')}</span>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-600 dark:text-red-400">
                  {response.error.message}
                </div>
                {/* Error Details - show error details or raw body if available */}
                {(response.error.details || response.rawBody) && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowErrorDetails(!showErrorDetails)}
                      className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      {showErrorDetails ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          {t('tool.apiDiff.hideDetails')}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          {t('tool.apiDiff.showDetails')}
                        </>
                      )}
                    </button>
                    {showErrorDetails && (
                      <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono text-red-800 dark:text-red-200 overflow-auto">
                        {response.error.details || response.rawBody}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'body' ? (
            <BodyTab
              parsedJson={response.parsedJson}
              rawBody={response.rawBody}
              notValidJsonText={t('tool.apiDiff.notValidJson')}
              differentFields={differentFields}
              side={side}
              viewMode={viewMode}
              isDark={isDark}
            />
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


/**
 * Recursively render JSON with clickable links for URLs (similar to API Tester)
 */
const JsonWithLinks: React.FC<{ 
  data: unknown; 
  depth?: number;
  differentFields?: DifferentField[];
  side?: 'A' | 'B';
  path?: string;
}> = ({ data, depth = 0, differentFields = [], side, path = '' }) => {
  // Create set of different field paths for highlighting
  const diffPaths = useMemo(() => new Set(differentFields.map((f) => f.path)), [differentFields]);
  
  const isDifferent = (fieldPath: string) => diffPaths.has(fieldPath);
  const isMissing = (fieldPath: string) => {
    const field = differentFields.find((f) => f.path === fieldPath);
    if (!field) return false;
    return side === 'A' ? field.valueA === undefined : field.valueB === undefined;
  };

  const getHighlightClass = (fieldPath: string) => {
    if (isMissing(fieldPath)) return 'bg-red-100 dark:bg-red-900/50 px-1 rounded';
    if (isDifferent(fieldPath)) return 'bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded';
    return '';
  };

  if (data === null) return <span className="text-gray-500">null</span>;
  if (data === undefined) return <span className="text-gray-500">undefined</span>;

  if (typeof data === 'string') {
    const highlightClass = getHighlightClass(path);
    // Check if it's a URL
    if (/^https?:\/\//i.test(data)) {
      return (
        <a
          href={data}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1',
            highlightClass
          )}
          onClick={(e) => e.stopPropagation()}
        >
          "{data}"
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return <span className={cn('text-emerald-600 dark:text-emerald-400', highlightClass)}>"{data}"</span>;
  }

  if (typeof data === 'number') {
    const highlightClass = getHighlightClass(path);
    return <span className={cn('text-purple-600 dark:text-purple-400', highlightClass)}>{data}</span>;
  }

  if (typeof data === 'boolean') {
    const highlightClass = getHighlightClass(path);
    return <span className={cn('text-orange-600 dark:text-orange-400', highlightClass)}>{data.toString()}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]</span>;
    return (
      <span>
        {'['}
        <div className="pl-4">
          {data.map((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            return (
              <div key={index}>
                <JsonWithLinks data={item} depth={depth + 1} differentFields={differentFields} side={side} path={itemPath} />
                {index < data.length - 1 && ','}
              </div>
            );
          })}
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
          {entries.map(([key, value], index) => {
            const keyPath = path ? `${path}.${key}` : key;
            const highlightClass = getHighlightClass(keyPath);
            return (
              <div key={key}>
                <span className={cn('text-gray-700 dark:text-gray-300', highlightClass)}>"{key}"</span>
                <span className="text-gray-500">: </span>
                <JsonWithLinks data={value} depth={depth + 1} differentFields={differentFields} side={side} path={keyPath} />
                {index < entries.length - 1 && ','}
              </div>
            );
          })}
        </div>
        {'}'}
      </span>
    );
  }

  return <span>{String(data)}</span>;
};

// Body Tab Component with multiple view modes (similar to API Tester)
const BodyTab: React.FC<{
  parsedJson: unknown;
  rawBody: string | null;
  notValidJsonText: string;
  differentFields: DifferentField[];
  side: 'A' | 'B';
  viewMode: ViewMode;
  isDark: boolean;
}> = ({ parsedJson, rawBody, notValidJsonText, differentFields, side, viewMode, isDark }) => {
  // If not valid JSON, show raw body
  if (parsedJson === undefined) {
    return (
      <div className="space-y-2">
        <div className="text-yellow-600 dark:text-yellow-400 text-sm">
          {notValidJsonText}
        </div>
        {rawBody && (
          <pre className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap break-all">
            {rawBody}
          </pre>
        )}
      </div>
    );
  }

  // Tree View - using JsonWithLinks with diff highlighting
  if (viewMode === 'tree') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-auto font-mono text-sm">
        <JsonWithLinks data={parsedJson} differentFields={differentFields} side={side} />
      </div>
    );
  }

  // Pretty View - using CodeMirror with syntax highlighting
  if (viewMode === 'pretty') {
    return (
      <div className="w-full overflow-hidden">
        <CodeMirror
          value={JSON.stringify(parsedJson, null, 2)}
          height="auto"
          extensions={[]}
          theme={isDark ? oneDark : undefined}
          editable={false}
          basicSetup={{ lineNumbers: true, foldGutter: true }}
          className="w-full [&_.cm-editor]:!max-w-full [&_.cm-scroller]:!overflow-x-auto"
        />
      </div>
    );
  }

  // Raw View - plain text
  return (
    <pre className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap break-all">
      {rawBody || JSON.stringify(parsedJson)}
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

