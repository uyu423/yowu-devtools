import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  /** Preferred position - 'auto' will calculate, 'top'/'bottom' will force that direction */
  position?: 'auto' | 'top' | 'bottom';
  /** Horizontal alignment - 'center' (default), 'left', or 'right' */
  align?: 'center' | 'left' | 'right';
  /** Prevent text wrapping - default true for short labels, set false for long descriptions */
  nowrap?: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom';
  arrowLeft: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  className,
  position: preferredPosition = 'auto',
  align = 'center',
  nowrap = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    const tooltipHeight = tooltipRect?.height || 40;
    const tooltipWidth = tooltipRect?.width || 100;
    
    const margin = 8;
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;

    // Determine vertical placement
    let placement: 'top' | 'bottom';
    if (preferredPosition === 'auto') {
      placement = (spaceAbove < tooltipHeight + margin && spaceBelow > tooltipHeight + margin) 
        ? 'bottom' 
        : 'top';
    } else {
      placement = preferredPosition;
    }

    // Calculate top position
    const top = placement === 'top'
      ? triggerRect.top - tooltipHeight - margin
      : triggerRect.bottom + margin;

    // Calculate left position based on alignment
    let left: number;
    switch (align) {
      case 'left':
        left = triggerRect.left;
        break;
      case 'right':
        left = triggerRect.right - tooltipWidth;
        break;
      default:
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
    }

    // Ensure tooltip stays within viewport horizontally
    const viewportPadding = 8;
    if (left < viewportPadding) {
      left = viewportPadding;
    } else if (left + tooltipWidth > window.innerWidth - viewportPadding) {
      left = window.innerWidth - tooltipWidth - viewportPadding;
    }

    // Calculate arrow position relative to tooltip
    const arrowLeft = Math.max(8, Math.min(
      triggerRect.left + (triggerRect.width / 2) - left - 4,
      tooltipWidth - 16
    ));

    return { top, left, placement, arrowLeft };
  }, [preferredPosition, align]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    let animationFrameId: number;

    const updatePosition = () => {
      const pos = calculatePosition();
      if (pos) {
        setTooltipPosition(pos);
      }
    };

    // Initial calculation
    updatePosition();
    
    // Recalculate after a frame
    animationFrameId = requestAnimationFrame(updatePosition);

    // Update position on scroll/resize
    const handleScrollResize = () => {
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isVisible, calculatePosition]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setTooltipPosition(null);
  };

  const tooltipContent = isVisible && (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-[9999] px-4 py-2.5 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg pointer-events-none",
        nowrap ? "whitespace-nowrap w-max" : "whitespace-normal max-w-lg",
      )}
      style={{
        top: tooltipPosition?.top ?? -9999,
        left: tooltipPosition?.left ?? -9999,
        visibility: tooltipPosition ? 'visible' : 'hidden',
      }}
    >
      {content}
      {/* Arrow */}
      <div 
        className="absolute"
        style={{
          left: tooltipPosition?.arrowLeft ?? 0,
          ...(tooltipPosition?.placement === 'top' 
            ? { top: '100%', marginTop: '-1px' } 
            : { bottom: '100%', marginBottom: '-1px' }
          ),
        }}
      >
        <div className={cn(
          "border-4 border-transparent",
          tooltipPosition?.placement === 'top' 
            ? 'border-t-gray-900 dark:border-t-gray-700' 
            : 'border-b-gray-900 dark:border-b-gray-700'
        )} />
      </div>
    </div>
  );

  return (
    <div 
      ref={triggerRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </div>
  );
};
