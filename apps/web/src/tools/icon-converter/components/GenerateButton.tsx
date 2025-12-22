import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  isGenerating: boolean;
  progress: number;
  currentSize: number | null;
  disabled: boolean;
  onGenerate: () => void;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  progress,
  currentSize,
  disabled,
  onGenerate,
}) => {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200',
          'flex items-center justify-center gap-2',
          disabled || isGenerating
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate</span>
          </>
        )}
      </button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {currentSize && `Processing ${currentSize}×${currentSize}...`}
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

