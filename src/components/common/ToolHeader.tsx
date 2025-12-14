import React from 'react';
import { Share2, RotateCcw } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  description: string;
  onReset?: () => void;
  onShare?: () => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ title, description, onReset, onShare }) => {
  return (
    <div className="mb-6 pb-4 border-b dark:border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex space-x-2">
          {onShare && (
            <button 
              onClick={onShare}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              title="Share State"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {onReset && (
            <button 
              onClick={onReset}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
              title="Reset Tool"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
