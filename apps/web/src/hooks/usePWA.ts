import { useCallback, useEffect, useRef, useState } from 'react';
// @ts-expect-error - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';
import { APP_VERSION } from '@/lib/constants';

// 업데이트 체크 간격 (밀리초)
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1시간
// 버전 체크 간격 (밀리초) - Service Worker보다 더 자주 체크
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5분
// 팝업 숨기기 기간 (밀리초)
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24시간

// localStorage 키
const STORAGE_KEY_UPDATE_DISMISSED = 'yowu-devtools:v1:pwa:updateDismissedUntil';
const STORAGE_KEY_INSTALL_DISMISSED = 'yowu-devtools:v1:pwa:installDismissedUntil';

/**
 * localStorage에서 숨기기 만료 시간 확인
 */
function isDismissedUntil(key: string): boolean {
  try {
    const dismissedUntil = localStorage.getItem(key);
    if (dismissedUntil) {
      const expiry = parseInt(dismissedUntil, 10);
      if (Date.now() < expiry) {
        return true; // 아직 숨기기 기간 중
      }
      // 만료되었으면 제거
      localStorage.removeItem(key);
    }
  } catch {
    // localStorage 접근 오류 무시
  }
  return false;
}

/**
 * localStorage에 숨기기 만료 시간 저장
 */
function setDismissedUntil(key: string): void {
  try {
    const expiry = Date.now() + DISMISS_DURATION;
    localStorage.setItem(key, expiry.toString());
  } catch {
    // localStorage 접근 오류 무시
  }
}

interface VersionInfo {
  version: string;
  buildTime: string;
}

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
 * - version.json 기반 업데이트 감지 (보조)
 * - 앱 설치 프롬프트
 * - 오프라인 상태 감지
 *
 * @see https://vite-pwa-org.netlify.app/guide/prompt-for-update.html
 * @see https://vite-pwa-org.netlify.app/guide/periodic-sw-updates.html
 */
export function usePWA(): UsePWAResult {
  // 초기 상태: localStorage에서 숨기기 상태 확인
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const versionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  
  // 실제 업데이트 가능 상태 (내부 추적용)
  const hasUpdateRef = useRef(false);

  /**
   * version.json을 조회하여 서버 버전과 현재 앱 버전 비교
   * - 버전이 다르면 업데이트 알림 표시
   * - 캐시를 우회하기 위해 타임스탬프 쿼리 파라미터 추가
   */
  const checkVersionUpdate = useCallback(async () => {
    // 오프라인이면 스킵
    if (!navigator.onLine) {
      console.log('[PWA] Skipping version check - offline');
      return;
    }

    try {
      // 캐시 우회를 위해 타임스탬프 추가
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn('[PWA] Version check failed - response not ok');
        return;
      }

      const serverVersion: VersionInfo = await response.json();
      console.log(`[PWA] Version check: server=${serverVersion.version}, client=${APP_VERSION}`);

      // 버전이 다르면 업데이트 알림 (숨기기 상태가 아닐 때만)
      if (serverVersion.version !== APP_VERSION) {
        console.log('[PWA] New version detected via version.json');
        hasUpdateRef.current = true;
        if (!isDismissedUntil(STORAGE_KEY_UPDATE_DISMISSED)) {
          setNeedRefresh(true);
        }
      }
    } catch (error) {
      // 네트워크 오류 등은 조용히 처리 (개발 환경에서는 version.json이 없을 수 있음)
      console.warn('[PWA] Version check failed:', error);
    }
  }, []);

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
    // 앱 기동 시 즉시 버전 체크 (Service Worker 등록과 별개로)
    // 약간의 지연을 두어 초기 렌더링 완료 후 체크
    const initialCheckTimeout = setTimeout(() => {
      checkVersionUpdate();
    }, 1000);

    // 주기적 버전 체크 설정 (Service Worker 체크보다 더 자주)
    versionIntervalRef.current = setInterval(() => {
      checkVersionUpdate();
    }, VERSION_CHECK_INTERVAL);

    // Service Worker 등록 및 업데이트 감지
    // onRegisteredSW 사용 (v0.12.8+, onRegistered 대체)
    const updateSWFn = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New content available - refresh needed');
        hasUpdateRef.current = true;
        // 숨기기 상태가 아닐 때만 알림 표시
        if (!isDismissedUntil(STORAGE_KEY_UPDATE_DISMISSED)) {
          setNeedRefresh(true);
        }
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline');
        setOfflineReady(true);
      },
      onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
        console.log('[PWA] Service Worker registered:', swUrl);

        if (registration) {
          registrationRef.current = registration;

          // 주기적 Service Worker 업데이트 체크 설정
          // Edge case 처리: 온라인/오프라인 상태에 따라 동적 처리
          intervalRef.current = setInterval(() => {
            checkForUpdates();
          }, UPDATE_CHECK_INTERVAL);

          // 앱이 포커스를 받을 때 업데이트 체크 (페이지 전환, 탭 전환 등)
          const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
              console.log('[PWA] App became visible - checking for updates');
              checkForUpdates();
              checkVersionUpdate(); // 버전 체크도 함께 수행
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);

          // 온라인 상태가 되면 업데이트 체크
          const handleOnline = () => {
            console.log('[PWA] Back online - checking for updates');
            checkForUpdates();
            checkVersionUpdate(); // 버전 체크도 함께 수행
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
      // 이벤트를 저장하여 나중에 사용
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).deferredPrompt = e;
      // 숨기기 상태가 아닐 때만 설치 프롬프트 표시
      if (!isDismissedUntil(STORAGE_KEY_INSTALL_DISMISSED)) {
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      // 타임아웃 및 인터벌 정리
      clearTimeout(initialCheckTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (versionIntervalRef.current) {
        clearInterval(versionIntervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [checkForUpdates, checkVersionUpdate]);

  const updateServiceWorker = async () => {
    if (updateSW) {
      // true를 전달하여 새 Service Worker에 skipWaiting 메시지를 보내고 활성화
      // updateSW(true)는 자동으로 페이지 reload를 수행함
      await updateSW(true);
      setNeedRefresh(false);
      // Note: updateSW(true)가 reload를 처리하므로 별도의 reload 불필요
    }
  };

  const closePrompt = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
    // 하루 동안 업데이트 알림 숨기기
    setDismissedUntil(STORAGE_KEY_UPDATE_DISMISSED);
    console.log('[PWA] Update prompt dismissed for 24 hours');
  };

  const closeInstallPrompt = () => {
    setIsInstallable(false);
    // 하루 동안 설치 알림 숨기기
    setDismissedUntil(STORAGE_KEY_INSTALL_DISMISSED);
    console.log('[PWA] Install prompt dismissed for 24 hours');
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

