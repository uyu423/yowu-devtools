import React from 'react';
import { RefreshCw, X, Download, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface PWAUpdatePromptProps {
  needRefresh: boolean;
  offlineReady: boolean;
  isOnline: boolean;
  onUpdate: () => Promise<void>;
  onClose: () => void;
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
  onInstall,
  isInstallable = false,
}) => {
  // 오프라인 준비 완료 알림 (한 번만 표시)
  React.useEffect(() => {
    if (offlineReady) {
      toast.success('App is ready to work offline', {
        duration: 3000,
      });
    }
  }, [offlineReady]);

  // 오프라인 상태 알림
  React.useEffect(() => {
    if (!isOnline) {
      toast.info('You are currently offline', {
        duration: 5000,
        icon: <WifiOff className="w-4 h-4" />,
      });
    }
  }, [isOnline]);

  if (!needRefresh && !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {needRefresh && (
        <div className="mb-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                New version available
              </h3>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                A new version of the app is available. Update now to get the latest features.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onUpdate}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Update now
                </button>
                <button
                  onClick={onClose}
                  className="rounded-md border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isInstallable && onInstall && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Install App
              </h3>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Install this app on your device for quick access and offline use.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onInstall}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={onClose}
                  className="rounded-md border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

