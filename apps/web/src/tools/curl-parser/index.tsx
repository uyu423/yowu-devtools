/* eslint-disable react-refresh/only-export-components */
/**
 * cURL Parser Tool
 *
 * Parse and visualize cURL commands.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Terminal } from 'lucide-react';
import type { ToolDefinition } from '@/tools/types';
import { ToolHeader } from '@/components/common/ToolHeader';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { parseCurl } from '@/lib/curl/parseCurl';
import type { CurlParseResult } from '@/lib/curl/types';
import type { CurlParserState } from './types';
import { DEFAULT_STATE } from './types';

const CurlParserTool: React.FC = () => {
  const { t } = useI18n();
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

        {/* Error display */}
        {parseError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{parseError}</p>
          </div>
        )}

        {/* Parse result */}
        {parseResult && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('tool.curl.parseSuccess')}
            </p>
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

