/**
 * BodyEditor - Request body editor with mode toggle (raw/json/form)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import type { BurstBody, BurstBodyMode } from '../types';

interface BodyEditorProps {
  body: BurstBody;
  onChange: (body: BurstBody) => void;
  disabled?: boolean;
  methodSupportsBody: boolean;
}

export const BodyEditor: React.FC<BodyEditorProps> = ({
  body,
  onChange,
  disabled,
  methodSupportsBody,
}) => {
  const { t } = useI18n();

  if (!methodSupportsBody) {
    return (
      <div className={cn(
        'p-4 rounded-lg',
        'bg-gray-50 dark:bg-gray-800/50',
        'border border-gray-200 dark:border-gray-700'
      )}>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('tool.apiBurstTest.body.notSupported')}
        </p>
      </div>
    );
  }

  const handleModeChange = (mode: BurstBodyMode) => {
    onChange({ ...body, mode });
  };

  const handleTextChange = (text: string) => {
    onChange({ ...body, text });
  };

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1">
        {(['raw', 'json', 'form'] as BurstBodyMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg',
              'transition-colors',
              body.mode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t(`tool.apiBurstTest.body.${mode}`)}
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        value={body.text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={
          body.mode === 'json'
            ? '{"key": "value"}'
            : body.mode === 'form'
            ? 'key1=value1&key2=value2'
            : t('tool.apiBurstTest.body.placeholder')
        }
        disabled={disabled}
        rows={6}
        className={cn(
          'w-full px-3 py-2 text-sm rounded-lg border',
          'border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900',
          'text-gray-900 dark:text-gray-100 font-mono',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'resize-y min-h-[100px] max-h-[300px]',
          'disabled:opacity-50'
        )}
      />

      {/* Mode hints */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {body.mode === 'json' && t('tool.apiBurstTest.body.jsonHint')}
        {body.mode === 'form' && t('tool.apiBurstTest.body.formHint')}
        {body.mode === 'raw' && t('tool.apiBurstTest.body.rawHint')}
      </p>
    </div>
  );
};

export default BodyEditor;

