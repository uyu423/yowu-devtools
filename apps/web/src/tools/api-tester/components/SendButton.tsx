/**
 * SendButton - Request send button with mode indicator
 */

import { Send, Square, Zap } from 'lucide-react';

import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

interface SendButtonProps {
  onClick: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'direct' | 'extension';
  disabled?: boolean;
}

// Detect Mac for keyboard shortcut display
const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const sendShortcut = isMac ? '⌘↵' : 'Ctrl+Enter';

export const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  onCancel,
  isLoading,
  mode = 'direct',
  disabled,
}) => {
  if (isLoading) {
    return (
      <Tooltip content="Esc">
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
      </Tooltip>
    );
  }

  return (
    <Tooltip content={sendShortcut}>
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
      >
        {mode === 'extension' ? (
          <Zap className="w-4 h-4" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Send</span>
      </button>
    </Tooltip>
  );
};

export default SendButton;
