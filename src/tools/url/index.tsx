/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Link, RefreshCw } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';

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
  useTitle('URL Encoder');
  const { state, updateState, resetState, shareState } = useToolState<UrlToolState>('url', DEFAULT_STATE);
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
      const normalized = state.plusForSpace ? debouncedInput.replace(/\+/g, '%20') : debouncedInput;
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
        title="URL Encode/Decode" 
        description="Safely transform query params or path segments."
        onReset={resetState}
        onShare={shareState}
      />
      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel 
          title="Input"
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder="Type or paste content here..."
          className="h-40 lg:h-48"
          status={conversion.error ? 'error' : 'default'}
        />

        <ActionBar className="flex-col items-start gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            {['encode', 'decode'].map((mode) => (
              <button 
                key={mode}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${state.mode === mode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => updateState({ mode: mode as UrlToolState['mode'] })}
              >
                {mode === 'encode' ? 'Encode' : 'Decode'}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input 
              type="checkbox" 
              className="rounded border-gray-300" 
              checked={state.plusForSpace}
              onChange={(e) => updateState({ plusForSpace: e.target.checked })}
            />
            <span>Use + for spaces</span>
          </label>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
            onClick={handleSwap}
            disabled={!conversion.result}
          >
            <RefreshCw className="h-4 w-4" />
            Input/Output Swap
          </button>
        </ActionBar>

        {conversion.error && (
          <ErrorBanner message="Decoding failed" details={conversion.error} />
        )}

        <EditorPanel 
          title="Result"
          value={conversion.result}
          readOnly
          placeholder="Result will appear here..."
          className="h-40 lg:h-48"
          status={conversion.error ? 'error' : 'success'}
        />

        <div className="flex justify-end">
          <button
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            onClick={() => conversion.result && copyToClipboard(conversion.result, 'Copied result.')}
            disabled={!conversion.result}
          >
            Copy Result
          </button>
        </div>
      </div>
    </div>
  );
};

export const urlTool: ToolDefinition<UrlToolState> = {
  id: 'url',
  title: 'URL Encoder',
  description: 'Encode/Decode URL strings',
  path: '/url',
  icon: Link,
  defaultState: DEFAULT_STATE,
  Component: UrlTool,
};
