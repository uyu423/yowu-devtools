import React from 'react';
import { ChevronDown, ChevronRight, Power, Settings, RotateCcw, Copy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ImageStudioState } from '../types';
import { PIPELINE_STEPS } from '../constants';

interface PipelinePanelProps {
  state: ImageStudioState;
  hasImage: boolean;
  isProcessing: boolean;
  isCopying?: boolean;
  onToggleStep: (stepId: 'crop' | 'resize' | 'rotate') => void;
  onResetPipeline: () => void;
  onExport: () => void;
  onCopyToClipboard?: () => void;
  onOpenPresets: () => void;
  t: (key: string) => string;
  children?: React.ReactNode;
}

export const PipelinePanel: React.FC<PipelinePanelProps> = ({
  state,
  hasImage,
  isProcessing,
  isCopying = false,
  onToggleStep,
  onResetPipeline,
  onExport,
  onCopyToClipboard,
  onOpenPresets,
  t,
  children,
}) => {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(new Set(['crop', 'resize', 'rotate', 'export']));
  
  // Detect Mac for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const copyShortcut = isMac ? '⌘C' : 'Ctrl+C';
  const exportShortcut = isMac ? '⌘↵' : 'Ctrl+Enter';
  const resetShortcut = isMac ? '⌘⇧R' : 'Ctrl+Shift+R';

  const toggleExpand = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getStepEnabled = (stepId: string): boolean => {
    switch (stepId) {
      case 'crop':
        return state.cropEnabled;
      case 'resize':
        return state.resizeEnabled;
      case 'rotate':
        return state.rotateEnabled;
      case 'export':
        return true; // Export is always enabled when there's an image
      default:
        return false;
    }
  };

  const enabledStepsCount = [state.cropEnabled, state.resizeEnabled, state.rotateEnabled].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('tool.imageStudio.pipeline')}
          </h3>
          <Tooltip content={`${t('tool.imageStudio.resetPipeline')} (${resetShortcut})`}>
            <button
              type="button"
              onClick={onResetPipeline}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {enabledStepsCount} {t('tool.imageStudio.stepsEnabled')}
        </span>
      </div>

      {/* Pipeline Steps */}
      <div className="flex-1 overflow-y-auto">
        {PIPELINE_STEPS.map((step, index) => {
          const isEnabled = getStepEnabled(step.id);
          const isExpanded = expandedSteps.has(step.id);
          const isExport = step.id === 'export';
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                'border-b border-gray-200 dark:border-gray-700 last:border-b-0',
                !isEnabled && !isExport && 'opacity-60'
              )}
            >
              {/* Step Header */}
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                  isExpanded && 'bg-gray-50 dark:bg-gray-800/30'
                )}
                onClick={() => toggleExpand(step.id)}
              >
                {/* Step number */}
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                    isEnabled || isExport
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  )}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isEnabled || isExport
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                />

                {/* Name */}
                <span
                  className={cn(
                    'flex-1 text-sm font-medium',
                    isEnabled || isExport
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {t(`tool.imageStudio.${step.id}.title`)}
                </span>

                {/* Enable/Disable toggle (not for export) */}
                {!isExport && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStep(step.id as 'crop' | 'resize' | 'rotate');
                    }}
                    className={cn(
                      'p-1 rounded transition-colors',
                      isEnabled
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    title={isEnabled ? t('common.disable') : t('common.enable')}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                )}

                {/* Expand/Collapse */}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Step Content (expanded) */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  {/* Render children based on step.id */}
                  {children && React.Children.toArray(children).find(
                    (child) => React.isValidElement<{ 'data-step'?: string }>(child) && child.props['data-step'] === step.id
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Export Buttons */}
        <div className="flex gap-2">
          <Tooltip content={exportShortcut} className="flex-1">
            <button
              type="button"
              onClick={onExport}
              disabled={!hasImage || isProcessing || isCopying}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
                hasImage && !isProcessing && !isCopying
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              <Download className="w-4 h-4" />
              {isProcessing ? t('common.processing') : t('common.download')}
            </button>
          </Tooltip>
          {onCopyToClipboard && (
            <Tooltip content={copyShortcut}>
              <button
                type="button"
                onClick={onCopyToClipboard}
                disabled={!hasImage || isProcessing || isCopying}
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors',
                  hasImage && !isProcessing && !isCopying
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                )}
              >
                <Copy className="w-4 h-4" />
                {isCopying && <span className="text-sm">{t('common.copying')}</span>}
              </button>
            </Tooltip>
          )}
        </div>

        {/* Presets Button */}
        <button
          type="button"
          onClick={onOpenPresets}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
        >
          <Settings className="w-4 h-4" />
          {t('common.preset.managePresets')}
        </button>
      </div>
    </div>
  );
};

