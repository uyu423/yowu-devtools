import React from 'react';
import { Maximize2, Minimize2, Grid3x3, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FitMode, OutputFormat } from '../logic/constants';

interface RenderOptionsPanelProps {
  fit: FitMode;
  padding: number;
  background: {
    type: 'transparent' | 'solid';
    color?: string;
  };
  quality: number;
  outputFormat: OutputFormat;
  onFitChange: (fit: FitMode) => void;
  onPaddingChange: (padding: number) => void;
  onBackgroundChange: (background: { type: 'transparent' | 'solid'; color?: string }) => void;
  onQualityChange: (quality: number) => void;
}

const fitOptions: { value: FitMode; label: string; description: string; icon: React.ReactNode }[] =
  [
    {
      value: 'contain',
      label: 'Contain',
      description: 'Keep ratio, add padding',
      icon: <Maximize2 className="w-4 h-4" />,
    },
    {
      value: 'cover',
      label: 'Cover',
      description: 'Keep ratio, may crop',
      icon: <Grid3x3 className="w-4 h-4" />,
    },
    {
      value: 'stretch',
      label: 'Stretch',
      description: 'Fill canvas, ignore ratio',
      icon: <Minimize2 className="w-4 h-4" />,
    },
  ];

export const RenderOptionsPanel: React.FC<RenderOptionsPanelProps> = ({
  fit,
  padding,
  background,
  quality,
  outputFormat,
  onFitChange,
  onPaddingChange,
  onBackgroundChange,
  onQualityChange,
}) => {
  const showQualitySlider = outputFormat === 'webp' || outputFormat === 'jpeg';

  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rendering Options</h3>

      {/* Fit Mode */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Fit Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {fitOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFitChange(option.value)}
              className={cn(
                'p-2 rounded-lg border text-left transition-all duration-200',
                'hover:border-blue-300 dark:hover:border-blue-700',
                fit === option.value
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className={cn(
                    'p-1 rounded',
                    fit === option.value
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50'
                      : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  {option.icon}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    fit === option.value
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {option.label}
                </span>
              </div>
              <p
                className={cn(
                  'text-[10px] leading-tight',
                  fit === option.value
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Padding Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Padding</label>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">{padding}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={padding}
          onChange={(e) => onPaddingChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
        />
      </div>

      {/* Background */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Background</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onBackgroundChange({ type: 'transparent' })}
            className={cn(
              'flex-1 p-2.5 rounded-lg border transition-all duration-200',
              'hover:border-blue-300 dark:hover:border-blue-700',
              background.type === 'transparent'
                ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]" />
              <span
                className={cn(
                  'text-xs font-medium',
                  background.type === 'transparent'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                Transparent
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onBackgroundChange({ type: 'solid', color: background.color || '#ffffff' })
            }
            className={cn(
              'flex-1 p-2.5 rounded-lg border transition-all duration-200',
              'hover:border-blue-300 dark:hover:border-blue-700',
              background.type === 'solid'
                ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Palette
                className={cn(
                  'w-4 h-4',
                  background.type === 'solid'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  background.type === 'solid'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                Solid Color
              </span>
            </div>
          </button>
        </div>

        {/* Color Picker (Solid 모드일 때만) */}
        {background.type === 'solid' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <input
              type="color"
              value={background.color || '#ffffff'}
              onChange={(e) =>
                onBackgroundChange({ type: 'solid', color: e.target.value })
              }
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <div className="flex-1">
              <input
                type="text"
                value={background.color || '#ffffff'}
                onChange={(e) =>
                  onBackgroundChange({ type: 'solid', color: e.target.value })
                }
                className="w-full px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                placeholder="#ffffff"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quality Slider (WebP/JPEG만) */}
      {showQualitySlider && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Quality</label>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{quality}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
            <span>Low (smaller file)</span>
            <span>High (better quality)</span>
          </div>
        </div>
      )}
    </div>
  );
};

