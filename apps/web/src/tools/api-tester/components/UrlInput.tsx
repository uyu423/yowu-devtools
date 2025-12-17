/**
 * UrlInput - URL input field with auto-parsing support
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface UrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onPaste?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  onPaste,
  placeholder = 'https://api.example.com/v1/users',
  disabled,
}) => {
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (onPaste) {
      const pastedText = e.clipboardData.getData('text');
      onPaste(pastedText);
      e.preventDefault(); // Prevent default paste behavior
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={handlePaste}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'flex-1 h-10 px-3 py-2 border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-900',
        'text-gray-900 dark:text-gray-100',
        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'text-sm font-mono'
      )}
    />
  );
};

export default UrlInput;

