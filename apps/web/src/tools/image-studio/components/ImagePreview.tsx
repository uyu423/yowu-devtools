import React from 'react';
import { ImageOff, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageMetadata, CropArea, Rotation } from '../types';

interface ImagePreviewProps {
  imageUrl: string | null;
  metadata: ImageMetadata | null;
  cropArea: CropArea | null;
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
  showCropOverlay: boolean;
  onFileSelect: (file: File) => void;
  onCropAreaChange?: (area: CropArea) => void;
  t: (key: string) => string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  metadata,
  cropArea,
  rotation,
  flipHorizontal,
  flipVertical,
  showCropOverlay,
  onFileSelect,
  onCropAreaChange,
  t,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = React.useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handlePaste = React.useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          onFileSelect(file);
          break;
        }
      }
    }
  }, [onFileSelect]);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Get transform style for rotation and flip
  const getTransformStyle = () => {
    const transforms: string[] = [];
    if (rotation !== 0) {
      transforms.push(`rotate(${rotation}deg)`);
    }
    if (flipHorizontal) {
      transforms.push('scaleX(-1)');
    }
    if (flipVertical) {
      transforms.push('scaleY(-1)');
    }
    return transforms.length > 0 ? transforms.join(' ') : undefined;
  };

  // Handle crop area mouse events
  const handleCropMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (!showCropOverlay || !cropArea || !containerRef.current || !metadata) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDraggingCrop(true);
    setResizeHandle(handle || null);
  };

  const handleCropMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingCrop || !dragStart || !containerRef.current || !metadata || !cropArea || !onCropAreaChange) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale factor from display to actual image coordinates
    const scaleX = metadata.width / rect.width;
    const scaleY = metadata.height / rect.height;

    const deltaX = (x - dragStart.x) * scaleX;
    const deltaY = (y - dragStart.y) * scaleY;

    const newArea = { ...cropArea };

    if (resizeHandle) {
      // Resizing
      switch (resizeHandle) {
        case 'nw':
          newArea.x = Math.max(0, cropArea.x + deltaX);
          newArea.y = Math.max(0, cropArea.y + deltaY);
          newArea.width = Math.max(50, cropArea.width - deltaX);
          newArea.height = Math.max(50, cropArea.height - deltaY);
          break;
        case 'ne':
          newArea.y = Math.max(0, cropArea.y + deltaY);
          newArea.width = Math.max(50, cropArea.width + deltaX);
          newArea.height = Math.max(50, cropArea.height - deltaY);
          break;
        case 'sw':
          newArea.x = Math.max(0, cropArea.x + deltaX);
          newArea.width = Math.max(50, cropArea.width - deltaX);
          newArea.height = Math.max(50, cropArea.height + deltaY);
          break;
        case 'se':
          newArea.width = Math.max(50, cropArea.width + deltaX);
          newArea.height = Math.max(50, cropArea.height + deltaY);
          break;
      }
    } else {
      // Moving
      newArea.x = Math.max(0, Math.min(metadata.width - cropArea.width, cropArea.x + deltaX));
      newArea.y = Math.max(0, Math.min(metadata.height - cropArea.height, cropArea.y + deltaY));
    }

    // Clamp to image bounds
    newArea.x = Math.max(0, newArea.x);
    newArea.y = Math.max(0, newArea.y);
    newArea.width = Math.min(metadata.width - newArea.x, newArea.width);
    newArea.height = Math.min(metadata.height - newArea.y, newArea.height);

    onCropAreaChange(newArea);
    setDragStart({ x, y });
  }, [isDraggingCrop, dragStart, metadata, cropArea, resizeHandle, onCropAreaChange]);

  const handleCropMouseUp = React.useCallback(() => {
    setIsDraggingCrop(false);
    setDragStart(null);
    setResizeHandle(null);
  }, []);

  React.useEffect(() => {
    if (isDraggingCrop) {
      document.addEventListener('mousemove', handleCropMouseMove);
      document.addEventListener('mouseup', handleCropMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCropMouseMove);
        document.removeEventListener('mouseup', handleCropMouseUp);
      };
    }
  }, [isDraggingCrop, handleCropMouseMove, handleCropMouseUp]);

  // Calculate crop overlay position as percentage
  const getCropOverlayStyle = () => {
    if (!cropArea || !metadata) return {};
    
    return {
      left: `${(cropArea.x / metadata.width) * 100}%`,
      top: `${(cropArea.y / metadata.height) * 100}%`,
      width: `${(cropArea.width / metadata.width) * 100}%`,
      height: `${(cropArea.height / metadata.height) * 100}%`,
    };
  };

  if (!imageUrl) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center w-full h-64 md:h-96',
          'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        )}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="image-studio-file-input"
        />
        <label
          htmlFor="image-studio-file-input"
          className="flex flex-col items-center cursor-pointer"
        >
          <Upload className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-500" />
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tool.imageStudio.dropImageHere')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('tool.imageStudio.supportedFormats')}
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {t('tool.imageStudio.pasteFromClipboard')}
          </p>
        </label>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Metadata display */}
      {metadata && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 text-xs bg-black/60 text-white rounded">
          {metadata.width} × {metadata.height} • {(metadata.fileSize / 1024).toFixed(1)} KB
        </div>
      )}

      {/* Image container with transforms */}
      <div className="flex items-center justify-center p-4 min-h-64 md:min-h-96">
        {/* Wrapper that applies transform to both image and crop overlay */}
        <div 
          className="relative max-w-full max-h-full"
          style={{ transform: getTransformStyle() }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-[60vh] object-contain block"
            onError={() => {
              // Handle broken image
            }}
          />

          {/* Crop overlay - now transforms with the image */}
          {showCropOverlay && cropArea && metadata && (
            <>
              {/* Darkened area outside crop */}
              <div className="absolute inset-0 bg-black/50 pointer-events-none" />
              
              {/* Crop selection area */}
              <div
                className="absolute border-2 border-white bg-transparent cursor-move"
                style={getCropOverlayStyle()}
                onMouseDown={(e) => handleCropMouseDown(e)}
              >
                {/* Clear window */}
                <div className="absolute inset-0 bg-black/0" />
                
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
                </div>

                {/* Resize handles */}
                {['nw', 'ne', 'sw', 'se'].map((handle) => (
                  <div
                    key={handle}
                    className={cn(
                      'absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-sm cursor-pointer',
                      handle === 'nw' && '-left-2 -top-2 cursor-nw-resize',
                      handle === 'ne' && '-right-2 -top-2 cursor-ne-resize',
                      handle === 'sw' && '-left-2 -bottom-2 cursor-sw-resize',
                      handle === 'se' && '-right-2 -bottom-2 cursor-se-resize'
                    )}
                    onMouseDown={(e) => handleCropMouseDown(e, handle)}
                  />
                ))}

                {/* Crop dimensions display */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs bg-black/80 text-white rounded whitespace-nowrap">
                  {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* No image placeholder overlay (for drag) */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg">
          <div className="text-center">
            <ImageOff className="w-12 h-12 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t('tool.imageStudio.dropToReplace')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

