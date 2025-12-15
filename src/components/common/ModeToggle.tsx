import React from 'react';
import { cn } from '@/lib/utils';

export interface ModeOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface ModeToggleProps<T extends string> {
  options: ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'pill';
}

/**
 * A reusable mode toggle button group component.
 * Used for switching between modes like encode/decode, split/unified view, etc.
 *
 * @example
 * ```tsx
 * <ModeToggle
 *   options={[
 *     { value: 'encode', label: 'Encode' },
 *     { value: 'decode', label: 'Decode' },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 * ```
 */
export function ModeToggle<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
  variant = 'default',
}: ModeToggleProps<T>) {
  const containerClasses = cn(
    'inline-flex items-center p-1 rounded-lg',
    variant === 'default'
      ? 'bg-gray-100 dark:bg-gray-900'
      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    className
  );

  const buttonClasses = (isActive: boolean) =>
    cn(
      'rounded-md font-medium transition-colors',
      size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
      isActive
        ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
    );

  return (
    <div className={containerClasses}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={buttonClasses(value === option.value)}
          onClick={() => onChange(option.value)}
        >
          {option.icon && (
            <span className="mr-1.5 inline-flex">{option.icon}</span>
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}

