/**
 * CorsModal - Modal shown when CORS error is detected
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Zap, ExternalLink, X } from 'lucide-react';
import type { ExtensionStatus } from '../types';

interface CorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetryWithExtension: () => void;
  extensionStatus: ExtensionStatus;
}

// Chrome Web Store URL for the extension (placeholder)
const EXTENSION_STORE_URL = 'https://chromewebstore.google.com';

export const CorsModal: React.FC<CorsModalProps> = ({
  isOpen,
  onClose,
  onRetryWithExtension,
  extensionStatus,
}) => {
  if (!isOpen) return null;

  const isExtensionAvailable = extensionStatus === 'connected' || extensionStatus === 'permission-required';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-md mx-4 p-6 rounded-xl shadow-xl',
        'bg-white dark:bg-gray-800'
      )}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">
          CORS Error Detected
        </h3>

        {/* Description */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
          This request was blocked by the browser's CORS policy.
          {isExtensionAvailable ? (
            <> Would you like to retry using the Chrome Extension to bypass CORS?</>
          ) : (
            <> Install the Chrome Extension to bypass CORS restrictions.</>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {isExtensionAvailable ? (
            <button
              onClick={onRetryWithExtension}
              className={cn(
                'flex items-center justify-center gap-2 w-full px-4 py-2.5',
                'bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium',
                'transition-colors'
              )}
            >
              <Zap className="w-4 h-4" />
              Retry with Extension
            </button>
          ) : (
            <a
              href={EXTENSION_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center gap-2 w-full px-4 py-2.5',
                'bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium',
                'transition-colors'
              )}
            >
              Install Chrome Extension
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onClose}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg font-medium',
              'text-gray-700 dark:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'transition-colors'
            )}
          >
            Cancel
          </button>
        </div>

        {/* Learn more link */}
        <div className="mt-4 text-center">
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Learn more about CORS
          </a>
        </div>
      </div>
    </div>
  );
};

export default CorsModal;

