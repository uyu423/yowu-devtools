import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface ResizablePanelsProps {
  /** Left panel content */
  leftPanel: React.ReactNode;
  /** Right panel content */
  rightPanel: React.ReactNode;
  /** Initial left panel width as percentage (0-100), default 50 */
  initialLeftWidth?: number;
  /** Minimum left panel width as percentage (0-100), default 20 */
  minLeftWidth?: number;
  /** Maximum left panel width as percentage (0-100), default 80 */
  maxLeftWidth?: number;
  /** Storage key for persisting panel width */
  storageKey?: string;
  /** Additional class names for the container */
  className?: string;
  /** Hide left panel and expand right panel to full width */
  expandRightPanel?: boolean;
}

/**
 * A resizable two-panel layout component.
 * On desktop (lg+), panels are horizontal with a draggable divider.
 * On mobile, panels stack vertically without resizing.
 */
export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  storageKey,
  className,
  expandRightPanel = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`yowu-devtools:v1:ui:${storageKey}`);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= minLeftWidth && parsed <= maxLeftWidth) {
          return parsed;
        }
      }
    }
    return initialLeftWidth;
  });
  const [isDragging, setIsDragging] = useState(false);

  // Save to localStorage when width changes
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(`yowu-devtools:v1:ui:${storageKey}`, leftWidth.toString());
    }
  }, [leftWidth, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // Calculate percentage
      let newLeftWidth = (mouseX / containerWidth) * 100;
      
      // Clamp to min/max
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      
      setLeftWidth(newLeftWidth);
    },
    [isDragging, minLeftWidth, maxLeftWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const touch = e.touches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const touchX = touch.clientX - containerRect.left;
      
      let newLeftWidth = (touchX / containerWidth) * 100;
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      
      setLeftWidth(newLeftWidth);
    },
    [isDragging, minLeftWidth, maxLeftWidth]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  // Double-click to reset to initial width
  const handleDoubleClick = useCallback(() => {
    setLeftWidth(initialLeftWidth);
  }, [initialLeftWidth]);

  // Calculate right panel width
  const rightWidth = 100 - leftWidth;

  // CSS custom property for dynamic panel widths
  const cssVars = {
    '--left-panel-width': `calc(${leftWidth}% - 3px)`,
    '--right-panel-width': `calc(${rightWidth}% - 3px)`,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden',
        'gap-6 lg:gap-2', // Gap: mobile 24px, desktop 8px
        className
      )}
      style={expandRightPanel ? undefined : cssVars}
    >
      {/* Left Panel - On mobile: full width, On desktop: resizable */}
      <div
        className={cn(
          'flex flex-col min-h-0 lg:shrink-0 transition-all duration-300 ease-in-out',
          expandRightPanel
            ? 'w-0 opacity-0 overflow-hidden lg:hidden'
            : 'w-full lg:w-[var(--left-panel-width)]'
        )}
      >
        {leftPanel}
      </div>

      {/* Divider - Only visible on desktop when not expanded */}
      {!expandRightPanel && (
        <div
          className={cn(
            'hidden lg:flex items-center justify-center relative',
            'w-1.5 cursor-col-resize select-none shrink-0',
            'group hover:bg-blue-500/20 active:bg-blue-500/30 rounded transition-colors',
            isDragging && 'bg-blue-500/30'
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onDoubleClick={handleDoubleClick}
          title="Drag to resize, double-click to reset"
        >
          <div
            className={cn(
              'w-1 h-16 rounded-full transition-colors',
              'bg-gray-400 dark:bg-gray-500',
              'group-hover:bg-blue-500 group-active:bg-blue-600',
              isDragging && 'bg-blue-600'
            )}
          />
          <GripVertical
            className={cn(
              'absolute w-4 h-4 text-gray-500 dark:text-gray-400 opacity-0',
              'group-hover:opacity-100 transition-opacity',
              isDragging && 'opacity-100 text-blue-500'
            )}
          />
        </div>
      )}

      {/* Right Panel - On mobile: full width, On desktop: fills remaining space or full width when expanded */}
      <div
        className={cn(
          'flex flex-col min-h-0 lg:shrink-0 transition-all duration-300 ease-in-out',
          expandRightPanel
            ? 'w-full'
            : 'w-full lg:w-[var(--right-panel-width)]'
        )}
      >
        {rightPanel}
      </div>
    </div>
  );
};

