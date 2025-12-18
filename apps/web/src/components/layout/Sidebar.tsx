import { ArrowDownAZ, Clock, ExternalLink, Hash, Laptop, Moon, Sparkles, Star, Sun, TrendingUp, X } from 'lucide-react';
import { getToolById, tools } from '@/tools';

import { LanguageSelector } from '@/components/common/LanguageSelector';
import { Tooltip } from '@/components/ui/Tooltip';
import { NavLink } from 'react-router-dom';
import React from 'react';
import { buildLocalePath } from '@/lib/i18nUtils';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/yowu-logo.jpeg';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/hooks/useI18nHooks';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useTheme } from '@/hooks/useThemeHooks';

// 정렬 타입 정의
type SortType = 'alphabetical' | 'added' | 'newest';
const SORT_STORAGE_KEY = 'yowu-devtools:v1:app:toolSort';
const SORT_CYCLE: SortType[] = ['alphabetical', 'added', 'newest'];

interface SidebarProps {
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { theme, setTheme } = useTheme();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentTools } = useRecentTools();
  const { t, locale } = useI18n();

  // 정렬 상태 (localStorage에서 초기값 로드, 기본값: alphabetical)
  const [sortType, setSortType] = React.useState<SortType>(() => {
    if (typeof window === 'undefined') return 'alphabetical';
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    return (saved as SortType) || 'alphabetical';
  });

  // 정렬 순환 함수
  const cycleSortType = () => {
    const currentIndex = SORT_CYCLE.indexOf(sortType);
    const nextIndex = (currentIndex + 1) % SORT_CYCLE.length;
    const nextSort = SORT_CYCLE[nextIndex];
    setSortType(nextSort);
    localStorage.setItem(SORT_STORAGE_KEY, nextSort);
  };

  // 정렬 아이콘 및 라벨 매핑
  const sortConfig = {
    alphabetical: {
      icon: ArrowDownAZ,
      label: t('sidebar.sortAlphabetical'),
    },
    added: {
      icon: Hash,
      label: t('sidebar.sortAdded'),
    },
    newest: {
      icon: TrendingUp,
      label: t('sidebar.sortNewest'),
    },
  };

  // Helper function to build locale-aware path
  const getLocalePath = (path: string) => buildLocalePath(locale, path);

  // 즐겨찾기 도구 목록
  const favoriteTools = favorites
    .map((id) => getToolById(id))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined);

  // 최근 사용한 도구 목록
  const recentToolItems = recentTools
    .map(({ toolId }) => getToolById(toolId))
    .filter((tool): tool is NonNullable<typeof tool> => tool !== undefined);

  // All Tools: 정렬된 도구 목록
  const sortedTools = React.useMemo(() => {
    const toolsCopy = [...tools];
    switch (sortType) {
      case 'alphabetical':
        return toolsCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'added':
        // 원래 순서 유지 (tools 배열의 순서)
        return tools;
      case 'newest':
        // 역순 (최신이 위)
        return toolsCopy.reverse();
      default:
        return toolsCopy;
    }
  }, [sortType]);

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900 dark:border-gray-800 transition-colors">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b shrink-0 bg-white dark:bg-gray-900 dark:border-gray-800 dark:text-white transition-colors">
        <div className="flex items-center space-x-3">
          <a
            href="https://yowu.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700"
            title={t('sidebar.goToYowuDev')}
          >
            <img
              src={logoImg}
              alt="yowu"
              className="w-full h-full object-cover"
            />
          </a>
          <NavLink
            to={getLocalePath('/')}
            onClick={onCloseMobile}
            className="font-bold text-lg tracking-tight whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {t('sidebar.appName')}
          </NavLink>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-4 px-3">
          {/* 즐겨찾기 섹션 */}
          {favoriteTools.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {t('sidebar.favorites')}
              </div>
              <div className="space-y-1 mt-1">
                {favoriteTools.map((tool) => (
                  <NavLink
                    key={tool.id}
                    to={getLocalePath(tool.path)}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      )
                    }
                  >
                    {tool.icon && (
                      <tool.icon className="w-4 h-4 mr-3 opacity-70" />
                    )}
                    <span className="flex-1">{tool.title}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
                      title={t('sidebar.removeFromFavorites')}
                    >
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </button>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* 최근 사용한 도구 섹션 */}
          {recentToolItems.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {t('sidebar.recentTools')}
              </div>
              <div className="space-y-1 mt-1">
                {recentToolItems.map((tool) => (
                  <NavLink
                    key={tool.id}
                    to={getLocalePath(tool.path)}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      )
                    }
                  >
                    {tool.icon && (
                      <tool.icon className="w-4 h-4 mr-3 opacity-70" />
                    )}
                    <span className="flex-1">{tool.title}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className={cn(
                        'opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity',
                        isFavorite(tool.id) && 'opacity-100'
                      )}
                      title={
                        isFavorite(tool.id)
                          ? t('sidebar.removeFromFavorites')
                          : t('sidebar.addToFavorites')
                      }
                    >
                      <Star
                        className={cn(
                          'w-3.5 h-3.5',
                          isFavorite(tool.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : ''
                        )}
                      />
                    </button>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* 전체 도구 리스트 */}
          {tools.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {t('sidebar.noToolsLoaded')}
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>{t('sidebar.allTools')}</span>
                <Tooltip content={sortConfig[sortType].label} position="bottom" align="right" nowrap>
                  <button
                    onClick={cycleSortType}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {React.createElement(sortConfig[sortType].icon, { className: 'w-3 h-3' })}
                  </button>
                </Tooltip>
              </div>
              <div className="space-y-1 mt-1">
                {sortedTools.map((tool) => (
                  <NavLink
                    key={tool.id}
                    to={getLocalePath(tool.path)}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      )
                    }
                  >
                    {tool.icon && (
                      <tool.icon className="w-4 h-4 mr-3 opacity-70" />
                    )}
                    <span className="flex-1">{tool.title}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.id);
                      }}
                      className={cn(
                        'opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity',
                        isFavorite(tool.id) && 'opacity-100'
                      )}
                      title={
                        isFavorite(tool.id)
                          ? t('sidebar.removeFromFavorites')
                          : t('sidebar.addToFavorites')
                      }
                    >
                      <Star
                        className={cn(
                          'w-3.5 h-3.5',
                          isFavorite(tool.id)
                            ? 'fill-yellow-400 text-yellow-400'
                            : ''
                        )}
                      />
                    </button>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Coming Soon Badge & Feature Request */}
        <div className="mt-6 px-4 flex flex-col items-center gap-2">
          <div
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 dark:from-purple-900/30 dark:to-blue-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 cursor-help transition-all hover:scale-105"
            title={t('sidebar.moreComingSoon')}
          >
            <Sparkles className="w-3 h-3 mr-1.5 animate-pulse" />
            <span>{t('sidebar.moreComingSoon')}</span>
          </div>
          <a
            href="https://github.com/uyu423/yowu-devtools/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <span>{t('sidebar.suggestFeature')}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Footer / Language & Theme */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors space-y-3">
        {/* License Info */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
          <a
            href="https://github.com/uyu423/yowu-devtools/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="GPL-3.0-or-later"
          >
            {t('sidebar.license')}
          </a>
          <span>·</span>
          <a
            href="https://github.com/uyu423/yowu-devtools"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {t('sidebar.sourceCode')}
          </a>
          <span>·</span>
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html#section15"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {t('sidebar.noWarranty')}
          </a>
        </div>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Theme Toggle */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all',
              theme === 'light'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            )}
            title={t('sidebar.lightMode')}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all',
              theme === 'system'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            )}
            title={t('sidebar.systemMode')}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all',
              theme === 'dark'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            )}
            title={t('sidebar.darkMode')}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
