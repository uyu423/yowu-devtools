import React, { useState, useRef, useLayoutEffect } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current || !containerRef.current) return;

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
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    };

    // 즉시 실행
    updatePosition();
    
    // requestAnimationFrame으로 한 프레임 후 다시 확인 (렌더링 완료 후)
    requestAnimationFrame(updatePosition);
  }, [isVisible]);

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
            "absolute z-50 px-4 py-2.5 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-normal pointer-events-none left-1/2 transform -translate-x-1/2 max-w-lg",
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {content}
          <div className={cn(
            "absolute left-1/2 transform -translate-x-1/2",
            position === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'
          )}>
            <div className={cn(
              "border-4 border-transparent",
              position === 'top' 
                ? 'border-t-gray-900 dark:border-t-gray-700' 
                : 'border-b-gray-900 dark:border-b-gray-700'
            )} />
          </div>
        </div>
      )}
    </div>
  );
};

