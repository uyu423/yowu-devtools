import React from 'react';
import { X, Share2, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/hooks/useI18nHooks';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  includedFields: string[];
  excludedFields?: string[];
  isSensitive?: boolean;
  toolName: string;
  /** Whether the user is on a mobile device (affects button text) */
  isMobile?: boolean;
}

/**
 * ShareModal component for showing what data will be included in share links
 */
export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  includedFields,
  excludedFields = [],
  isSensitive = false,
  toolName,
  isMobile = false,
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

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
            <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('shareModal.title').replace('{toolName}', toolName)}
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
          {isSensitive && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('shareModal.sensitiveWarningTitle')}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {t('shareModal.sensitiveWarningDescription')}
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('shareModal.includedInShareLink')}
            </p>
            <ul className="space-y-1">
              {includedFields.map((field) => (
                <li
                  key={field}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {field}
                  </code>
                </li>
              ))}
            </ul>
          </div>

          {excludedFields.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('shareModal.excludedUiOnly')}
              </p>
              <ul className="space-y-1">
                {excludedFields.map((field) => (
                  <li
                    key={field}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {field}
                    </code>
                    <span className="text-xs italic">({t('shareModal.notShared')})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('shareModal.footerNote')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-md transition-colors"
          >
            {isMobile
              ? t('shareModal.generateShareLink')
              : t('shareModal.copyLink')}
          </button>
        </div>
      </div>
    </div>
  );
};

