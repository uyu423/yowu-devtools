import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  message: string;
  details?: string;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, details, className }) => {
  if (!message) return null;

  return (
    <div className={cn('flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800', className)}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">{message}</p>
        {details && <p className="mt-1 text-xs text-red-700/90 whitespace-pre-line">{details}</p>}
      </div>
    </div>
  );
};
