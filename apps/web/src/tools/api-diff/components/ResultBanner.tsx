/**
 * Result Banner - 비교 결과 배너 및 Diff 테이블
 * Simple & Modern Design
 */

import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileDiff,
  GripHorizontal,
  Minus,
  X,
} from 'lucide-react';
import type { ComparisonResult, DifferentField } from '../types';
import {
  DIFF_TABLE_DEFAULT_HEIGHT,
  DIFF_TABLE_MAX_HEIGHT,
  DIFF_TABLE_MIN_HEIGHT,
  STORAGE_KEY_DIFF_TABLE_HEIGHT,
} from '../constants';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { formatDiffValue } from '../utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { useNavigate } from 'react-router-dom';

interface ResultBannerProps {
  comparison: ComparisonResult | null;
  hasResponses: boolean;
  rawBodyA?: string | null;
  rawBodyB?: string | null;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  comparison,
  hasResponses,
  rawBodyA,
  rawBodyB,
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [tableHeight, setTableHeight] = useState<number>(() => {
    if (typeof window === 'undefined') return DIFF_TABLE_DEFAULT_HEIGHT;
    const saved = localStorage.getItem(STORAGE_KEY_DIFF_TABLE_HEIGHT);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        return Math.min(
          Math.max(parsed, DIFF_TABLE_MIN_HEIGHT),
          DIFF_TABLE_MAX_HEIGHT
        );
      }
    }
    return DIFF_TABLE_DEFAULT_HEIGHT;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIFF_TABLE_HEIGHT, String(tableHeight));
  }, [tableHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = tableHeight;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startYRef.current;
      const newHeight = Math.min(
        Math.max(startHeightRef.current + delta, DIFF_TABLE_MIN_HEIGHT),
        DIFF_TABLE_MAX_HEIGHT
      );
      setTableHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleCompareInTextDiff = useCallback(() => {
    const formatJson = (raw: string | null | undefined): string => {
      if (!raw) return '';
      try {
        const parsed = JSON.parse(raw);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return raw;
      }
    };

    navigate('/diff', {
      state: {
        left: formatJson(rawBodyA),
        right: formatJson(rawBodyB),
      },
    });
  }, [rawBodyA, rawBodyB, navigate]);

  if (!hasResponses) return null;
  if (!comparison) return null;

  // Success State
  if (comparison.isSame) {
    return (
      <div className="mb-4">
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            'bg-gray-50 dark:bg-gray-800/50',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg'
          )}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 dark:bg-green-600">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {t('tool.apiDiff.responsesIdentical')}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {comparison.statusA || 200}
          </span>
        </div>
      </div>
    );
  }

  // Different State
  const diffCount = comparison.differentFields.length;

  return (
    <div className="mb-4">
      <div
        className={cn(
          'bg-gray-50 dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 dark:bg-red-600">
            <X className="w-4 h-4 text-white" strokeWidth={3} />
          </div>

          <div className="flex-1 flex items-center gap-3 min-w-0">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {t('tool.apiDiff.responsesDifferent')}
            </span>

            {diffCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {diffCount}
              </span>
            )}

            {!comparison.statusSame && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {comparison.statusA || '?'} / {comparison.statusB || '?'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {(rawBodyA || rawBodyB) && (
              <button
                onClick={handleCompareInTextDiff}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md',
                  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                  'border border-blue-200 dark:border-blue-800',
                  'hover:bg-blue-100 dark:hover:bg-blue-900/30',
                  'hover:border-blue-300 dark:hover:border-blue-700',
                  'transition-all duration-200',
                  'shadow-sm hover:shadow'
                )}
              >
                <FileDiff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {t('tool.apiDiff.compareInTextDiff')}
                </span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            )}

            {diffCount > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md',
                  'text-gray-500 dark:text-gray-400',
                  'hover:bg-gray-200 dark:hover:bg-gray-700',
                  'transition-colors'
                )}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Diff Table */}
        {diffCount > 0 && isExpanded && (
          <div
            ref={containerRef}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="overflow-auto" style={{ height: tableHeight }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {t('tool.apiDiff.path')}
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {t('tool.apiDiff.valueA')}
                    </th>
                    <th className="text-left py-2 px-4 font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {t('tool.apiDiff.valueB')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900">
                  {comparison.differentFields.map((field, index) => (
                    <DiffRow key={field.path || index} field={field} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Drag Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={cn(
                'flex items-center justify-center h-4 cursor-ns-resize',
                'bg-gray-100 dark:bg-gray-800',
                'border-t border-gray-200 dark:border-gray-700',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'transition-colors'
              )}
            >
              <GripHorizontal
                className={cn(
                  'w-4 h-4 text-gray-400 dark:text-gray-500',
                  isDragging && 'text-gray-600 dark:text-gray-300'
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Diff Row
const DiffRow: React.FC<{ field: DifferentField }> = ({ field }) => {
  const valueAStr = formatDiffValue(field.valueA);
  const valueBStr = formatDiffValue(field.valueB);
  const isAMissing = field.valueA === undefined;
  const isBMissing = field.valueB === undefined;

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="py-2 px-4 align-top">
        <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
          {field.path}
        </code>
      </td>

      <td className="py-2 px-4 align-top">
        {isAMissing ? (
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic">
            <Minus className="w-3 h-3" />
            missing
          </span>
        ) : (
          <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
            {valueAStr}
          </code>
        )}
      </td>

      <td className="py-2 px-4 align-top">
        {isBMissing ? (
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic">
            <Minus className="w-3 h-3" />
            missing
          </span>
        ) : (
          <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
            {valueBStr}
          </code>
        )}
      </td>
    </tr>
  );
};

export default ResultBanner;
