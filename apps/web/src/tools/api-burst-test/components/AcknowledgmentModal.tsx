/**
 * AcknowledgmentModal - Required confirmation before first test run
 */

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';

interface AcknowledgmentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AcknowledgmentModal: React.FC<AcknowledgmentModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const { t } = useI18n();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [ipChecked, setIpChecked] = useState(false);

  if (!isOpen) return null;

  const canConfirm = permissionChecked && ipChecked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-md mx-4 p-6 rounded-xl',
        'bg-white dark:bg-gray-800',
        'shadow-2xl',
        'animate-in fade-in zoom-in-95 duration-200'
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('tool.apiBurstTest.acknowledgment.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tool.apiBurstTest.acknowledgment.subtitle')}
            </p>
          </div>
        </div>

        {/* Warning message */}
        <div className={cn(
          'p-3 rounded-lg mb-4',
          'bg-amber-50 dark:bg-amber-900/20',
          'border border-amber-200 dark:border-amber-800'
        )}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('tool.apiBurstTest.acknowledgment.warning')}
            </p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={permissionChecked}
              onChange={(e) => setPermissionChecked(e.target.checked)}
              className={cn(
                'w-5 h-5 mt-0.5 rounded',
                'border-gray-300 dark:border-gray-600',
                'text-blue-600 focus:ring-blue-500 focus:ring-offset-0'
              )}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
              {t('tool.apiBurstTest.acknowledgment.permission')}
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={ipChecked}
              onChange={(e) => setIpChecked(e.target.checked)}
              className={cn(
                'w-5 h-5 mt-0.5 rounded',
                'border-gray-300 dark:border-gray-600',
                'text-blue-600 focus:ring-blue-500 focus:ring-offset-0'
              )}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
              {t('tool.apiBurstTest.acknowledgment.ipVisible')}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium',
              'text-gray-700 dark:text-gray-300',
              'bg-gray-100 dark:bg-gray-700',
              'hover:bg-gray-200 dark:hover:bg-gray-600',
              'transition-colors'
            )}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium',
              'text-white',
              'bg-blue-600 hover:bg-blue-700',
              'disabled:bg-gray-300 dark:disabled:bg-gray-600',
              'disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {t('tool.apiBurstTest.acknowledgment.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgmentModal;

