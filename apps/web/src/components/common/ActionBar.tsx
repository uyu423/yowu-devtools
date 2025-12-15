import React from 'react';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({ children, className }) => {
  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      {children}
    </div>
  );
};

