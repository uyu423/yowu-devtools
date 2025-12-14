/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Eye, Copy } from 'lucide-react';
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
import { base64UrlDecode, verifyJwtSignature } from '@/lib/jwtUtils';

interface JwtDecoderState {
  token: string;
  verifyKey: string; // HMAC secret or RSA/ECDSA public key
}

const DEFAULT_STATE: JwtDecoderState = {
  token: '',
  verifyKey: '',
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

const JwtDecoderTool: React.FC = () => {
  const resolvedTheme = useResolvedTheme();
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<JwtDecoderState>('jwt-decoder', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();
  
  useTitle('JWT Decoder');

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
    if (!state.token) {
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
  }, [state.token]);

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
    if (!decoded || !state.verifyKey) {
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
  }, [decoded, state.verifyKey, state.token]);

  const error = useMemo((): string | null => {
    if (!state.token) {
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
  }, [state.token]);

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

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title="JWT Decoder"
        description="Decode JSON Web Tokens to view header, payload, and signature."
        onReset={resetState}
        onShare={async () => {
          if (isMobile) {
            setIsShareModalOpen(true);
          } else {
            await copyShareLink();
          }
        }}
      />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title="JWT Token"
          value={state.token}
          onChange={(val) => updateState({ token: val })}
          placeholder="Paste JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          className="h-32"
          status={error ? 'error' : 'default'}
        />

        {error && <ErrorBanner message={error} />}

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

        {!decoded && !error && state.token && (
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
        toolName="JWT Decoder"
        isSensitive={true}
      />
    </div>
  );
};

export const jwtDecoderTool: ToolDefinition<JwtDecoderState> = {
  id: 'jwt-decoder',
  title: 'JWT Decoder',
  description: 'Decode JSON Web Tokens',
  icon: Eye,
  path: '/jwt-decoder',
  keywords: ['jwt', 'token', 'decode', 'json', 'web', 'token', 'verify', 'decoder'],
  category: 'parser',
  defaultState: DEFAULT_STATE,
  Component: JwtDecoderTool,
};

