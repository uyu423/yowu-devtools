/**
 * CollapsibleSection - Collapsible section with header
 */

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  count,
  isOpen,
  onToggle,
  children,
  className,
}) => {
  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-2.5',
          'text-sm font-medium text-gray-700 dark:text-gray-300',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
        )}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <span>{title}</span>
        {count !== undefined && (
          <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
            ({count})
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;

