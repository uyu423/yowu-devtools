/**
 * HistorySidebar - Right sidebar showing request history and favorites
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, Star, Trash2, Clock, MoreVertical, X, Edit2, Check } from 'lucide-react';
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
  isOpen?: boolean;
  onClose?: () => void;
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
  isOpen = true,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

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
              Rename
            </button>
            <button
              onClick={() => {
                onDelete(item.id);
                setContextMenuId(null);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-72 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">History</h3>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history..."
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-sm rounded-lg',
              'bg-gray-100 dark:bg-gray-800',
              'border border-transparent focus:border-blue-500 dark:focus:border-blue-400',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none'
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Favorites section */}
        {favoriteItems.length > 0 && (
          <div className="py-2">
            <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Favorites
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
              <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Recent
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
              {searchTerm ? 'No matching requests' : 'No requests yet'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;

