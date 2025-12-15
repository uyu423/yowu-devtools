/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Search, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { ShareModal } from '@/components/common/ShareModal';

interface QueryStringToolState {
  input: string;
  showDecoded: boolean;
  showRaw: boolean;
}

const DEFAULT_STATE: QueryStringToolState = {
  input: '',
  showDecoded: true,
  showRaw: false,
};

interface ParsedParam {
  key: string;
  rawValue: string;
  decodedValue: string;
  isEncoded: boolean;
}

interface UrlInfo {
  protocol: string | null;
  host: string | null;
  path: string | null;
  fragment: string | null;
}

interface ParseResult {
  params: ParsedParam[];
  queryString: string;
  urlInfo: UrlInfo | null;
  error: string | null;
}

const QueryStringTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.urlParser.title'));
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<QueryStringToolState>('url-parser', DEFAULT_STATE);
  
  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.urlParser.title'),
  });

  const debouncedInput = useDebouncedValue(state.input, 300);

  const parseResult = useMemo<ParseResult>(() => {
    if (!debouncedInput.trim()) {
      return { params: [], queryString: '', urlInfo: null, error: null };
    }

    try {
      const input = debouncedInput.trim();
      let urlInfo: UrlInfo | null = null;
      let queryString = '';
      let fragment: string | null = null;

      // Extract fragment (#) part
      let inputWithoutFragment = input;
      if (input.includes('#')) {
        const hashIndex = input.indexOf('#');
        fragment = input.substring(hashIndex + 1);
        inputWithoutFragment = input.substring(0, hashIndex);
      }

      // Check if input looks like a full URL
      const isFullUrl =
        inputWithoutFragment.match(/^https?:\/\//i) ||
        (inputWithoutFragment.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/) &&
          !inputWithoutFragment.startsWith('?'));

      if (isFullUrl) {
        try {
          let urlToParse = inputWithoutFragment;
          if (!urlToParse.match(/^https?:\/\//i)) {
            urlToParse = `https://${urlToParse}`;
          }

          const url = new URL(urlToParse);
          urlInfo = {
            protocol: url.protocol.replace(':', ''),
            host: url.hostname,
            path: url.pathname,
            fragment,
          };
          queryString = url.search.substring(1);
        } catch {
          if (inputWithoutFragment.includes('?')) {
            const urlParts = inputWithoutFragment.split('?');
            queryString = urlParts.slice(1).join('?');
            const firstPart = urlParts[0];
            if (firstPart.match(/^https?:\/\//i)) {
              try {
                const url = new URL(firstPart);
                urlInfo = {
                  protocol: url.protocol.replace(':', ''),
                  host: url.hostname,
                  path: url.pathname,
                  fragment,
                };
              } catch { /* ignore */ }
            }
          }
        }
      } else {
        if (inputWithoutFragment.startsWith('?')) {
          queryString = inputWithoutFragment.substring(1);
        } else if (inputWithoutFragment.includes('?')) {
          const parts = inputWithoutFragment.split('?');
          queryString = parts.slice(1).join('?');
        } else {
          queryString = inputWithoutFragment;
        }
      }

      if (queryString.startsWith('&')) {
        queryString = queryString.substring(1);
      }

      if (!queryString && !urlInfo) {
        return {
          params: [],
          queryString: '',
          urlInfo: null,
          error: t('tool.urlParser.noQueryStringFound'),
        };
      }

      const params: ParsedParam[] = [];
      const pairs = queryString.split('&');

      for (const pair of pairs) {
        if (!pair) continue;

        const equalIndex = pair.indexOf('=');
        let key: string;
        let rawValue: string;

        if (equalIndex === -1) {
          key = pair;
          rawValue = '';
        } else {
          key = pair.substring(0, equalIndex);
          rawValue = pair.substring(equalIndex + 1);
        }

        let decodedKey: string;
        let decodedValue: string;
        try {
          decodedKey = decodeURIComponent(key);
          decodedValue = decodeURIComponent(rawValue);
        } catch {
          decodedKey = key;
          decodedValue = rawValue;
        }

        const isEncoded = rawValue !== decodedValue || rawValue.includes('%');

        params.push({
          key: decodedKey,
          rawValue,
          decodedValue,
          isEncoded,
        });
      }

      return {
        params,
        queryString,
        urlInfo,
        error: params.length === 0 && !urlInfo ? t('tool.urlParser.noParamsFound') : null,
      };
    } catch (error) {
      return {
        params: [],
        queryString: '',
        urlInfo: null,
        error: `${t('tool.urlParser.failedToParse')}: ${(error as Error).message}`,
      };
    }
  }, [debouncedInput, t]);

  const handleCopyParam = (param: ParsedParam) => {
    const value = state.showDecoded ? param.decodedValue : param.rawValue;
    const text = `${param.key}=${value}`;
    copyToClipboard(text, t('tool.urlParser.copiedParam').replace('{key}', param.key));
  };

  const handleCopyAll = () => {
    if (!parseResult.queryString) return;
    copyToClipboard(parseResult.queryString, t('tool.urlParser.copiedQueryString'));
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.urlParser.title')}
        description={t('tool.urlParser.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title={t('tool.urlParser.urlOrQueryString')}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={t('tool.urlParser.inputPlaceholder')}
          status={parseResult.error ? 'error' : 'default'}
          resizable
          minHeight={120}
          maxHeight={500}
          heightStorageKey="url-parser-input-height"
        />

        <ActionBar className="flex-col items-start gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center">
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.showDecoded}
              onChange={(e) => updateState({ showDecoded: e.target.checked })}
            />
            <OptionLabel tooltip={t('tool.urlParser.showDecodedTooltip')}>
              {t('tool.urlParser.showDecodedValues')}
            </OptionLabel>
          </label>

          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.showRaw}
              onChange={(e) => updateState({ showRaw: e.target.checked })}
            />
            <OptionLabel tooltip={t('tool.urlParser.showRawTooltip')}>
              {t('tool.urlParser.showRawValues')}
            </OptionLabel>
          </label>
        </ActionBar>

        {parseResult.error && (
          <ErrorBanner message={t('tool.urlParser.parsingFailed')} details={parseResult.error} />
        )}

        {!parseResult.error && parseResult.urlInfo && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-t-md border">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {t('tool.urlParser.urlInformation')}
              </span>
            </div>
            <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
              <div className="p-4 space-y-3">
                {parseResult.urlInfo.protocol && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      {t('tool.urlParser.protocol')}:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.protocol}
                    </span>
                    <button
                      onClick={() => copyToClipboard(parseResult.urlInfo!.protocol!, t('tool.urlParser.copiedProtocol'))}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title={t('common.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {parseResult.urlInfo.host && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      {t('tool.urlParser.host')}:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.host}
                    </span>
                    <button
                      onClick={() => copyToClipboard(parseResult.urlInfo!.host!, t('tool.urlParser.copiedHost'))}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title={t('common.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {parseResult.urlInfo.path && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      {t('tool.urlParser.path')}:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.path || <span className="text-gray-400 dark:text-gray-500 italic">/</span>}
                    </span>
                    <button
                      onClick={() => copyToClipboard(parseResult.urlInfo!.path || '/', t('tool.urlParser.copiedPath'))}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title={t('common.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {parseResult.urlInfo.fragment && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      {t('tool.urlParser.fragment')}:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.fragment}
                    </span>
                    <button
                      onClick={() => copyToClipboard(parseResult.urlInfo!.fragment!, t('tool.urlParser.copiedFragment'))}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title={t('common.copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!parseResult.error && parseResult.params.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-t-md border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('tool.urlParser.parameters')} ({parseResult.params.length})
                </span>
              </div>
              <button
                onClick={handleCopyAll}
                disabled={!parseResult.queryString}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('tool.urlParser.copyQueryString')}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {t('tool.urlParser.key')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {t('tool.urlParser.value')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                        {t('tool.urlParser.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {parseResult.params.map((param, index) => (
                      <tr key={`${param.key}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                          {param.key || <span className="text-gray-400 dark:text-gray-500 italic">({t('tool.urlParser.empty')})</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            {state.showDecoded && (
                              <div className="font-mono text-gray-900 dark:text-gray-100 break-all">
                                {param.decodedValue || <span className="text-gray-400 dark:text-gray-500 italic">({t('tool.urlParser.empty')})</span>}
                              </div>
                            )}
                            {state.showRaw && (
                              <div className="font-mono text-gray-600 dark:text-gray-400 text-xs break-all">
                                Raw: {param.rawValue || <span className="text-gray-400 dark:text-gray-500 italic">({t('tool.urlParser.empty')})</span>}
                              </div>
                            )}
                            {param.isEncoded && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                {t('tool.urlParser.encoded')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCopyParam(param)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title={t('common.copy')}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!parseResult.error && parseResult.params.length === 0 && !parseResult.urlInfo && debouncedInput.trim() && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('tool.urlParser.noQueryParamsFound')}</p>
            <p className="text-sm mt-2">{t('tool.urlParser.enterUrlWithParams')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const queryStringTool: ToolDefinition<QueryStringToolState> = {
  id: 'url-parser',
  title: 'URL Parser',
  description: 'Parse and visualize URL components',
  keywords: ['url parser', 'query string parser', 'url analyzer', 'query params', 'url parameters', 'url decoder', 'url components'],
  category: 'parser',
  path: '/url-parser',
  icon: Search,
  defaultState: DEFAULT_STATE,
  Component: QueryStringTool,
};
