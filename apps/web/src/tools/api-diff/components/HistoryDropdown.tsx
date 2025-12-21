/**
 * History Dropdown - 히스토리 드롭다운 컴포넌트
 */

import React, { useState, useRef, useEffect } from 'react';
import { History, X, Trash2, ChevronDown } from 'lucide-react';
import type { HistoryItem } from '../types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';

interface HistoryDropdownProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  items,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setConfirmClear(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearAll = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
      setIsOpen(false);
    } else {
      setConfirmClear(true);
    }
  };

  const formatDate = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm',
          'border border-gray-300 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-800',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'text-gray-700 dark:text-gray-300',
          'transition-colors'
        )}
      >
        <History className="w-4 h-4" />
        <span>{t('tool.apiDiff.history.title')}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
        {items.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 max-h-96 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
              {t('tool.apiDiff.history.empty')}
            </div>
          ) : (
            <>
              {/* Header with Clear All */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tool.apiDiff.history.recentRequests')}
                </span>
                <button
                  onClick={handleClearAll}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded',
                    confirmClear
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                  )}
                >
                  <Trash2 className="w-3 h-3" />
                  {confirmClear
                    ? t('tool.apiDiff.history.confirmClear')
                    : t('tool.apiDiff.history.clearAll')}
                </button>
              </div>

              {/* History Items */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(item.ts)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryDropdown;

