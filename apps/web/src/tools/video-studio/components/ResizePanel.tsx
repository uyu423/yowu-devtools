import React, { useMemo } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import type { ResizeMode } from '../types';
import { RESIZE_PRESETS } from '../constants';

interface ResizePanelProps {
  width: number;
  height: number;
  lockAspect: boolean;
  mode: ResizeMode;
  originalWidth: number;
  originalHeight: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onLockAspectChange: (locked: boolean) => void;
  onModeChange: (mode: ResizeMode) => void;
  t: (key: string) => string;
  disabled?: boolean;
}

export const ResizePanel: React.FC<ResizePanelProps> = ({
  width,
  height,
  lockAspect,
  mode,
  originalWidth,
  originalHeight,
  onWidthChange,
  onHeightChange,
  onLockAspectChange,
  onModeChange,
  t,
  disabled = false,
}) => {
  const aspectRatio = originalWidth / originalHeight;

  // Generate resize mode options with i18n translations
  const resizeModeOptions = useMemo(
    () => [
      { value: 'contain', label: t('common.resizeMode.contain'), description: t('common.resizeMode.containDesc') },
      { value: 'cover', label: t('common.resizeMode.cover'), description: t('common.resizeMode.coverDesc') },
      { value: 'stretch', label: t('common.resizeMode.stretch'), description: t('common.resizeMode.stretchDesc') },
    ],
    [t]
  );

  const handleWidthChange = (newWidth: number) => {
    onWidthChange(newWidth);
    if (lockAspect) {
      onHeightChange(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    onHeightChange(newHeight);
    if (lockAspect) {
      onWidthChange(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePresetClick = (preset: { width: number; height: number }) => {
    onWidthChange(preset.width);
    onHeightChange(preset.height);
  };

  const handleUseOriginal = () => {
    onWidthChange(originalWidth);
    onHeightChange(originalHeight);
  };

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none')} data-step="resize">
      {/* Dimensions */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.resize.dimensionsTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.resize.dimensions')}
          </label>
        </OptionLabel>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              {t('tool.videoStudio.resize.width')}
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
              min={1}
              max={7680}
              step={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => onLockAspectChange(!lockAspect)}
            className={cn(
              'mt-4 p-2 rounded-md transition-colors',
              lockAspect
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            title={
              lockAspect
                ? t('tool.videoStudio.resize.unlockAspect')
                : t('tool.videoStudio.resize.lockAspect')
            }
          >
            {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <div className="flex-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              {t('tool.videoStudio.resize.height')}
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
              min={1}
              max={4320}
              step={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleUseOriginal}
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {t('tool.videoStudio.resize.useOriginal')} ({originalWidth} × {originalHeight})
        </button>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('tool.videoStudio.resize.presets')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RESIZE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors',
                width === preset.width && height === preset.height
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resize Mode */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.resize.modeTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.resize.mode')}
          </label>
        </OptionLabel>
        <Select
          value={mode}
          onChange={(value) => onModeChange(value as ResizeMode)}
          options={resizeModeOptions}
          className="w-full"
          triggerClassName="w-full"
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {resizeModeOptions.find((o) => o.value === mode)?.description}
        </p>
      </div>
    </div>
  );
};

