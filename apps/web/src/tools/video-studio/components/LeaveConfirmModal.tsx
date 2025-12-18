import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}

/**
 * Modal to confirm leaving the page while processing is in progress
 */
export const LeaveConfirmModal: React.FC<LeaveConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  t,
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
          {t('tool.videoStudio.leavePageTitle')}
        </h3>

        {/* Message */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
          {t('tool.videoStudio.leavePageWarning')}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {t('tool.videoStudio.stayOnPage')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            {t('tool.videoStudio.leavePage')}
          </button>
        </div>
      </div>
    </div>
  );
};

