import React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupProps<T extends string = string> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  disabled?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
}

export function RadioGroup<T extends string = string>({
  name,
  value,
  onChange,
  options,
  disabled = false,
  className,
  orientation = 'horizontal',
  size = 'sm',
}: RadioGroupProps<T>) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn(
        'flex gap-3',
        orientation === 'vertical' && 'flex-col',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={cn(
              'inline-flex items-center gap-2 select-none',
              isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            )}
          >
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(option.value)}
              className={cn(
                'relative inline-flex items-center justify-center shrink-0',
                'rounded-full border-2 transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                'dark:focus:ring-offset-gray-900',
                sizeClasses[size],
                isSelected
                  ? 'border-blue-600 dark:border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                isDisabled && 'cursor-not-allowed',
                !isDisabled && 'cursor-pointer'
              )}
            >
              {isSelected && (
                <span
                  className={cn(
                    'rounded-full bg-blue-600 dark:bg-blue-500',
                    dotSizeClasses[size]
                  )}
                />
              )}
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

