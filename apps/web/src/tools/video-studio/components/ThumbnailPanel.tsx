import React from 'react';
import { Image, Clock, Download } from 'lucide-react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { cn } from '@/lib/utils';
import { formatTime, parseTime, THUMBNAIL_FORMAT_OPTIONS } from '../constants';
import type { ThumbnailFormat } from '../types';

interface ThumbnailPanelProps {
  thumbnailTime: number;
  thumbnailFormat: ThumbnailFormat;
  videoDuration: number;
  hasVideo: boolean;
  isExtracting: boolean;
  onTimeChange: (time: number) => void;
  onFormatChange: (format: ThumbnailFormat) => void;
  onSeekTo: (time: number) => void;
  onExtract: () => void;
  t: (key: string) => string;
}

/**
 * ThumbnailPanel - Standalone thumbnail extraction component
 * 
 * This is separated from the video pipeline because:
 * - Thumbnail extraction outputs an IMAGE, not a video
 * - It cannot be combined with other pipeline steps (trim, cut, crop, resize)
 * - It's a quick action that can be performed independently
 */
export const ThumbnailPanel: React.FC<ThumbnailPanelProps> = ({
  thumbnailTime,
  thumbnailFormat,
  videoDuration,
  hasVideo,
  isExtracting,
  onTimeChange,
  onFormatChange,
  onSeekTo,
  onExtract,
  t,
}) => {
  const [inputValue, setInputValue] = React.useState(formatTime(thumbnailTime));

  React.useEffect(() => {
    setInputValue(formatTime(thumbnailTime));
  }, [thumbnailTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseTime(inputValue);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= videoDuration) {
      onTimeChange(parsed);
      onSeekTo(parsed);
    } else {
      setInputValue(formatTime(thumbnailTime));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onTimeChange(time);
    onSeekTo(time);
  };

  const handleQuickSelect = (percentage: number) => {
    const time = videoDuration * percentage;
    onTimeChange(time);
    onSeekTo(time);
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
          <Image className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('tool.videoStudio.thumbnail.title')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('tool.videoStudio.thumbnail.description')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Time Input */}
        <div>
          <OptionLabel tooltip={t('tool.videoStudio.thumbnail.timeTooltip')}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('tool.videoStudio.thumbnail.extractAt')}
            </label>
          </OptionLabel>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
              placeholder="0:00.00"
              disabled={!hasVideo}
              className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                onTimeChange(0);
                onSeekTo(0);
              }}
              disabled={!hasVideo}
              className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              {t('tool.videoStudio.thumbnail.start')}
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div>
          <input
            type="range"
            value={thumbnailTime}
            onChange={handleSliderChange}
            min={0}
            max={videoDuration || 1}
            step={0.1}
            disabled={!hasVideo}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0:00</span>
            <span>{formatTime(videoDuration || 0)}</span>
          </div>
        </div>

        {/* Quick Select */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.thumbnail.quickSelect')}
          </label>
          <div className="flex gap-1.5">
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickSelect(pct)}
                disabled={!hasVideo}
                className="flex-1 px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
              >
                {pct === 0
                  ? t('tool.videoStudio.thumbnail.start')
                  : pct === 1
                    ? t('tool.videoStudio.thumbnail.end')
                    : `${Math.round(pct * 100)}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.thumbnail.format')}
          </label>
          <div className="flex gap-1.5">
            {THUMBNAIL_FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFormatChange(opt.value as ThumbnailFormat)}
                disabled={!hasVideo}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50',
                  thumbnailFormat === opt.value
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extract Button */}
        <button
          type="button"
          onClick={onExtract}
          disabled={!hasVideo || isExtracting}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
            hasVideo && !isExtracting
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          )}
        >
          <Download className="w-4 h-4" />
          {isExtracting
            ? t('tool.videoStudio.thumbnail.extracting')
            : t('tool.videoStudio.thumbnail.extractButton')}
        </button>

        {/* Info Note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
          <div className="flex items-start gap-2">
            <Image className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              {t('tool.videoStudio.thumbnail.note')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
