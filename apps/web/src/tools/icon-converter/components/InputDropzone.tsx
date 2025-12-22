import React from 'react';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_INPUT_FORMATS, MAX_FILE_SIZE } from '../logic/constants';

interface InputDropzoneProps {
  onFileSelect: (file: File) => void;
  file: File | null;
}

export const InputDropzone: React.FC<InputDropzoneProps> = ({ onFileSelect, file }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    // 파일 타입 검증
    if (!SUPPORTED_INPUT_FORMATS.includes(file.type as typeof SUPPORTED_INPUT_FORMATS[number])) {
      return `Unsupported format: ${file.type}. Please use SVG, PNG, JPG, WebP, or AVIF.`;
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          'hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.02]'
            : file
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_INPUT_FORMATS.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {file ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <FileImage className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {file.name}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1].toUpperCase()}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click or drop to change file
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop image here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports: SVG, PNG, JPG, WebP, AVIF
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Maximum: {MAX_FILE_SIZE / 1024 / 1024}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
};

