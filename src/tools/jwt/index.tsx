/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Key, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { isMobileDevice } from '@/lib/utils';
import { ShareModal } from '@/components/common/ShareModal';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

interface JwtToolState {
  token: string;
  mode: 'decode' | 'encode';
  verifyKey: string; // HMAC secret or RSA/ECDSA public key
  // Encoding fields
  headerJson: string;
  payloadJson: string;
  algorithm: 'none' | 'HS256' | 'HS384' | 'HS512';
  secretKey: string; // For HMAC signing
}

const DEFAULT_STATE: JwtToolState = {
  token: '',
  mode: 'decode',
  verifyKey: '',
  headerJson: JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2),
  payloadJson: JSON.stringify({ sub: '1234567890', name: 'John Doe' }, null, 2),
  algorithm: 'HS256',
  secretKey: '',
};

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isNotYetValid: boolean;
  signatureVerified: boolean | null; // null = not attempted, true = verified, false = failed
  signatureError?: string;
  expiryTime?: number;
  issuedAt?: number;
  notBefore?: number;
}

const JwtTool: React.FC = () => {
  const resolvedTheme = useResolvedTheme();
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<JwtToolState>('jwt', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();
  
  useTitle(state.mode === 'decode' ? 'JWT Decoder' : 'JWT Encoder');

  const isDark = resolvedTheme === 'dark';

  const jsonViewStyles = React.useMemo(
    () => ({
      ...defaultStyles,
      container: `${defaultStyles.container} text-sm font-mono ${
        isDark ? 'text-gray-100' : 'text-gray-900'
      }`,
      childFieldsContainer: `${
        defaultStyles.childFieldsContainer ?? ''
      } child-fields-container`,
    }),
    [isDark]
  );

  const decoded = useMemo((): DecodedJwt | null => {
    if (!state.token || state.mode !== 'decode') {
      return null;
    }

    try {
      const parts = state.token.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      const [headerRaw, payloadRaw, signatureRaw] = parts;

      // Base64URL 디코딩
      const headerJson = base64UrlDecode(headerRaw);
      const payloadJson = base64UrlDecode(payloadRaw);

      const header = JSON.parse(headerJson);
      const payload = JSON.parse(payloadJson);

      return {
        header,
        payload,
        signature: signatureRaw,
        raw: {
          header: headerRaw,
          payload: payloadRaw,
          signature: signatureRaw,
        },
      };
    } catch {
      return null;
    }
  }, [state.token, state.mode]);

  const validation = useMemo((): ValidationResult | null => {
    if (!decoded) return null;

    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.payload.exp as number | undefined;
    const iat = decoded.payload.iat as number | undefined;
    const nbf = decoded.payload.nbf as number | undefined;

    const isExpired = exp !== undefined && exp < now;
    const isNotYetValid = nbf !== undefined && nbf > now;

    return {
      isValid: !isExpired && !isNotYetValid,
      isExpired,
      isNotYetValid,
      signatureVerified: null,
      expiryTime: exp,
      issuedAt: iat,
      notBefore: nbf,
    };
  }, [decoded]);

  const [signatureVerification, setSignatureVerification] = React.useState<{
    verified: boolean | null;
    error?: string;
  }>({ verified: null });

  React.useEffect(() => {
    if (!decoded || !state.verifyKey || state.mode !== 'decode') {
      setSignatureVerification({ verified: null });
      return;
    }

    const verifySignature = async () => {
      try {
        const alg = decoded.header.alg as string;
        const verified = await verifyJwtSignature(
          state.token,
          state.verifyKey,
          alg
        );
        setSignatureVerification({ verified });
      } catch (error) {
        setSignatureVerification({
          verified: false,
          error: (error as Error).message,
        });
      }
    };

    verifySignature();
  }, [decoded, state.verifyKey, state.token, state.mode]);

  const error = useMemo((): string | null => {
    if (!state.token || state.mode !== 'decode') {
      return null;
    }

    try {
      const parts = state.token.trim().split('.');
      if (parts.length !== 3) {
        return 'Invalid JWT format. Expected 3 parts separated by dots (header.payload.signature).';
      }

      const [headerRaw, payloadRaw] = parts;

      try {
        const headerJson = base64UrlDecode(headerRaw);
        JSON.parse(headerJson);
      } catch {
        return 'Failed to decode JWT header. Invalid Base64URL encoding.';
      }

      try {
        const payloadJson = base64UrlDecode(payloadRaw);
        JSON.parse(payloadJson);
      } catch {
        return 'Failed to decode JWT payload. Invalid Base64URL encoding.';
      }

      return null;
    } catch (error) {
      return (error as Error).message || 'Failed to decode JWT token.';
    }
  }, [state.token, state.mode]);

  const handleCopyHeader = () => {
    if (decoded) {
      copyToClipboard(JSON.stringify(decoded.header, null, 2));
    }
  };

  const handleCopyPayload = () => {
    if (decoded) {
      copyToClipboard(JSON.stringify(decoded.payload, null, 2));
    }
  };

  const handleCopySignature = () => {
    if (decoded) {
      copyToClipboard(decoded.signature);
    }
  };

  // Encoding logic
  const encodedToken = useMemo((): string | null => {
    if (state.mode !== 'encode') return null;

    try {
      const header = JSON.parse(state.headerJson);
      const payload = JSON.parse(state.payloadJson);

      const headerB64 = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));

      if (state.algorithm === 'none') {
        return `${headerB64}.${payloadB64}.`;
      }

      // HMAC signing
      if (state.algorithm.startsWith('HS') && state.secretKey) {
        // This will be handled by async function
        return null; // Will be set by useEffect
      }

      return `${headerB64}.${payloadB64}.`;
    } catch {
      return null;
    }
  }, [state.mode, state.headerJson, state.payloadJson, state.algorithm, state.secretKey]);

  const [signedToken, setSignedToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Header의 alg 필드를 확인하여 서명 필요 여부 결정
    let needsSigning = true;
    try {
      const header = JSON.parse(state.headerJson);
      const alg = (header.alg as string) || state.algorithm;
      if (alg === 'none') {
        needsSigning = false;
      } else if (alg.startsWith('HS') && !state.secretKey) {
        setSignedToken(null);
        return;
      }
    } catch {
      // Header JSON 파싱 실패 시 기본 동작
      if (state.algorithm === 'none' || (state.algorithm.startsWith('HS') && !state.secretKey)) {
        setSignedToken(null);
        return;
      }
    }

    if (state.mode !== 'encode' || !needsSigning) {
      if (!needsSigning) {
        // 'none' 알고리즘인 경우 signToken에서 처리
      } else {
        setSignedToken(null);
        return;
      }
    }

    const signToken = async () => {
      try {
        const header = JSON.parse(state.headerJson);
        const payload = JSON.parse(state.payloadJson);

        // Header의 alg 필드를 우선적으로 사용 (JWT 표준 준수)
        // 별도 폼의 algorithm은 편의를 위한 것이지만, 실제 서명은 Header의 alg를 사용
        const alg = (header.alg as string) || state.algorithm;
        
        // alg가 'none'이면 서명 없이 반환
        if (alg === 'none') {
          const headerB64 = base64UrlEncode(JSON.stringify(header));
          const payloadB64 = base64UrlEncode(JSON.stringify(payload));
          setSignedToken(`${headerB64}.${payloadB64}.`);
          return;
        }

        // HMAC 알고리즘인지 확인
        if (!alg.startsWith('HS')) {
          throw new Error(`Unsupported algorithm: ${alg}. Only HS256, HS384, HS512, and 'none' are supported.`);
        }

        const headerB64 = base64UrlEncode(JSON.stringify(header));
        const payloadB64 = base64UrlEncode(JSON.stringify(payload));
        const message = `${headerB64}.${payloadB64}`;

        const hashName = alg === 'HS256' ? 'SHA-256' : alg === 'HS384' ? 'SHA-384' : 'SHA-512';
        const encoder = new TextEncoder();
        const keyData = encoder.encode(state.secretKey);
        const messageData = encoder.encode(message);

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: hashName },
          false,
          ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const signatureArray = new Uint8Array(signature);
        // Uint8Array를 Base64로 직접 변환 (더 안전하고 효율적)
        const binary = Array.from(signatureArray, byte => String.fromCharCode(byte)).join('');
        const base64 = btoa(binary);
        const signatureB64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        setSignedToken(`${message}.${signatureB64}`);
      } catch {
        setSignedToken(null);
      }
    };

    signToken();
  }, [state.mode, state.headerJson, state.payloadJson, state.algorithm, state.secretKey]);

  const finalToken = state.algorithm === 'none' ? encodedToken : signedToken;

  const encodeError = useMemo((): string | null => {
    if (state.mode !== 'encode') return null;

    try {
      JSON.parse(state.headerJson);
    } catch {
      return 'Invalid JSON in header';
    }

    try {
      JSON.parse(state.payloadJson);
    } catch {
      return 'Invalid JSON in payload';
    }

    if (state.algorithm !== 'none' && !state.secretKey) {
      return 'Secret key is required for signing';
    }

    return null;
  }, [state.mode, state.headerJson, state.payloadJson, state.algorithm, state.secretKey]);

  const handleCopyToken = () => {
    if (finalToken) {
      copyToClipboard(finalToken);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={state.mode === 'decode' ? 'JWT Decoder' : 'JWT Encoder'}
        description={
          state.mode === 'decode'
            ? 'Decode JSON Web Tokens to view header, payload, and signature.'
            : 'Encode JSON Web Tokens from header and payload.'
        }
        onReset={resetState}
        onShare={async () => {
          if (isMobile) {
            setIsShareModalOpen(true);
          } else {
            await copyShareLink();
          }
        }}
      />

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => updateState({ mode: 'decode' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            state.mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Decode
        </button>
        <button
          onClick={() => updateState({ mode: 'encode' })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            state.mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Encode
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {state.mode === 'decode' ? (
          <>
            <EditorPanel
              title="JWT Token"
              value={state.token}
              onChange={(val) => updateState({ token: val })}
              placeholder="Paste JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              className="h-32"
              status={error ? 'error' : 'default'}
            />

            {error && <ErrorBanner message={error} />}
          </>
        ) : (
          <>
            {/* Header Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Header (JSON)
                </label>
              </div>
              <EditorPanel
                title=""
                value={state.headerJson}
                onChange={(val) => updateState({ headerJson: val })}
                placeholder='{"alg":"HS256","typ":"JWT"}'
                className="h-32"
                status={encodeError?.includes('header') ? 'error' : 'default'}
              />
            </div>

            {/* Payload Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payload (JSON)
                </label>
              </div>
              <EditorPanel
                title=""
                value={state.payloadJson}
                onChange={(val) => updateState({ payloadJson: val })}
                placeholder='{"sub":"1234567890","name":"John Doe"}'
                className="h-32"
                status={encodeError?.includes('payload') ? 'error' : 'default'}
              />
            </div>

            {/* Algorithm Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Algorithm
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (updates header.alg)
                </span>
              </label>
              <select
                value={state.algorithm}
                onChange={(e) => {
                  const newAlg = e.target.value as JwtToolState['algorithm'];
                  updateState({ algorithm: newAlg });
                  // Header JSON의 alg 필드도 자동 업데이트
                  try {
                    const header = JSON.parse(state.headerJson);
                    header.alg = newAlg;
                    updateState({ headerJson: JSON.stringify(header, null, 2) });
                  } catch {
                    // Header JSON 파싱 실패 시 무시
                  }
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
              >
                <option value="none">None (unsigned)</option>
                <option value="HS256">HS256</option>
                <option value="HS384">HS384</option>
                <option value="HS512">HS512</option>
              </select>
            </div>

            {/* Secret Key Input (for HMAC) */}
            {state.algorithm !== 'none' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Secret Key
                </label>
                <input
                  type="text"
                  value={state.secretKey}
                  onChange={(e) => updateState({ secretKey: e.target.value })}
                  placeholder="Enter secret key for signing"
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                />
              </div>
            )}

            {encodeError && <ErrorBanner message={encodeError} />}

            {/* Encoded Token Output */}
            {finalToken && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Encoded JWT Token
                  </label>
                  <button
                    onClick={handleCopyToken}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Copy Token"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <EditorPanel
                  title=""
                  value={finalToken}
                  onChange={() => {}} // Read-only
                  placeholder=""
                  className="h-32"
                  readOnly
                />
              </div>
            )}
          </>
        )}

        {decoded && (
          <div className="flex-1 flex flex-col gap-6">
            {/* Validation Status */}
            {validation && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Validation Status
                  </h3>
                  {validation.isValid && !validation.isExpired && !validation.isNotYetValid ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      Valid
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      Invalid
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {validation.isExpired && (
                    <div className="text-red-600 dark:text-red-400">
                      ⚠ Token has expired
                      {validation.expiryTime && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (expired at {new Date(validation.expiryTime * 1000).toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  {validation.isNotYetValid && (
                    <div className="text-orange-600 dark:text-orange-400">
                      ⚠ Token is not yet valid
                      {validation.notBefore && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (valid from {new Date(validation.notBefore * 1000).toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  {!validation.isExpired && !validation.isNotYetValid && (
                    <div className="text-emerald-600 dark:text-emerald-400">
                      ✓ Token is valid (not expired)
                    </div>
                  )}
                  {validation.issuedAt && (
                    <div className="text-gray-600 dark:text-gray-400">
                      Issued at: {new Date(validation.issuedAt * 1000).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature Verification */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Signature Verification
                </h3>
                {signatureVerification.verified === true && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    Verified
                  </span>
                )}
                {signatureVerification.verified === false && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    Failed
                  </span>
                )}
                {signatureVerification.verified === null && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    Not verified
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Key
                  </label>
                  <textarea
                    value={state.verifyKey}
                    onChange={(e) => updateState({ verifyKey: e.target.value })}
                    placeholder={
                      decoded.header.alg?.toString().startsWith('HS')
                        ? 'Enter HMAC secret key (for HS256, HS384, HS512)'
                        : decoded.header.alg?.toString().startsWith('RS') || decoded.header.alg?.toString().startsWith('ES')
                        ? 'Enter public key (PEM format for RS256/RS384/RS512/ES256/ES384/ES512)'
                        : 'Enter verification key'
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
                {signatureVerification.error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Error: {signatureVerification.error}
                  </div>
                )}
                {signatureVerification.verified === null && state.verifyKey && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Enter a key above to verify the signature
                  </div>
                )}
                {signatureVerification.verified === true && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">
                    ✓ Signature is valid
                  </div>
                )}
                {signatureVerification.verified === false && !signatureVerification.error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    ✗ Signature verification failed. The token may have been tampered with or the key is incorrect.
                  </div>
                )}
              </div>
            </div>
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Header
                </h3>
                <button
                  onClick={handleCopyHeader}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Copy JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <JsonView
                  key={`jwt-header-${isDark ? 'dark' : 'light'}`}
                  data={decoded.header}
                  shouldExpandNode={() => true}
                  style={jsonViewStyles}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                Raw: {decoded.raw.header}
              </div>
            </div>

            {/* Payload */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payload
                </h3>
                <button
                  onClick={handleCopyPayload}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Copy JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <JsonView
                  key={`jwt-payload-${isDark ? 'dark' : 'light'}`}
                  data={decoded.payload}
                  shouldExpandNode={() => true}
                  style={jsonViewStyles}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                Raw: {decoded.raw.payload}
              </div>
            </div>

            {/* Signature */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Signature
                </h3>
                <button
                  onClick={handleCopySignature}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Copy Signature"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {decoded.signature}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Note: Signature verification is not performed. This tool only decodes the token.
              </div>
            </div>
          </div>
        )}

        {!decoded && !error && state.token && state.mode === 'decode' && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Enter a JWT token to decode it.
          </div>
        )}
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onConfirm={async () => {
          setIsShareModalOpen(false);
          await shareViaWebShare();
        }}
        includedFields={shareInfo.includedFields}
        excludedFields={shareInfo.excludedFields}
        toolName="JWT"
        isSensitive={true}
      />
    </div>
  );
};

// Base64URL 디코딩 함수
function base64UrlDecode(str: string): string {
  // Base64URL을 일반 Base64로 변환
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  // Base64 디코딩
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// Base64URL 인코딩 함수
function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  // Uint8Array를 Base64로 직접 변환 (더 안전하고 효율적)
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Base64URL을 바이트 배열로 디코딩하는 함수
function base64UrlDecodeToBytes(str: string): Uint8Array {
  // Base64URL을 일반 Base64로 변환
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  // Base64 디코딩하여 바이트 배열로 변환
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// JWT 서명 검증 함수
async function verifyJwtSignature(
  token: string,
  key: string,
  algorithm: string
): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerRaw, payloadRaw, signatureRaw] = parts;
  const message = `${headerRaw}.${payloadRaw}`;
  const signatureBytes = base64UrlDecodeToBytes(signatureRaw);

  // HMAC 알고리즘 (HS256, HS384, HS512)
  if (algorithm.startsWith('HS')) {
    const hashName = algorithm === 'HS256' ? 'SHA-256' : algorithm === 'HS384' ? 'SHA-384' : 'SHA-512';
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: hashName },
      false,
      ['verify']
    );

    const messageData = encoder.encode(message);

    // signatureBytes는 Uint8Array이므로 올바른 범위의 ArrayBuffer를 사용
    // Uint8Array의 buffer는 전체 ArrayBuffer를 참조할 수 있으므로, 
    // byteOffset과 byteLength를 고려하여 올바른 범위만 사용
    const signatureBuffer = signatureBytes.buffer.slice(
      signatureBytes.byteOffset,
      signatureBytes.byteOffset + signatureBytes.byteLength
    );

    return await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBuffer as ArrayBuffer,
      messageData.buffer as ArrayBuffer
    );
  }

  // RSA 알고리즘 (RS256, RS384, RS512)
  if (algorithm.startsWith('RS')) {
    const hashName = algorithm === 'RS256' ? 'SHA-256' : algorithm === 'RS384' ? 'SHA-384' : 'SHA-512';
    
    // PEM 형식의 공개 키 파싱
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    let pemKey = key.trim();
    
    if (!pemKey.includes(pemHeader)) {
      // PEM 헤더/푸터가 없으면 추가
      pemKey = `${pemHeader}\n${pemKey}\n${pemFooter}`;
    }

    // PEM을 DER로 변환
    const pemContents = pemKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryDer.buffer as ArrayBuffer,
      {
        name: 'RSA-PSS',
        hash: hashName,
      },
      false,
      ['verify']
    );

    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);

    // RSA-PSS로 검증 시도
    try {
      return await crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        cryptoKey,
        signatureBytes.buffer as ArrayBuffer,
        messageData.buffer as ArrayBuffer
      );
    } catch {
      // RSA-PSS 실패 시 RSASSA-PKCS1-v1_5로 재시도
      const cryptoKeyPKCS1 = await crypto.subtle.importKey(
        'spki',
        binaryDer.buffer as ArrayBuffer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: hashName,
        },
        false,
        ['verify']
      );

      return await crypto.subtle.verify(
        {
          name: 'RSASSA-PKCS1-v1_5',
        },
        cryptoKeyPKCS1,
        signatureBytes.buffer as ArrayBuffer,
        messageData.buffer as ArrayBuffer
      );
    }
  }

  // ECDSA 알고리즘 (ES256, ES384, ES512)
  if (algorithm.startsWith('ES')) {
    const hashName = algorithm === 'ES256' ? 'SHA-256' : algorithm === 'ES384' ? 'SHA-384' : 'SHA-512';
    const curve = algorithm === 'ES256' ? 'P-256' : algorithm === 'ES384' ? 'P-384' : 'P-521';
    const keyLength = algorithm === 'ES256' ? 32 : algorithm === 'ES384' ? 48 : 66;
    
    // PEM 형식의 공개 키 파싱
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    let pemKey = key.trim();
    
    if (!pemKey.includes(pemHeader)) {
      pemKey = `${pemHeader}\n${pemKey}\n${pemFooter}`;
    }

    const pemContents = pemKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryDer.buffer as ArrayBuffer,
      {
        name: 'ECDSA',
        namedCurve: curve,
      },
      false,
      ['verify']
    );

    const encoder = new TextEncoder();
    const messageData = encoder.encode(message);
    
    // JWT의 ECDSA 서명은 r과 s 값을 연속으로 배치한 형태 (각각 keyLength 바이트)
    // Web Crypto API는 DER 형식을 요구하므로 변환 필요
    if (signatureBytes.length !== keyLength * 2) {
      throw new Error(`Invalid signature length for ${algorithm}. Expected ${keyLength * 2} bytes.`);
    }

    // DER 형식으로 변환: SEQUENCE { INTEGER r, INTEGER s }
    const r = signatureBytes.slice(0, keyLength);
    const s = signatureBytes.slice(keyLength);
    
    // r과 s의 앞부분 0 제거 (DER INTEGER는 leading zero를 제거)
    let rStart = 0;
    while (rStart < r.length - 1 && r[rStart] === 0) rStart++;
    if ((r[rStart] & 0x80) !== 0) rStart--; // 음수 방지
    
    let sStart = 0;
    while (sStart < s.length - 1 && s[sStart] === 0) sStart++;
    if ((s[sStart] & 0x80) !== 0) sStart--; // 음수 방지
    
    const rBytes = r.slice(rStart);
    const sBytes = s.slice(sStart);
    
    // DER 인코딩
    const derSignature = new Uint8Array(4 + rBytes.length + 4 + sBytes.length);
    let offset = 0;
    
    // SEQUENCE
    derSignature[offset++] = 0x30;
    const seqLength = 2 + rBytes.length + 2 + sBytes.length;
    if (seqLength < 128) {
      derSignature[offset++] = seqLength;
    } else {
      derSignature[offset++] = 0x81;
      derSignature[offset++] = seqLength;
    }
    
    // INTEGER r
    derSignature[offset++] = 0x02;
    derSignature[offset++] = rBytes.length;
    derSignature.set(rBytes, offset);
    offset += rBytes.length;
    
    // INTEGER s
    derSignature[offset++] = 0x02;
    derSignature[offset++] = sBytes.length;
    derSignature.set(sBytes, offset);
    
    return await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: hashName,
      },
      cryptoKey,
      derSignature.buffer,
      messageData
    );
  }

  throw new Error(`Unsupported algorithm: ${algorithm}. Supported: HS256/HS384/HS512, RS256/RS384/RS512, ES256/ES384/ES512`);
}

export const jwtTool: ToolDefinition<JwtToolState> = {
  id: 'jwt',
  title: 'JWT Decoder',
  description: 'Decode and encode JSON Web Tokens',
  icon: Key,
  path: '/jwt',
  keywords: ['jwt', 'token', 'decode', 'encode', 'json', 'web', 'token', 'verify'],
  category: 'parser',
  defaultState: DEFAULT_STATE,
  Component: JwtTool,
};
