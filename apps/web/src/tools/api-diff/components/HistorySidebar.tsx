/**
 * HistorySidebar - Overlay sidebar showing request history
 * Similar to API Tester's history sidebar but as an overlay that doesn't affect layout
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Trash2,
  Clock,
  X,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18nHooks';
import type { HistoryItem, HttpMethod } from '../types';

interface HistorySidebarProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-blue-600 dark:text-blue-400',
  PUT: 'text-amber-600 dark:text-amber-400',
  PATCH: 'text-purple-600 dark:text-purple-400',
  DELETE: 'text-red-600 dark:text-red-400',
};

const formatDate = (ts: number): string => {
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
};

const extractMethod = (name: string): HttpMethod | null => {
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  for (const method of methods) {
    if (name.startsWith(method + ' ')) {
      return method;
    }
  }
  return null;
};

const extractPath = (name: string): string => {
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  for (const method of methods) {
    if (name.startsWith(method + ' ')) {
      return name.substring(method.length + 1);
    }
  }
  return name;
};

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  items,
  onSelect,
  onDelete,
  onClearAll,
  isOpen,
  onToggle,
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(term));
  }, [items, searchTerm]);

  const handleClearAll = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  // Collapsed state - show toggle button
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
        title={t('tool.apiDiff.history.show')}
      >
        <PanelRightOpen className="w-4 h-4" />
        <span className="text-xs font-medium writing-mode-vertical">
          {t('tool.apiDiff.history.title')}
        </span>
        {items.length > 0 && (
          <span className="ml-0.5 px-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
            {items.length}
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
          'fixed right-0 top-0 h-full w-96 z-50',
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
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {t('tool.apiDiff.history.title')}
            </h3>
            {items.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                {items.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  confirmClear
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
                )}
              >
                {confirmClear
                  ? t('tool.apiDiff.history.confirmClear')
                  : t('tool.apiDiff.history.clearAll')}
              </button>
            )}
            <button
              onClick={onToggle}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              )}
              title={t('tool.apiDiff.history.hide')}
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
              placeholder={t('tool.apiDiff.history.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-9 pr-3 py-2 text-sm',
                'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'rounded-lg',
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
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-8">
              <Clock className="w-8 h-8 mb-2" />
              <span className="text-sm">
                {searchTerm
                  ? t('tool.apiDiff.history.noMatch')
                  : t('tool.apiDiff.history.empty')}
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredItems.map((item) => {
                const method = extractMethod(item.name);
                const path = extractPath(item.name);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start justify-between px-4 py-3',
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      'cursor-pointer group',
                      'transition-colors'
                    )}
                    onClick={() => onSelect(item)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {method && (
                          <span
                            className={cn(
                              'text-xs font-bold',
                              METHOD_COLORS[method]
                            )}
                          >
                            {method}
                          </span>
                        )}
                        <span className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate">
                          {path}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatDate(item.ts)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className={cn(
                        'p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400',
                        'opacity-0 group-hover:opacity-100 transition-opacity'
                      )}
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;

