/**
 * HistorySidebar - Overlay sidebar showing request history and favorites
 * Slides in from the right edge without affecting main layout
 */

import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, Star, Trash2, Clock, MoreVertical, X, Edit2, Check, PanelRightClose, History } from 'lucide-react';
import { useI18n } from '@/hooks/useI18nHooks';
import type { HistoryItem, HttpMethod } from '../types';
import { getStatusColor } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  favorites: Set<string>;
  onSelect: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onRename: (id: string, name: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-blue-600 dark:text-blue-400',
  PUT: 'text-orange-600 dark:text-orange-400',
  PATCH: 'text-purple-600 dark:text-purple-400',
  DELETE: 'text-red-600 dark:text-red-400',
  HEAD: 'text-gray-600 dark:text-gray-400',
  OPTIONS: 'text-gray-600 dark:text-gray-400',
};

/**
 * Extract path from URL for display
 */
const getUrlPath = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
};

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return new Date(timestamp).toLocaleDateString();
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  favorites,
  onSelect,
  onToggleFavorite,
  onDelete,
  onClear,
  onRename,
  isOpen,
  onToggle,
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Reset confirm state after timeout
  useEffect(() => {
    if (confirmClear) {
      const timeout = setTimeout(() => setConfirmClear(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [confirmClear]);

  // Close context menu when clicking outside
  useEffect(() => {
    if (contextMenuId) {
      const handleClickOutside = () => setContextMenuId(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenuId]);

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  // Filter history by search
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const lower = searchTerm.toLowerCase();
    return history.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) ||
        item.request.url.toLowerCase().includes(lower) ||
        item.request.method.toLowerCase().includes(lower)
    );
  }, [history, searchTerm]);

  // Separate favorites and regular history
  const favoriteItems = useMemo(
    () => filteredHistory.filter((item) => favorites.has(item.id)),
    [filteredHistory, favorites]
  );
  const regularItems = useMemo(
    () => filteredHistory.filter((item) => !favorites.has(item.id)),
    [filteredHistory, favorites]
  );

  const handleStartRename = (item: HistoryItem) => {
    setEditingId(item.id);
    setEditName(item.name || '');
    setContextMenuId(null);
  };

  const handleSaveRename = () => {
    if (editingId) {
      onRename(editingId, editName);
      setEditingId(null);
    }
  };

  const HistoryItemComponent: React.FC<{ item: HistoryItem; isFavorite: boolean }> = ({
    item,
    isFavorite,
  }) => {
    const isEditing = editingId === item.id;

    return (
      <div
        className={cn(
          'group relative px-3 py-2 rounded-lg cursor-pointer',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors'
        )}
        onClick={() => !isEditing && onSelect(item)}
      >
        <div className="flex items-center gap-2">
          {/* Method */}
          <span className={cn('text-xs font-semibold w-12', METHOD_COLORS[item.request.method])}>
            {item.request.method}
          </span>

          {/* Status */}
          {item.response?.status && (
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                'bg-gray-100 dark:bg-gray-800',
                getStatusColor(item.response.status)
              )}
            >
              {item.response.status}
            </span>
          )}

          {/* Actions (visible on hover) */}
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
              className={cn(
                'p-1 rounded',
                isFavorite
                  ? 'text-yellow-500'
                  : 'text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
              )}
            >
              <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenuId(contextMenuId === item.id ? null : item.id);
              }}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name or URL */}
        <div className="mt-1">
          {isEditing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Request name"
                autoFocus
                className="flex-1 text-sm px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
              <button
                onClick={handleSaveRename}
                className="p-1 text-emerald-600 dark:text-emerald-400"
              >
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingId(null)} className="p-1 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {item.name || getUrlPath(item.request.url)}
            </div>
          )}
        </div>

        {/* Timing and timestamp */}
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          {item.response?.timingMs && <span>{item.response.timingMs}ms</span>}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>

        {/* Context menu */}
        {contextMenuId === item.id && (
          <div
            className={cn(
              'absolute right-2 top-full mt-1 z-10',
              'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
              'py-1 min-w-32'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleStartRename(item)}
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              {t('tool.apiTester.rename')}
            </button>
            <button
              onClick={() => {
                onDelete(item.id);
                setContextMenuId(null);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('tool.apiTester.delete')}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Collapsed state - show floating toggle button on right edge
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          'fixed right-0 top-1/2 -translate-y-1/2 z-40',
          'flex items-center gap-1.5 px-2 py-3',
          'bg-white dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700',
          'rounded-l-lg shadow-lg',
          'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400',
          'transition-colors'
        )}
        title={t('tool.apiTester.showHistory')}
      >
        <History className="w-4 h-4" />
        <span className="text-xs font-medium writing-mode-vertical">
          {t('tool.apiTester.history')}
        </span>
        {history.length > 0 && (
          <span className="ml-0.5 px-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
            {history.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-96 max-w-full z-50',
          'flex flex-col',
          'bg-white dark:bg-gray-900',
          'border-l border-gray-200 dark:border-gray-700',
          'shadow-xl',
          'animate-slide-in-right'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {t('tool.apiTester.history')}
            </h3>
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                {history.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClear}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  confirmClear
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                )}
              >
                {confirmClear ? t('common.confirmDelete') : t('tool.apiTester.clearHistory')}
              </button>
            )}
            <button
              onClick={onToggle}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              )}
              title={t('tool.apiTester.hideHistory')}
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('tool.apiTester.searchHistory')}
              className={cn(
                'w-full pl-9 pr-8 py-2 text-sm rounded-lg',
                'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
              )}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Favorites section */}
          {favoriteItems.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                <Star className="w-3 h-3" />
                {t('tool.apiTester.favorites')}
              </div>
              {favoriteItems.map((item) => (
                <HistoryItemComponent key={item.id} item={item} isFavorite={true} />
              ))}
            </div>
          )}

          {/* Regular history */}
          {regularItems.length > 0 && (
            <div className="py-2">
              {favoriteItems.length > 0 && (
                <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('tool.apiTester.recent')}
                </div>
              )}
              {regularItems.map((item) => (
                <HistoryItemComponent key={item.id} item={item} isFavorite={false} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-8">
              <Clock className="w-8 h-8 mb-2" />
              <span className="text-sm">
                {searchTerm ? t('tool.apiTester.noMatchingRequests') : t('tool.apiTester.noHistory')}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;

