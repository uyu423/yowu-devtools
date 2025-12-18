import React from 'react';
import { Clock, Scissors } from 'lucide-react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { formatTime, parseTime } from '../constants';

interface TrimPanelProps {
  trimStart: number;
  trimEnd: number;
  videoDuration: number;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
  onSeekTo: (time: number) => void;
  t: (key: string) => string;
}

export const TrimPanel: React.FC<TrimPanelProps> = ({
  trimStart,
  trimEnd,
  videoDuration,
  onStartChange,
  onEndChange,
  onSeekTo,
  t,
}) => {
  const [startInput, setStartInput] = React.useState(formatTime(trimStart));
  const [endInput, setEndInput] = React.useState(formatTime(trimEnd));

  React.useEffect(() => {
    setStartInput(formatTime(trimStart));
  }, [trimStart]);

  React.useEffect(() => {
    setEndInput(formatTime(trimEnd));
  }, [trimEnd]);

  const handleStartInputBlur = () => {
    const parsed = parseTime(startInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed < trimEnd) {
      onStartChange(parsed);
      onSeekTo(parsed);
    } else {
      setStartInput(formatTime(trimStart));
    }
  };

  const handleEndInputBlur = () => {
    const parsed = parseTime(endInput);
    if (!isNaN(parsed) && parsed > trimStart && parsed <= videoDuration) {
      onEndChange(parsed);
    } else {
      setEndInput(formatTime(trimEnd));
    }
  };

  const handleStartSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (time < trimEnd) {
      onStartChange(time);
    }
  };

  const handleEndSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (time > trimStart) {
      onEndChange(time);
    }
  };

  const trimmedDuration = trimEnd - trimStart;

  return (
    <div className="space-y-4" data-step="trim">
      {/* Start Time */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.trim.startTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.trim.startTime')}
          </label>
        </OptionLabel>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onBlur={handleStartInputBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleStartInputBlur()}
            placeholder="0:00.00"
            className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => onSeekTo(trimStart)}
            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {t('tool.videoStudio.trim.preview')}
          </button>
        </div>
        <input
          type="range"
          value={trimStart}
          onChange={handleStartSliderChange}
          min={0}
          max={videoDuration}
          step={0.1}
          className="w-full h-2 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      {/* End Time */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.trim.endTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.trim.endTime')}
          </label>
        </OptionLabel>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            onBlur={handleEndInputBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleEndInputBlur()}
            placeholder="0:00.00"
            className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => onSeekTo(trimEnd)}
            className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {t('tool.videoStudio.trim.preview')}
          </button>
        </div>
        <input
          type="range"
          value={trimEnd}
          onChange={handleEndSliderChange}
          min={0}
          max={videoDuration}
          step={0.1}
          className="w-full h-2 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>

      {/* Duration Info */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Scissors className="w-4 h-4 text-blue-500" />
            <span>{t('tool.videoStudio.trim.outputDuration')}</span>
          </div>
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {formatTime(trimmedDuration)}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('tool.videoStudio.trim.originalDuration')}: {formatTime(videoDuration)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            onStartChange(0);
            onEndChange(videoDuration);
          }}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {t('tool.videoStudio.trim.selectAll')}
        </button>
        <button
          type="button"
          onClick={() => {
            onStartChange(0);
            onEndChange(Math.min(30, videoDuration));
          }}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {t('tool.videoStudio.trim.first30s')}
        </button>
        <button
          type="button"
          onClick={() => {
            onStartChange(Math.max(0, videoDuration - 30));
            onEndChange(videoDuration);
          }}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          {t('tool.videoStudio.trim.last30s')}
        </button>
      </div>
    </div>
  );
};

