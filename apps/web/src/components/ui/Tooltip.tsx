import React, { useState, useRef, useLayoutEffect } from 'react';
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

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  className,
  position: preferredPosition = 'auto',
  align = 'center',
  nowrap = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine final position
  const finalPosition = preferredPosition === 'auto' ? calculatedPosition : preferredPosition;

  useLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current || !containerRef.current) return;
    if (preferredPosition !== 'auto') return; // Skip calculation if position is forced

    // tooltip이 렌더링된 후 위치 계산
    const updatePosition = () => {
      const container = containerRef.current;
      const tooltip = tooltipRef.current;
      if (!container || !tooltip) return;

      const rect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      const margin = 8;
      const tooltipHeight = tooltipRect.height || 100;

      // 위쪽 공간 확인
      const spaceAbove = rect.top;
      // 아래쪽 공간 확인
      const spaceBelow = window.innerHeight - rect.bottom;

      // 위쪽 공간이 부족하고 아래쪽 공간이 충분하면 아래쪽에 표시
      if (spaceAbove < tooltipHeight + margin && spaceBelow > tooltipHeight + margin) {
        setCalculatedPosition('bottom');
      } else {
        setCalculatedPosition('top');
      }
    };

    // 즉시 실행
    updatePosition();
    
    // requestAnimationFrame으로 한 프레임 후 다시 확인 (렌더링 완료 후)
    requestAnimationFrame(updatePosition);
  }, [isVisible, preferredPosition]);

  // Get alignment classes
  const getAlignmentClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0';
      case 'right':
        return 'right-0';
      default:
        return 'left-1/2 transform -translate-x-1/2';
    }
  };

  const getArrowAlignmentClasses = () => {
    switch (align) {
      case 'left':
        return 'left-4';
      case 'right':
        return 'right-4';
      default:
        return 'left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-4 py-2.5 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg pointer-events-none",
            nowrap ? "whitespace-nowrap w-max" : "whitespace-normal max-w-lg",
            getAlignmentClasses(),
            finalPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {content}
          <div className={cn(
            "absolute",
            getArrowAlignmentClasses(),
            finalPosition === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'
          )}>
            <div className={cn(
              "border-4 border-transparent",
              finalPosition === 'top' 
                ? 'border-t-gray-900 dark:border-t-gray-700' 
                : 'border-b-gray-900 dark:border-b-gray-700'
            )} />
          </div>
        </div>
      )}
    </div>
  );
};

