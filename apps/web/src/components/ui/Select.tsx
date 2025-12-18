import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  size?: 'sm' | 'md';
  /** Direction to open the dropdown */
  direction?: 'up' | 'down' | 'auto';
  /** Render custom trigger content */
  renderValue?: (option: SelectOption<T> | undefined) => React.ReactNode;
  /** Title for accessibility */
  title?: string;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
  triggerClassName,
  dropdownClassName,
  size = 'sm',
  direction = 'down',
  renderValue,
  title,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC 키로 닫기 + 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (newValue: T) => {
    onChange(newValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDownTrigger = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
  };

  const dropdownPosition = direction === 'up' 
    ? 'bottom-full mb-1' 
    : 'top-full mt-1';

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      {/* 트리거 버튼 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDownTrigger}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between gap-2 rounded-md',
          'border border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-gray-100',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'transition-colors cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          triggerClassName
        )}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
      >
        <span className="truncate">
          {renderValue
            ? renderValue(selectedOption)
            : selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 right-0 z-50',
            dropdownPosition,
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-md shadow-lg',
            'py-1 overflow-hidden',
            'max-h-60 overflow-y-auto',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            dropdownClassName
          )}
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={cn(
                'w-full flex items-center justify-between gap-2 text-sm',
                'text-left transition-colors',
                sizeClasses[size],
                option.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : value === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              role="option"
              aria-selected={value === option.value}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

