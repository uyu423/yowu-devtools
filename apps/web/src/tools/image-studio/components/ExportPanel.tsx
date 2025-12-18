import React from 'react';
import { AlertCircle } from 'lucide-react';
import { OptionLabel } from '@/components/ui/OptionLabel';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '../types';
import { EXPORT_FORMAT_OPTIONS } from '../constants';

interface ExportPanelProps {
  format: ExportFormat;
  quality: number;
  suffix: string;
  originalFileName: string;
  supportedFormats: Set<ExportFormat>;
  onFormatChange: (format: ExportFormat) => void;
  onQualityChange: (quality: number) => void;
  onSuffixChange: (suffix: string) => void;
  t: (key: string) => string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  format,
  quality,
  suffix,
  originalFileName,
  supportedFormats,
  onFormatChange,
  onQualityChange,
  onSuffixChange,
  t,
}) => {
  const showQualitySlider = format === 'jpeg' || format === 'webp';

  const getOutputFileName = () => {
    const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'image';
    const extension = EXPORT_FORMAT_OPTIONS.find((o) => o.value === format)?.extension || '.png';
    return `${baseName}${suffix}${extension}`;
  };

  return (
    <div className="space-y-4" data-step="export">
      {/* Format */}
      <div>
        <OptionLabel tooltip={t('tool.imageStudio.export.formatTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.imageStudio.export.format')}
          </label>
        </OptionLabel>
        <div className="flex gap-2">
          {EXPORT_FORMAT_OPTIONS.map((option) => {
            const isSupported = supportedFormats.has(option.value as ExportFormat);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => isSupported && onFormatChange(option.value as ExportFormat)}
                disabled={!isSupported}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  format === option.value
                    ? 'bg-blue-600 text-white'
                    : isSupported
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                )}
                title={!isSupported ? t('tool.imageStudio.export.formatNotSupported') : undefined}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {!supportedFormats.has('webp') && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{t('tool.imageStudio.export.webpNotSupported')}</span>
          </div>
        )}
      </div>

      {/* Quality (for JPEG/WebP) */}
      {showQualitySlider && (
        <div>
          <OptionLabel tooltip={t('tool.imageStudio.export.qualityTooltip')}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t('tool.imageStudio.export.quality')}: {quality}%
            </label>
          </OptionLabel>
          <input
            type="range"
            value={quality}
            onChange={(e) => onQualityChange(parseInt(e.target.value))}
            min={1}
            max={100}
            step={1}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{t('tool.imageStudio.export.smaller')}</span>
            <span>{t('tool.imageStudio.export.better')}</span>
          </div>
        </div>
      )}

      {/* File Name Suffix */}
      <div>
        <OptionLabel tooltip={t('tool.imageStudio.export.suffixTooltip')}>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('tool.imageStudio.export.suffix')}
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
          {t('tool.imageStudio.export.outputFileName')}
        </label>
        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate">
          {getOutputFileName()}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
        <p>
          <strong>{t('tool.imageStudio.export.privacyNote')}:</strong> {t('tool.imageStudio.export.privacyDescription')}
        </p>
      </div>
    </div>
  );
};

