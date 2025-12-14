import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { cn } from '@/lib/utils';

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
  default: 'border-gray-200',
  error: 'border-red-300 ring-1 ring-red-100',
  success: 'border-emerald-300 ring-1 ring-emerald-100',
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
  return (
    <div
      className={cn("flex flex-col overflow-hidden rounded-md border bg-white shadow-sm", statusStyles[status], readOnly && 'bg-gray-50', className)}
      data-mode={mode}
    >
      {title && (
        <div className="border-b bg-gray-50 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
          {title}
        </div>
      )}
      <CodeMirror
        value={value}
        height="100%"
        className="flex-1 text-sm font-mono"
        onChange={(next) => onChange?.(next)}
        editable={!readOnly}
        placeholder={placeholder}
        extensions={[EditorView.lineWrapping]}
        theme="light"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
        }}
      />
    </div>
  );
};
