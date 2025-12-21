/**
 * Domain Preset Modal - 도메인 프리셋 관리 모달
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import type { DomainPreset } from '../types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18nHooks';
import { toast } from 'sonner';

interface DomainPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: DomainPreset[];
  onSelect: (domain: string) => void;
  onAddPreset: (title: string, domain: string) => void;
  onRemovePreset: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  targetSide: 'A' | 'B';
}

export const DomainPresetModal: React.FC<DomainPresetModalProps> = ({
  isOpen,
  onClose,
  presets,
  onSelect,
  onAddPreset,
  onRemovePreset,
  onClearAll,
  onExport,
  onImport,
  targetSide,
}) => {
  const { t } = useI18n();
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddPreset = () => {
    if (!newTitle.trim() || !newDomain.trim()) {
      toast.error(t('tool.apiDiff.preset.fillBothFields'));
      return;
    }
    onAddPreset(newTitle, newDomain);
    setNewTitle('');
    setNewDomain('');
    toast.success(t('tool.apiDiff.preset.added'));
  };

  const handleSelect = (domain: string) => {
    onSelect(domain);
    onClose();
    toast.success(t('tool.apiDiff.preset.selected'));
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemovePreset(id);
    toast.success(t('tool.apiDiff.preset.removed'));
  };

  const handleClearAll = () => {
    if (showConfirmClear) {
      onClearAll();
      setShowConfirmClear(false);
      toast.success(t('tool.apiDiff.preset.clearedAll'));
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
      toast.success(t('tool.apiDiff.preset.importSuccess').replace('{{count}}', String(result.count)));
    } else {
      toast.error(result.error || t('tool.apiDiff.preset.importFailed'));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('tool.apiDiff.preset.title')} - Domain {targetSide}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add New Preset */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.apiDiff.preset.addNew')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('tool.apiDiff.preset.titlePlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder={t('tool.apiDiff.preset.domainPlaceholder')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPreset()}
              />
              <button
                onClick={handleAddPreset}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                title={t('tool.apiDiff.preset.add')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preset List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tool.apiDiff.preset.savedPresets')} ({presets.length})
            </label>
            {presets.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                {t('tool.apiDiff.preset.noPresets')}
              </div>
            ) : (
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelect(preset.domain)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors',
                      'bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                      'border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {preset.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                        {preset.domain}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRemove(preset.id, e)}
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title={t('tool.apiDiff.preset.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors',
                presets.length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title={t('tool.apiDiff.preset.export')}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.export')}</span>
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title={t('tool.apiDiff.preset.import')}
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
              'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors',
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
                <span>{t('tool.apiDiff.preset.confirmClear')}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('tool.apiDiff.preset.clearAll')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainPresetModal;

