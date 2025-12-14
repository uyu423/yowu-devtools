import React, { useCallback } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface FileDownloadProps {
  content: string;
  fileName?: string;
  mimeType?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * FileDownload component for downloading content as a file
 */
export const FileDownload: React.FC<FileDownloadProps> = ({
  content,
  fileName,
  mimeType = 'text/plain',
  className,
  disabled = false,
  children,
}) => {
  const handleDownload = useCallback(() => {
    if (!content || disabled) return;

    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'download.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  }, [content, fileName, mimeType, disabled]);

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled || !content}
      className={className}
    >
      {children || (
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download
        </span>
      )}
    </button>
  );
};

