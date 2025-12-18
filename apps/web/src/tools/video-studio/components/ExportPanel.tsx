import React, { useMemo } from 'react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { cn } from '@/lib/utils';
import type { ExportFormat, QualityPreset } from '../types';

interface ExportPanelProps {
  format: ExportFormat;
  qualityPreset: QualityPreset;
  suffix: string;
  originalFileName: string;
  onFormatChange: (format: ExportFormat) => void;
  onQualityPresetChange: (preset: QualityPreset) => void;
  onSuffixChange: (suffix: string) => void;
  t: (key: string) => string;
  disabled?: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  format,
  qualityPreset,
  suffix,
  originalFileName,
  onFormatChange,
  onQualityPresetChange,
  onSuffixChange,
  t,
  disabled = false,
}) => {
  // Generate quality preset options with i18n translations
  const qualityPresetOptions = useMemo(
    () => [
      { value: 'fast' as const, label: t('common.videoQuality.fast'), description: t('common.videoQuality.fastDesc') },
      { value: 'balanced' as const, label: t('common.videoQuality.balanced'), description: t('common.videoQuality.balancedDesc') },
      { value: 'high' as const, label: t('common.videoQuality.highQuality'), description: t('common.videoQuality.highQualityDesc') },
    ],
    [t]
  );

  // Generate video format options with i18n translations
  const formatOptions = useMemo(
    () => [
      { value: 'mp4', label: t('common.videoFormat.mp4'), mimeType: 'video/mp4', extension: '.mp4' },
      { value: 'webm', label: t('common.videoFormat.webm'), mimeType: 'video/webm', extension: '.webm' },
    ],
    [t]
  );

  const getOutputFileName = () => {
    const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'video';
    const extension = formatOptions.find((o) => o.value === format)?.extension || '.mp4';
    return `${baseName}${suffix}${extension}`;
  };

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none')} data-step="export">
      {/* Format */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.export.formatTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.export.format')}
          </label>
        </OptionLabel>
        <div className="flex gap-2">
          {formatOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFormatChange(option.value as ExportFormat)}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                format === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Preset */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.export.qualityTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.export.quality')}
          </label>
        </OptionLabel>
        <div className="space-y-2">
          {qualityPresetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onQualityPresetChange(option.value)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors',
                qualityPreset === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0',
                  qualityPreset === option.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {qualityPreset === option.value && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Name Suffix */}
      <div>
        <OptionLabel tooltip={t('tool.videoStudio.export.suffixTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.videoStudio.export.suffix')}
          </label>
        </OptionLabel>
        <input
          type="text"
          value={suffix}
          onChange={(e) => onSuffixChange(e.target.value)}
          placeholder="_edited"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Output Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('tool.videoStudio.export.outputFileName')}
        </label>
        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate">
          {getOutputFileName()}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
        <p>
          <strong>{t('tool.videoStudio.export.privacyNote')}:</strong>{' '}
          {t('tool.videoStudio.export.privacyDescription')}
        </p>
      </div>

      {/* Performance Note */}
      <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
        <p>
          <strong>{t('tool.videoStudio.export.performanceNote')}:</strong>{' '}
          {t('tool.videoStudio.export.performanceDescription')}
        </p>
      </div>
    </div>
  );
};

