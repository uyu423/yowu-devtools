/**
 * cURL Parser - UI Components
 */

import React from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/hooks/useI18nHooks';
import type { CurlParseResult } from '@/lib/curl/types';
import { decodeUrl, decodeCookie } from '@/lib/curl/parseCurl';

interface RequestSummaryProps {
  result: CurlParseResult;
  onOpenInApiTester: () => void;
  urlDecoded?: boolean;
}

export const RequestSummary: React.FC<RequestSummaryProps> = ({
  result,
  onOpenInApiTester,
  urlDecoded = false,
}) => {
  const { t } = useI18n();
  const { request } = result;
  const displayUrl = urlDecoded && request.urlDecoded ? request.urlDecoded : request.url;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('tool.curl.method')}:</span>
          <span className="ml-2 font-mono font-semibold text-blue-600 dark:text-blue-400">
            {request.method}
          </span>
        </div>
      </div>
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t('tool.curl.url')}:</span>
        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <code className="text-sm text-gray-900 dark:text-gray-100 break-all">
            {displayUrl}
          </code>
        </div>
      </div>
      <button
        onClick={onOpenInApiTester}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        {t('tool.curl.openInApiTester')}
      </button>
    </div>
  );
};

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
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tool.curl.noQueryParams')}</p>
    );
  }

  return (
    <div className="space-y-2">
      {params.map((param, index) => (
        <div key={index} className="flex items-center gap-2">
          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
            {urlDecoded ? decodeUrl(param.key) : param.key}
          </code>
          <span className="text-gray-500 dark:text-gray-400">=</span>
          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
            {urlDecoded ? decodeUrl(param.value) : param.value}
          </code>
          {!param.enabled && (
            <span className="text-xs text-gray-400 dark:text-gray-500">({t('tool.curl.disabled')})</span>
          )}
        </div>
      ))}
    </div>
  );
};

interface HeadersViewProps {
  headers: Array<{ key: string; value: string; enabled: boolean; sensitive?: boolean }>;
  hideSensitive?: boolean;
}

export const HeadersView: React.FC<HeadersViewProps> = ({
  headers,
  hideSensitive = false,
}) => {
  const { t } = useI18n();
  
  if (headers.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tool.curl.noHeaders')}</p>
    );
  }

  const maskValue = (value: string): string => {
    if (value.length <= 6) return '***';
    return value.slice(0, 6) + '…';
  };

  return (
    <div className="space-y-2">
      {headers.map((header, index) => {
        const displayValue =
          hideSensitive && header.sensitive ? maskValue(header.value) : header.value;

        return (
          <div key={index} className="flex items-start gap-2">
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100 min-w-[120px]">
              {header.key}:
            </code>
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
              {displayValue}
            </code>
            {header.sensitive && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">({t('tool.curl.sensitive')})</span>
            )}
            {!header.enabled && (
              <span className="text-xs text-gray-400 dark:text-gray-500">({t('tool.curl.disabled')})</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface CookiesViewProps {
  cookies: { raw: string; items: Array<{ key: string; value: string; sensitive?: boolean }> };
  cookieDecode?: boolean;
  hideSensitive?: boolean;
}

export const CookiesView: React.FC<CookiesViewProps> = ({
  cookies,
  cookieDecode = false,
  hideSensitive = false,
}) => {
  const { t } = useI18n();
  const maskValue = (value: string): string => {
    if (value.length <= 6) return '***';
    return value.slice(0, 6) + '…';
  };

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t('tool.curl.raw')}:</span>
        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <code className="text-sm text-gray-900 dark:text-gray-100 break-all">
            {cookies.raw}
          </code>
        </div>
      </div>
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t('tool.curl.parsed')}:</span>
        <div className="mt-1 space-y-1">
          {cookies.items.map((item, index) => {
            const displayValue =
              hideSensitive && item.sensitive ? maskValue(item.value) : item.value;
            const decodedValue = cookieDecode ? decodeCookie(displayValue) : displayValue;

            return (
              <div key={index} className="flex items-center gap-2">
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {item.key}
                </code>
                <span className="text-gray-500 dark:text-gray-400">=</span>
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {decodedValue}
                </code>
                {item.sensitive && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">({t('tool.curl.sensitive')})</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface BodyViewProps {
  body: { kind: string; text?: string; urlencodedItems?: Array<{ key: string; value: string }>; multipartItems?: Array<{ kind: string; key: string; value?: string; path?: string; note?: string }> };
}

export const BodyView: React.FC<BodyViewProps> = ({ body }) => {
  const { t } = useI18n();
  
  if (body.kind === 'none') {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t('tool.curl.noBody')}</p>;
  }

  if (body.kind === 'json' || body.kind === 'text') {
    return (
      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all">
          {body.text}
        </pre>
      </div>
    );
  }

  if (body.kind === 'urlencoded' && body.urlencodedItems) {
    return (
      <div className="space-y-2">
        {body.urlencodedItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {item.key}
            </code>
            <span className="text-gray-500 dark:text-gray-400">=</span>
            <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
              {item.value}
            </code>
          </div>
        ))}
      </div>
    );
  }

  if (body.kind === 'multipart' && body.multipartItems) {
    return (
      <div className="space-y-2">
        {body.multipartItems.map((item, index) => {
          if (item.kind === 'field') {
            return (
              <div key={index} className="flex items-center gap-2">
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {item.key}
                </code>
                <span className="text-gray-500 dark:text-gray-400">=</span>
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {item.value}
                </code>
              </div>
            );
          } else {
            return (
              <div key={index} className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  {t('tool.curl.file')}: {item.key} = @{item.path} ({t('tool.curl.unsupportedFileNote')})
                </span>
              </div>
            );
          }
        })}
      </div>
    );
  }

  return null;
};

interface WarningsViewProps {
  warnings: Array<{ code: string; message: string }>;
}

export const WarningsView: React.FC<WarningsViewProps> = ({ warnings }) => {
  const { t } = useI18n();
  
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{warning.message}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{t('tool.curl.code')}: {warning.code}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

