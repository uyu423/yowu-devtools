import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { cn } from '@/lib/utils';
import { useResolvedTheme } from '@/hooks/useThemeHooks';

// We'll add more extensions later based on mode
interface HighlightRange {
  from: number;
  to: number;
  className: string;
}

interface EditorPanelProps {
  value: string;
  onChange?: (val: string) => void;
  mode?: 'json' | 'text' | 'yaml';
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  title?: string;
  status?: 'default' | 'error' | 'success';
  highlights?: HighlightRange[]; // For regex highlighting
}

const statusStyles: Record<NonNullable<EditorPanelProps['status']>, string> = {
  default: 'border-gray-200 dark:border-gray-700',
  error: 'border-red-300 dark:border-red-700 ring-1 ring-red-100 dark:ring-red-900/30',
  success: 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-100 dark:ring-emerald-900/30',
};

// Color mapping for highlights
const getHighlightColor = (className: string, isDark: boolean): string => {
  // Match colors
  if (className.includes('yellow')) {
    return isDark ? '#713f12' : '#fef08a';
  }
  // Group colors
  if (className.includes('blue')) {
    return isDark ? '#1e3a8a' : '#bfdbfe';
  }
  if (className.includes('green')) {
    return isDark ? '#14532d' : '#bbf7d0';
  }
  if (className.includes('purple')) {
    return isDark ? '#581c87' : '#e9d5ff';
  }
  if (className.includes('pink')) {
    return isDark ? '#831843' : '#fce7f3';
  }
  if (className.includes('indigo')) {
    return isDark ? '#312e81' : '#c7d2fe';
  }
  if (className.includes('red')) {
    return isDark ? '#7f1d1d' : '#fecaca';
  }
  if (className.includes('orange')) {
    return isDark ? '#7c2d12' : '#fed7aa';
  }
  return isDark ? '#713f12' : '#fef08a'; // default yellow
};

// Create highlight extension
const createHighlightExtension = (highlights: HighlightRange[], isDark: boolean) => {
  // Create a plugin that updates decorations when highlights change
  const highlightPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      private highlights: HighlightRange[];
      private isDark: boolean;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_view: EditorView) {
        this.highlights = highlights;
        this.isDark = isDark;
        this.decorations = this.buildDecorations();
      }

      update() {
        // Rebuild decorations when highlights change
        const newDecos = this.buildDecorations();
        if (newDecos.size !== this.decorations.size || 
            newDecos !== this.decorations) {
          this.decorations = newDecos;
          return true;
        }
        return false;
      }

      buildDecorations(): DecorationSet {
        if (this.highlights.length === 0) {
          return Decoration.none;
        }
        const decos = this.highlights.map(({ from, to, className }) => {
          const bgColor = getHighlightColor(className, this.isDark);
          const isBold = className.includes('font-semibold');
          
          return Decoration.mark({
            attributes: {
              style: `background-color: ${bgColor}; ${isBold ? 'font-weight: 600;' : ''}`,
            },
          }).range(from, to);
        });
        return Decoration.set(decos);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );

  return highlightPlugin;
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
  highlights = [],
}) => {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';
  const editorContainerRef = React.useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = React.useState<string>('100%');

  // Create highlight extension when highlights change
  const highlightExtension = React.useMemo(() => {
    if (highlights.length === 0) {
      return [];
    }
    return [createHighlightExtension(highlights, isDark)];
  }, [highlights, isDark]); // Recreate when highlights or theme changes

  // Calculate editor height based on container - only when className includes h-full or specific height
  React.useEffect(() => {
    // Only use ResizeObserver if we need dynamic height calculation
    // For fixed heights (h-40, h-64, etc.), CodeMirror's height="100%" should work
    if (!className?.includes('h-full') && !className?.includes('flex-1')) {
      return;
    }

    const updateHeight = () => {
      if (editorContainerRef.current) {
        const containerHeight = editorContainerRef.current.offsetHeight;
        if (containerHeight > 0) {
          setEditorHeight(`${containerHeight}px`);
        }
      }
    };

    // Initial height calculation with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateHeight, 0);
    
    // Use ResizeObserver to update height when container size changes
    const resizeObserver = new ResizeObserver(updateHeight);
    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [className]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border shadow-sm",
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
      <div ref={editorContainerRef} className="flex-1 min-h-0 overflow-hidden">
        <CodeMirror
          key={`editor-${isDark ? 'dark' : 'light'}`}
          value={value}
          height={editorHeight}
          className="text-sm font-mono"
          onChange={(next) => onChange?.(next)}
          editable={!readOnly}
          placeholder={placeholder}
          extensions={[EditorView.lineWrapping, ...highlightExtension]}
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
