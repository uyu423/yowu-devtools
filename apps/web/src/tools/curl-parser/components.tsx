/**
 * cURL Parser - UI Components
 * Redesigned to match URL Parser style
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, FileJson, ExternalLink, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { buildLocalePath } from '@/lib/i18nUtils';
import type { CurlParseResult } from '@/lib/curl/types';
import { decodeUrl } from '@/lib/curl/parseCurl';
import lzString from 'lz-string';

// ================================
// Helper: Check if value looks like JSON
// ================================
const isJsonLike = (value: string): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  // Check for JSON object or array patterns
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
};

// ================================
// Helper: Try parse JSON
// ================================
const tryParseJson = (value: string): object | null => {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

// ================================
// Helper: Check if value is a URL
// ================================
const isUrl = (value: string): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  // Check for http:// or https:// URLs
  return /^https?:\/\/[^\s]+$/i.test(trimmed);
};

// ================================
// Clickable URL Component
// ================================
interface ClickableValueProps {
  value: string;
  className?: string;
}

const ClickableValue: React.FC<ClickableValueProps> = ({ value, className = '' }) => {
  if (isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-blue-600 dark:text-blue-400 hover:underline ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {value}
        <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-70" />
      </a>
    );
  }
  return <span className={className}>{value}</span>;
};

// ================================
// Open in JSON Viewer Button Component
// ================================
interface OpenInJsonViewerButtonProps {
  value: string;
  compact?: boolean;
}

const OpenInJsonViewerButton: React.FC<OpenInJsonViewerButtonProps> = ({ value, compact = false }) => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  
  const handleOpenInJsonViewer = () => {
    // Create envelope format expected by useToolState
    const envelope = {
      tool: 'json',
      state: {
        input: value,
        indent: 2,
        sortKeys: false,
        viewMode: 'tree',
        expandLevel: 5,
      },
    };
    // Compress and navigate to JSON Viewer with 'd' parameter
    const compressed = lzString.compressToEncodedURIComponent(JSON.stringify(envelope));
    const jsonViewerPath = buildLocalePath(locale, '/json');
    navigate(`${jsonViewerPath}?d=${compressed}`);
  };
  
  if (compact) {
    return (
      <button
        onClick={handleOpenInJsonViewer}
        className={cn(
          'p-1.5 rounded-md',
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
          'border border-blue-200 dark:border-blue-800',
          'hover:bg-blue-100 dark:hover:bg-blue-900/30',
          'hover:border-blue-300 dark:hover:border-blue-700',
          'transition-all duration-200',
          'shadow-sm hover:shadow'
        )}
        title={t('tool.curl.openInJsonViewer')}
      >
        <FileJson className="w-4 h-4" />
      </button>
    );
  }
  
  return (
    <button
      onClick={handleOpenInJsonViewer}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md',
        'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        'border border-blue-200 dark:border-blue-800',
        'hover:bg-blue-100 dark:hover:bg-blue-900/30',
        'hover:border-blue-300 dark:hover:border-blue-700',
        'transition-all duration-200',
        'shadow-sm hover:shadow'
      )}
    >
      <FileJson className="w-3.5 h-3.5" />
      <span>{t('tool.curl.openInJsonViewer')}</span>
      <ExternalLink className="w-3 h-3 opacity-70" />
    </button>
  );
};

// ================================
// Section Header Component
// ================================
interface SectionHeaderProps {
  title: string;
  count?: number;
  onCopyAll?: () => void;
  copyAllTooltip?: string;
  rightContent?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  onCopyAll,
  copyAllTooltip,
  rightContent,
}) => {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-t-md border">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title} {count !== undefined && `(${count})`}
      </span>
      <div className="flex items-center gap-2">
        {rightContent}
        {onCopyAll && (
          <button
            onClick={onCopyAll}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title={copyAllTooltip || t('common.copy')}
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ================================
// Request Summary Component
// ================================
interface RequestSummaryProps {
  result: CurlParseResult;
  urlDecoded?: boolean;
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
  result,
  urlDecoded = false,
}) => {
  const { t } = useI18n();
  const { request } = result;
  const displayUrl = urlDecoded && request.urlDecoded ? request.urlDecoded : request.url;

  const handleCopyMethod = () => {
    copyToClipboard(request.method, t('tool.curl.copiedMethod'));
  };

  const handleCopyUrl = () => {
    copyToClipboard(displayUrl, t('tool.curl.copiedUrl'));
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={t('tool.curl.requestSummary')} />
      <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 space-y-3">
          {/* Method */}
          <div className="flex items-start gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
              {t('tool.curl.method')}:
            </span>
            <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">
              {request.method}
            </span>
            <button
              onClick={handleCopyMethod}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
              title={t('common.copy')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {/* URL */}
          <div className="flex items-start gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
              {t('tool.curl.url')}:
            </span>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all flex-1">
              {displayUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title={t('common.copy')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================
// Query Parameters View Component
// ================================
interface QueryParamsViewProps {
  params: Array<{ key: string; value: string; enabled: boolean }>;
  urlDecoded?: boolean;
}

export const QueryParamsView: React.FC<QueryParamsViewProps> = ({
  params,
  urlDecoded = false,
}) => {
  const { t } = useI18n();

  if (params.length === 0) {
    return null;
  }

  const handleCopyParam = (key: string, value: string) => {
    const displayKey = urlDecoded ? decodeUrl(key) : key;
    const displayValue = urlDecoded ? decodeUrl(value) : value;
    copyToClipboard(`${displayKey}=${displayValue}`, t('tool.curl.copiedParam').replace('{key}', displayKey));
  };

  const handleCopyAll = () => {
    const queryString = params
      .filter((p) => p.enabled)
      .map((p) => `${p.key}=${p.value}`)
      .join('&');
    copyToClipboard(queryString, t('tool.curl.copiedAllParams'));
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t('tool.curl.queryParams')}
        count={params.length}
        onCopyAll={handleCopyAll}
        copyAllTooltip={t('tool.curl.copyAllParams')}
      />
      <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.curl.key')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.curl.value')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                  {t('tool.curl.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {params.map((param, index) => {
                const displayKey = urlDecoded ? decodeUrl(param.key) : param.key;
                const displayValue = urlDecoded ? decodeUrl(param.value) : param.value;
                const valueIsJson = isJsonLike(displayValue) && tryParseJson(displayValue) !== null;
                return (
                  <tr
                    key={`${param.key}-${index}`}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!param.enabled ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {displayKey || (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          ({t('tool.curl.empty')})
                        </span>
                      )}
                      {!param.enabled && (
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                          ({t('tool.curl.disabled')})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {displayValue ? (
                        <ClickableValue value={displayValue} />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          ({t('tool.curl.empty')})
                        </span>
                      )}
                      {valueIsJson && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          (JSON)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyParam(param.key, param.value)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title={t('common.copy')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {valueIsJson && (
                          <OpenInJsonViewerButton value={displayValue} compact />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ================================
// Headers View Component
// ================================
interface HeadersViewProps {
  headers: Array<{ key: string; value: string; enabled: boolean }>;
}

export const HeadersView: React.FC<HeadersViewProps> = ({ headers }) => {
  const { t } = useI18n();

  if (headers.length === 0) {
    return null;
  }

  const handleCopyHeader = (key: string, value: string) => {
    copyToClipboard(`${key}: ${value}`, t('tool.curl.copiedHeader').replace('{key}', key));
  };

  const handleCopyAll = () => {
    const headersText = headers
      .filter((h) => h.enabled)
      .map((h) => `${h.key}: ${h.value}`)
      .join('\n');
    copyToClipboard(headersText, t('tool.curl.copiedAllHeaders'));
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t('tool.curl.headers')}
        count={headers.length}
        onCopyAll={handleCopyAll}
        copyAllTooltip={t('tool.curl.copyAllHeaders')}
      />
      <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.curl.key')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.curl.value')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                  {t('tool.curl.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {headers.map((header, index) => {
                const valueIsJson = isJsonLike(header.value) && tryParseJson(header.value) !== null;
                return (
                  <tr
                    key={`${header.key}-${index}`}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!header.enabled ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {header.key}
                      {!header.enabled && (
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                          ({t('tool.curl.disabled')})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      <ClickableValue value={header.value} />
                      {valueIsJson && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          (JSON)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyHeader(header.key, header.value)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title={t('common.copy')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {valueIsJson && (
                          <OpenInJsonViewerButton value={header.value} compact />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ================================
// Cookies View Component
// ================================
interface CookiesViewProps {
  cookies: { raw: string; items: Array<{ key: string; value: string }> };
}

export const CookiesView: React.FC<CookiesViewProps> = ({ cookies }) => {
  const { t } = useI18n();
  const [rawExpanded, setRawExpanded] = useState(false);

  const handleCopyCookie = (key: string, value: string) => {
    copyToClipboard(`${key}=${value}`, t('tool.curl.copiedCookie').replace('{key}', key));
  };

  const handleCopyRaw = () => {
    copyToClipboard(cookies.raw, t('tool.curl.copiedAllCookies'));
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title={t('tool.curl.cookies')}
        count={cookies.items.length}
        onCopyAll={handleCopyRaw}
        copyAllTooltip={t('tool.curl.copyAllCookies')}
      />
      <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
        {/* Raw Cookie - Collapsible */}
        <div className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => setRawExpanded(!rawExpanded)}
            className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            {rawExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('tool.curl.raw')}
            </span>
            {!rawExpanded && (
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                ({cookies.raw.length} chars)
              </span>
            )}
          </button>
          {rawExpanded && (
            <div className="px-4 pb-4">
              <div className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <code className="text-sm text-gray-900 dark:text-gray-100 break-all">
                  {cookies.raw}
                </code>
              </div>
            </div>
          )}
        </div>
        {/* Parsed Cookies Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.curl.key')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.curl.value')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                  {t('tool.curl.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {cookies.items.map((cookie, index) => {
                const valueIsJson = isJsonLike(cookie.value) && tryParseJson(cookie.value) !== null;
                return (
                  <tr
                    key={`${cookie.key}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                      {cookie.key}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {cookie.value ? (
                        <ClickableValue value={cookie.value} />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          ({t('tool.curl.empty')})
                        </span>
                      )}
                      {valueIsJson && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          (JSON)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyCookie(cookie.key, cookie.value)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title={t('common.copy')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {valueIsJson && (
                          <OpenInJsonViewerButton value={cookie.value} compact />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ================================
// Body View Component
// ================================
interface BodyViewProps {
  body: {
    kind: string;
    text?: string;
    urlencodedItems?: Array<{ key: string; value: string }>;
    multipartItems?: Array<{
      kind: string;
      key: string;
      value?: string;
      path?: string;
      note?: string;
    }>;
  };
}

export const BodyView: React.FC<BodyViewProps> = ({ body }) => {
  const { t } = useI18n();

  if (body.kind === 'none') {
    return null;
  }

  const handleCopyBody = () => {
    if (body.text) {
      copyToClipboard(body.text, t('tool.curl.copiedBody'));
    }
  };

  const handleCopyField = (key: string, value: string) => {
    copyToClipboard(`${key}=${value}`, t('tool.curl.copiedBodyField').replace('{key}', key));
  };

  if (body.kind === 'json' || body.kind === 'text') {
    const isJson = body.kind === 'json' || (body.text && tryParseJson(body.text) !== null);
    
    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title={`${t('tool.curl.body')} (${body.kind})`}
          onCopyAll={handleCopyBody}
          copyAllTooltip={t('tool.curl.copyBody')}
          rightContent={isJson && body.text ? <OpenInJsonViewerButton value={body.text} /> : undefined}
        />
        <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-4">
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700">
              {body.text}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (body.kind === 'urlencoded' && body.urlencodedItems) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title={`${t('tool.curl.body')} (${body.kind})`}
          count={body.urlencodedItems.length}
        />
        <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t('tool.curl.key')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t('tool.curl.value')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                    {t('tool.curl.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {body.urlencodedItems.map((item, index) => {
                  const valueIsJson = isJsonLike(item.value) && tryParseJson(item.value) !== null;
                  return (
                    <tr
                      key={`${item.key}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                        {item.key}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                        {item.value ? (
                          <ClickableValue value={item.value} />
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">
                            ({t('tool.curl.empty')})
                          </span>
                        )}
                        {valueIsJson && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            (JSON)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyField(item.key, item.value)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title={t('common.copy')}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {valueIsJson && (
                            <OpenInJsonViewerButton value={item.value} compact />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (body.kind === 'multipart' && body.multipartItems) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          title={`${t('tool.curl.body')} (${body.kind})`}
          count={body.multipartItems.length}
        />
        <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t('tool.curl.key')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {t('tool.curl.value')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                    {t('tool.curl.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {body.multipartItems.map((item, index) => {
                  if (item.kind === 'field') {
                    const valueIsJson = item.value && isJsonLike(item.value) && tryParseJson(item.value) !== null;
                    return (
                      <tr
                        key={`${item.key}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                          {item.key}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                          {item.value ? (
                            <ClickableValue value={item.value} />
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              ({t('tool.curl.empty')})
                            </span>
                          )}
                          {valueIsJson && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                              (JSON)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyField(item.key, item.value || '')}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title={t('common.copy')}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {valueIsJson && item.value && (
                              <OpenInJsonViewerButton value={item.value} compact />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr
                        key={`${item.key}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-yellow-50 dark:bg-yellow-900/10"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                          {item.key}
                          <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                            ({t('tool.curl.file')})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-yellow-700 dark:text-yellow-300 break-all">
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            @{item.path} ({t('tool.curl.unsupportedFileNote')})
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {/* No copy for file items */}
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ================================
// Options View Component
// ================================
interface OptionsViewProps {
  options: {
    followRedirects?: boolean;
    insecureTLS?: boolean;
    compressed?: boolean;
    basicAuth?: { user: string; password: string };
  };
}

export const OptionsView: React.FC<OptionsViewProps> = ({ options }) => {
  const { t } = useI18n();

  const hasAnyOption =
    options.followRedirects ||
    options.insecureTLS ||
    options.compressed ||
    options.basicAuth;

  if (!hasAnyOption) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={t('tool.curl.options')} />
      <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 space-y-3">
          {options.followRedirects && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                -L:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {t('tool.curl.followRedirects')}
              </span>
            </div>
          )}
          {options.insecureTLS && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider min-w-[80px]">
                -k:
              </span>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('tool.curl.insecureTLSBrowser')}
              </span>
            </div>
          )}
          {options.compressed && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                --compressed:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Compressed
              </span>
            </div>
          )}
          {options.basicAuth && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                -u:
              </span>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {t('tool.curl.basicAuth')}: {options.basicAuth.user}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ================================
// Warnings View Component
// ================================
interface WarningsViewProps {
  warnings: Array<{ code: string; message: string }>;
}

export const WarningsView: React.FC<WarningsViewProps> = ({ warnings }) => {
  const { t } = useI18n();

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title={t('tool.curl.warnings')} count={warnings.length} />
      <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 space-y-3">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{warning.message}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {t('tool.curl.code')}: {warning.code}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
