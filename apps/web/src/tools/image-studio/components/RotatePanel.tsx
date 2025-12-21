import React from 'react';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Rotation } from '../types';
import { ROTATION_OPTIONS } from '../constants';

interface RotatePanelProps {
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
  onRotationChange: (rotation: Rotation) => void;
  onFlipHorizontalChange: (flip: boolean) => void;
  onFlipVerticalChange: (flip: boolean) => void;
  onResetTransform: () => void;
  t: (key: string) => string;
  disabled?: boolean;
}

export const RotatePanel: React.FC<RotatePanelProps> = ({
  rotation,
  flipHorizontal,
  flipVertical,
  onRotationChange,
  onFlipHorizontalChange,
  onFlipVerticalChange,
  onResetTransform,
  t,
  disabled = false,
}) => {
  const handleRotateLeft = () => {
    const newRotation = ((rotation - 90 + 360) % 360) as Rotation;
    onRotationChange(newRotation);
  };

  const handleRotateRight = () => {
    const newRotation = ((rotation + 90) % 360) as Rotation;
    onRotationChange(newRotation);
  };

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none')} data-step="rotate">
      {/* Rotation */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tool.imageStudio.rotate.rotation')}
        </label>
        
        {/* Quick rotate buttons */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <button
            type="button"
            onClick={handleRotateLeft}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={t('tool.imageStudio.rotate.rotateLeft')}
          >
            <RotateCcw className="w-4 h-4" />
            90° {t('tool.imageStudio.rotate.left')}
          </button>
          
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {rotation}°
            </span>
          </div>
          
          <button
            type="button"
            onClick={handleRotateRight}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={t('tool.imageStudio.rotate.rotateRight')}
          >
            90° {t('tool.imageStudio.rotate.right')}
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Rotation presets */}
        <div className="flex gap-2">
          {ROTATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onRotationChange(option.value as Rotation)}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                rotation === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flip */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tool.imageStudio.rotate.flip')}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onFlipHorizontalChange(!flipHorizontal)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md transition-colors',
              flipHorizontal
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="text-sm">{t('tool.imageStudio.rotate.horizontal')}</span>
          </button>
          <button
            type="button"
            onClick={() => onFlipVerticalChange(!flipVertical)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md transition-colors',
              flipVertical
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <FlipVertical className="w-4 h-4" />
            <span className="text-sm">{t('tool.imageStudio.rotate.vertical')}</span>
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onResetTransform}
        className="w-full px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        {t('tool.imageStudio.rotate.resetTransform')}
      </button>
    </div>
  );
};

