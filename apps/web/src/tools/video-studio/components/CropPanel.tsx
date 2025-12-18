import React from 'react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import type { CropArea } from '../types';

interface CropPanelProps {
  cropArea: CropArea | null;
  videoWidth: number;
  videoHeight: number;
  onCropAreaChange: (area: CropArea) => void;
  onResetCrop: () => void;
  t: (key: string) => string;
  disabled?: boolean;
}

const ASPECT_RATIO_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1 (Square)', ratio: 1 },
  { value: '4:3', label: '4:3', ratio: 4 / 3 },
  { value: '16:9', label: '16:9', ratio: 16 / 9 },
  { value: '9:16', label: '9:16 (Vertical)', ratio: 9 / 16 },
];

export const CropPanel: React.FC<CropPanelProps> = ({
  cropArea,
  videoWidth,
  videoHeight,
  onCropAreaChange,
  onResetCrop,
  t,
  disabled = false,
}) => {
  const [aspectRatio, setAspectRatio] = React.useState<string>('free');

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);

    if (value === 'free' || !cropArea) return;

    const option = ASPECT_RATIO_OPTIONS.find((o) => o.value === value);
    if (!option?.ratio) return;

    // Calculate new dimensions maintaining aspect ratio
    const newWidth = Math.min(cropArea.width, videoWidth);
    const newHeight = newWidth / option.ratio;

    if (newHeight <= videoHeight) {
      onCropAreaChange({
        ...cropArea,
        width: newWidth,
        height: newHeight,
      });
    } else {
      const adjustedHeight = Math.min(cropArea.height, videoHeight);
      onCropAreaChange({
        ...cropArea,
        width: adjustedHeight * option.ratio,
        height: adjustedHeight,
      });
    }
  };

  const handleCoordinateChange = (key: keyof CropArea, value: number) => {
    if (!cropArea) return;

    const newArea = { ...cropArea, [key]: Math.max(0, value) };

    // Clamp to video bounds
    newArea.x = Math.min(newArea.x, videoWidth - 50);
    newArea.y = Math.min(newArea.y, videoHeight - 50);
    newArea.width = Math.min(newArea.width, videoWidth - newArea.x);
    newArea.height = Math.min(newArea.height, videoHeight - newArea.y);

    onCropAreaChange(newArea);
  };

  const handleSelectAll = () => {
    onCropAreaChange({
      x: 0,
      y: 0,
      width: videoWidth,
      height: videoHeight,
    });
    setAspectRatio('free');
  };

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none')} data-step="crop">
      {/* Aspect Ratio */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.crop.aspectRatioTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.crop.aspectRatio')}
          </label>
        </OptionLabel>
        <Select
          value={aspectRatio}
          onChange={handleAspectRatioChange}
          options={ASPECT_RATIO_OPTIONS}
          className="w-full"
          triggerClassName="w-full"
          disabled={disabled}
        />
      </div>

      {/* Crop Coordinates */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('tool.videoStudio.crop.coordinates')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(cropArea?.x || 0)}
              onChange={(e) => handleCoordinateChange('x', parseInt(e.target.value) || 0)}
              min={0}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Y</label>
            <input
              type="number"
              value={Math.round(cropArea?.y || 0)}
              onChange={(e) => handleCoordinateChange('y', parseInt(e.target.value) || 0)}
              min={0}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              {t('tool.videoStudio.crop.width')}
            </label>
            <input
              type="number"
              value={Math.round(cropArea?.width || videoWidth)}
              onChange={(e) => handleCoordinateChange('width', parseInt(e.target.value) || 50)}
              min={50}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">
              {t('tool.videoStudio.crop.height')}
            </label>
            <input
              type="number"
              value={Math.round(cropArea?.height || videoHeight)}
              onChange={(e) => handleCoordinateChange('height', parseInt(e.target.value) || 50)}
              min={50}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSelectAll}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {t('tool.videoStudio.crop.selectAll')}
        </button>
        <button
          type="button"
          onClick={onResetCrop}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {t('common.reset')}
        </button>
      </div>

      {/* Crop Preview Info */}
      {cropArea && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('tool.videoStudio.crop.outputResolution')}: {Math.round(cropArea.width)} ×{' '}
            {Math.round(cropArea.height)}
          </p>
        </div>
      )}
    </div>
  );
};

