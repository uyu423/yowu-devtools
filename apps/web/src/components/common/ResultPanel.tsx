import React from 'react';
import { Copy } from 'lucide-react';
import { EditorPanel } from './EditorPanel';
import { copyToClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

interface ResultPanelProps {
  /** Title displayed in the header */
  title: string;
  /** Result value to display */
  value: string;
  /** Toast message when copied */
  copyMessage: string;
  /** Copy button tooltip */
  copyTooltip?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Status indicator for the panel */
  status?: 'default' | 'success' | 'error';
  /** Editor panel height class */
  className?: string;
  /** Code editor mode */
  mode?: 'json' | 'yaml' | 'text';
  /** Whether copy is disabled (e.g., during error) */
  disabled?: boolean;
}

/**
 * A reusable result panel component with a header containing title and copy button,
 * and an EditorPanel for displaying results.
 *
 * @example
 * ```tsx
 * <ResultPanel
 *   title="Result"
 *   value={result}
 *   copyMessage="Copied to clipboard"
 *   placeholder="Result will appear here"
 *   status={error ? 'error' : 'success'}
 * />
 * ```
 */
export const ResultPanel: React.FC<ResultPanelProps> = ({
  title,
  value,
  copyMessage,
  copyTooltip,
  placeholder,
  status = 'default',
  className,
  mode = 'text',
  disabled = false,
}) => {
  const canCopy = Boolean(value) && !disabled;

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex items-center justify-between px-3 py-1.5',
          'border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900',
          'shrink-0 rounded-t-md border border-b-0'
        )}
      >
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <button
          onClick={() => canCopy && copyToClipboard(value, copyMessage)}
          disabled={!canCopy}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={copyTooltip}
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <EditorPanel
        title=""
        value={value}
        readOnly
        mode={mode}
        placeholder={placeholder}
        className={cn('rounded-t-none', className)}
        status={status}
      />
    </div>
  );
};

