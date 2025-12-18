/**
 * CorsModal - Modal shown when CORS error is detected
 *
 * Features:
 * - Explains why CORS errors occur and why extension is needed
 * - Option to remember choice for the domain
 * - Mobile detection: shows message that extension is not available on mobile
 * - i18n support
 */

import { AlertTriangle, Check, ExternalLink, Info, Monitor, X, Zap } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { EXTENSION_STORE_URL } from '../constants';
import type { ExtensionStatus } from '../types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';

/**
 * Detect if the device is mobile
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface CorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryWithExtension: (rememberChoice: boolean) => void;
  extensionStatus: ExtensionStatus;
  targetUrl?: string;
}

/**
 * Extract origin from URL for display
 */
const getOriginFromUrl = (url?: string): string | null => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export const CorsModal: React.FC<CorsModalProps> = ({
  isOpen,
  onClose,
  onRetryWithExtension,
  extensionStatus,
  targetUrl,
}) => {
  const { t } = useI18n();
  const [rememberChoice, setRememberChoice] = useState(true);
  const isMobile = useMemo(() => isMobileDevice(), []);

  if (!isOpen) return null;

  const isExtensionAvailable =
    extensionStatus === 'connected' ||
    extensionStatus === 'permission-required';
  const origin = getOriginFromUrl(targetUrl);

  const handleRetry = () => {
    onRetryWithExtension(rememberChoice);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('tool.apiTester.corsErrorTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Main description */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('tool.apiTester.corsErrorDescription')}
          </p>

          {/* Explanation box */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('tool.apiTester.corsErrorExplanation')}
              </p>
              <details className="mt-2 text-sm">
                <summary className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium">
                  {t('tool.apiTester.corsWhyExtension')}
                </summary>
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  {t('tool.apiTester.corsWhyExtensionDesc')}
                </p>
              </details>
            </div>
          </div>

          {/* Mobile warning */}
          {isMobile && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <Monitor className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('tool.apiTester.corsMobileNotSupported')}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {t('tool.apiTester.corsMobileUseDesktop')}
                </p>
              </div>
            </div>
          )}

          {/* Remember choice checkbox */}
          {!isMobile && isExtensionAvailable && origin && (
            <label className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={rememberChoice}
                  onChange={(e) => setRememberChoice(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                    rememberChoice
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                  )}
                >
                  {rememberChoice && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('tool.apiTester.corsRememberChoice')}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('tool.apiTester.corsRememberChoiceDesc').replace(
                    '{origin}',
                    origin
                  )}
                </span>
              </div>
            </label>
          )}

          {/* Learn more link */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              {t('tool.apiTester.learnMoreCors')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {isMobile ? t('common.ok') : t('common.cancel')}
          </button>
          {!isMobile && (
            isExtensionAvailable ? (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors"
              >
                <Zap className="w-4 h-4" />
                {t('tool.apiTester.corsRetryWithExtension')}
              </button>
            ) : (
              <a
                href={EXTENSION_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors"
              >
                {t('tool.apiTester.corsInstallExtension')}
                <ExternalLink className="w-4 h-4" />
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CorsModal;
