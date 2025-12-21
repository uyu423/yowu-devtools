/**
 * ResponseViewer - Display API response with status, headers, and body
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Copy, Download, Check, Clock, Database, FileType, ExternalLink, ChevronDown, ChevronUp, FileJson, FileCode2, Loader2 } from 'lucide-react';
import type { ResponseData } from '../types';
import { getStatusColor, getStatusText, formatBytes } from '../types';
import { parseResponseBody } from '../utils';
import { copyToClipboard } from '@/lib/clipboard';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import { useI18n } from '@/hooks/useI18nHooks';
import { JsonTreeView } from '@/components/common/JsonTreeView';
import { buildLocalePath } from '@/lib/i18nUtils';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

interface ResponseViewerProps {
  response: ResponseData | null;
  isLoading?: boolean;
}

type ViewMode = 'tree' | 'pretty' | 'raw';
type TabType = 'body' | 'headers';

// Map error codes to i18n keys
const ERROR_MESSAGE_KEYS: Record<string, string> = {
  TIMEOUT: 'errorTimeout',
  CORS_ERROR: 'errorCors',
  NETWORK_ERROR: 'errorNetwork',
  UNKNOWN_ERROR: 'errorUnknown',
  PERMISSION_DENIED: 'errorPermissionDenied',
  EXTENSION_ERROR: 'errorExtension',
};

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response, isLoading }) => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('body');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [copied, setCopied] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isNavigating, setIsNavigating] = useState<'json' | 'yaml' | null>(null);
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  // Get translated error message based on error code
  const getErrorMessage = useCallback(
    (error: { code: string; message: string }) => {
      const key = ERROR_MESSAGE_KEYS[error.code];
      if (!key) return error.message;

      // Extract parameters from original message for interpolation
      let translatedMessage = t(`tool.apiTester.${key}`);

      // Handle timeout message with ms parameter
      if (error.code === 'TIMEOUT') {
        const msMatch = error.message.match(/(\d+)ms/);
        if (msMatch) {
          translatedMessage = translatedMessage.replace('{ms}', msMatch[1]);
        }
      }

      // Handle permission denied with origin parameter
      if (error.code === 'PERMISSION_DENIED') {
        const originMatch = error.message.match(/for ([^\s.]+)/);
        if (originMatch) {
          translatedMessage = translatedMessage.replace('{origin}', originMatch[1]);
        }
      }

      return translatedMessage;
    },
    [t]
  );

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
    if (parsedBody.type === 'yaml') {
      return typeof parsedBody.data === 'string' ? parsedBody.data : String(parsedBody.data);
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

  // Navigate to JSON Viewer with data
  const handleOpenInJsonViewer = useCallback(() => {
    if (!parsedBody || parsedBody.type !== 'json' || isNavigating) return;
    
    setIsNavigating('json');
    
    try {
      const jsonString = JSON.stringify(parsedBody.data, null, 2);
      const shareState = {
        input: jsonString,
        indent: 2,
        sortKeys: false,
        viewMode: 'tree',
        expandLevel: 5,
      };
      
      // Use React Router state instead of URL parameter for faster navigation
      // Include locale in path to prevent redirect that would lose state
      const targetPath = buildLocalePath(locale, '/json');
      navigate(targetPath, { state: shareState });
    } catch (error) {
      console.error('Failed to navigate to JSON Viewer:', error);
      setIsNavigating(null);
    }
  }, [parsedBody, navigate, isNavigating, locale]);

  // Navigate to YAML Converter with data
  const handleOpenInYamlConverter = useCallback(() => {
    if (!parsedBody || parsedBody.type !== 'yaml' || isNavigating) return;
    
    setIsNavigating('yaml');
    
    try {
      const yamlString = typeof parsedBody.data === 'string' ? parsedBody.data : '';
      const shareState = {
        source: yamlString,
        direction: 'yaml2json' as const,
        indent: 2,
      };
      
      // Use React Router state instead of URL parameter for faster navigation
      // Include locale in path to prevent redirect that would lose state
      const targetPath = buildLocalePath(locale, '/yaml');
      navigate(targetPath, { state: shareState });
    } catch (error) {
      console.error('Failed to navigate to YAML Converter:', error);
      setIsNavigating(null);
    }
  }, [parsedBody, navigate, isNavigating, locale]);

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
          <span>{t('tool.apiTester.sendingRequest')}</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <span>{t('tool.apiTester.sendRequestToSee')}</span>
      </div>
    );
  }

  // Network/CORS error (not HTTP error)
  if (response.error && !response.status) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4 text-red-600 dark:text-red-400">
          <span className="font-semibold">{t('common.error')}</span>
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
            {getErrorMessage(response.error)}
          </div>
          
          {/* Error Details Toggle */}
          {response.error.details && (
            <div className="mt-4">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="flex items-center gap-1 text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                {showErrorDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    {t('tool.apiTester.hideErrorDetails')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    {t('tool.apiTester.showErrorDetails')}
                  </>
                )}
              </button>
              
              {showErrorDetails && (
                <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono text-red-800 dark:text-red-200 overflow-auto whitespace-pre-wrap break-words max-h-64">
                  {response.error.details}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // HTTP response (including 4xx, 5xx errors)
  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {/* Status code */}
        <div className={cn('font-semibold', getStatusColor(response.status))}>
          {response.status} {getStatusText(response.status, response.statusText)}
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
            <FileType className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-xs">
              {response.headers['content-type'].split(';')[0]}
            </span>
          </div>
        )}

        {/* Method badge */}
        {response.method && (
          <div className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {t('tool.apiTester.viaMethod').replace('{method}', response.method)}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('body')}
          className={cn(
            'px-2 sm:px-3 py-1 text-sm rounded-md transition-colors',
            activeTab === 'body'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          {t('tool.apiTester.responseBody')}
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={cn(
            'px-2 sm:px-3 py-1 text-sm rounded-md transition-colors',
            activeTab === 'headers'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          {t('tool.apiTester.responseHeaders')} ({Object.keys(response.headers || {}).length})
        </button>

        {/* View mode and action buttons */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* View mode (only for body tab with JSON) */}
          {activeTab === 'body' && parsedBody?.type === 'json' && (
            <div className="flex items-center gap-1">
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
                  {t(`tool.apiTester.view${mode.charAt(0).toUpperCase() + mode.slice(1)}`)}
                </button>
              ))}
            </div>
          )}

          {/* Divider between view mode and action buttons */}
          {activeTab === 'body' && parsedBody?.type === 'json' && (
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          )}

          {/* Open in JSON Viewer button - only for JSON responses */}
          {activeTab === 'body' && parsedBody?.type === 'json' && (
            <button
              onClick={handleOpenInJsonViewer}
              disabled={isNavigating !== null}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-md',
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                'border border-blue-200 dark:border-blue-800',
                'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                'hover:border-blue-300 dark:hover:border-blue-700',
                'transition-all duration-200',
                'shadow-sm hover:shadow',
                isNavigating === 'json' && 'opacity-75 cursor-wait',
                isNavigating !== null && isNavigating !== 'json' && 'opacity-50 cursor-not-allowed'
              )}
              title={t('tool.apiTester.openInJsonViewer')}
            >
              {isNavigating === 'json' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <FileJson className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('tool.apiTester.openInJsonViewer')}</span>
                  <ExternalLink className="w-3 h-3 opacity-70 hidden sm:inline" />
                </>
              )}
            </button>
          )}

          {/* Open in YAML Converter button - only for YAML responses */}
          {activeTab === 'body' && parsedBody?.type === 'yaml' && (
            <button
              onClick={handleOpenInYamlConverter}
              disabled={isNavigating !== null}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-md',
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                'border border-blue-200 dark:border-blue-800',
                'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                'hover:border-blue-300 dark:hover:border-blue-700',
                'transition-all duration-200',
                'shadow-sm hover:shadow',
                isNavigating === 'yaml' && 'opacity-75 cursor-wait',
                isNavigating !== null && isNavigating !== 'yaml' && 'opacity-50 cursor-not-allowed'
              )}
              title={t('tool.apiTester.openInYamlConverter')}
            >
              {isNavigating === 'yaml' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('tool.apiTester.openInYamlConverter')}</span>
                  <ExternalLink className="w-3 h-3 opacity-70 hidden sm:inline" />
                </>
              )}
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              'p-1.5 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-colors',
              copied && 'text-emerald-500 dark:text-emerald-400'
            )}
            title={t('common.copy')}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'body' && (
          <div className="p-4">
            {parsedBody?.type === 'json' && (
              <>
                {viewMode === 'tree' && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-auto font-mono text-sm">
                    <JsonTreeView data={parsedBody.data} expandLevel={Infinity} isDark={isDark} />
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

            {parsedBody?.type === 'yaml' && (
              <div className="w-full overflow-hidden">
                <CodeMirror
                  value={typeof parsedBody.data === 'string' ? parsedBody.data : String(parsedBody.data)}
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
                  {t('tool.apiTester.binaryResponse')} ({formatBytes(bodySize)})
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
                  {t('tool.apiTester.downloadBinary')}
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
