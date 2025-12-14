import React, { useRef, useState, useCallback } from 'react';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileInputProps {
  onFileLoad: (content: string, fileName: string) => void;
  accept?: string; // File types to accept (e.g., '.json,.txt')
  maxSize?: number; // Max file size in bytes (default: 10MB)
  className?: string;
  disabled?: boolean;
}

/**
 * FileInput component for drag & drop and file selection
 * Supports both drag & drop and file picker dialog
 */
export const FileInput: React.FC<FileInputProps> = ({
  onFileLoad,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const readFile = useCallback(
    async (file: File) => {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }

      setIsLoading(true);
      try {
        const content = await file.text();
        onFileLoad(content, file.name);
        toast.success(`File "${file.name}" loaded successfully`);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Failed to read file');
      } finally {
        setIsLoading(false);
      }
    },
    [onFileLoad, maxSize]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      readFile(file);
    },
    [readFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleFileSelect, disabled]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className={cn('relative', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          disabled && 'opacity-50 cursor-not-allowed',
          isLoading && 'opacity-50'
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading file...</span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Drop a file here or click to browse
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {accept ? `Accepted: ${accept}` : 'All text files'} • Max {maxSize / 1024 / 1024}MB
            </span>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

/**
 * Simple file input button (alternative to drag & drop)
 */
interface FileInputButtonProps {
  onFileLoad: (content: string, fileName: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const FileInputButton: React.FC<FileInputButtonProps> = ({
  onFileLoad,
  accept,
  maxSize = 10 * 1024 * 1024,
  className,
  disabled = false,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const readFile = useCallback(
    async (file: File) => {
      if (file.size > maxSize) {
        toast.error(`File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
        return;
      }

      setIsLoading(true);
      try {
        const content = await file.text();
        onFileLoad(content, file.name);
        toast.success(`File "${file.name}" loaded successfully`);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Failed to read file');
      } finally {
        setIsLoading(false);
      }
    },
    [onFileLoad, maxSize]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        readFile(files[0]);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [readFile]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isLoading}
        className={className}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            Loading...
          </span>
        ) : (
          children || (
            <span className="flex items-center gap-2">
              <File className="w-4 h-4" />
              Choose File
            </span>
          )
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isLoading}
      />
    </>
  );
};

