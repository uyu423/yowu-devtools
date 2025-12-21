/**
 * ParamsEditor - Query parameters editor
 */

import React from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { BurstParamItem } from '../types';
import { createBurstParamItem, HARD_LIMITS } from '../types';

interface ParamsEditorProps {
  params: BurstParamItem[];
  onChange: (params: BurstParamItem[]) => void;
  disabled?: boolean;
}

export const ParamsEditor: React.FC<ParamsEditorProps> = ({
  params,
  onChange,
  disabled,
}) => {
  const { t } = useI18n();

  const handleAdd = () => {
    if (params.length >= HARD_LIMITS.MAX_PARAMS) return;
    onChange([...params, createBurstParamItem()]);
  };

  const handleRemove = (id: string) => {
    onChange(params.filter((p) => p.id !== id));
  };

  const handleUpdate = (id: string, field: 'key' | 'value', value: string) => {
    onChange(
      params.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleToggle = (id: string) => {
    onChange(
      params.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="space-y-2">
      {params.map((param) => (
        <div
          key={param.id}
          className={cn(
            'flex items-center gap-2 group',
            !param.enabled && 'opacity-50'
          )}
        >
          {/* Drag handle placeholder */}
          <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Enable/disable checkbox */}
          <input
            type="checkbox"
            checked={param.enabled}
            onChange={() => handleToggle(param.id)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />

          {/* Key input */}
          <input
            type="text"
            value={param.key}
            onChange={(e) => handleUpdate(param.id, 'key', e.target.value)}
            placeholder={t('tool.apiBurstTest.paramKey')}
            disabled={disabled}
            className={cn(
              'flex-1 h-8 px-2 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
          />

          {/* Value input */}
          <input
            type="text"
            value={param.value}
            onChange={(e) => handleUpdate(param.id, 'value', e.target.value)}
            placeholder={t('tool.apiBurstTest.paramValue')}
            disabled={disabled}
            className={cn(
              'flex-1 h-8 px-2 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:opacity-50'
            )}
          />

          {/* Remove button */}
          <button
            onClick={() => handleRemove(param.id)}
            disabled={disabled}
            className={cn(
              'p-1 rounded',
              'text-gray-400 hover:text-red-500',
              'hover:bg-red-50 dark:hover:bg-red-900/20',
              'transition-colors',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={disabled || params.length >= HARD_LIMITS.MAX_PARAMS}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg',
          'text-blue-600 dark:text-blue-400',
          'hover:bg-blue-50 dark:hover:bg-blue-900/20',
          'transition-colors',
          'disabled:opacity-50 disabled:pointer-events-none'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>{t('tool.apiBurstTest.addParam')}</span>
      </button>

      {params.length >= HARD_LIMITS.MAX_PARAMS && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t('tool.apiBurstTest.maxParamsReached')} ({HARD_LIMITS.MAX_PARAMS})
        </p>
      )}
    </div>
  );
};

export default ParamsEditor;

