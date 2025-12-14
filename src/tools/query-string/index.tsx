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
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';
import { isMobileDevice } from '@/lib/utils';
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
  useTitle('URL Parser');
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<QueryStringToolState>('url-parser', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();
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

      // Check if input looks like a full URL (starts with http:// or https://, or contains domain pattern)
      const isFullUrl =
        inputWithoutFragment.match(/^https?:\/\//i) ||
        (inputWithoutFragment.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/) &&
          !inputWithoutFragment.startsWith('?'));

      if (isFullUrl) {
        // Try to parse as URL
        try {
          // Add protocol if missing
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

          // Extract query string from URL
          queryString = url.search.substring(1); // Remove leading '?'
        } catch {
          // URL parsing failed, try to extract query string manually
          if (inputWithoutFragment.includes('?')) {
            const urlParts = inputWithoutFragment.split('?');
            queryString = urlParts.slice(1).join('?');
            // Try to extract domain and path from first part
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
              } catch {
                // Ignore
              }
            }
          }
        }
      } else {
        // Not a full URL, treat as query string only
        if (inputWithoutFragment.startsWith('?')) {
          queryString = inputWithoutFragment.substring(1);
        } else if (inputWithoutFragment.includes('?')) {
          const parts = inputWithoutFragment.split('?');
          queryString = parts.slice(1).join('?');
        } else {
          queryString = inputWithoutFragment;
        }
      }

      // If it starts with '&', remove it
      if (queryString.startsWith('&')) {
        queryString = queryString.substring(1);
      }

      // If no query string and no URL info, show error
      if (!queryString && !urlInfo) {
        return {
          params: [],
          queryString: '',
          urlInfo: null,
          error: 'No query string found. Please enter a URL with query parameters or a query string.',
        };
      }

      // Parse query string
      const params: ParsedParam[] = [];
      const pairs = queryString.split('&');

      for (const pair of pairs) {
        if (!pair) continue; // Skip empty pairs

        const equalIndex = pair.indexOf('=');
        let key: string;
        let rawValue: string;

        if (equalIndex === -1) {
          // No '=' found, treat as key with empty value
          key = pair;
          rawValue = '';
        } else {
          key = pair.substring(0, equalIndex);
          rawValue = pair.substring(equalIndex + 1);
        }

        // Decode the key and value
        let decodedKey: string;
        let decodedValue: string;
        try {
          decodedKey = decodeURIComponent(key);
          decodedValue = decodeURIComponent(rawValue);
        } catch {
          // If decoding fails, use raw values
          decodedKey = key;
          decodedValue = rawValue;
        }

        // Check if value was encoded
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
        error: params.length === 0 && !urlInfo ? 'No parameters found in query string.' : null,
      };
    } catch (error) {
      return {
        params: [],
        queryString: '',
        urlInfo: null,
        error: `Failed to parse query string: ${(error as Error).message}`,
      };
    }
  }, [debouncedInput]);

  const handleCopyParam = (param: ParsedParam) => {
    const value = state.showDecoded ? param.decodedValue : param.rawValue;
    const text = `${param.key}=${value}`;
    copyToClipboard(text, `Copied "${param.key}" parameter.`);
  };

  const handleCopyAll = () => {
    if (!parseResult.queryString) return;
    copyToClipboard(parseResult.queryString, 'Copied query string.');
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title="URL Parser"
        description="Parse and visualize URL components including protocol, host, path, fragment, and query parameters."
        onReset={resetState}
        onShare={async () => {
          if (isMobile) {
            setIsShareModalOpen(true);
          } else {
            await copyShareLink();
          }
        }}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onConfirm={async () => {
          setIsShareModalOpen(false);
          await shareViaWebShare();
        }}
        includedFields={shareInfo.includedFields}
        excludedFields={shareInfo.excludedFields}
        toolName="URL Parser"
      />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title="URL or Query String"
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder="Enter a URL or query string (e.g., https://example.com/search?q=laptop&category=electronics#results or ?arr[]=value1&key=value)..."
          className="h-40 lg:h-48"
          status={parseResult.error ? 'error' : 'default'}
        />

        <ActionBar className="flex-col items-start gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center">
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.showDecoded}
              onChange={(e) => updateState({ showDecoded: e.target.checked })}
            />
            <OptionLabel tooltip="Show decoded (human-readable) values. When enabled, URL-encoded characters like %20 will be displayed as spaces.">
              Show decoded values
            </OptionLabel>
          </label>

          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.showRaw}
              onChange={(e) => updateState({ showRaw: e.target.checked })}
            />
            <OptionLabel tooltip="Show raw (encoded) values. When enabled, the original URL-encoded values will be displayed alongside decoded values for comparison.">
              Show raw values
            </OptionLabel>
          </label>
        </ActionBar>

        {parseResult.error && (
          <ErrorBanner message="Parsing failed" details={parseResult.error} />
        )}

        {!parseResult.error && parseResult.urlInfo && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-t-md border">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                URL Information
              </span>
            </div>
            <div className="border dark:border-gray-700 rounded-b-md bg-white dark:bg-gray-800 overflow-hidden">
              <div className="p-4 space-y-3">
                {parseResult.urlInfo.protocol && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      Protocol:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.protocol}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(parseResult.urlInfo!.protocol!, 'Copied protocol.')
                      }
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title="Copy Protocol"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {parseResult.urlInfo.host && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      Host:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.host}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(parseResult.urlInfo!.host!, 'Copied host.')
                      }
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title="Copy Host"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {parseResult.urlInfo.path && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      Path:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.path || <span className="text-gray-400 dark:text-gray-500 italic">/</span>}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(parseResult.urlInfo!.path || '/', 'Copied path.')
                      }
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title="Copy Path"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {parseResult.urlInfo.fragment && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px]">
                      Fragment:
                    </span>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {parseResult.urlInfo.fragment}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(parseResult.urlInfo!.fragment!, 'Copied fragment.')
                      }
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors ml-auto"
                      title="Copy Fragment"
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
                  Parameters ({parseResult.params.length})
                </span>
              </div>
              <button
                onClick={handleCopyAll}
                disabled={!parseResult.queryString}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy Query String"
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
                        Key
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {parseResult.params.map((param, index) => (
                      <tr
                        key={`${param.key}-${index}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                          {param.key || <span className="text-gray-400 dark:text-gray-500 italic">(empty)</span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            {state.showDecoded && (
                              <div className="font-mono text-gray-900 dark:text-gray-100 break-all">
                                {param.decodedValue || (
                                  <span className="text-gray-400 dark:text-gray-500 italic">(empty)</span>
                                )}
                              </div>
                            )}
                            {state.showRaw && (
                              <div className="font-mono text-gray-600 dark:text-gray-400 text-xs break-all">
                                Raw: {param.rawValue || (
                                  <span className="text-gray-400 dark:text-gray-500 italic">(empty)</span>
                                )}
                              </div>
                            )}
                            {param.isEncoded && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Encoded
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCopyParam(param)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title={`Copy ${param.key}`}
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
            <p>No query parameters found.</p>
            <p className="text-sm mt-2">Enter a URL with query parameters or a query string.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const queryStringTool: ToolDefinition<QueryStringToolState> = {
  id: 'url-parser',
  title: 'URL Parser',
  description: 'Parse and visualize URL components including protocol, host, path, fragment, and query parameters',
  keywords: ['url parser', 'query string parser', 'url analyzer', 'query params', 'url parameters', 'url decoder', 'url components'],
  category: 'parser',
  path: '/url-parser',
  icon: Search,
  defaultState: DEFAULT_STATE,
  Component: QueryStringTool,
};

