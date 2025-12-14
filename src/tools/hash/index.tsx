/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Hash, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';

interface HashToolState {
  input: string;
  algorithm: 'SHA-256' | 'SHA-1' | 'MD5' | 'SHA-384' | 'SHA-512';
  hmac: boolean;
  hmacKey: string;
  outputFormat: 'hex' | 'base64';
}

const DEFAULT_STATE: HashToolState = {
  input: '',
  algorithm: 'SHA-256',
  hmac: false,
  hmacKey: '',
  outputFormat: 'hex',
};

// Convert ArrayBuffer to Hex string
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

// Convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
};

const HashTool: React.FC = () => {
  useTitle('Hash Generator');
  const { state, updateState, resetState, shareState } = useToolState<HashToolState>(
    'hash',
    DEFAULT_STATE,
    {
      shareStateFilter: ({ input, algorithm, hmac, hmacKey, outputFormat }) => ({
        input,
        algorithm,
        hmac,
        hmacKey,
        outputFormat,
      }),
    }
  );

  const debouncedInput = useDebouncedValue(state.input, 300);
  const debouncedHmacKey = useDebouncedValue(state.hmacKey, 300);

  const [hashResult, setHashResult] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  // Check WebCrypto API support
  const isWebCryptoSupported = React.useMemo(() => {
    return typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto;
  }, []);

  // Calculate hash
  React.useEffect(() => {
    if (!isWebCryptoSupported) {
      setError('WebCrypto API is not supported in this browser.');
      return;
    }

    if (!debouncedInput.trim()) {
      setHashResult('');
      setError(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    const calculateHash = async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(debouncedInput);

        let hashBuffer: ArrayBuffer;

        if (state.hmac && debouncedHmacKey.trim()) {
          // HMAC calculation
          const keyData = encoder.encode(debouncedHmacKey);
          const hashName = state.algorithm === 'MD5' ? 'SHA-256' : state.algorithm; // MD5 doesn't support HMAC, use SHA-256

          const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: hashName },
            false,
            ['sign']
          );

          hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
        } else {
          // Regular hash calculation
          // Note: WebCrypto API doesn't support MD5, so we'll show an error for MD5
          if (state.algorithm === 'MD5') {
            setError('MD5 is not supported by WebCrypto API. Please use SHA-256, SHA-1, SHA-384, or SHA-512.');
            setIsCalculating(false);
            return;
          }

          hashBuffer = await crypto.subtle.digest(state.algorithm, data);
        }

        const result =
          state.outputFormat === 'hex'
            ? arrayBufferToHex(hashBuffer)
            : arrayBufferToBase64(hashBuffer);

        setHashResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate hash');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateHash();
  }, [
    debouncedInput,
    debouncedHmacKey,
    state.algorithm,
    state.hmac,
    state.outputFormat,
    isWebCryptoSupported,
  ]);

  const handleCopy = async () => {
    if (hashResult) {
      await copyToClipboard(hashResult);
      toast.success('Hash copied to clipboard');
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title="Hash Generator"
        description="Calculate hash values and HMAC signatures"
        onReset={resetState}
        onShare={shareState}
      />

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Input */}
      <div className="mb-4">
        <EditorPanel
          value={state.input}
          onChange={(value) => updateState({ input: value })}
          placeholder="Enter text to hash..."
          mode="text"
          readOnly={false}
        />
      </div>

      {/* Options */}
      <div className="mb-4 space-y-4">
        {/* Algorithm and Format */}
        <div className="flex flex-wrap gap-4">
          <OptionLabel tooltip="Select hash algorithm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Algorithm
            </label>
            <select
              value={state.algorithm}
              onChange={(e) =>
                updateState({
                  algorithm: e.target.value as HashToolState['algorithm'],
                })
              }
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
              <option value="MD5">MD5 (Not supported)</option>
            </select>
          </OptionLabel>

          <OptionLabel tooltip="Select output format">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <select
              value={state.outputFormat}
              onChange={(e) =>
                updateState({
                  outputFormat: e.target.value as 'hex' | 'base64',
                })
              }
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hex">Hex</option>
              <option value="base64">Base64</option>
            </select>
          </OptionLabel>
        </div>

        {/* HMAC Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            HMAC Authentication
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.hmac}
                onChange={(e) => updateState({ hmac: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable HMAC</span>
            </label>
          </div>
          {state.hmac && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                HMAC Key
              </label>
              <input
                type="text"
                value={state.hmacKey}
                onChange={(e) => updateState({ hmacKey: e.target.value })}
                placeholder="Enter HMAC key..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="mb-4 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Hash Result {isCalculating && <span className="text-gray-500 font-normal">(Calculating...)</span>}
          </label>
          <button
            onClick={handleCopy}
            disabled={!hashResult || isCalculating}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy hash"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <EditorPanel
            value={hashResult || (isCalculating ? 'Calculating...' : '')}
            onChange={() => {}} // Read-only
            placeholder="Hash result will appear here..."
            mode="text"
            readOnly={true}
          />
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong className="text-gray-700 dark:text-gray-300">Note:</strong> For checksum verification only. Not suitable for security purposes.
        </p>
      </div>
    </div>
  );
};

export const hashTool: ToolDefinition<HashToolState> = {
  id: 'hash',
  title: 'Hash Generator',
  description: 'Calculate hash values and HMAC signatures',
  path: '/hash',
  icon: Hash,
  keywords: [
    'hash',
    'checksum',
    'sha256',
    'sha1',
    'md5',
    'hmac',
    'cryptographic hash',
    'digest',
    'fingerprint',
  ],
  category: 'Converters',
  defaultState: DEFAULT_STATE,
  Component: HashTool,
};

