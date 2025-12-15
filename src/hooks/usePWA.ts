import { useCallback, useEffect, useRef, useState } from 'react';
// @ts-expect-error - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// 업데이트 체크 간격 (밀리초)
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1시간

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
 *
 * @see https://vite-pwa-org.netlify.app/guide/prompt-for-update.html
 * @see https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
 */
export function usePWA(): UsePWAResult {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  /**
   * Service Worker 업데이트 체크
   * - 오프라인이면 스킵
   * - 에러 발생 시 조용히 실패
   */
  const checkForUpdates = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration) return;

    // 오프라인이면 업데이트 체크 스킵
    if (!navigator.onLine) {
      console.log('[PWA] Skipping update check - offline');
      return;
    }

    try {
      await registration.update();
      console.log('[PWA] Update check completed');
    } catch (error) {
      // 서버 다운 등의 이유로 실패해도 조용히 처리
      console.warn('[PWA] Update check failed:', error);
    }
  }, []);

  useEffect(() => {
    // Service Worker 등록 및 업데이트 감지
    // onRegisteredSW 사용 (v0.12.8+, onRegistered 대체)
    const updateSWFn = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New content available - refresh needed');
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline');
        setOfflineReady(true);
      },
      onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
        console.log('[PWA] Service Worker registered:', swUrl);

        if (registration) {
          registrationRef.current = registration;

          // 주기적 업데이트 체크 설정
          // Edge case 처리: 온라인/오프라인 상태에 따라 동적 처리
          intervalRef.current = setInterval(() => {
            checkForUpdates();
          }, UPDATE_CHECK_INTERVAL);

          // 앱이 포커스를 받을 때 업데이트 체크 (페이지 전환, 탭 전환 등)
          const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
              console.log('[PWA] App became visible - checking for updates');
              checkForUpdates();
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);

          // 온라인 상태가 되면 업데이트 체크
          const handleOnline = () => {
            console.log('[PWA] Back online - checking for updates');
            checkForUpdates();
          };
          window.addEventListener('online', handleOnline);

          // 클린업
          return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleOnline);
          };
        }
      },
      onRegisterError(error: Error) {
        console.error('[PWA] Service Worker registration error:', error);
      },
    });

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
      // 인터벌 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [checkForUpdates]);

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

