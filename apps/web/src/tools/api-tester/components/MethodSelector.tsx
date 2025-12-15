/**
 * MethodSelector - HTTP method dropdown selector
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { HttpMethod } from '../types';

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
  disabled?: boolean;
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-blue-600 dark:text-blue-400',
  PUT: 'text-orange-600 dark:text-orange-400',
  PATCH: 'text-purple-600 dark:text-purple-400',
  DELETE: 'text-red-600 dark:text-red-400',
  HEAD: 'text-gray-600 dark:text-gray-400',
  OPTIONS: 'text-gray-600 dark:text-gray-400',
};

export const MethodSelector: React.FC<MethodSelectorProps> = ({ value, onChange, disabled }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      disabled={disabled}
      className={cn(
        'h-10 px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-800',
        'font-semibold text-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'cursor-pointer',
        METHOD_COLORS[value]
      )}
    >
      {METHODS.map((method) => (
        <option key={method} value={method} className={METHOD_COLORS[method]}>
          {method}
        </option>
      ))}
    </select>
  );
};

export default MethodSelector;

