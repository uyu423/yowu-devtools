import React, { useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  /** ID for label association */
  id?: string;
  /** Show loading spinner (external loading state) */
  isLoading?: boolean;
  /** Use transition for non-urgent updates (prevents UI freeze) */
  useTransitionOnChange?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  size = 'sm',
  id,
  isLoading = false,
  useTransitionOnChange = false,
}) => {
  const [isPending, startTransition] = useTransition();
  const showLoading = isLoading || isPending;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  const handleClick = () => {
    if (disabled || showLoading) return;
    
    if (useTransitionOnChange) {
      startTransition(() => {
        onChange(!checked);
      });
    } else {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-busy={showLoading}
      disabled={disabled || showLoading}
      onClick={handleClick}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0',
        'rounded border-2 transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        'dark:focus:ring-offset-gray-900',
        sizeClasses[size],
        checked
          ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        (disabled || showLoading) && 'opacity-50 cursor-not-allowed',
        !(disabled || showLoading) && 'cursor-pointer',
        className
      )}
    >
      {showLoading ? (
        <Loader2
          className={cn(
            'animate-spin',
            checked ? 'text-white' : 'text-gray-500 dark:text-gray-400',
            iconSizeClasses[size]
          )}
        />
      ) : checked ? (
        <Check
          className={cn(
            'text-white',
            iconSizeClasses[size]
          )}
          strokeWidth={3}
        />
      ) : null}
    </button>
  );
};

interface CheckboxWithLabelProps extends Omit<CheckboxProps, 'id'> {
  label: React.ReactNode;
  labelClassName?: string;
}

export const CheckboxWithLabel: React.FC<CheckboxWithLabelProps> = ({
  label,
  labelClassName,
  ...checkboxProps
}) => {
  const id = React.useId();
  const showLoading = checkboxProps.isLoading;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        (checkboxProps.disabled || showLoading) && 'cursor-not-allowed opacity-70',
        labelClassName
      )}
    >
      <Checkbox {...checkboxProps} id={id} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
};

