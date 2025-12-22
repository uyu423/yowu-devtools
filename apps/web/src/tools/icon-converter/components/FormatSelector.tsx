import React from 'react';
import { FileCode2, FileImage, CheckCircle2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OutputFormat } from '../logic/constants';

interface FormatSelectorProps {
  format: OutputFormat;
  exportZip: boolean;
  onFormatChange: (format: OutputFormat) => void;
  onExportZipChange: (exportZip: boolean) => void;
}

const formats: { value: OutputFormat; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'ico',
    label: 'ICO',
    icon: <FileCode2 className="w-5 h-5" />,
    description: 'Multi-size icon (recommended)',
  },
  {
    value: 'png',
    label: 'PNG',
    icon: <FileImage className="w-5 h-5" />,
    description: 'Lossless, supports transparency',
  },
  {
    value: 'webp',
    label: 'WebP',
    icon: <FileImage className="w-5 h-5" />,
    description: 'Modern, smaller file size',
  },
  {
    value: 'jpeg',
    label: 'JPEG',
    icon: <FileImage className="w-5 h-5" />,
    description: 'Best for photos, no transparency',
  },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  format,
  exportZip,
  onFormatChange,
  onExportZipChange,
}) => {
  const showZipOption = format !== 'ico';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Output Format
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {formats.map((fmt) => (
            <button
              key={fmt.value}
              type="button"
              onClick={() => onFormatChange(fmt.value)}
              className={cn(
                'relative p-3 rounded-lg border-2 text-left transition-all duration-200',
                'hover:border-blue-300 dark:hover:border-blue-700',
                format === fmt.value
                  ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className={cn(
                    'p-1.5 rounded',
                    format === fmt.value
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50'
                      : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
                  )}
                >
                  {fmt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        format === fmt.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {fmt.label}
                    </span>
                    {format === fmt.value && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      format === fmt.value
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {fmt.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export as ZIP 옵션 (ICO 제외) */}
      {showZipOption && (
        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <input
              type="checkbox"
              checked={exportZip}
              onChange={(e) => onExportZipChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex items-center gap-2 flex-1">
              <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Export as ZIP
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bundle all sizes into a single archive
                </p>
              </div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

