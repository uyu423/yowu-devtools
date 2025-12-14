import { useEffect, useState } from 'react';
// @ts-expect-error - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

interface UsePWAResult {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => Promise<void>;
  closePrompt: () => void;
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
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
      onRegistered(registration: ServiceWorkerRegistration | undefined) {
        console.log('Service Worker registered:', registration);
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
    isInstallable,
    installApp,
    isOnline,
  };
}

