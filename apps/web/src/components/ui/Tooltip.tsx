import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  /** Preferred position - 'auto' will calculate, 'top'/'bottom'/'left'/'right' will force that direction */
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  /** Horizontal alignment (for top/bottom) - 'center' (default), 'left', or 'right' */
  align?: 'center' | 'left' | 'right';
  /** Prevent text wrapping - default true for short labels, set false for long descriptions */
  nowrap?: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  arrowPosition: number;
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
    const spaceLeft = triggerRect.left;
    const spaceRight = window.innerWidth - triggerRect.right;

    // Determine placement
    let placement: 'top' | 'bottom' | 'left' | 'right';
    if (preferredPosition === 'auto') {
      placement = (spaceAbove < tooltipHeight + margin && spaceBelow > tooltipHeight + margin) 
        ? 'bottom' 
        : 'top';
    } else if (preferredPosition === 'left' || preferredPosition === 'right') {
      // For left/right, check if there's enough space, otherwise flip
      if (preferredPosition === 'right' && spaceRight < tooltipWidth + margin && spaceLeft > tooltipWidth + margin) {
        placement = 'left';
      } else if (preferredPosition === 'left' && spaceLeft < tooltipWidth + margin && spaceRight > tooltipWidth + margin) {
        placement = 'right';
      } else {
        placement = preferredPosition;
      }
    } else {
      placement = preferredPosition;
    }

    let top: number;
    let left: number;
    let arrowPosition: number;

    if (placement === 'left' || placement === 'right') {
      // Horizontal positioning
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
      
      if (placement === 'left') {
        left = triggerRect.left - tooltipWidth - margin;
      } else {
        left = triggerRect.right + margin;
      }

      // Ensure tooltip stays within viewport vertically
      const viewportPadding = 8;
      if (top < viewportPadding) {
        top = viewportPadding;
      } else if (top + tooltipHeight > window.innerHeight - viewportPadding) {
        top = window.innerHeight - tooltipHeight - viewportPadding;
      }

      // Calculate arrow position relative to tooltip (vertical)
      arrowPosition = Math.max(8, Math.min(
        triggerRect.top + (triggerRect.height / 2) - top - 4,
        tooltipHeight - 16
      ));
    } else {
      // Vertical positioning (top/bottom)
      top = placement === 'top'
        ? triggerRect.top - tooltipHeight - margin
        : triggerRect.bottom + margin;

      // Calculate left position based on alignment
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

      // Calculate arrow position relative to tooltip (horizontal)
      arrowPosition = Math.max(8, Math.min(
        triggerRect.left + (triggerRect.width / 2) - left - 4,
        tooltipWidth - 16
      ));
    }

    return { top, left, placement, arrowPosition };
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

  // Get arrow styles based on placement
  const getArrowStyles = () => {
    if (!tooltipPosition) return {};
    
    const { placement, arrowPosition } = tooltipPosition;
    
    switch (placement) {
      case 'top':
        return {
          left: arrowPosition,
          top: '100%',
          marginTop: '-1px',
        };
      case 'bottom':
        return {
          left: arrowPosition,
          bottom: '100%',
          marginBottom: '-1px',
        };
      case 'left':
        return {
          top: arrowPosition,
          left: '100%',
          marginLeft: '-1px',
        };
      case 'right':
        return {
          top: arrowPosition,
          right: '100%',
          marginRight: '-1px',
        };
      default:
        return {};
    }
  };

  // Get arrow class based on placement
  const getArrowClass = () => {
    if (!tooltipPosition) return '';
    
    const { placement } = tooltipPosition;
    
    switch (placement) {
      case 'top':
        return 'border-t-gray-900 dark:border-t-gray-700';
      case 'bottom':
        return 'border-b-gray-900 dark:border-b-gray-700';
      case 'left':
        return 'border-l-gray-900 dark:border-l-gray-700';
      case 'right':
        return 'border-r-gray-900 dark:border-r-gray-700';
      default:
        return '';
    }
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
        style={getArrowStyles()}
      >
        <div className={cn(
          "border-4 border-transparent",
          getArrowClass()
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
