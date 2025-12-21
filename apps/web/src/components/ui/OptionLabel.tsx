import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { cn } from '@/lib/utils';

interface OptionLabelProps {
  children: React.ReactNode;
  tooltip: string;
  className?: string;
}

export const OptionLabel: React.FC<OptionLabelProps> = ({ children, tooltip, className }) => {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span>{children}</span>
      <Tooltip content={tooltip}>
        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-help transition-colors" />
      </Tooltip>
    </div>
  );
};

