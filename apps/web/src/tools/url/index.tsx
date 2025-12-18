/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Link, RefreshCw } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ModeToggle } from '@/components/common/ModeToggle';
import { ResultPanel } from '@/components/common/ResultPanel';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToolSetup } from '@/hooks/useToolSetup';
import { ShareModal } from '@/components/common/ShareModal';
import { AdsenseFooter } from '@/components/common/AdsenseFooter';

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
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<UrlToolState>('url', 'url', DEFAULT_STATE);

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
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.url.title')}
        description={t('tool.url.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title={t('common.input')}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={t('tool.url.inputPlaceholder')}
          status={conversion.error ? 'error' : 'default'}
          resizable
          minHeight={120}
          maxHeight={500}
          heightStorageKey="url-input-height"
        />

        <ActionBar className="flex-col items-start gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center">
          <ModeToggle
            options={[
              { value: 'encode' as const, label: t('common.encode') },
              { value: 'decode' as const, label: t('common.decode') },
            ]}
            value={state.mode}
            onChange={(mode) => updateState({ mode })}
          />

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

        <ResultPanel
          title={t('common.result')}
          value={conversion.result}
          copyMessage={t('common.copiedResult')}
          copyTooltip={t('common.copy')}
          placeholder={t('tool.url.resultPlaceholder')}
          status={conversion.error ? 'error' : 'success'}
          className="h-40 lg:h-48"
        />

        <AdsenseFooter />
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
