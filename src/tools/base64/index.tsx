/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Binary, RefreshCw, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ActionBar } from '@/components/common/ActionBar';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';
import { isMobileDevice } from '@/lib/utils';
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
  useTitle('Base64 Converter');
  // Base64 tool state contains: input (string), mode, urlSafe
  // All fields are necessary for sharing - input may be large but required
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<Base64State>('base64', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();

  const conversion = useMemo(() => {
    if (!state.input) {
      return { result: '', error: null as string | null };
    }
    try {
      if (state.mode === 'encode') {
        let encoded = encodeBase64(state.input);
        if (state.urlSafe) encoded = toUrlSafe(encoded);
        return { result: encoded, error: null };
      }
      const source = state.urlSafe ? fromUrlSafe(state.input) : state.input;
      return { result: decodeBase64(source), error: null };
    } catch (error) {
      return { result: '', error: (error as Error).message };
    }
  }, [state.input, state.mode, state.urlSafe]);

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
        title="Base64 Converter"
        description="Encode or decode UTF-8 text, including Base64URL."
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
        toolName="Base64 Converter"
      />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title={state.mode === 'encode' ? 'Text Input' : 'Base64 Input'}
          value={state.input}
          onChange={(val) => updateState({ input: val })}
          placeholder={
            state.mode === 'encode'
              ? 'Type text to encode...'
              : 'Paste Base64 string...'
          }
          className="h-40 lg:h-56"
          status={conversion.error ? 'error' : 'default'}
        />

        <ActionBar className="flex-col gap-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
                  updateState({ mode: mode as Base64State['mode'] })
                }
              >
                {mode === 'encode' ? 'Encode' : 'Decode'}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
              checked={state.urlSafe}
              onChange={(e) => updateState({ urlSafe: e.target.checked })}
            />
            <OptionLabel tooltip="Use the URL-safe Base64 alphabet (- and _) and omit padding for link-friendly strings. This variant replaces '+' with '-' and '/' with '_', making the encoded string safe to use in URLs without additional encoding.">
              URL Safe
            </OptionLabel>
          </label>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={handleSwap}
            disabled={!conversion.result}
          >
            <RefreshCw className="h-4 w-4" />
            Input/Output Swap
          </button>
        </ActionBar>

        {conversion.error && (
          <ErrorBanner
            message="Base64 conversion failed"
            details={conversion.error}
          />
        )}

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 rounded-t-md border border-b-0">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Result
            </span>
            <button
              onClick={() =>
                conversion.result &&
                copyToClipboard(conversion.result, 'Copied result.')
              }
              disabled={!conversion.result}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy Result"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <EditorPanel
            title=""
            value={conversion.result}
            readOnly
            placeholder="Result will appear here..."
            className="h-40 lg:h-56 rounded-t-none"
            status={conversion.error ? 'error' : 'success'}
          />
        </div>
      </div>
    </div>
  );
};

function encodeBase64(value: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
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
  title: 'Base64',
  description: 'Base64 Encode/Decode',
  path: '/base64',
  icon: Binary,
  keywords: ['base64', 'encode', 'decode', 'base64url', 'urlsafe'],
  category: 'converter',
  defaultState: DEFAULT_STATE,
  Component: Base64Tool,
};
