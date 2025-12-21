/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Eye, Copy, HelpCircle } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { useResolvedTheme } from '@/hooks/useThemeHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { ShareModal } from '@/components/common/ShareModal';
import { AdsenseFooter } from '@/components/common/AdsenseFooter';
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
  const { t } = useI18n();
  const resolvedTheme = useResolvedTheme();
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<JwtDecoderState>('jwt-decoder', DEFAULT_STATE);
  
  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.jwtDecoder.title'),
    isSensitive: true,
  });
  
  useTitle(t('tool.jwtDecoder.title'));

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
        throw new Error(t('tool.jwtDecoder.invalidJwtFormat'));
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
  }, [state.token, t]);

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
        return t('tool.jwtDecoder.invalidJwtFormatDetails');
      }

      const [headerRaw, payloadRaw] = parts;

      try {
        const headerJson = base64UrlDecode(headerRaw);
        JSON.parse(headerJson);
      } catch {
        return t('tool.jwtDecoder.failedToDecodeHeader');
      }

      try {
        const payloadJson = base64UrlDecode(payloadRaw);
        JSON.parse(payloadJson);
      } catch {
        return t('tool.jwtDecoder.failedToDecodePayload');
      }

      return null;
    } catch (error) {
      return (error as Error).message || t('tool.jwtDecoder.failedToDecodeToken');
    }
  }, [state.token, t]);

  const handleCopyHeader = () => {
    if (decoded) {
      copyToClipboard(JSON.stringify(decoded.header, null, 2), t('common.copiedToClipboard'));
    }
  };

  const handleCopyPayload = () => {
    if (decoded) {
      copyToClipboard(JSON.stringify(decoded.payload, null, 2), t('common.copiedToClipboard'));
    }
  };

  const handleCopySignature = () => {
    if (decoded) {
      copyToClipboard(decoded.signature, t('common.copiedToClipboard'));
    }
  };

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.jwtDecoder.title')}
        description={t('tool.jwtDecoder.description')}
        onReset={resetState}
        onShare={handleShare}
      />

      <div className="flex-1 flex flex-col gap-6">
        <EditorPanel
          title={t('tool.jwtDecoder.jwtToken')}
          titleTooltip={t('tool.jwtDecoder.jwtTokenTooltip')}
          value={state.token}
          onChange={(val) => updateState({ token: val })}
          placeholder={t('tool.jwtDecoder.tokenPlaceholder')}
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
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('tool.jwtDecoder.validationStatus')}
                    </h3>
                    <Tooltip content={t('tool.jwtDecoder.validationStatusTooltip')} position="bottom" nowrap={false}>
                      <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                    </Tooltip>
                  </div>
                  {validation.isValid && !validation.isExpired && !validation.isNotYetValid ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      {t('tool.jwtDecoder.valid')}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      {t('tool.jwtDecoder.invalid')}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  {validation.isExpired && (
                    <div className="text-red-600 dark:text-red-400">
                      {t('tool.jwtDecoder.tokenExpired')}
                      {validation.expiryTime && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({t('tool.jwtDecoder.expiredAt')} {new Date(validation.expiryTime * 1000).toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  {validation.isNotYetValid && (
                    <div className="text-orange-600 dark:text-orange-400">
                      {t('tool.jwtDecoder.tokenNotYetValid')}
                      {validation.notBefore && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          ({t('tool.jwtDecoder.validFrom')} {new Date(validation.notBefore * 1000).toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  {!validation.isExpired && !validation.isNotYetValid && (
                    <div className="text-emerald-600 dark:text-emerald-400">
                      {t('tool.jwtDecoder.tokenIsValid')}
                    </div>
                  )}
                  {validation.issuedAt && (
                    <div className="text-gray-600 dark:text-gray-400">
                      {t('tool.jwtDecoder.issuedAt')}: {new Date(validation.issuedAt * 1000).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature Verification */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('tool.jwtDecoder.signatureVerification')}
                  </h3>
                  <Tooltip content={t('tool.jwtDecoder.signatureVerificationTooltip')} position="bottom" nowrap={false}>
                    <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                  </Tooltip>
                </div>
                {signatureVerification.verified === true && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    {t('tool.jwtDecoder.verified')}
                  </span>
                )}
                {signatureVerification.verified === false && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    {t('tool.jwtDecoder.verificationFailed')}
                  </span>
                )}
                {signatureVerification.verified === null && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {t('tool.jwtDecoder.notVerified')}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>{t('tool.jwtDecoder.verificationKey')}</span>
                    <Tooltip content={t('tool.jwtDecoder.verificationKeyTooltip')} position="bottom" nowrap={false}>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
                    </Tooltip>
                  </label>
                  <textarea
                    value={state.verifyKey}
                    onChange={(e) => updateState({ verifyKey: e.target.value })}
                    placeholder={
                      decoded.header.alg?.toString().startsWith('HS')
                        ? t('tool.jwtDecoder.hmacKeyPlaceholder')
                        : decoded.header.alg?.toString().startsWith('RS') || decoded.header.alg?.toString().startsWith('ES')
                        ? t('tool.jwtDecoder.publicKeyPlaceholder')
                        : t('tool.jwtDecoder.enterVerificationKey')
                    }
                    className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
                {signatureVerification.error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {t('common.error')}: {signatureVerification.error}
                  </div>
                )}
                {signatureVerification.verified === null && state.verifyKey && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tool.jwtDecoder.enterKeyToVerify')}
                  </div>
                )}
                {signatureVerification.verified === true && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400">
                    {t('tool.jwtDecoder.signatureIsValid')}
                  </div>
                )}
                {signatureVerification.verified === false && !signatureVerification.error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {t('tool.jwtDecoder.signatureVerificationFailed')}
                  </div>
                )}
              </div>
            </div>
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('tool.jwtDecoder.header')}
                  </h3>
                  <Tooltip content={t('tool.jwtDecoder.headerTooltip')} position="bottom" nowrap={false}>
                    <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                  </Tooltip>
                </div>
                <button
                  onClick={handleCopyHeader}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title={t('common.copy')}
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
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('tool.jwtDecoder.payload')}
                  </h3>
                  <Tooltip content={t('tool.jwtDecoder.payloadTooltip')} position="bottom" nowrap={false}>
                    <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                  </Tooltip>
                </div>
                <button
                  onClick={handleCopyPayload}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title={t('common.copy')}
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
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('tool.jwtDecoder.signature')}
                  </h3>
                  <Tooltip content={t('tool.jwtDecoder.signatureTooltip')} position="bottom" nowrap={false}>
                    <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                  </Tooltip>
                </div>
                <button
                  onClick={handleCopySignature}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title={t('common.copy')}
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
                {t('tool.jwtDecoder.signatureNote')}
              </div>
            </div>
          </div>
        )}

        {!decoded && !error && state.token && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('tool.jwtDecoder.enterTokenToDecode')}
          </div>
        )}
      </div>
      <ShareModal {...shareModalProps} />

      <AdsenseFooter />
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
