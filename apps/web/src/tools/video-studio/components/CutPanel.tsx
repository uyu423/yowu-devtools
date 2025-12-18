import React from 'react';
import { Plus, Trash2, ScissorsLineDashed, SplitSquareVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CutMode, CutSegment } from '../types';
import { formatTime, parseTime } from '../constants';

interface CutPanelProps {
  cutMode: CutMode;
  cutSegments: CutSegment[];
  splitCount: number;
  videoDuration: number;
  onModeChange: (mode: CutMode) => void;
  onSegmentsChange: (segments: CutSegment[]) => void;
  onSplitCountChange: (count: number) => void;
  onSeekTo: (time: number) => void;
  t: (key: string) => string;
}

export const CutPanel: React.FC<CutPanelProps> = ({
  cutMode,
  cutSegments,
  splitCount,
  videoDuration,
  onModeChange,
  onSegmentsChange,
  onSplitCountChange,
  onSeekTo,
  t,
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
    <div className="space-y-4" data-step="cut">
      {/* Mode Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tool.videoStudio.cut.mode')}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onModeChange('remove')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md transition-colors',
              cutMode === 'remove'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <ScissorsLineDashed className="w-4 h-4" />
            <span className="text-sm">{t('tool.videoStudio.cut.removeSegment')}</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('split')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md transition-colors',
              cutMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span className="text-sm">{t('tool.videoStudio.cut.splitInto')}</span>
          </button>
        </div>
      </div>

      {/* Remove Mode Content */}
      {cutMode === 'remove' && (
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
      )}

      {/* Split Mode Content */}
      {cutMode === 'split' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('tool.videoStudio.cut.numberOfClips')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={splitCount}
                onChange={(e) => onSplitCountChange(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                min={2}
                max={10}
                className="w-20 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('tool.videoStudio.cut.clips')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <strong>{t('tool.videoStudio.cut.eachClipDuration')}:</strong>{' '}
                ~{formatTime(videoDuration / splitCount)}
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                {t('tool.videoStudio.cut.splitNote')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {cutMode === 'remove'
            ? t('tool.videoStudio.cut.removeHint')
            : t('tool.videoStudio.cut.splitHint')}
        </p>
      </div>
    </div>
  );
};

