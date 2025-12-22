/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Hash, Copy, File, KeyRound, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';
import { ShareModal } from '@/components/common/ShareModal';
import { GoogleAdsenseBlock } from '@/components/common/GoogleAdsenseBlock';
import { cn } from '@/lib/utils';
import CryptoJS from 'crypto-js';

interface HashToolState {
  mode: 'hash' | 'hmac'; // Hash or HMAC mode
  inputType: 'text' | 'file'; // Text or File input
  text?: string; // Text input
  // file은 공유/저장 대신 "마지막 파일명" 정도만 표시(실데이터 저장 금지)
  lastFileName?: string; // Last loaded file name (for display only)
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'; // Supported algorithms
  outputEncoding: 'hex' | 'base64' | 'base64url'; // Output encoding format
  hmacKeyText?: string; // HMAC key (default: not saved/shared)
  hmacKeyEncoding?: 'raw' | 'hex' | 'base64'; // Key encoding format
  saveHmacKey?: boolean; // Whether to save HMAC key in share links (default: false)
  expectedMac?: string; // Expected MAC for verification
}

const DEFAULT_STATE: HashToolState = {
  mode: 'hash',
  inputType: 'text',
  text: '',
  algorithm: 'SHA-256',
  outputEncoding: 'hex',
  hmacKeyEncoding: 'raw',
  saveHmacKey: false,
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

// Convert ArrayBuffer to Base64URL string
const arrayBufferToBase64URL = (buffer: ArrayBuffer): string => {
  const base64 = arrayBufferToBase64(buffer);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// Convert hex string to ArrayBuffer
const hexToArrayBuffer = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

// Convert base64 string to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};


const HashTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.hash.title'));
  
  // HMAC 키는 기본적으로 공유 링크에 포함하지 않음
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } = useToolState<HashToolState>(
    'hash',
    DEFAULT_STATE,
    {
      shareStateFilter: ({ mode, inputType, text, lastFileName, algorithm, outputEncoding, hmacKeyText, hmacKeyEncoding, saveHmacKey }) => {
        const filtered: Partial<HashToolState> = {
          mode,
          inputType,
          algorithm,
          outputEncoding,
          hmacKeyEncoding,
        };
        
        // Text input만 공유 (파일 내용은 공유하지 않음)
        if (inputType === 'text' && text) {
          filtered.text = text;
        }
        
        // 파일명만 공유 (실제 파일 내용은 공유하지 않음)
        if (inputType === 'file' && lastFileName) {
          filtered.lastFileName = lastFileName;
        }
        
        // HMAC 키는 saveHmacKey가 true일 때만 공유
        if (saveHmacKey && hmacKeyText) {
          filtered.hmacKeyText = hmacKeyText;
          filtered.saveHmacKey = true;
        }
        
        // Expected MAC은 공유하지 않음 (검증용)
        
        return filtered as HashToolState;
      },
    }
  );

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.hash.title'),
  });

  const debouncedText = useDebouncedValue(state.text || '', 300);
  const debouncedHmacKey = useDebouncedValue(state.hmacKeyText || '', 300);

  const [hashResult, setHashResult] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [currentFile, setCurrentFile] = React.useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = React.useState<{ name: string; size: number; lastModified: number } | null>(null);
  const [verificationResult, setVerificationResult] = React.useState<'match' | 'mismatch' | null>(null);

  // Check WebCrypto API support
  const isWebCryptoSupported = React.useMemo(() => {
    return typeof window !== 'undefined' && 'crypto' in window && 'subtle' in window.crypto;
  }, []);

  // Generate random HMAC key
  const generateRandomKey = React.useCallback(async () => {
    if (!isWebCryptoSupported) {
      toast.error(t('tool.hash.webCryptoNotSupported'));
      return;
    }

    try {
      // Generate 32 random bytes (256 bits) for HMAC key
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      
      // Convert to hex string
      const hexKey = arrayBufferToHex(randomBytes.buffer);
      updateState({ hmacKeyText: hexKey, hmacKeyEncoding: 'hex' });
      toast.success(t('tool.hash.randomKeyGenerated'));
    } catch {
      toast.error(t('tool.hash.failedToGenerateKey'));
    }
  }, [isWebCryptoSupported, updateState, t]);

  // Check if algorithm uses WebCrypto API (SHA-256, SHA-512) or crypto-js (MD5, SHA-1)
  const usesWebCrypto = React.useMemo(() => {
    return state.algorithm === 'SHA-256' || state.algorithm === 'SHA-512';
  }, [state.algorithm]);

  // Calculate hash from ArrayBuffer or WordArray
  const calculateHashFromBuffer = React.useCallback(
    async (data: ArrayBuffer | CryptoJS.lib.WordArray): Promise<string> => {
      // Use crypto-js for MD5 and SHA-1
      if (state.algorithm === 'MD5' || state.algorithm === 'SHA-1') {
        let wordArray: CryptoJS.lib.WordArray;
        
        if (data instanceof ArrayBuffer) {
          // Convert ArrayBuffer to WordArray
          const bytes = new Uint8Array(data);
          const words: number[] = [];
          for (let i = 0; i < bytes.length; i += 4) {
            words.push(
              (bytes[i] << 24) |
              (bytes[i + 1] << 16) |
              (bytes[i + 2] << 8) |
              (bytes[i + 3] || 0)
            );
          }
          wordArray = CryptoJS.lib.WordArray.create(words, bytes.length);
        } else {
          wordArray = data;
        }

        let hash: CryptoJS.lib.WordArray;

        if (state.mode === 'hmac' && debouncedHmacKey.trim()) {
          // HMAC calculation using crypto-js
          let key: string | CryptoJS.lib.WordArray;
          
          try {
            // Decode HMAC key based on encoding
            if (state.hmacKeyEncoding === 'hex') {
              if (debouncedHmacKey.length % 2 !== 0) {
                throw new Error('Invalid hex key: length must be even');
              }
              key = CryptoJS.enc.Hex.parse(debouncedHmacKey);
            } else if (state.hmacKeyEncoding === 'base64') {
              key = CryptoJS.enc.Base64.parse(debouncedHmacKey);
            } else {
              // raw (text)
              key = debouncedHmacKey;
            }
          } catch (err) {
            throw new Error(`Invalid key encoding: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }

          // Calculate HMAC
          if (state.algorithm === 'MD5') {
            hash = CryptoJS.HmacMD5(wordArray, key);
          } else {
            // SHA-1
            hash = CryptoJS.HmacSHA1(wordArray, key);
          }
        } else {
          // Regular hash calculation
          if (state.algorithm === 'MD5') {
            hash = CryptoJS.MD5(wordArray);
          } else {
            // SHA-1
            hash = CryptoJS.SHA1(wordArray);
          }
        }

        // Convert to output format
        if (state.outputEncoding === 'hex') {
          return hash.toString(CryptoJS.enc.Hex);
        } else if (state.outputEncoding === 'base64url') {
          const base64 = hash.toString(CryptoJS.enc.Base64);
          return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        } else {
          return hash.toString(CryptoJS.enc.Base64);
        }
      }

      // Use WebCrypto API for SHA-256 and SHA-512
      if (!isWebCryptoSupported) {
        throw new Error(t('tool.hash.webCryptoNotSupported'));
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(t('tool.hash.processingTimeout')));
        }, 10_000);
      });

      let hashBuffer: ArrayBuffer;
      const arrayBuffer = data instanceof ArrayBuffer ? data : dataToArrayBuffer(data);

      if (state.mode === 'hmac' && debouncedHmacKey.trim()) {
        // HMAC calculation
        let keyData: ArrayBuffer;
        
        try {
          // Decode HMAC key based on encoding
          if (state.hmacKeyEncoding === 'hex') {
            if (debouncedHmacKey.length % 2 !== 0) {
              throw new Error('Invalid hex key: length must be even');
            }
            keyData = hexToArrayBuffer(debouncedHmacKey);
          } else if (state.hmacKeyEncoding === 'base64') {
            keyData = base64ToArrayBuffer(debouncedHmacKey);
          } else {
            // raw (text)
            const encoder = new TextEncoder();
            keyData = encoder.encode(debouncedHmacKey).buffer;
          }
        } catch (err) {
          throw new Error(`Invalid key encoding: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        const cryptoKey = await Promise.race([
          crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: state.algorithm },
            false,
            ['sign']
          ),
          timeoutPromise,
        ]);

        hashBuffer = await Promise.race([
          crypto.subtle.sign('HMAC', cryptoKey, arrayBuffer),
          timeoutPromise,
        ]);
      } else {
        // Regular hash calculation
        hashBuffer = await Promise.race([
          crypto.subtle.digest(state.algorithm, arrayBuffer),
          timeoutPromise,
        ]);
      }

      // Convert to output format
      if (state.outputEncoding === 'hex') {
        return arrayBufferToHex(hashBuffer);
      } else if (state.outputEncoding === 'base64url') {
        return arrayBufferToBase64URL(hashBuffer);
      } else {
        return arrayBufferToBase64(hashBuffer);
      }
    },
    [state.mode, state.algorithm, state.outputEncoding, state.hmacKeyEncoding, debouncedHmacKey, isWebCryptoSupported, t]
  );

  // Helper function to convert WordArray to ArrayBuffer
  const dataToArrayBuffer = (wordArray: CryptoJS.lib.WordArray): ArrayBuffer => {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const bytes = new Uint8Array(sigBytes);
    
    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      bytes[i] = byte;
    }
    
    return bytes.buffer;
  };

  // Calculate hash for text input
  React.useEffect(() => {
    if (state.inputType !== 'text' || !debouncedText.trim()) {
      if (state.inputType === 'text') {
        setHashResult('');
        setError(null);
      }
      return;
    }

    setIsCalculating(true);
    setError(null);

    const calculateHash = async () => {
      try {
        let data: ArrayBuffer | CryptoJS.lib.WordArray;
        
        if (usesWebCrypto) {
          // Use ArrayBuffer for WebCrypto API
          const encoder = new TextEncoder();
          data = encoder.encode(debouncedText).buffer;
        } else {
          // Use WordArray for crypto-js
          data = CryptoJS.enc.Utf8.parse(debouncedText);
        }
        
        const result = await calculateHashFromBuffer(data);
        setHashResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('tool.hash.failedToCalculateHash'));
        setHashResult('');
      } finally {
        setIsCalculating(false);
      }
    };

    calculateHash();
  }, [debouncedText, state.inputType, calculateHashFromBuffer, usesWebCrypto, t]);

  // Calculate hash for file
  const calculateFileHash = React.useCallback(
    async (file: File) => {
      setIsCalculating(true);
      setError(null);
      
      try {
        if (usesWebCrypto) {
          // Use ArrayBuffer for WebCrypto API
          const arrayBuffer = await file.arrayBuffer();
          const result = await calculateHashFromBuffer(arrayBuffer);
          setHashResult(result);
        } else {
          // Use WordArray for crypto-js
          // Read file as ArrayBuffer first, then convert to WordArray
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const words: number[] = [];
          for (let i = 0; i < bytes.length; i += 4) {
            words.push(
              (bytes[i] << 24) |
              ((bytes[i + 1] || 0) << 16) |
              ((bytes[i + 2] || 0) << 8) |
              (bytes[i + 3] || 0)
            );
          }
          const wordArray = CryptoJS.lib.WordArray.create(words, bytes.length);
          const result = await calculateHashFromBuffer(wordArray);
          setHashResult(result);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : t('tool.hash.failedToCalculateFileHash'));
        setHashResult('');
      } finally {
        setIsCalculating(false);
      }
    },
    [calculateHashFromBuffer, usesWebCrypto, t]
  );

  // Handle file selection
  const handleFileSelect = React.useCallback((file: File) => {
    setCurrentFile(file);
    setFileMetadata({
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
    });
    updateState({ lastFileName: file.name });
    
    // Calculate hash immediately
    calculateFileHash(file);
  }, [calculateFileHash, updateState]);

  // Recalculate file hash when algorithm, mode, key, or encoding changes
  React.useEffect(() => {
    if (state.inputType === 'file' && currentFile) {
      calculateFileHash(currentFile);
    }
  }, [state.algorithm, state.mode, state.outputEncoding, debouncedHmacKey, state.hmacKeyEncoding, state.inputType, currentFile, calculateFileHash]);

  // Verify MAC
  React.useEffect(() => {
    if (!state.expectedMac || !hashResult) {
      setVerificationResult(null);
      return;
    }

    // Compare expected MAC with calculated hash (case-insensitive)
    const normalizedExpected = state.expectedMac.trim().toLowerCase();
    const normalizedResult = hashResult.toLowerCase();
    
    setVerificationResult(normalizedExpected === normalizedResult ? 'match' : 'mismatch');
  }, [state.expectedMac, hashResult]);

  const handleCopy = async () => {
    if (hashResult) {
      await copyToClipboard(hashResult, t('common.copiedToClipboard'));
    }
  };

  const handleReset = () => {
    resetState();
    setCurrentFile(null);
    setFileMetadata(null);
    setHashResult('');
    setError(null);
    setVerificationResult(null);
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.hash.title')}
        description={t('tool.hash.description')}
        onReset={handleReset}
        onShare={() => {
          if (state.inputType === 'file') {
            toast.error(t('tool.hash.fileSharingNotSupported'));
            return;
          }
          handleShare();
        }}
      />

      {error && <ErrorBanner message={error} className="mb-4" />}

      {/* Mode Selection */}
      <div className="mb-4">
        <OptionLabel tooltip={t('tool.hash.modeTooltip')}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.hash.mode')}
          </label>
        </OptionLabel>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateState({ mode: 'hash' })}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              state.mode === 'hash'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <Hash className="w-4 h-4 inline mr-2" />
            Hash
          </button>
          <button
            type="button"
            onClick={() => updateState({ mode: 'hmac' })}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              state.mode === 'hmac'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <KeyRound className="w-4 h-4 inline mr-2" />
            HMAC
          </button>
        </div>
      </div>

      {/* Input Type Selection */}
      <div className="mb-4">
        <OptionLabel tooltip={t('tool.hash.inputTypeTooltip')}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('tool.hash.inputType')}
          </label>
        </OptionLabel>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              updateState({ inputType: 'text' });
              setCurrentFile(null);
              setFileMetadata(null);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              state.inputType === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t('tool.hash.text')}
          </button>
          <button
            type="button"
            onClick={() => {
              updateState({ inputType: 'file' });
              setHashResult('');
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              state.inputType === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <File className="w-4 h-4 inline mr-2" />
            {t('tool.hash.file')}
          </button>
        </div>
      </div>

      {/* Input Section */}
      {state.inputType === 'text' ? (
        <div className="mb-4">
          <EditorPanel
            value={state.text || ''}
            onChange={(value) => updateState({ text: value })}
            placeholder={t('tool.hash.enterTextPlaceholder')}
            mode="text"
            readOnly={false}
          />
        </div>
      ) : (
        <div className="mb-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
              className="hidden"
              id="hash-file-input"
            />
            <label
              htmlFor="hash-file-input"
              className="cursor-pointer"
            >
              <File className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tool.hash.dropFileHere')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('tool.hash.maxFileSize')}
              </div>
            </label>
          </div>
          {fileMetadata && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div><strong>{t('tool.hash.fileName')}:</strong> {fileMetadata.name}</div>
                <div><strong>{t('tool.hash.fileSize')}:</strong> {(fileMetadata.size / 1024).toFixed(2)} KB</div>
                <div><strong>{t('tool.hash.modified')}:</strong> {new Date(fileMetadata.lastModified).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div className="mb-4 space-y-4">
        {/* Algorithm */}
        <div>
          <OptionLabel tooltip={t('tool.hash.algorithmTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tool.hash.algorithm')}
            </label>
          </OptionLabel>
          <select
            value={state.algorithm}
            onChange={(e) =>
              updateState({
                algorithm: e.target.value as 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512',
              })
            }
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MD5">MD5</option>
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </div>

        {/* Output Encoding */}
        <div>
          <OptionLabel tooltip={t('tool.hash.outputEncodingTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tool.hash.outputEncoding')}
            </label>
          </OptionLabel>
          <select
            value={state.outputEncoding}
            onChange={(e) =>
              updateState({
                outputEncoding: e.target.value as 'hex' | 'base64' | 'base64url',
              })
            }
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
            <option value="base64url">Base64URL</option>
          </select>
        </div>

        {/* HMAC Options */}
        {state.mode === 'hmac' && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <OptionLabel tooltip={t('tool.hash.keyEncodingTooltip')}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('tool.hash.keyEncoding')}
                  </label>
                </OptionLabel>
                <button
                  type="button"
                  onClick={generateRandomKey}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title={t('tool.hash.generateRandomKey')}
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('tool.hash.generateRandom')}
                </button>
              </div>
              <select
                value={state.hmacKeyEncoding || 'raw'}
                onChange={(e) =>
                  updateState({
                    hmacKeyEncoding: e.target.value as 'raw' | 'hex' | 'base64',
                  })
                }
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="raw">{t('tool.hash.rawTextUtf8')}</option>
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('tool.hash.hmacKey')}
              </label>
              <input
                type="text"
                value={state.hmacKeyText || ''}
                onChange={(e) => updateState({ hmacKeyText: e.target.value })}
                placeholder={t('tool.hash.enterHmacKeyPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.saveHmacKey || false}
                  onChange={(e) => updateState({ saveHmacKey: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('tool.hash.saveKeyInShareLinks')}
                </span>
              </label>
              {state.saveHmacKey && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {t('tool.hash.saveKeyWarning')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AdSense - Before Hash Result */}
      <GoogleAdsenseBlock />

      {/* Output */}
      <div className="mb-4 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.hash.hashResult')} {isCalculating && <span className="text-gray-500 font-normal">({t('tool.hash.calculating')})</span>}
          </label>
          <button
            onClick={handleCopy}
            disabled={!hashResult || isCalculating}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('common.copy')}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <EditorPanel
            value={hashResult || (isCalculating ? t('tool.hash.calculating') : '')}
            onChange={() => {}} // Read-only
            placeholder={t('tool.hash.resultPlaceholder')}
            mode="text"
            readOnly={true}
          />
        </div>
        
        {/* Security Note */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong className="text-gray-700 dark:text-gray-300">{t('tool.hash.note')}:</strong> {t('tool.hash.securityNote')}
          </p>
          {(state.algorithm === 'MD5' || state.algorithm === 'SHA-1') && (
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              <strong>{t('tool.hash.securityWarning')}:</strong> {t('tool.hash.algorithmWarning').replace('{algorithm}', state.algorithm)}
            </p>
          )}
        </div>
      </div>

      {/* HMAC Verification Section */}
      {state.mode === 'hmac' && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <OptionLabel tooltip={t('tool.hash.verificationTooltip')}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tool.hash.verification')}
            </label>
          </OptionLabel>
          <div className="space-y-2">
            <input
              type="text"
              value={state.expectedMac || ''}
              onChange={(e) => updateState({ expectedMac: e.target.value })}
              placeholder={t('tool.hash.enterExpectedMacPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {verificationResult === 'match' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">{t('tool.hash.verificationSuccess')}</span>
              </div>
            )}
            {verificationResult === 'mismatch' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t('tool.hash.verificationFailed')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <ShareModal {...shareModalProps} />
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
    'sha512',
    'hmac',
    'cryptographic hash',
    'digest',
    'fingerprint',
    'file hash',
  ],
  category: 'Converters',
  defaultState: DEFAULT_STATE,
  Component: HashTool,
};
