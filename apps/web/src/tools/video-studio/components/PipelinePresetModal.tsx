/**
 * Pipeline Preset Modal - 파이프라인 프리셋 관리 모달 (Video Studio)
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Shield,
  Check,
  Settings,
} from 'lucide-react';
import type { VideoPipelinePreset } from '../hooks/usePipelinePresets';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PipelinePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: VideoPipelinePreset[];
  onSelect: (preset: VideoPipelinePreset) => void;
  onAddPreset: (
    name: string,
    description: string,
    settings: VideoPipelinePreset['settings']
  ) => void;
  onRemovePreset: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  getCurrentSettings: () => VideoPipelinePreset['settings'];
  t: (key: string) => string;
}

export const PipelinePresetModal: React.FC<PipelinePresetModalProps> = ({
  isOpen,
  onClose,
  presets,
  onSelect,
  onAddPreset,
  onRemovePreset,
  onClearAll,
  onExport,
  onImport,
  getCurrentSettings,
  t,
}) => {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddPreset = () => {
    if (!newName.trim()) {
      toast.error(t('common.preset.nameRequired'));
      return;
    }
    const settings = getCurrentSettings();
    onAddPreset(newName, newDescription, settings);
    setNewName('');
    setNewDescription('');
    toast.success(t('common.preset.added'));
  };

  const handleSelect = (preset: VideoPipelinePreset) => {
    onSelect(preset);
    onClose();
    toast.success(t('common.preset.loaded').replace('{name}', preset.name));
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemovePreset(id);
    toast.success(t('common.preset.removed'));
  };

  const handleClearAll = () => {
    if (showConfirmClear) {
      onClearAll();
      setShowConfirmClear(false);
      toast.success(t('common.preset.clearedAll'));
    } else {
      setShowConfirmClear(true);
      setTimeout(() => setShowConfirmClear(false), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await onImport(file);
    if (result.success) {
      toast.success(t('common.preset.importSuccess').replace('{count}', String(result.count)));
    } else {
      toast.error(result.error || t('common.preset.importFailed'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('common.preset.managePresets')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mx-4 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('common.preset.privacyNotice')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add New Preset */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.preset.saveCurrentSettings')}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('common.preset.namePlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t('common.preset.descriptionPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPreset()}
              />
              <button
                onClick={handleAddPreset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('common.preset.savePreset')}
              </button>
            </div>
          </div>

          {/* Preset List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('common.preset.savedPresets')} ({presets.length})
            </label>
            {presets.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                {t('common.preset.noPresets')}
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors',
                      'bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                      'border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {preset.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(preset.createdAt)}
                        </span>
                      </div>
                      {preset.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {preset.description}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {preset.settings.trimEnabled && (
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            Trim
                          </span>
                        )}
                        {preset.settings.cutEnabled && (
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            Cut
                          </span>
                        )}
                        {preset.settings.cropEnabled && (
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            Crop
                          </span>
                        )}
                        {preset.settings.resizeEnabled && (
                          <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                            Resize
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                          {preset.settings.exportFormat.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(preset);
                        }}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title={t('common.preset.load')}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleRemove(preset.id, e)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title={t('common.preset.remove')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              disabled={presets.length === 0}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors',
                presets.length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title={t('common.preset.exportAll')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.export')}</span>
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title={t('common.preset.importAll')}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.import')}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <button
            onClick={handleClearAll}
            disabled={presets.length === 0}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors',
              presets.length === 0
                ? 'text-gray-400 cursor-not-allowed'
                : showConfirmClear
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            )}
          >
            {showConfirmClear ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>{t('common.preset.confirmClear')}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.preset.clearAll')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PipelinePresetModal;

