/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Image, ExternalLink } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { ShareModal } from '@/components/common/ShareModal';
import { toast } from 'sonner';

import type { ImageStudioState, ImageMetadata, CropArea, ExportFormat } from './types';
import { DEFAULT_STATE, MAX_FILE_SIZE, SUPPORTED_INPUT_FORMATS, EXPORT_FORMAT_OPTIONS } from './constants';
import { executeAndDownload, executePipeline, type PipelineConfig } from './processing';
import {
  ImagePreview,
  PipelinePanel,
  PipelinePresetModal,
  CropPanel,
  ResizePanel,
  RotatePanel,
  ExportPanel,
} from './components';
import { usePipelinePresets, type ImagePipelinePreset } from './hooks/usePipelinePresets';

const ImageStudioTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.imageStudio.title'));

  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<ImageStudioState>('image-studio', DEFAULT_STATE, {
      shareStateFilter: ({
        cropEnabled,
        resizeEnabled,
        rotateEnabled,
        cropAspectRatio,
        cropCustomRatio,
        resizeWidth,
        resizeHeight,
        resizeLockAspect,
        resizeMode,
        resizeQuality,
        rotation,
        flipHorizontal,
        flipVertical,
        exportFormat,
        exportQuality,
        exportSuffix,
      }) => ({
        cropEnabled,
        resizeEnabled,
        rotateEnabled,
        cropAspectRatio,
        cropCustomRatio,
        cropArea: null, // Don't share crop area (image-specific)
        resizeWidth,
        resizeHeight,
        resizeLockAspect,
        resizeMode,
        resizeQuality,
        rotation,
        flipHorizontal,
        flipVertical,
        exportFormat,
        exportQuality,
        exportSuffix,
      }),
    });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.imageStudio.title'),
  });

  // Image state
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = React.useState<ImageMetadata | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isCopying, setIsCopying] = React.useState(false);

  // Preset modal state
  const [presetModalOpen, setPresetModalOpen] = React.useState(false);
  const {
    presets,
    addPreset,
    removePreset,
    clearAllPresets,
    exportPresets,
    importPresets,
  } = usePipelinePresets();

  // Supported formats detection
  const [supportedFormats, setSupportedFormats] = React.useState<Set<ExportFormat>>(new Set(['png', 'jpeg']));

  // Check WebP support on mount
  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
    
    setSupportedFormats(new Set(webpSupported ? ['png', 'jpeg', 'webp'] : ['png', 'jpeg']));
    
    // If current format is not supported, fallback to png
    if (!webpSupported && state.exportFormat === 'webp') {
      updateState({ exportFormat: 'png' });
    }
  }, [state.exportFormat, updateState]);

  // Handle file selection
  const handleFileSelect = React.useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!SUPPORTED_INPUT_FORMATS.includes(file.type)) {
      setError(t('tool.imageStudio.unsupportedFormat'));
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t('tool.imageStudio.fileTooLarge'));
      return;
    }

    // Create object URL for preview
    const url = URL.createObjectURL(file);

    // Load image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      // Revoke old URL if exists
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      setImageUrl(url);
      setImageMetadata({
        fileName: file.name,
        fileSize: file.size,
        width: img.width,
        height: img.height,
        type: file.type,
      });

      // Initialize crop area to full image
      updateState({
        cropArea: {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        },
        resizeWidth: img.width,
        resizeHeight: img.height,
      });

      toast.success(t('common.fileLoadedSuccess').replace('{name}', file.name));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError(t('tool.imageStudio.failedToLoadImage'));
    };

    img.src = url;
  }, [imageUrl, t, updateState]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Toggle pipeline steps
  const handleToggleStep = (stepId: 'crop' | 'resize' | 'rotate') => {
    const key = `${stepId}Enabled` as keyof ImageStudioState;
    updateState({ [key]: !state[key] });
  };

  // Handle crop area change
  const handleCropAreaChange = (area: CropArea) => {
    updateState({ cropArea: area });
  };

  // Reset crop to full image
  const handleResetCrop = () => {
    if (imageMetadata) {
      updateState({
        cropArea: {
          x: 0,
          y: 0,
          width: imageMetadata.width,
          height: imageMetadata.height,
        },
      });
    }
  };

  // Reset transform
  const handleResetTransform = () => {
    updateState({
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    });
  };

  // Reset entire pipeline settings (not the image)
  const handleResetPipeline = React.useCallback(() => {
    const resetValues: Partial<ImageStudioState> = {
      // Pipeline steps
      cropEnabled: DEFAULT_STATE.cropEnabled,
      resizeEnabled: DEFAULT_STATE.resizeEnabled,
      rotateEnabled: DEFAULT_STATE.rotateEnabled,
      // Crop settings
      cropAspectRatio: DEFAULT_STATE.cropAspectRatio,
      cropCustomRatio: DEFAULT_STATE.cropCustomRatio,
      cropArea: imageMetadata
        ? { x: 0, y: 0, width: imageMetadata.width, height: imageMetadata.height }
        : DEFAULT_STATE.cropArea,
      // Resize settings
      resizeWidth: imageMetadata?.width || DEFAULT_STATE.resizeWidth,
      resizeHeight: imageMetadata?.height || DEFAULT_STATE.resizeHeight,
      resizeLockAspect: DEFAULT_STATE.resizeLockAspect,
      resizeMode: DEFAULT_STATE.resizeMode,
      resizeQuality: DEFAULT_STATE.resizeQuality,
      // Rotate/Flip settings
      rotation: DEFAULT_STATE.rotation,
      flipHorizontal: DEFAULT_STATE.flipHorizontal,
      flipVertical: DEFAULT_STATE.flipVertical,
      // Export settings
      exportFormat: DEFAULT_STATE.exportFormat,
      exportQuality: DEFAULT_STATE.exportQuality,
      exportSuffix: DEFAULT_STATE.exportSuffix,
    };
    updateState(resetValues);
    toast.success(t('common.reset'));
  }, [imageMetadata, updateState, t]);

  // Build output file name
  const buildOutputFileName = React.useCallback(() => {
    const baseName = imageMetadata?.fileName.replace(/\.[^/.]+$/, '') || 'image';
    const suffix = state.exportSuffix || '_edited';
    const extension = EXPORT_FORMAT_OPTIONS.find((f) => f.value === state.exportFormat)?.extension || '.png';
    return `${baseName}${suffix}${extension}`;
  }, [imageMetadata?.fileName, state.exportSuffix, state.exportFormat]);

  // Export image using the processing pipeline
  const handleExport = React.useCallback(async () => {
    if (!imageUrl || !imageMetadata) {
      toast.error(t('tool.imageStudio.noImageLoaded'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Build pipeline configuration from current state
      const config: PipelineConfig = {
        crop: {
          enabled: state.cropEnabled,
          area: state.cropArea,
        },
        resize: {
          enabled: state.resizeEnabled,
          width: state.resizeWidth,
          height: state.resizeHeight,
          mode: state.resizeMode,
          quality: state.resizeQuality,
        },
        rotate: {
          enabled: state.rotateEnabled,
          rotation: state.rotation,
          flipHorizontal: state.flipHorizontal,
          flipVertical: state.flipVertical,
        },
        export: {
          format: state.exportFormat,
          quality: state.exportQuality,
          fileName: buildOutputFileName(),
        },
      };

      // Execute pipeline
      const result = await executeAndDownload(imageUrl, config);

      if (result.success) {
        toast.success(t('common.fileDownloadSuccess'));
      } else {
        throw new Error(result.error || t('tool.imageStudio.exportFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tool.imageStudio.exportFailed'));
      toast.error(t('tool.imageStudio.exportFailed'));
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, imageMetadata, state, buildOutputFileName, t]);

  // Copy processed image to clipboard
  const handleCopyToClipboard = React.useCallback(async () => {
    if (!imageUrl || !imageMetadata) {
      toast.error(t('tool.imageStudio.noImageLoaded'));
      return;
    }

    setIsCopying(true);
    setError(null);

    try {
      // Build pipeline configuration - force PNG for clipboard compatibility
      const config: PipelineConfig = {
        crop: {
          enabled: state.cropEnabled,
          area: state.cropArea,
        },
        resize: {
          enabled: state.resizeEnabled,
          width: state.resizeWidth,
          height: state.resizeHeight,
          mode: state.resizeMode,
          quality: state.resizeQuality,
        },
        rotate: {
          enabled: state.rotateEnabled,
          rotation: state.rotation,
          flipHorizontal: state.flipHorizontal,
          flipVertical: state.flipVertical,
        },
        export: {
          format: 'png', // PNG for best clipboard compatibility
          quality: 100,
          fileName: 'clipboard',
        },
      };

      // Execute pipeline
      const result = await executePipeline(imageUrl, config);

      if (result.success && result.blob) {
        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': result.blob,
          }),
        ]);
        toast.success(t('tool.imageStudio.copiedToClipboard'));
      } else {
        throw new Error(result.error || t('tool.imageStudio.copyFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tool.imageStudio.copyFailed'));
      toast.error(t('tool.imageStudio.copyFailed'));
    } finally {
      setIsCopying(false);
    }
  }, [imageUrl, imageMetadata, state, t]);

  // Reset all
  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageMetadata(null);
    setError(null);
    resetState();
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      // Cmd/Ctrl + O: Open file
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault();
        // Click the file input to trigger file picker
        const input = document.getElementById('image-studio-file-input') as HTMLInputElement;
        input?.click();
        return;
      }

      // Cmd/Ctrl + Enter: Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (imageUrl && imageMetadata && !isProcessing && !isCopying) {
          handleExport();
        }
        return;
      }

      // Cmd/Ctrl + Shift + R: Reset pipeline
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        handleResetPipeline();
        return;
      }

      // Esc: Close modal
      if (e.key === 'Escape') {
        if (presetModalOpen) {
          e.preventDefault();
          setPresetModalOpen(false);
        }
        return;
      }

      // Cmd/Ctrl + C: Copy image to clipboard
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        // Skip if focus is on an input
        if (isInputFocused) {
          return; // Allow default copy behavior for text inputs
        }

        // Skip if no image is loaded or already processing
        if (!imageUrl || !imageMetadata || isCopying || isProcessing) {
          return;
        }

        e.preventDefault();
        handleCopyToClipboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, imageMetadata, isCopying, isProcessing, presetModalOpen, handleCopyToClipboard, handleResetPipeline, handleExport]);

  // Get current settings for preset
  const getCurrentSettings = React.useCallback((): ImagePipelinePreset['settings'] => ({
    cropEnabled: state.cropEnabled,
    cropAspectRatio: state.cropAspectRatio,
    cropCustomRatio: state.cropCustomRatio,
    resizeEnabled: state.resizeEnabled,
    resizeWidth: state.resizeWidth,
    resizeHeight: state.resizeHeight,
    resizeLockAspect: state.resizeLockAspect,
    resizeMode: state.resizeMode,
    resizeQuality: state.resizeQuality,
    rotateEnabled: state.rotateEnabled,
    rotation: state.rotation,
    flipHorizontal: state.flipHorizontal,
    flipVertical: state.flipVertical,
    exportFormat: state.exportFormat,
    exportQuality: state.exportQuality,
    exportSuffix: state.exportSuffix,
  }), [state]);

  // Handle preset selection (load preset)
  const handleSelectPreset = (preset: ImagePipelinePreset) => {
    updateState({
      cropEnabled: preset.settings.cropEnabled,
      cropAspectRatio: preset.settings.cropAspectRatio,
      cropCustomRatio: preset.settings.cropCustomRatio,
      resizeEnabled: preset.settings.resizeEnabled,
      resizeWidth: preset.settings.resizeWidth,
      resizeHeight: preset.settings.resizeHeight,
      resizeLockAspect: preset.settings.resizeLockAspect,
      resizeMode: preset.settings.resizeMode,
      resizeQuality: preset.settings.resizeQuality,
      rotateEnabled: preset.settings.rotateEnabled,
      rotation: preset.settings.rotation,
      flipHorizontal: preset.settings.flipHorizontal,
      flipVertical: preset.settings.flipVertical,
      exportFormat: preset.settings.exportFormat,
      exportQuality: preset.settings.exportQuality,
      exportSuffix: preset.settings.exportSuffix,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <ToolHeader
          title={t('tool.imageStudio.title')}
          description={t('tool.imageStudio.description')}
          onReset={handleReset}
          onShare={handleShare}
        />
      </div>

      {error && (
        <div className="px-4 md:px-6 pt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <ImagePreview
            imageUrl={imageUrl}
            metadata={imageMetadata}
            cropArea={state.cropArea}
            rotation={state.rotation}
            flipHorizontal={state.flipHorizontal}
            flipVertical={state.flipVertical}
            showCropOverlay={state.cropEnabled}
            onFileSelect={handleFileSelect}
            onCropAreaChange={handleCropAreaChange}
            t={t}
          />
          
          {/* Bug Report Link */}
          <div className="flex justify-center mt-4">
            <a
              href="https://github.com/uyu423/yowu-devtools/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <span>{t('sidebar.reportBug')}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Pipeline Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <PipelinePanel
            state={state}
            hasImage={!!imageUrl}
            isProcessing={isProcessing}
            isCopying={isCopying}
            onToggleStep={handleToggleStep}
            onResetPipeline={handleResetPipeline}
            onExport={handleExport}
            onCopyToClipboard={handleCopyToClipboard}
            onOpenPresets={() => setPresetModalOpen(true)}
            t={t}
          >
            {/* Crop Panel */}
            <CropPanel
              data-step="crop"
              aspectRatio={state.cropAspectRatio}
              customRatio={state.cropCustomRatio}
              cropArea={state.cropArea}
              imageWidth={imageMetadata?.width || 1920}
              imageHeight={imageMetadata?.height || 1080}
              onAspectRatioChange={(ratio) => updateState({ cropAspectRatio: ratio })}
              onCustomRatioChange={(ratio) => updateState({ cropCustomRatio: ratio })}
              onCropAreaChange={handleCropAreaChange}
              onResetCrop={handleResetCrop}
              t={t}
              disabled={!state.cropEnabled}
            />

            {/* Rotate Panel */}
            <RotatePanel
              data-step="rotate"
              rotation={state.rotation}
              flipHorizontal={state.flipHorizontal}
              flipVertical={state.flipVertical}
              onRotationChange={(rotation) => updateState({ rotation })}
              onFlipHorizontalChange={(flip) => updateState({ flipHorizontal: flip })}
              onFlipVerticalChange={(flip) => updateState({ flipVertical: flip })}
              onResetTransform={handleResetTransform}
              t={t}
              disabled={!state.rotateEnabled}
            />

            {/* Resize Panel */}
            <ResizePanel
              data-step="resize"
              width={state.resizeWidth}
              height={state.resizeHeight}
              lockAspect={state.resizeLockAspect}
              mode={state.resizeMode}
              quality={state.resizeQuality}
              originalWidth={imageMetadata?.width || 1920}
              originalHeight={imageMetadata?.height || 1080}
              onWidthChange={(width) => updateState({ resizeWidth: width })}
              onHeightChange={(height) => updateState({ resizeHeight: height })}
              onLockAspectChange={(locked) => updateState({ resizeLockAspect: locked })}
              onModeChange={(mode) => updateState({ resizeMode: mode })}
              onQualityChange={(quality) => updateState({ resizeQuality: quality })}
              t={t}
              disabled={!state.resizeEnabled}
            />

            {/* Export Panel - always enabled */}
            <ExportPanel
              data-step="export"
              format={state.exportFormat}
              quality={state.exportQuality}
              suffix={state.exportSuffix}
              originalFileName={imageMetadata?.fileName || 'image'}
              supportedFormats={supportedFormats}
              onFormatChange={(format) => updateState({ exportFormat: format })}
              onQualityChange={(quality) => updateState({ exportQuality: quality })}
              onSuffixChange={(suffix) => updateState({ exportSuffix: suffix })}
              t={t}
            />
          </PipelinePanel>
        </div>
      </div>

      <ShareModal {...shareModalProps} />

      <PipelinePresetModal
        isOpen={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        presets={presets}
        onSelect={handleSelectPreset}
        onAddPreset={addPreset}
        onRemovePreset={removePreset}
        onClearAll={clearAllPresets}
        onExport={exportPresets}
        onImport={importPresets}
        getCurrentSettings={getCurrentSettings}
        t={t}
      />
    </div>
  );
};

export const imageStudioTool: ToolDefinition<ImageStudioState> = {
  id: 'image-studio',
  title: 'Image Studio',
  description: 'Crop, resize, rotate, and convert images',
  path: '/image-studio',
  icon: Image,
  keywords: [
    'image',
    'photo',
    'crop',
    'resize',
    'rotate',
    'flip',
    'convert',
    'png',
    'jpeg',
    'webp',
    'editor',
    'compress',
  ],
  category: 'Media',
  defaultState: DEFAULT_STATE,
  Component: ImageStudioTool,
};

