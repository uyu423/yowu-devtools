/**
 * Key-Value Editor Component
 */

import React, { useRef, useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { KeyValuePair } from '../types';
import { generateId } from '../constants';
import { cn } from '@/lib/utils';

// Max height for scroll container (approximately 5 items visible)
const MAX_SCROLL_HEIGHT = 220;
// Threshold for showing scroll indicators (number of items)
const SCROLL_THRESHOLD = 5;

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  className?: string;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const shouldScroll = items.length >= SCROLL_THRESHOLD;

  // Check scroll position to show/hide gradients
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !shouldScroll) {
      // Defer setState to avoid synchronous calls in effect
      const timeoutId = setTimeout(() => {
        setShowTopGradient(false);
        setShowBottomGradient(false);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowTopGradient(scrollTop > 0);
      setShowBottomGradient(scrollTop + clientHeight < scrollHeight - 1);
    };

    // Initial check (deferred)
    const timeoutId = setTimeout(handleScroll, 0);

    container.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [shouldScroll, items.length]);

  const addItem = () => {
    onChange([
      ...items,
      { id: generateId(), key: '', value: '' },
    ]);
    // Scroll to bottom after adding item
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 0);
  };

  const updateItem = (id: string, field: 'key' | 'value', value: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      // Keep at least one empty item
      onChange([{ id: generateId(), key: '', value: '' }]);
    } else {
      onChange(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Scrollable container with gradient indicators */}
      <div className="relative">
        {/* Top gradient indicator */}
        {showTopGradient && (
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-gray-800 to-transparent z-10 pointer-events-none rounded-t-md" />
        )}
        
        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'space-y-2',
            shouldScroll && 'overflow-y-auto pr-1'
          )}
          style={shouldScroll ? { maxHeight: MAX_SCROLL_HEIGHT } : undefined}
        >
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="text"
                value={item.key}
                onChange={(e) => updateItem(item.id, 'key', e.target.value)}
                placeholder={keyPlaceholder}
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                placeholder={valuePlaceholder}
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Bottom gradient indicator */}
        {showBottomGradient && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-10 pointer-events-none rounded-b-md" />
        )}
      </div>
      
      {/* Add button - always visible outside scroll area */}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 px-2 py-1 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors w-fit"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </div>
  );
};

export default KeyValueEditor;

