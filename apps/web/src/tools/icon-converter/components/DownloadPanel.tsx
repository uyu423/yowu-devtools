import React from 'react';
import { Download, FileDown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FORMAT_EXTENSIONS, type OutputFormat } from '../logic/constants';

interface DownloadPanelProps {
  outputBlob: Blob;
  outputFormat: OutputFormat;
  fileName: string;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({
  outputBlob,
  outputFormat,
  fileName,
}) => {
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (outputBlob) {
      const url = URL.createObjectURL(outputBlob);
      setDownloadUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [outputBlob]);

  const getDownloadFileName = (): string => {
    const baseName = fileName.replace(/\.[^/.]+$/, ''); // 확장자 제거
    const extension = FORMAT_EXTENSIONS[outputFormat];
    return `${baseName}${extension}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFormatLabel = (): string => {
    const labels: Record<OutputFormat, string> = {
      ico: 'ICO',
      png: 'PNG',
      webp: 'WebP',
      jpeg: 'JPEG',
    };
    return labels[outputFormat];
  };

  const isZipFile = outputBlob.type === 'application/zip';

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Download</h3>

      <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            {isZipFile ? (
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate">
              {getDownloadFileName()}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              {getFormatLabel()} • {formatFileSize(outputBlob.size)}
            </p>
          </div>
        </div>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download={getDownloadFileName()}
            className={cn(
              'flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg',
              'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold',
              'transition-all duration-200 shadow-md hover:shadow-lg'
            )}
          >
            <Download className="w-5 h-5" />
            <span>Download {isZipFile ? 'ZIP' : getFormatLabel()}</span>
          </a>
        )}
      </div>
    </div>
  );
};

