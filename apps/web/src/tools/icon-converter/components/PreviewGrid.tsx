import React from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewGridProps {
  sizes: number[];
  generatedBlobs: { size: number; blob: Blob; dataUrl: string }[];
  isGenerating: boolean;
}

export const PreviewGrid: React.FC<PreviewGridProps> = ({
  sizes,
  generatedBlobs,
  isGenerating,
}) => {
  const hasPreview = generatedBlobs.length > 0 || isGenerating;

  if (!hasPreview) {
    return (
      <div className="p-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-700">
              <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No preview available
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Generate icons to see preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preview</h3>

      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {sizes.map((size) => {
            const preview = generatedBlobs.find((b) => b.size === size);

            return (
              <div
                key={size}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <div
                  className={cn(
                    'relative flex items-center justify-center rounded border border-gray-300 dark:border-gray-600',
                    'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)]',
                    'dark:bg-[linear-gradient(45deg,#555_25%,transparent_25%,transparent_75%,#555_75%,#555),linear-gradient(45deg,#555_25%,transparent_25%,transparent_75%,#555_75%,#555)]',
                    'bg-[length:16px_16px] bg-[position:0_0,8px_8px]'
                  )}
                  style={{
                    width: `${Math.min(size, 64)}px`,
                    height: `${Math.min(size, 64)}px`,
                  }}
                >
                  {preview ? (
                    <img
                      src={preview.dataUrl}
                      alt={`${size}×${size}`}
                      className="w-full h-full object-contain"
                      style={{
                        imageRendering: size <= 32 ? 'pixelated' : 'auto',
                      }}
                    />
                  ) : isGenerating ? (
                    <Loader2 className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
                  ) : null}
                </div>

                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {size}×{size}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {generatedBlobs.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {generatedBlobs.length} of {sizes.length} generated
        </p>
      )}
    </div>
  );
};

