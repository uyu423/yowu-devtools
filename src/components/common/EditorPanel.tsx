import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { cn } from '@/lib/utils';
import { useResolvedTheme } from '@/hooks/useThemeHooks';

// We'll add more extensions later based on mode
interface EditorPanelProps {
  value: string;
  onChange?: (val: string) => void;
  mode?: 'json' | 'text' | 'yaml';
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  title?: string;
  status?: 'default' | 'error' | 'success';
}

const statusStyles: Record<NonNullable<EditorPanelProps['status']>, string> = {
  default: 'border-gray-200 dark:border-gray-700',
  error: 'border-red-300 dark:border-red-700 ring-1 ring-red-100 dark:ring-red-900/30',
  success: 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-100 dark:ring-emerald-900/30',
};

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  value, 
  onChange, 
  mode = 'text', 
  readOnly = false,
  className,
  placeholder,
  title,
  status = 'default',
}) => {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border shadow-sm min-h-0",
        "bg-white dark:bg-gray-800",
        statusStyles[status],
        readOnly && 'bg-gray-50 dark:bg-gray-900/50',
        className
      )}
      data-mode={mode}
    >
      {title && (
        <div className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 shrink-0">
          {title}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeMirror
          key={`editor-${isDark ? 'dark' : 'light'}`}
          value={value}
          height="100%"
          className="h-full text-sm font-mono"
          onChange={(next) => onChange?.(next)}
          editable={!readOnly}
          placeholder={placeholder}
          extensions={[EditorView.lineWrapping]}
          theme={isDark ? oneDark : undefined}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: false,
          }}
        />
      </div>
    </div>
  );
};
