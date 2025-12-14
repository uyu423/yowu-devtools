import { useEffect, useState } from 'react';
// @ts-expect-error - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

interface UsePWAResult {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  closePrompt: () => void;
  closeInstallPrompt: () => void;
  isInstallable: boolean;
  installApp: () => Promise<void>;
  isOnline: boolean;
}

/**
 * PWA 기능을 관리하는 커스텀 훅
 * - Service Worker 업데이트 감지
 * - 앱 설치 프롬프트
 * - 오프라인 상태 감지
 */
export function usePWA(): UsePWAResult {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Service Worker 등록 및 업데이트 감지
    const updateSWFn = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('Service Worker update available - refresh needed');
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('Service Worker offline ready');
        setOfflineReady(true);
      },
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        console.log('Service Worker registered:', registration);
        
        // Service Worker 업데이트 감지 (추가 보장)
        if (registration) {
          // 주기적으로 업데이트 확인 (1시간마다)
          setInterval(() => {
            registration.update().catch((error) => {
              console.error('Failed to check for updates:', error);
            });
          }, 60 * 60 * 1000); // 1시간

          // Service Worker 업데이트 발견 시 알림
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 새 버전이 설치되었고, 현재 활성화된 Service Worker가 있으면 업데이트 필요
                  console.log('New Service Worker installed - refresh needed');
                  setNeedRefresh(true);
                }
              });
            }
          });
        }
      },
      onRegisterError(error: Error) {
        console.error('Service Worker registration error:', error);
      },
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUpdateSW(() => updateSWFn);

    // 네트워크 상태 감지
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 앱 설치 가능 여부 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
      // 이벤트를 저장하여 나중에 사용
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const updateServiceWorker = async () => {
    if (updateSW) {
      await updateSW();
      setNeedRefresh(false);
      // 페이지 새로고침
      window.location.reload();
    }
  };

  const closePrompt = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  const closeInstallPrompt = () => {
    setIsInstallable(false);
  };

  const installApp = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deferredPrompt = (window as any).deferredPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setIsInstallable(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).deferredPrompt = null;
    }
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    closePrompt,
    closeInstallPrompt,
    isInstallable,
    installApp,
    isOnline,
  };
}

