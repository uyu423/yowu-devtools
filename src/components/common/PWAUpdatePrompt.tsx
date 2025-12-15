import React from 'react';
import { RefreshCw, X, Download, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/hooks/useI18nHooks';

interface PWAUpdatePromptProps {
  needRefresh: boolean;
  offlineReady: boolean;
  isOnline: boolean;
  onUpdate: () => Promise<void>;
  onClose: () => void;
  onCloseInstall?: () => void;
  onInstall?: () => Promise<void>;
  isInstallable?: boolean;
}

/**
 * PWA 업데이트 및 설치 프롬프트 컴포넌트
 */
export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  needRefresh,
  offlineReady,
  isOnline,
  onUpdate,
  onClose,
  onCloseInstall,
  onInstall,
  isInstallable = false,
}) => {
  const { t } = useI18n();

  // 오프라인 준비 완료 알림 (한 번만 표시)
  React.useEffect(() => {
    if (offlineReady) {
      toast.success(t('pwa.appReadyOffline'), {
        duration: 3000,
      });
    }
  }, [offlineReady, t]);

  // 오프라인 상태 알림
  React.useEffect(() => {
    if (!isOnline) {
      toast.info(t('pwa.youAreOffline'), {
        duration: 5000,
        icon: <WifiOff className="w-4 h-4" />,
      });
    }
  }, [isOnline, t]);

  if (!needRefresh && !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 max-w-sm md:max-w-sm mx-auto md:mx-0">
      {needRefresh && (
        <div className="mb-2 rounded-lg border border-blue-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-white">
                {t('pwa.newVersionAvailable')}
              </h3>
              <p className="mt-1 text-xs text-blue-700 dark:text-gray-300">
                {t('pwa.newVersionDescription')}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onUpdate}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  {t('pwa.updateNow')}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-md border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('pwa.later')}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-blue-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isInstallable && onInstall && (
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-white">
                {t('pwa.installApp')}
              </h3>
              <p className="mt-1 text-xs text-indigo-700 dark:text-gray-300">
                {t('pwa.installAppDescription')}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onInstall}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  {t('pwa.install')}
                </button>
                <button
                  onClick={onCloseInstall}
                  className="rounded-md border border-indigo-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('pwa.notNow')}
                </button>
              </div>
            </div>
            <button
              onClick={onCloseInstall}
              className="flex-shrink-0 text-indigo-400 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

