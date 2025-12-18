import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tools, getToolI18nKey } from '@/tools';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useI18n } from '@/hooks/useI18nHooks';
import { buildLocalePath } from '@/lib/i18nUtils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  tool: (typeof tools)[0];
  matchScore: number;
  matchType: 'title' | 'keyword' | 'description';
}

/**
 * Simple fuzzy search function
 * Returns a score based on how well the query matches the text
 */
function fuzzyMatch(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match
  if (textLower === queryLower) return 100;

  // Starts with query
  if (textLower.startsWith(queryLower)) return 80;

  // Contains query
  if (textLower.includes(queryLower)) return 60;

  // Check if all characters in query appear in order in text
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }
  if (queryIndex === queryLower.length) return 40;

  return 0;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentTools } = useRecentTools();
  const { locale, t } = useI18n();

  // Helper function to build locale-aware path
  const getLocalePath = useCallback(
    (path: string) => buildLocalePath(locale, path),
    [locale]
  );

  // Search results
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) {
      // No query: show recent tools first, then favorites, then all tools
      const recentToolIds = new Set(recentTools.map((rt) => rt.toolId));
      const favoriteIds = new Set(favorites);

      const recent = tools
        .filter((tool) => recentToolIds.has(tool.id))
        .map((tool) => ({
          tool,
          matchScore: 100,
          matchType: 'title' as const,
        }));

      const favorite = tools
        .filter(
          (tool) => favoriteIds.has(tool.id) && !recentToolIds.has(tool.id)
        )
        .map((tool) => ({ tool, matchScore: 90, matchType: 'title' as const }));

      const others = tools
        .filter(
          (tool) => !recentToolIds.has(tool.id) && !favoriteIds.has(tool.id)
        )
        .map((tool) => ({ tool, matchScore: 0, matchType: 'title' as const }));

      return [...recent, ...favorite, ...others];
    }

    const queryLower = query.toLowerCase();
    const scored: SearchResult[] = [];

    for (const tool of tools) {
      let maxScore = 0;
      let matchType: 'title' | 'keyword' | 'description' = 'title';

      // Match title
      const titleScore = fuzzyMatch(queryLower, tool.title);
      if (titleScore > maxScore) {
        maxScore = titleScore;
        matchType = 'title';
      }

      // Match keywords
      if (tool.keywords) {
        for (const keyword of tool.keywords) {
          const keywordScore = fuzzyMatch(queryLower, keyword);
          if (keywordScore > maxScore) {
            maxScore = keywordScore;
            matchType = 'keyword';
          }
        }
      }

      // Match description
      const descScore = fuzzyMatch(queryLower, tool.description);
      if (descScore > maxScore) {
        maxScore = descScore;
        matchType = 'description';
      }

      // Match ID
      const idScore = fuzzyMatch(queryLower, tool.id);
      if (idScore > maxScore) {
        maxScore = idScore;
        matchType = 'keyword';
      }

      if (maxScore > 0) {
        scored.push({ tool, matchScore: maxScore, matchType });
      }
    }

    // Sort by score (descending)
    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }, [query, favorites, recentTools]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;

    const selectedItem = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null;

    if (selectedItem) {
      selectedItem.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Reset query when opening
      if (query) {
        setQuery('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }

      if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          navigate(getLocalePath(selected.tool.path));
          onClose();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onClose, getLocalePath]);

  if (!isOpen) return null;

  const handleToolClick = (tool: (typeof tools)[0]) => {
    navigate(getLocalePath(tool.path));
    onClose();
  };

  const handleFavoriteToggle = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    toggleFavorite(toolId);
  };

  const isRecentTool = (toolId: string) => {
    return recentTools.some((rt) => rt.toolId === toolId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />

      {/* Palette */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('commandPalette.searchTools')}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
          />
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {t('commandPalette.noResults')}
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => {
                const tool = result.tool;
                const isSelected = index === selectedIndex;
                const isFav = isFavorite(tool.id);
                const isRecent = isRecentTool(tool.id);

                return (
                  <div
                    key={tool.id}
                    data-index={index}
                    onClick={() => handleToolClick(tool)}
                    className={cn(
                      'flex items-center px-4 py-3 cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    )}
                  >
                    {tool.icon && (
                      <tool.icon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tool.title}
                        </span>
                        {isRecent && (
                          <span title={t('commandPalette.recent')}>
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                          </span>
                        )}
                        {isFav && (
                          <span title={t('commandPalette.favorites')}>
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {t(`tool.${getToolI18nKey(tool)}.description`)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleFavoriteToggle(e, tool.id)}
                      className={cn(
                        'ml-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
                        isFav && 'bg-yellow-50 dark:bg-yellow-900/20'
                      )}
                      title={
                        isFav
                          ? t('commandPalette.removeFromFavorites')
                          : t('commandPalette.addToFavorites')
                      }
                    >
                      <Star
                        className={cn(
                          'w-4 h-4',
                          isFav && 'fill-yellow-400 text-yellow-400'
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
              ↑↓
            </kbd>{' '}
            {t('commandPalette.navigate')}{' '}
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
              Enter
            </kbd>{' '}
            {t('commandPalette.select')}{' '}
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
              Esc
            </kbd>{' '}
            {t('commandPalette.close')}
          </span>
        </div>
      </div>
    </div>
  );
};
