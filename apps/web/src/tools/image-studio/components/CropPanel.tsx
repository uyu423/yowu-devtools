import React from 'react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { Select } from '@/components/ui/Select';
import type { AspectRatio, CropArea, CustomAspectRatio } from '../types';
import { ASPECT_RATIO_OPTIONS } from '../constants';

interface CropPanelProps {
  aspectRatio: AspectRatio;
  customRatio: CustomAspectRatio;
  cropArea: CropArea | null;
  imageWidth: number;
  imageHeight: number;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onCustomRatioChange: (ratio: CustomAspectRatio) => void;
  onCropAreaChange: (area: CropArea) => void;
  onResetCrop: () => void;
  t: (key: string) => string;
}

export const CropPanel: React.FC<CropPanelProps> = ({
  aspectRatio,
  customRatio,
  cropArea,
  imageWidth,
  imageHeight,
  onAspectRatioChange,
  onCustomRatioChange,
  onCropAreaChange,
  onResetCrop,
  t,
}) => {
  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    onAspectRatioChange(newRatio);
    
    // Update crop area to match aspect ratio if not free
    if (newRatio !== 'free' && cropArea) {
      const option = ASPECT_RATIO_OPTIONS.find((o) => o.value === newRatio);
      if (option?.ratio) {
        const newWidth = Math.min(cropArea.width, imageWidth);
        const newHeight = newWidth / option.ratio;
        if (newHeight <= imageHeight) {
          onCropAreaChange({
            ...cropArea,
            width: newWidth,
            height: newHeight,
          });
        } else {
          const adjustedHeight = Math.min(cropArea.height, imageHeight);
          onCropAreaChange({
            ...cropArea,
            width: adjustedHeight * option.ratio,
            height: adjustedHeight,
          });
        }
      }
    }
  };

  const handleCoordinateChange = (key: keyof CropArea, value: number) => {
    if (!cropArea) return;
    
    const newArea = { ...cropArea, [key]: Math.max(0, value) };
    
    // Clamp to image bounds
    newArea.x = Math.min(newArea.x, imageWidth - 50);
    newArea.y = Math.min(newArea.y, imageHeight - 50);
    newArea.width = Math.min(newArea.width, imageWidth - newArea.x);
    newArea.height = Math.min(newArea.height, imageHeight - newArea.y);
    
    onCropAreaChange(newArea);
  };

  const handleSelectAll = () => {
    onCropAreaChange({
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
    });
  };

  return (
    <div className="space-y-4" data-step="crop">
      {/* Aspect Ratio */}
      <div>
        <OptionLabel tooltip={t('tool.imageStudio.crop.aspectRatioTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.imageStudio.crop.aspectRatio')}
          </label>
        </OptionLabel>
        <Select
          value={aspectRatio}
          onChange={(value) => handleAspectRatioChange(value as AspectRatio)}
          options={ASPECT_RATIO_OPTIONS}
          className="w-full"
          triggerClassName="w-full"
        />
      </div>

      {/* Custom Aspect Ratio */}
      {aspectRatio === 'custom' && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={customRatio.width}
            onChange={(e) => onCustomRatioChange({ ...customRatio, width: parseInt(e.target.value) || 1 })}
            min={1}
            max={100}
            className="w-16 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">:</span>
          <input
            type="number"
            value={customRatio.height}
            onChange={(e) => onCustomRatioChange({ ...customRatio, height: parseInt(e.target.value) || 1 })}
            min={1}
            max={100}
            className="w-16 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Crop Coordinates */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('tool.imageStudio.crop.coordinates')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(cropArea?.x || 0)}
              onChange={(e) => handleCoordinateChange('x', parseInt(e.target.value) || 0)}
              min={0}
              max={imageWidth - 50}
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
              max={imageHeight - 50}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">{t('tool.imageStudio.crop.width')}</label>
            <input
              type="number"
              value={Math.round(cropArea?.width || imageWidth)}
              onChange={(e) => handleCoordinateChange('width', parseInt(e.target.value) || 50)}
              min={50}
              max={imageWidth - (cropArea?.x || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">{t('tool.imageStudio.crop.height')}</label>
            <input
              type="number"
              value={Math.round(cropArea?.height || imageHeight)}
              onChange={(e) => handleCoordinateChange('height', parseInt(e.target.value) || 50)}
              min={50}
              max={imageHeight - (cropArea?.y || 0)}
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
          {t('tool.imageStudio.crop.selectAll')}
        </button>
        <button
          type="button"
          onClick={onResetCrop}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {t('common.reset')}
        </button>
      </div>
    </div>
  );
};

