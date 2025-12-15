/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Link, RefreshCw, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { isMobileDevice } from '@/lib/utils';
import { ShareModal } from '@/components/common/ShareModal';

interface UrlToolState {
  input: string;
  mode: 'encode' | 'decode';
  plusForSpace: boolean;
}

const DEFAULT_STATE: UrlToolState = {
  input: '',
  mode: 'encode',
  plusForSpace: false,
};

const UrlTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.url.title'));
  // URL tool state contains: input (string), mode, plusForSpace
  // All fields are necessary for sharing - input may be large but required
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<UrlToolState>('url', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();
  const debouncedInput = useDebouncedValue(state.input, 200);

  const conversion = useMemo(() => {
    if (!debouncedInput) {
      return { result: '', error: null as string | null };
    }
    try {
      if (state.mode === 'encode') {
        const encoded = encodeURIComponent(debouncedInput);
        return {
          result: state.plusForSpace ? encoded.replace(/%20/g, '+') : encoded,
          error: null,
        };
      }
      const normalized = state.plusForSpace
        ? debouncedInput.replace(/\+/g, '%20')
        : debouncedInput;
      return {
        result: decodeURIComponent(normalized),
        error: null,
      };
    } catch (error) {
      return { result: '', error: (error as Error).message };
    }
  }, [debouncedInput, state.mode, state.plusForSpace]);

  const handleSwap = () => {
    if (!conversion.result) return;
    updateState({
      input: conversion.result,
      mode: state.mode === 'encode' ? 'decode' : 'encode',
    });
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.url.title')}
        description={t('tool.url.description')}
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
        toolName={t('tool.url.title')}
      />
      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title={t('common.input')}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={t('tool.url.inputPlaceholder')}
          className="h-40 lg:h-48"
          status={conversion.error ? 'error' : 'default'}
        />

        <ActionBar className="flex-col items-start gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {['encode', 'decode'].map((mode) => (
              <button
                key={mode}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  state.mode === mode
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                onClick={() =>
                  updateState({ mode: mode as UrlToolState['mode'] })
                }
              >
                {mode === 'encode' ? t('common.encode') : t('common.decode')}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.plusForSpace}
              onChange={(e) => updateState({ plusForSpace: e.target.checked })}
            />
            <OptionLabel tooltip={t('tool.url.useSpacePlusTooltip')}>
              {t('tool.url.useSpacePlus')}
            </OptionLabel>
          </label>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={handleSwap}
            disabled={!conversion.result}
          >
            <RefreshCw className="h-4 w-4" />
            {t('tool.url.inputOutputSwap')}
          </button>
        </ActionBar>

        {conversion.error && (
          <ErrorBanner message={t('tool.url.decodingFailed')} details={conversion.error} />
        )}

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-t-md border border-b-0">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('common.result')}
            </span>
            <button
              onClick={() =>
                conversion.result &&
                copyToClipboard(conversion.result, t('common.copiedResult'))
              }
              disabled={!conversion.result}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('common.copy')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <EditorPanel
            title=""
            value={conversion.result}
            readOnly
            placeholder={t('tool.url.resultPlaceholder')}
            className="h-40 lg:h-48 rounded-t-none"
            status={conversion.error ? 'error' : 'success'}
          />
        </div>
      </div>
    </div>
  );
};

export const urlTool: ToolDefinition<UrlToolState> = {
  id: 'url',
  title: 'URL Encoder',
  description: 'Encode/Decode URL strings',
  keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'query', 'parameter'],
  category: 'converter',
  path: '/url',
  icon: Link,
  defaultState: DEFAULT_STATE,
  Component: UrlTool,
};
