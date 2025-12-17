/**
 * Result Banner - 비교 결과 배너 및 Diff 테이블
 */

import {
  AlertTriangle,
  CheckCircle,
  GitCompare,
  GripHorizontal,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Save table height to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIFF_TABLE_HEIGHT, String(tableHeight));
  }, [tableHeight]);

  // Handle drag to resize
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

  // Navigate to Text Diff with response bodies
  const handleCompareInTextDiff = useCallback(() => {
    // Format JSON for better readability
    const formatJson = (raw: string | null | undefined): string => {
      if (!raw) return '';
      try {
        const parsed = JSON.parse(raw);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return raw;
      }
    };

    // Pass state directly for useToolState to merge with default state
    navigate('/diff', {
      state: {
        left: formatJson(rawBodyA),
        right: formatJson(rawBodyB),
      },
    });
  }, [rawBodyA, rawBodyB, navigate]);

  if (!hasResponses) return null;
  if (!comparison) return null;

  if (comparison.isSame) {
    return (
      <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">
            {t('tool.apiDiff.responsesIdentical')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            {t('tool.apiDiff.responsesDifferent')}
          </span>
          {!comparison.statusSame && (
            <span className="text-sm ml-2">
              ({t('tool.apiDiff.status')}: A=
              {comparison.statusA || t('common.error')}, B=
              {comparison.statusB || t('common.error')})
            </span>
          )}
        </div>

        {/* Compare in Text Diff button */}
        {(rawBodyA || rawBodyB) && (
          <button
            onClick={handleCompareInTextDiff}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg',
              'bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300',
              'hover:bg-amber-200 dark:hover:bg-amber-800/60',
              'transition-colors'
            )}
          >
            <GitCompare className="w-4 h-4" />
            <span>{t('tool.apiDiff.compareInTextDiff')}</span>
          </button>
        )}
      </div>

      {/* Diff Table */}
      {comparison.differentFields.length > 0 && (
        <div ref={containerRef}>
          <div
            className="overflow-auto border border-amber-200 dark:border-amber-800 rounded"
            style={{ height: tableHeight }}
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-amber-100 dark:bg-amber-900/40">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800">
                    {t('tool.apiDiff.path')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800">
                    {t('tool.apiDiff.valueA')}
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800">
                    {t('tool.apiDiff.valueB')}
                  </th>
                </tr>
              </thead>
              <tbody>
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
              'flex items-center justify-center h-6 cursor-ns-resize',
              'text-amber-400 dark:text-amber-600 hover:text-amber-500 dark:hover:text-amber-500',
              isDragging && 'text-amber-600 dark:text-amber-400'
            )}
          >
            <GripHorizontal className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
};

// Diff Row Component
const DiffRow: React.FC<{ field: DifferentField }> = ({ field }) => {
  const valueAStr = formatDiffValue(field.valueA);
  const valueBStr = formatDiffValue(field.valueB);

  return (
    <tr className="border-b border-amber-100 dark:border-amber-900/40 hover:bg-amber-50/50 dark:hover:bg-amber-900/20">
      <td className="py-2 px-3 font-mono text-amber-900 dark:text-amber-200">
        {field.path}
      </td>
      <td
        className={cn(
          'py-2 px-3 font-mono text-sm max-w-[200px] break-all',
          field.valueA === undefined
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
        )}
      >
        {valueAStr}
      </td>
      <td
        className={cn(
          'py-2 px-3 font-mono text-sm max-w-[200px] break-all',
          field.valueB === undefined
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
        )}
      >
        {valueBStr}
      </td>
    </tr>
  );
};

export default ResultBanner;
