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
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  value, 
  onChange, 
  mode = 'text', 
  readOnly = false,
  className,
  placeholder,
  title
}) => {
  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden bg-white", className)}>
      {title && (
        <div className="bg-gray-50 px-3 py-1.5 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      <CodeMirror
        value={value}
        height="100%"
        className="flex-1 text-sm font-mono"
        onChange={onChange}
        editable={!readOnly}
        placeholder={placeholder}
        extensions={[EditorView.lineWrapping]}
        theme="light" // or 'none' if we want custom styling
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
        }}
      />
    </div>
  );
};

