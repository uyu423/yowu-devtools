/**
 * KeyValueEditor - Reusable key-value table editor for query params, headers, etc.
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KeyValueItem } from '../types';
import { createKeyValueItem } from '../utils';

interface KeyValueEditorProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keyAutocomplete?: string[];
  valueAutocomplete?: string[];
  disabled?: boolean;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  keyAutocomplete,
  valueAutocomplete,
  disabled,
}) => {
  const handleAddItem = () => {
    onChange([...items, createKeyValueItem()]);
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Add an empty row if all rows are filled
  React.useEffect(() => {
    if (items.length === 0 || items.every((item) => item.key || item.value)) {
      // Already handled by user clicking Add
    }
  }, [items]);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
        <div className="w-6" /> {/* Checkbox space */}
        <div className="flex-1">{keyPlaceholder}</div>
        <div className="flex-1">{valuePlaceholder}</div>
        <div className="w-8" /> {/* Delete button space */}
      </div>

      {/* Items */}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          {/* Enable checkbox */}
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => handleUpdateItem(item.id, 'enabled', e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />

          {/* Key input */}
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleUpdateItem(item.id, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            disabled={disabled}
            list={keyAutocomplete ? `${item.id}-key-autocomplete` : undefined}
            className={cn(
              'flex-1 h-8 px-2 py-1 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:opacity-50',
              !item.enabled && 'opacity-50'
            )}
          />
          {keyAutocomplete && (
            <datalist id={`${item.id}-key-autocomplete`}>
              {keyAutocomplete.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}

          {/* Value input */}
          <input
            type="text"
            value={item.value}
            onChange={(e) => handleUpdateItem(item.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            disabled={disabled}
            list={valueAutocomplete ? `${item.id}-value-autocomplete` : undefined}
            className={cn(
              'flex-1 h-8 px-2 py-1 text-sm rounded border',
              'border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-1 focus:ring-blue-500',
              'disabled:opacity-50',
              !item.enabled && 'opacity-50'
            )}
          />
          {valueAutocomplete && (
            <datalist id={`${item.id}-value-autocomplete`}>
              {valueAutocomplete.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          )}

          {/* Delete button */}
          <button
            onClick={() => handleRemoveItem(item.id)}
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
        onClick={handleAddItem}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1 px-2 py-1 text-sm',
          'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
          'transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Add</span>
      </button>
    </div>
  );
};

export default KeyValueEditor;

