import { APP_VERSION, SUPPORTED_LOCALES } from '@/lib/constants';
import { Command, Github, Keyboard } from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { buildLocalePath, getToolPathFromUrl } from '@/lib/i18nUtils';
import { useEffect, useState } from 'react';

import { AppLayout } from '@/components/layout/AppLayout';
import { CommandPalette } from '@/components/common/CommandPalette';
import { PWAUpdatePrompt } from '@/components/common/PWAUpdatePrompt';
import { Toaster } from 'sonner';
import { tools, getToolI18nKey } from '@/tools';
import { useI18n } from '@/hooks/useI18nHooks';
import { usePWA } from '@/hooks/usePWA';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useResolvedTheme } from '@/hooks/useThemeHooks';


// Pre-compute static route definitions outside of component
// This avoids recreating these arrays on every render
interface RouteDefinition {
  key: string;
  path: string;
  element: React.ReactNode;
}

const localeHomeRoutes: RouteDefinition[] = SUPPORTED_LOCALES.map((locale) => ({
  key: locale.code,
  path: `/${locale.code}`,
  element: <HomePage />,
}));

const toolRoutes: RouteDefinition[] = tools.map((tool) => ({
  key: tool.id,
  path: tool.path,
  element: <tool.Component />,
}));

const localizedToolRoutes: RouteDefinition[] = SUPPORTED_LOCALES.flatMap(
  (locale) =>
    tools.map((tool) => ({
      key: `${locale.code}-${tool.id}`,
      path: `/${locale.code}${tool.path}`,
      element: <tool.Component />,
    }))
);

// Home page component (reusable for both / and /{locale}/)
function HomePage() {
  const { locale, t } = useI18n();
  const getLocalePath = (path: string) => buildLocalePath(locale, path);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          <span>{t('homepage.title')}</span>
          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 leading-none">
            v{APP_VERSION}
          </span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          {t('homepage.heroDescription')}
        </p>

        {/* Why it exists */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('homepage.whyItExists')}
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span>
                <strong>{t('homepage.privacyFirst')}</strong> –{' '}
                {t('homepage.privacyFirstDescription')}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span>
                <strong>{t('homepage.fastEfficient')}</strong> –{' '}
                {t('homepage.fastEfficientDescription')}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span>
                <strong>{t('homepage.installablePwa')}</strong> –{' '}
                {t('homepage.installablePwaDescription')}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
              <span>
                <strong>{t('homepage.openAuditable')}</strong> –{' '}
                {t('homepage.openAuditableDescription')}
              </span>
            </li>
          </ul>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
              <p>{t('homepage.hostedOn')}</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/uyu423/yowu-devtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>{t('homepage.viewOnGithub')}</span>
                </a>
                <a
                  href="https://github.com/uyu423/yowu-devtools/stargazers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <img
                    src="https://img.shields.io/github/stars/uyu423/yowu-devtools?style=flat-square"
                    alt="GitHub stars"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Palette Feature */}
      <div className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Command className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('homepage.quickNavigation')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('homepage.quickNavigationDescription').split('{cmdK}')[0]}
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                ⌘K
              </kbd>
              {t('homepage.quickNavigationDescription')
                .split('{cmdK}')[1]
                ?.split('{ctrlK}')[0] || ' / '}
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                Ctrl+K
              </kbd>
              {t('homepage.quickNavigationDescription').split('{ctrlK}')[1] ||
                ''}
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Keyboard className="w-4 h-4" />
                {t('homepage.searchByName')}
              </span>
              <span className="flex items-center gap-1">
                <Keyboard className="w-4 h-4" />
                {t('homepage.navigateWithArrows')}
              </span>
              <span className="flex items-center gap-1">
                <Keyboard className="w-4 h-4" />
                {t('homepage.accessFavorites')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          {t('homepage.availableTools')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={getLocalePath(tool.path)}
              className="group block p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-800"
            >
              <div className="flex items-start mb-2">
                {tool.icon && (
                  <tool.icon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t(`tool.${getToolI18nKey(tool)}.description`)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const { addRecentTool } = useRecentTools();

  // Extract tool path (without locale prefix)
  const toolPath = getToolPathFromUrl(location.pathname);

  // 메인 페이지 타이틀 설정
  useEffect(() => {
    if (toolPath === '/') {
      document.title = "Yowu's DevTools | Developer Tools";
    }
  }, [toolPath]);

  // 도구 페이지 진입 시 최근 사용한 도구에 추가
  useEffect(() => {
    const currentTool = tools.find((tool) => tool.path === toolPath);
    if (currentTool) {
      addRecentTool(currentTool.id);
    }
  }, [toolPath, addRecentTool]);

  return (
    <Routes>
      {/* Home page routes */}
      <Route path="/" element={<HomePage />} />

      {/* Locale-prefixed home page routes */}
      {localeHomeRoutes.map((route) => (
        <Route key={route.key} path={route.path} element={route.element} />
      ))}

      {/* Tool routes (without locale prefix - en-US, backward compatibility) */}
      {toolRoutes.map((route) => (
        <Route key={route.key} path={route.path} element={route.element} />
      ))}

      {/* Locale-prefixed tool routes */}
      {localizedToolRoutes.map((route) => (
        <Route key={route.key} path={route.path} element={route.element} />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  // PWA 기능 (업데이트 알림, 설치 프롬프트, 오프라인 감지)
  const pwa = usePWA();
  const resolvedTheme = useResolvedTheme();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Command Palette keyboard shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for ⌘K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppLayout>
      <Toaster
        position="bottom-center"
        theme={resolvedTheme}
        toastOptions={{
          classNames: {
            toast:
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
            success:
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            error:
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            info: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          },
        }}
      />
      <AppContent />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <PWAUpdatePrompt
        needRefresh={pwa.needRefresh}
        offlineReady={pwa.offlineReady}
        isOnline={pwa.isOnline}
        onUpdate={pwa.updateServiceWorker}
        onClose={pwa.closePrompt}
        onCloseInstall={pwa.closeInstallPrompt}
        onInstall={pwa.installApp}
        isInstallable={pwa.isInstallable}
      />
    </AppLayout>
  );
}

export default App;
