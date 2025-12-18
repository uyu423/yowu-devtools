/**
 * SendButton - Request send button with mode indicator
 */

import React from 'react';
import { Send, Square, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SendButtonProps {
  onClick: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'direct' | 'extension';
  disabled?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  onCancel,
  isLoading,
  mode = 'direct',
  disabled,
}) => {
  if (isLoading) {
    return (
      <button
        onClick={onCancel}
        className={cn(
          'h-10 px-3 sm:px-4 rounded-r-lg shrink-0',
          'bg-red-600 hover:bg-red-700',
          'text-white font-medium text-sm',
          'flex items-center gap-2',
          'transition-colors'
        )}
      >
        <Square className="w-4 h-4" />
        <span className="hidden sm:inline">Cancel</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-10 px-3 sm:px-4 rounded-r-lg shrink-0',
        'bg-blue-600 hover:bg-blue-700',
        'text-white font-medium text-sm',
        'flex items-center gap-2',
        'transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
      title="Send (⌘/Ctrl + Enter)"
    >
      {mode === 'extension' ? (
        <Zap className="w-4 h-4" />
      ) : (
        <Send className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Send</span>
    </button>
  );
};

export default SendButton;

