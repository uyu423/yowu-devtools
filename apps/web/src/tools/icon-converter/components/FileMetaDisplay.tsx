import React from 'react';
import { FileType, Ruler, HardDrive, CheckCircle2, XCircle } from 'lucide-react';

interface FileMetaDisplayProps {
  meta: {
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
    hasAlpha: boolean;
  };
}

export const FileMetaDisplay: React.FC<FileMetaDisplayProps> = ({ meta }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFormatName = (mimeType: string): string => {
    const formatMap: Record<string, string> = {
      'image/svg+xml': 'SVG',
      'image/png': 'PNG',
      'image/jpeg': 'JPEG',
      'image/webp': 'WebP',
      'image/avif': 'AVIF',
    };
    return formatMap[mimeType] || mimeType.split('/')[1].toUpperCase();
  };

  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        File Information
      </h3>

      <div className="space-y-2">
        {/* File Name */}
        <div className="flex items-center gap-2 text-sm">
          <FileType className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">Name:</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">{meta.name}</span>
        </div>

        {/* Format */}
        <div className="flex items-center gap-2 text-sm">
          <FileType className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">Format:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {getFormatName(meta.type)}
          </span>
        </div>

        {/* Dimensions */}
        <div className="flex items-center gap-2 text-sm">
          <Ruler className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">Dimensions:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {meta.width} × {meta.height} px
          </span>
        </div>

        {/* File Size */}
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">Size:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatFileSize(meta.size)}
          </span>
        </div>

        {/* Has Alpha */}
        <div className="flex items-center gap-2 text-sm">
          {meta.hasAlpha ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">Transparency:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Yes</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 min-w-[80px]">Transparency:</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">No</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

