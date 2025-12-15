/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Binary, RefreshCw } from 'lucide-react';
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

interface Base64State {
  input: string;
  mode: 'encode' | 'decode';
  urlSafe: boolean;
}

const DEFAULT_STATE: Base64State = {
  input: '',
  mode: 'encode',
  urlSafe: false,
};

const Base64Tool: React.FC = () => {
  const {
    state,
    updateState,
    resetState,
    t,
    handleShare,
    shareModalProps,
  } = useToolSetup<Base64State>('base64', 'base64', DEFAULT_STATE);

  const debouncedInput = useDebouncedValue(state.input, 300);

  const conversion = React.useMemo(() => {
    if (!debouncedInput) {
      return { result: '', error: null as string | null };
    }
    try {
      if (state.mode === 'encode') {
        let encoded = encodeBase64(debouncedInput);
        if (state.urlSafe) encoded = toUrlSafe(encoded);
        return { result: encoded, error: null };
      }
      const source = state.urlSafe ? fromUrlSafe(debouncedInput) : debouncedInput;
      return { result: decodeBase64(source), error: null };
    } catch (error) {
      return { result: '', error: (error as Error).message };
    }
  }, [debouncedInput, state.mode, state.urlSafe]);

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
        title={t('tool.base64.title')}
        description={t('tool.base64.description')}
        onReset={resetState}
        onShare={handleShare}
      />
      <ShareModal {...shareModalProps} />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title={state.mode === 'encode' ? t('tool.base64.textInput') : t('tool.base64.base64Input')}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={
            state.mode === 'encode'
              ? t('tool.base64.textPlaceholder')
              : t('tool.base64.base64Placeholder')
          }
          className="h-40 lg:h-56"
          status={conversion.error ? 'error' : 'default'}
        />

        <ActionBar className="flex-col gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
              checked={state.urlSafe}
              onChange={(e) => updateState({ urlSafe: e.target.checked })}
            />
            <OptionLabel tooltip={t('tool.base64.urlSafeTooltip')}>
              {t('tool.base64.urlSafe')}
            </OptionLabel>
          </label>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={handleSwap}
            disabled={!conversion.result}
          >
            <RefreshCw className="h-4 w-4" />
            {t('tool.base64.inputOutputSwap')}
          </button>
        </ActionBar>

        {conversion.error && (
          <ErrorBanner
            message={t('tool.base64.conversionFailed')}
            details={conversion.error}
          />
        )}

        <ResultPanel
          title={t('common.result')}
          value={conversion.result}
          copyMessage={t('common.copiedResult')}
          copyTooltip={t('common.copy')}
          placeholder={t('tool.base64.resultPlaceholder')}
          status={conversion.error ? 'error' : 'success'}
          className="h-40 lg:h-56"
        />
      </div>
    </div>
  );
};

function encodeBase64(value: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  // Use chunking for large data to avoid "Maximum call stack size exceeded" error
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

function toUrlSafe(value: string) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromUrlSafe(value: string) {
  let normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }
  return normalized;
}

export const base64Tool: ToolDefinition<Base64State> = {
  id: 'base64',
  title: 'Base64 Converter',
  description: 'Base64 Encode/Decode',
  path: '/base64',
  icon: Binary,
  keywords: ['base64', 'encode', 'decode', 'base64url', 'urlsafe'],
  category: 'converter',
  defaultState: DEFAULT_STATE,
  Component: Base64Tool,
};
