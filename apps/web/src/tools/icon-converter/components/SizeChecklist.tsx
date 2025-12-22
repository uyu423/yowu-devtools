import React from 'react';
import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AVAILABLE_SIZES, PRESETS, type Preset } from '../logic/constants';

interface SizeChecklistProps {
  sizes: number[];
  preset: Preset;
  onSizesChange: (sizes: number[]) => void;
}

export const SizeChecklist: React.FC<SizeChecklistProps> = ({
  sizes,
  preset,
  onSizesChange,
}) => {
  const isCustomMode = preset === 'custom';

  // Preset 변경 시 자동으로 sizes 업데이트
  React.useEffect(() => {
    if (preset !== 'custom') {
      onSizesChange(PRESETS[preset]);
    }
  }, [preset, onSizesChange]);

  const handleToggleSize = (size: number) => {
    if (!isCustomMode) return; // Custom 모드가 아니면 변경 불가

    if (sizes.includes(size)) {
      // 최소 1개는 선택되어야 함
      if (sizes.length > 1) {
        onSizesChange(sizes.filter((s) => s !== size));
      }
    } else {
      onSizesChange([...sizes, size].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (!isCustomMode) return;
    onSizesChange(AVAILABLE_SIZES);
  };

  const handleDeselectAll = () => {
    if (!isCustomMode) return;
    // 최소 1개는 선택되어야 하므로 첫 번째 사이즈만 유지
    onSizesChange([AVAILABLE_SIZES[0]]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Sizes
          {!isCustomMode && (
            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
              (Auto-selected by preset)
            </span>
          )}
        </h3>

        {isCustomMode && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={sizes.length === AVAILABLE_SIZES.length}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline"
            >
              Select All
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              disabled={sizes.length === 1}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>

      {/* Size Grid */}
      <div
        className={cn(
          'grid grid-cols-4 gap-2 p-3 rounded-lg border',
          isCustomMode
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-75'
        )}
      >
        {AVAILABLE_SIZES.map((size) => {
          const isSelected = sizes.includes(size);
          const isDisabled = !isCustomMode;

          return (
            <button
              key={size}
              type="button"
              onClick={() => handleToggleSize(size)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-2 p-2 rounded border transition-all duration-200',
                'text-sm',
                isDisabled && 'cursor-not-allowed',
                !isDisabled && 'hover:border-blue-300 dark:hover:border-blue-700',
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
              <span className="font-medium">{size}px</span>
            </button>
          );
        })}
      </div>

      {/* Warning if no size selected */}
      {sizes.length === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Please select at least one size
          </p>
        </div>
      )}

      {/* Selected count */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {sizes.length} {sizes.length === 1 ? 'size' : 'sizes'} selected
      </div>
    </div>
  );
};

