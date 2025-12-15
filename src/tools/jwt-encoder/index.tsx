/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Key, Copy } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { EditorPanel } from '@/components/common/EditorPanel';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { copyToClipboard } from '@/lib/clipboard';
import { isMobileDevice } from '@/lib/utils';
import { ShareModal } from '@/components/common/ShareModal';
import { base64UrlEncode } from '@/lib/jwtUtils';

interface JwtEncoderState {
  headerJson: string;
  payloadJson: string;
  algorithm: 'none' | 'HS256' | 'HS384' | 'HS512';
  secretKey: string; // For HMAC signing
}

const DEFAULT_STATE: JwtEncoderState = {
  headerJson: JSON.stringify({ alg: 'none', typ: 'JWT' }, null, 2),
  payloadJson: JSON.stringify({ sub: '1234567890', name: 'John Doe' }, null, 2),
  algorithm: 'none',
  secretKey: '',
};

const JwtEncoderTool: React.FC = () => {
  const { t } = useI18n();
  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<JwtEncoderState>('jwt-encoder', DEFAULT_STATE);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const shareInfo = getShareStateInfo();
  const isMobile = isMobileDevice();
  
  useTitle(t('tool.jwtEncoder.title'));

  // Encoding logic
  const encodedToken = useMemo((): string | null => {
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
  }, [state.headerJson, state.payloadJson, state.algorithm, state.secretKey]);

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

    if (!needsSigning) {
      // 'none' 알고리즘인 경우 signToken에서 처리
    } else {
      setSignedToken(null);
      return;
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
  }, [state.headerJson, state.payloadJson, state.algorithm, state.secretKey]);

  const finalToken = state.algorithm === 'none' ? encodedToken : signedToken;

  const encodeError = useMemo((): string | null => {
    try {
      JSON.parse(state.headerJson);
    } catch {
      return t('tool.jwtEncoder.invalidHeaderJson');
    }

    try {
      JSON.parse(state.payloadJson);
    } catch {
      return t('tool.jwtEncoder.invalidPayloadJson');
    }

    if (state.algorithm !== 'none' && !state.secretKey) {
      return t('tool.jwtEncoder.secretKeyRequired');
    }

    return null;
  }, [state.headerJson, state.payloadJson, state.algorithm, state.secretKey, t]);

  const handleCopyToken = () => {
    if (finalToken) {
      copyToClipboard(finalToken, t('common.copiedToClipboard'));
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-5xl mx-auto">
      <ToolHeader
        title={t('tool.jwtEncoder.title')}
        description={t('tool.jwtEncoder.description')}
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
        {/* Header Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.jwtEncoder.headerJson')}
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
              {t('tool.jwtEncoder.payloadJson')}
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
            {t('tool.jwtEncoder.algorithm')}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {t('tool.jwtEncoder.algorithmNote')}
            </span>
          </label>
          <select
            value={state.algorithm}
            onChange={(e) => {
              const newAlg = e.target.value as JwtEncoderState['algorithm'];
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
            <option value="none">{t('tool.jwtEncoder.noneUnsigned')}</option>
            <option value="HS256">HS256</option>
            <option value="HS384">HS384</option>
            <option value="HS512">HS512</option>
          </select>
        </div>

        {/* Secret Key Input (for HMAC) */}
        {state.algorithm !== 'none' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.jwtEncoder.secretKey')}
            </label>
            <input
              type="text"
              value={state.secretKey}
              onChange={(e) => updateState({ secretKey: e.target.value })}
              placeholder={t('tool.jwtEncoder.secretKeyPlaceholder')}
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
                {t('tool.jwtEncoder.encodedJwtToken')}
              </label>
              <button
                onClick={handleCopyToken}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title={t('common.copy')}
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
        toolName={t('tool.jwtEncoder.title')}
        isSensitive={true}
      />
    </div>
  );
};

export const jwtEncoderTool: ToolDefinition<JwtEncoderState> = {
  id: 'jwt-encoder',
  title: 'JWT Encoder',
  description: 'Encode JSON Web Tokens',
  icon: Key,
  path: '/jwt-encoder',
  keywords: ['jwt', 'token', 'encode', 'json', 'web', 'token', 'encoder', 'sign'],
  category: 'parser',
  defaultState: DEFAULT_STATE,
  Component: JwtEncoderTool,
};
