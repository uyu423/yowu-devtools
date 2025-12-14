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
    <div className="mb-6 pb-4 border-b">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex space-x-2">
          {onShare && (
            <button 
              onClick={onShare}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Share State"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          {onReset && (
            <button 
              onClick={onReset}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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

