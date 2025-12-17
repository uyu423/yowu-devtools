/* eslint-disable react-refresh/only-export-components */
/**
 * cURL Parser Tool
 *
 * Parse and visualize cURL commands.
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import type { ToolDefinition } from '@/tools/types';
import { ToolHeader } from '@/components/common/ToolHeader';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { parseCurl } from '@/lib/curl/parseCurl';
import { storeForApiTester } from '@/lib/curl/convertToApiTester';
import { buildLocalePath } from '@/lib/i18nUtils';
import type { CurlParseResult } from '@/lib/curl/types';
import type { CurlParserState } from './types';
import { DEFAULT_STATE } from './types';
import {
  RequestSummary,
  QueryParamsView,
  HeadersView,
  CookiesView,
  BodyView,
  WarningsView,
} from './components';

const CurlParserTool: React.FC = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  useTitle(t('tool.curl.title'));

  const { state, updateState, resetState } = useToolState<CurlParserState>(
    'curl-parser',
    DEFAULT_STATE,
    {
      shareStateFilter: ({ input, displayOptions }) => ({
        input,
        displayOptions,
        // Exclude sensitive data from share by default
      }),
    }
  );

  const [parseResult, setParseResult] = useState<CurlParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // UI state for collapsible sections
  const [requestSummaryOpen, setRequestSummaryOpen] = useState(true);
  const [queryParamsOpen, setQueryParamsOpen] = useState(true);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const [bodyOpen, setBodyOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(true);

  // Parse cURL command
  const handleParse = useCallback(() => {
    if (!state.input.trim()) {
      setParseResult(null);
      setParseError(null);
      return;
    }

    try {
      const result = parseCurl(state.input);
      setParseResult(result);
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse cURL command');
      setParseResult(null);
    }
  }, [state.input]);

  // Auto-parse on input change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleParse();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleParse]);

  const handleReset = useCallback(() => {
    resetState();
    setParseResult(null);
    setParseError(null);
  }, [resetState]);

  const handleOpenInApiTester = useCallback(() => {
    if (!parseResult) return;
    
    // Store parse result for API Tester
    storeForApiTester(parseResult);
    
    // Navigate to API Tester with locale prefix preserved
    const apiTesterPath = buildLocalePath(locale, '/api');
    navigate(apiTesterPath);
  }, [parseResult, locale, navigate]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.curl.title')}
        description={t('tool.curl.description')}
        onReset={handleReset}
      />

      <div className="flex flex-col gap-4 mt-4">
        {/* Input area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.curl.pasteHint')}
          </label>
          <textarea
            value={state.input}
            onChange={(e) => updateState({ input: e.target.value })}
            placeholder={t('tool.curl.placeholder')}
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleParse}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('tool.curl.parse')}
            </button>
            <button
              onClick={() => updateState({ input: '' })}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              {t('common.clear')}
            </button>
          </div>
        </div>

        {/* Display Options */}
        {parseResult && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.displayOptions.urlDecodeInDisplay}
                onChange={(e) =>
                  updateState({
                    displayOptions: {
                      ...state.displayOptions,
                      urlDecodeInDisplay: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                URL Decode in display
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.displayOptions.cookieDecode}
                onChange={(e) =>
                  updateState({
                    displayOptions: {
                      ...state.displayOptions,
                      cookieDecode: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Cookie decode
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.displayOptions.hideSensitiveValues}
                onChange={(e) =>
                  updateState({
                    displayOptions: {
                      ...state.displayOptions,
                      hideSensitiveValues: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Hide sensitive values
              </span>
            </label>
          </div>
        )}

        {/* Error display */}
        {parseError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{parseError}</p>
          </div>
        )}

        {/* Parse result */}
        {parseResult && (
          <div className="mt-4 space-y-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Request Summary */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setRequestSummaryOpen(!requestSummaryOpen)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {requestSummaryOpen ? (
                  <span className="text-gray-500">▼</span>
                ) : (
                  <span className="text-gray-500">▶</span>
                )}
                <span>Request Summary</span>
              </button>
              {requestSummaryOpen && (
                <div className="px-4 pb-4">
                  <RequestSummary
                    result={parseResult}
                    onOpenInApiTester={handleOpenInApiTester}
                    urlDecoded={state.displayOptions.urlDecodeInDisplay}
                  />
                </div>
              )}
            </div>

            {/* Query Params */}
            {parseResult.request.query.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setQueryParamsOpen(!queryParamsOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {queryParamsOpen ? (
                    <span className="text-gray-500">▼</span>
                  ) : (
                    <span className="text-gray-500">▶</span>
                  )}
                  <span>Query Parameters ({parseResult.request.query.length})</span>
                </button>
                {queryParamsOpen && (
                  <div className="px-4 pb-4">
                    <QueryParamsView
                      params={parseResult.request.query}
                      urlDecoded={state.displayOptions.urlDecodeInDisplay}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Headers */}
            {parseResult.request.headers.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setHeadersOpen(!headersOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {headersOpen ? (
                    <span className="text-gray-500">▼</span>
                  ) : (
                    <span className="text-gray-500">▶</span>
                  )}
                  <span>Headers ({parseResult.request.headers.length})</span>
                </button>
                {headersOpen && (
                  <div className="px-4 pb-4">
                    <HeadersView
                      headers={parseResult.request.headers}
                      hideSensitive={state.displayOptions.hideSensitiveValues}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Cookies */}
            {parseResult.request.cookies && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setCookiesOpen(!cookiesOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {cookiesOpen ? (
                    <span className="text-gray-500">▼</span>
                  ) : (
                    <span className="text-gray-500">▶</span>
                  )}
                  <span>Cookies ({parseResult.request.cookies.items.length})</span>
                </button>
                {cookiesOpen && (
                  <div className="px-4 pb-4">
                    <CookiesView
                      cookies={parseResult.request.cookies}
                      cookieDecode={state.displayOptions.cookieDecode}
                      hideSensitive={state.displayOptions.hideSensitiveValues}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Body */}
            {parseResult.request.body && parseResult.request.body.kind !== 'none' && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setBodyOpen(!bodyOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {bodyOpen ? (
                    <span className="text-gray-500">▼</span>
                  ) : (
                    <span className="text-gray-500">▶</span>
                  )}
                  <span>Body ({parseResult.request.body.kind})</span>
                </button>
                {bodyOpen && (
                  <div className="px-4 pb-4">
                    <BodyView body={parseResult.request.body} />
                  </div>
                )}
              </div>
            )}

            {/* Options */}
            {(parseResult.request.options.followRedirects !== undefined ||
              parseResult.request.options.insecureTLS !== undefined ||
              parseResult.request.options.compressed !== undefined ||
              parseResult.request.options.basicAuth !== undefined) && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setOptionsOpen(!optionsOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {optionsOpen ? (
                    <span className="text-gray-500">▼</span>
                  ) : (
                    <span className="text-gray-500">▶</span>
                  )}
                  <span>cURL Options</span>
                </button>
                {optionsOpen && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2 text-sm">
                      {parseResult.request.options.followRedirects && (
                        <div className="text-gray-700 dark:text-gray-300">-L (Follow redirects)</div>
                      )}
                      {parseResult.request.options.insecureTLS && (
                        <div className="text-yellow-600 dark:text-yellow-400">
                          -k (Insecure TLS - not supported in browser)
                        </div>
                      )}
                      {parseResult.request.options.compressed && (
                        <div className="text-gray-700 dark:text-gray-300">--compressed</div>
                      )}
                      {parseResult.request.options.basicAuth && (
                        <div className="text-gray-700 dark:text-gray-300">
                          -u (Basic Auth: {parseResult.request.options.basicAuth.user})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <div>
                <button
                  onClick={() => setWarningsOpen(!warningsOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {warningsOpen ? (
                    <span className="text-gray-500">▼</span>
                  ) : (
                    <span className="text-gray-500">▶</span>
                  )}
                  <span>Warnings ({parseResult.warnings.length})</span>
                </button>
                {warningsOpen && (
                  <div className="px-4 pb-4">
                    <WarningsView warnings={parseResult.warnings} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const curlParserTool: ToolDefinition<CurlParserState> = {
  id: 'curl-parser',
  title: 'cURL Parser',
  description: 'Parse and visualize cURL commands',
  icon: Terminal,
  path: '/curl',
  i18nKey: 'curl',
  defaultState: DEFAULT_STATE,
  Component: CurlParserTool,
};

