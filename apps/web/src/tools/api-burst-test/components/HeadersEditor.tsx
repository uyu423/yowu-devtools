/**
 * HeadersEditor - Key-value editor for request headers
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { BurstHeaderItem } from '../types';
import { createBurstHeaderItem, HARD_LIMITS } from '../types';

interface HeadersEditorProps {
  headers: BurstHeaderItem[];
  onChange: (headers: BurstHeaderItem[]) => void;
  disabled?: boolean;
}

const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Origin',
  'Referer',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With',
];

const COMMON_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'text/plain',
  'text/html',
  'application/xml',
];

export const HeadersEditor: React.FC<HeadersEditorProps> = ({
  headers,
  onChange,
  disabled,
}) => {
  const { t } = useI18n();

  const handleAddHeader = () => {
    if (headers.length >= HARD_LIMITS.MAX_HEADERS) return;
    onChange([...headers, createBurstHeaderItem()]);
  };

  const handleRemoveHeader = (id: string) => {
    onChange(headers.filter((h) => h.id !== id));
  };

  const handleUpdateHeader = (
    id: string,
    field: 'key' | 'value' | 'enabled',
    value: string | boolean
  ) => {
    onChange(
      headers.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
        <div className="w-6" />
        <div className="flex-1">{t('tool.apiBurstTest.headerKey')}</div>
        <div className="flex-1">{t('tool.apiBurstTest.headerValue')}</div>
        <div className="w-8" />
      </div>

      {/* Header items */}
      {headers.map((header) => (
        <div key={header.id} className="flex items-center gap-2">
          {/* Enable checkbox */}
          <input
            type="checkbox"
            checked={header.enabled}
            onChange={(e) => handleUpdateHeader(header.id, 'enabled', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />

          {/* Key input */}
          <input
            type="text"
            value={header.key}
            onChange={(e) => handleUpdateHeader(header.id, 'key', e.target.value)}
            placeholder={t('tool.apiBurstTest.headerKey')}
            disabled={disabled}
            list={`header-key-${header.id}`}
            className={cn(
              'flex-1 h-8 px-2 py-1 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100 font-mono',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:opacity-50',
              !header.enabled && 'opacity-50'
            )}
          />
          <datalist id={`header-key-${header.id}`}>
            {COMMON_HEADERS.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>

          {/* Value input */}
          <input
            type="text"
            value={header.value}
            onChange={(e) => handleUpdateHeader(header.id, 'value', e.target.value)}
            placeholder={t('tool.apiBurstTest.headerValue')}
            disabled={disabled}
            list={`header-value-${header.id}`}
            className={cn(
              'flex-1 h-8 px-2 py-1 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100 font-mono',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:opacity-50',
              !header.enabled && 'opacity-50'
            )}
          />
          <datalist id={`header-value-${header.id}`}>
            {COMMON_CONTENT_TYPES.map((ct) => (
              <option key={ct} value={ct} />
            ))}
          </datalist>

          {/* Delete button */}
          <button
            onClick={() => handleRemoveHeader(header.id)}
            disabled={disabled}
            className={cn(
              'p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={handleAddHeader}
        disabled={disabled || headers.length >= HARD_LIMITS.MAX_HEADERS}
        className={cn(
          'flex items-center gap-1 px-2 py-1 text-sm',
          'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>{t('tool.apiBurstTest.addHeader')}</span>
      </button>

      {headers.length >= HARD_LIMITS.MAX_HEADERS && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t('tool.apiBurstTest.maxHeadersReached')} ({HARD_LIMITS.MAX_HEADERS})
        </p>
      )}
    </div>
  );
};

export default HeadersEditor;

