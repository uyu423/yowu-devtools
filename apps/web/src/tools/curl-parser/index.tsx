/* eslint-disable react-refresh/only-export-components */
/**
 * cURL Parser Tool
 *
 * Parse and visualize cURL commands.
 * Redesigned to match URL Parser style.
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolDefinition } from '@/tools/types';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ShareModal } from '@/components/common/ShareModal';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { useShareModal } from '@/hooks/useShareModal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
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
  OptionsView,
  WarningsView,
} from './components';

const CurlParserTool: React.FC = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  useTitle(t('tool.curl.title'));

  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<CurlParserState>('curl-parser', DEFAULT_STATE, {
      shareStateFilter: ({ input, displayOptions }) => ({
        input,
        displayOptions,
      }),
    });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.curl.title'),
  });

  // Debounce input for auto-parsing
  const debouncedInput = useDebouncedValue(state.input, 300);

  // Auto-parse cURL command with useMemo
  const parseResult = useMemo<{ result: CurlParseResult | null; error: string | null }>(() => {
    if (!debouncedInput.trim()) {
      return { result: null, error: null };
    }

    try {
      const result = parseCurl(debouncedInput);
      return { result, error: null };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : t('tool.curl.parseFailed'),
      };
    }
  }, [debouncedInput, t]);

  const handleReset = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleOpenInApiTester = useCallback(() => {
    if (!parseResult.result) return;

    // Store parse result for API Tester
    storeForApiTester(parseResult.result);

    // Navigate to API Tester with locale prefix preserved
    const apiTesterPath = buildLocalePath(locale, '/api-tester');
    navigate(apiTesterPath);
  }, [parseResult.result, locale, navigate]);

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.curl.title')}
        description={t('tool.curl.description')}
        onReset={handleReset}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex-1 flex flex-col gap-6">
        {/* Input area */}
        <EditorPanel
          title={t('tool.curl.pasteHint')}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={t('tool.curl.placeholder')}
          status={parseResult.error ? 'error' : 'default'}
          resizable
          minHeight={120}
          maxHeight={500}
          heightStorageKey="curl-parser-input-height"
        />

        {/* Display Options */}
        <ActionBar className="flex-col items-start gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center">
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.displayOptions.urlDecodeInDisplay}
              onChange={(e) =>
                updateState({
                  displayOptions: {
                    ...state.displayOptions,
                    urlDecodeInDisplay: e.target.checked,
                  },
                })
              }
            />
            <OptionLabel tooltip={t('tool.curl.urlDecodeTooltip')}>
              {t('tool.curl.urlDecodeInDisplay')}
            </OptionLabel>
          </label>

          {/* Open in API Tester button */}
          {parseResult.result && (
            <button
              onClick={handleOpenInApiTester}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md',
                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                'border border-blue-200 dark:border-blue-800',
                'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                'hover:border-blue-300 dark:hover:border-blue-700',
                'transition-all duration-200',
                'shadow-sm hover:shadow',
                'sm:ml-auto'
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('tool.curl.openInApiTester')}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          )}
        </ActionBar>

        {/* Error display */}
        {parseResult.error && (
          <ErrorBanner message={t('tool.curl.parseFailed')} details={parseResult.error} />
        )}

        {/* Parse result - Static sections (no collapsible) */}
        {parseResult.result && (
          <div className="space-y-6">
            {/* Request Summary */}
            <RequestSummary
              result={parseResult.result}
              urlDecoded={state.displayOptions.urlDecodeInDisplay}
            />

            {/* Query Parameters */}
            {parseResult.result.request.query.length > 0 && (
              <QueryParamsView
                params={parseResult.result.request.query}
                urlDecoded={state.displayOptions.urlDecodeInDisplay}
              />
            )}

            {/* Headers */}
            {parseResult.result.request.headers.length > 0 && (
              <HeadersView headers={parseResult.result.request.headers} />
            )}

            {/* Cookies */}
            {parseResult.result.request.cookies && (
              <CookiesView cookies={parseResult.result.request.cookies} />
            )}

            {/* Body */}
            {parseResult.result.request.body &&
              parseResult.result.request.body.kind !== 'none' && (
                <BodyView body={parseResult.result.request.body} />
              )}

            {/* Options */}
            <OptionsView options={parseResult.result.request.options} />

            {/* Warnings */}
            {parseResult.result.warnings.length > 0 && (
              <WarningsView warnings={parseResult.result.warnings} />
            )}
          </div>
        )}

        {/* Empty state */}
        {!parseResult.error && !parseResult.result && debouncedInput.trim() === '' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('tool.curl.emptyState')}</p>
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
