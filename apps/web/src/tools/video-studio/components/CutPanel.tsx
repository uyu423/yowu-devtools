import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CutSegment } from '../types';
import { formatTime, parseTime } from '../constants';

interface CutPanelProps {
  cutSegments: CutSegment[];
  videoDuration: number;
  onSegmentsChange: (segments: CutSegment[]) => void;
  onSeekTo: (time: number) => void;
  t: (key: string) => string;
  disabled?: boolean;
}

export const CutPanel: React.FC<CutPanelProps> = ({
  cutSegments,
  videoDuration,
  onSegmentsChange,
  onSeekTo,
  t,
  disabled = false,
}) => {
  const handleAddSegment = () => {
    const newSegment: CutSegment = {
      id: `segment-${Date.now()}`,
      start: 0,
      end: Math.min(10, videoDuration),
    };
    onSegmentsChange([...cutSegments, newSegment]);
  };

  const handleRemoveSegment = (id: string) => {
    onSegmentsChange(cutSegments.filter((s) => s.id !== id));
  };

  const handleSegmentChange = (id: string, field: 'start' | 'end', value: string) => {
    const parsed = parseTime(value);
    if (isNaN(parsed)) return;

    onSegmentsChange(
      cutSegments.map((s) => {
        if (s.id !== id) return s;
        return { ...s, [field]: Math.max(0, Math.min(videoDuration, parsed)) };
      })
    );
  };

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none')} data-step="cut">
      {/* Segment List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('tool.videoStudio.cut.segmentsToRemove')}
          </label>
          <button
            type="button"
            onClick={handleAddSegment}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('tool.videoStudio.cut.addSegment')}
          </button>
        </div>

        {cutSegments.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            {t('tool.videoStudio.cut.noSegments')}
          </div>
        ) : (
          <div className="space-y-2">
            {cutSegments.map((segment, index) => (
              <div
                key={segment.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md"
              >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-4">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={formatTime(segment.start)}
                  onChange={(e) => handleSegmentChange(segment.id, 'start', e.target.value)}
                  onBlur={() => onSeekTo(segment.start)}
                  className="w-20 px-2 py-1 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Start"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="text"
                  value={formatTime(segment.end)}
                  onChange={(e) => handleSegmentChange(segment.id, 'end', e.target.value)}
                  onBlur={() => onSeekTo(segment.end)}
                  className="w-20 px-2 py-1 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="End"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({formatTime(segment.end - segment.start)})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSegment(segment.id)}
                  className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {t('tool.videoStudio.cut.removeHint')}
        </p>
      </div>
    </div>
  );
};
