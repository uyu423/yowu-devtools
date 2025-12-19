/**
 * UrlMethodInput - Combined URL input with method selector
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { BurstHttpMethod } from '../types';
import { METHOD_COLORS } from '../types';
import { useI18n } from '@/hooks/useI18nHooks';

interface UrlMethodInputProps {
  url: string;
  method: BurstHttpMethod;
  onUrlChange: (url: string) => void;
  onMethodChange: (method: BurstHttpMethod) => void;
  disabled?: boolean;
}

const METHODS: BurstHttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

export const UrlMethodInput: React.FC<UrlMethodInputProps> = ({
  url,
  method,
  onUrlChange,
  onMethodChange,
  disabled,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-stretch">
      {/* Method selector */}
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as BurstHttpMethod)}
        disabled={disabled}
        className={cn(
          'h-12 px-3 rounded-l-lg border border-r-0',
          'border-gray-200 dark:border-gray-700',
          'font-semibold text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer shrink-0',
          METHOD_COLORS[method]
        )}
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* URL input */}
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder={t('tool.apiBurstTest.urlPlaceholder')}
        disabled={disabled}
        className={cn(
          'flex-1 h-12 px-4',
          'border border-gray-200 dark:border-gray-700 rounded-r-lg',
          'bg-white dark:bg-gray-900',
          'text-gray-900 dark:text-gray-100',
          'font-mono text-sm',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
    </div>
  );
};

export default UrlMethodInput;

