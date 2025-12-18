/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ToolDefinition } from '@/tools/types';
import { Video } from 'lucide-react';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useToolState } from '@/hooks/useToolState';
import { useShareModal } from '@/hooks/useShareModal';
import { useTitle } from '@/hooks/useTitle';
import { useI18n } from '@/hooks/useI18nHooks';
import { ShareModal } from '@/components/common/ShareModal';
import { toast } from 'sonner';

import type { VideoStudioState, VideoMetadata, CropArea, ProcessingState, CutSegment, ThumbnailFormat } from './types';
import { DEFAULT_STATE, MAX_FILE_SIZE, SUPPORTED_INPUT_FORMATS, EXPORT_FORMAT_OPTIONS } from './constants';
import {
  executeVideoPipeline,
  extractThumbnail,
  downloadResult,
  downloadThumbnail,
  type VideoPipelineConfig,
  type ThumbnailConfig,
  type VideoProcessingProgress,
  getFileExtension,
} from './processing';
import {
  VideoPreview,
  PipelinePanel,
  PipelinePresetModal,
  ThumbnailPanel,
  TrimPanel,
  CutPanel,
  CropPanel,
  ResizePanel,
  ExportPanel,
} from './components';
import { usePipelinePresets, type VideoPipelinePreset } from './hooks/usePipelinePresets';

const INITIAL_PROCESSING_STATE: ProcessingState = {
  isProcessing: false,
  progress: 0,
  stage: 'idle',
  message: '',
  error: null,
  canCancel: false,
};

const VideoStudioTool: React.FC = () => {
  const { t } = useI18n();
  useTitle(t('tool.videoStudio.title'));

  const { state, updateState, resetState, copyShareLink, shareViaWebShare, getShareStateInfo } =
    useToolState<VideoStudioState>('video-studio', DEFAULT_STATE, {
      shareStateFilter: ({
        // Thumbnail is separate - not part of pipeline
        trimEnabled,
        cutEnabled,
        cropEnabled,
        resizeEnabled,
        trimStart,
        trimEnd,
        cutMode,
        splitCount,
        resizeWidth,
        resizeHeight,
        resizeLockAspect,
        resizeMode,
        exportFormat,
        qualityPreset,
        exportSuffix,
      }) => ({
        trimEnabled,
        cutEnabled,
        cropEnabled,
        resizeEnabled,
        // Thumbnail settings are not shared (separate action)
        thumbnailTime: 0,
        thumbnailFormat: 'jpeg' as ThumbnailFormat,
        trimStart,
        trimEnd,
        cutMode,
        cutSegments: [], // Don't share segments (video-specific)
        splitCount,
        cropArea: null, // Don't share crop area (video-specific)
        resizeWidth,
        resizeHeight,
        resizeLockAspect,
        resizeMode,
        exportFormat,
        qualityPreset,
        exportSuffix,
      }),
    });

  const { handleShare, shareModalProps } = useShareModal({
    copyShareLink,
    shareViaWebShare,
    getShareStateInfo,
    toolName: t('tool.videoStudio.title'),
  });

  // Video state
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = React.useState<VideoMetadata | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [processingState, setProcessingState] = React.useState<ProcessingState>(INITIAL_PROCESSING_STATE);

  // Thumbnail extraction state (separate from pipeline)
  const [isExtractingThumbnail, setIsExtractingThumbnail] = React.useState(false);

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

  // Handle file selection
  const handleFileSelect = React.useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!SUPPORTED_INPUT_FORMATS.includes(file.type) && !file.type.startsWith('video/')) {
        setError(t('tool.videoStudio.unsupportedFormat'));
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(t('tool.videoStudio.fileTooLarge'));
        return;
      }

      // Revoke old URL if exists
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }

      // Create object URL for preview
      const url = URL.createObjectURL(file);

      // Load video to get metadata
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        setVideoFile(file);
        setVideoUrl(url);
        setVideoMetadata({
          fileName: file.name,
          fileSize: file.size,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          type: file.type,
        });

        // Initialize state based on video
        updateState({
          cropArea: {
            x: 0,
            y: 0,
            width: video.videoWidth,
            height: video.videoHeight,
          },
          resizeWidth: video.videoWidth,
          resizeHeight: video.videoHeight,
          trimStart: 0,
          trimEnd: video.duration,
        });

        toast.success(t('common.fileLoadedSuccess').replace('{name}', file.name));
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        setError(t('tool.videoStudio.failedToLoadVideo'));
      };

      video.src = url;
    },
    [videoUrl, t, updateState]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Toggle pipeline steps (thumbnail is not part of pipeline)
  const handleToggleStep = (stepId: 'trim' | 'cut' | 'crop' | 'resize') => {
    const key = `${stepId}Enabled` as keyof VideoStudioState;
    updateState({ [key]: !state[key] });
  };

  // Handle crop area change
  const handleCropAreaChange = (area: CropArea) => {
    updateState({ cropArea: area });
  };

  // Reset crop to full video
  const handleResetCrop = () => {
    if (videoMetadata) {
      updateState({
        cropArea: {
          x: 0,
          y: 0,
          width: videoMetadata.width,
          height: videoMetadata.height,
        },
      });
    }
  };

  // Handle cut segments change
  const handleCutSegmentsChange = (segments: CutSegment[]) => {
    updateState({ cutSegments: segments });
  };

  // Handle seek
  const handleSeek = (time: number) => {
    // Video preview component handles seeking internally
    console.log('Seek to:', time);
  };

  // Extract thumbnail (separate from pipeline - outputs image)
  const handleExtractThumbnail = async () => {
    if (!videoFile || !videoMetadata) {
      toast.error(t('tool.videoStudio.noVideoLoaded'));
      return;
    }

    setIsExtractingThumbnail(true);
    setError(null);

    try {
      const config: ThumbnailConfig = {
        time: state.thumbnailTime,
        format: state.thumbnailFormat,
        fileName: buildThumbnailFileName(),
      };

      const result = await extractThumbnail(videoFile, config, (progress) => {
        // Could update UI with progress if needed
        console.log('Thumbnail extraction progress:', progress);
      });

      if (result.success && result.blobs && result.blobs.length > 0) {
        downloadThumbnail(result.blobs[0], config.fileName);
        toast.success(t('common.fileDownloadSuccess'));
      } else {
        throw new Error(result.error || t('tool.videoStudio.thumbnail.extractFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tool.videoStudio.thumbnail.extractFailed'));
      toast.error(t('tool.videoStudio.thumbnail.extractFailed'));
    } finally {
      setIsExtractingThumbnail(false);
    }
  };

  // Build thumbnail file name
  const buildThumbnailFileName = React.useCallback(() => {
    const baseName = videoMetadata?.fileName.replace(/\.[^/.]+$/, '') || 'video';
    const extension = getFileExtension(state.thumbnailFormat);
    const timeStr = `_${Math.floor(state.thumbnailTime)}s`;
    return `${baseName}_thumbnail${timeStr}${extension}`;
  }, [videoMetadata?.fileName, state.thumbnailFormat, state.thumbnailTime]);

  // Export video using the processing pipeline
  const handleExport = async () => {
    if (!videoFile || !videoMetadata) {
      toast.error(t('tool.videoStudio.noVideoLoaded'));
      return;
    }

    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'loading-engine',
      message: t('tool.videoStudio.loadingEngine'),
      error: null,
      canCancel: true,
    });
    setError(null);

    try {
      // Build pipeline configuration from current state
      const config: VideoPipelineConfig = {
        trim: {
          enabled: state.trimEnabled,
          start: state.trimStart,
          end: state.trimEnd || videoMetadata.duration,
        },
        cut: {
          enabled: state.cutEnabled,
          mode: state.cutMode,
          segments: state.cutSegments,
          splitCount: state.splitCount,
        },
        crop: {
          enabled: state.cropEnabled,
          area: state.cropArea,
        },
        resize: {
          enabled: state.resizeEnabled,
          width: state.resizeWidth,
          height: state.resizeHeight,
          mode: state.resizeMode,
        },
        export: {
          format: state.exportFormat,
          qualityPreset: state.qualityPreset,
          fileName: buildOutputFileName(),
        },
      };

      // Progress handler
      const handleProgress = (progress: VideoProcessingProgress) => {
        setProcessingState((prev) => ({
          ...prev,
          progress: progress.progress,
          stage: progress.stage,
          message: getProgressMessage(progress),
        }));
      };

      // Execute pipeline
      const result = await executeVideoPipeline(videoFile, config, handleProgress);

      if (result.success && result.blobs && result.blobs.length > 0) {
        downloadResult(result.blobs[0], config.export.fileName);
        toast.success(t('common.fileDownloadSuccess'));
      } else {
        throw new Error(result.error || t('tool.videoStudio.exportFailed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tool.videoStudio.exportFailed'));
      setProcessingState((prev) => ({
        ...prev,
        stage: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
      toast.error(t('tool.videoStudio.exportFailed'));
    } finally {
      setProcessingState(INITIAL_PROCESSING_STATE);
    }
  };

  // Build output file name
  const buildOutputFileName = React.useCallback(() => {
    const baseName = videoMetadata?.fileName.replace(/\.[^/.]+$/, '') || 'video';
    const suffix = state.exportSuffix || '_edited';
    const extension = EXPORT_FORMAT_OPTIONS.find((f) => f.value === state.exportFormat)?.extension || '.mp4';
    return `${baseName}${suffix}${extension}`;
  }, [videoMetadata?.fileName, state.exportSuffix, state.exportFormat]);

  // Get localized progress message
  const getProgressMessage = (progress: VideoProcessingProgress): string => {
    switch (progress.stage) {
      case 'loading-engine':
        return t('tool.videoStudio.loadingEngine');
      case 'preparing':
        return t('tool.videoStudio.preparing');
      case 'processing':
        return `${t('tool.videoStudio.processing')} ${progress.progress}%`;
      case 'finalizing':
        return t('tool.videoStudio.finalizing');
      case 'complete':
        return 'Complete!';
      case 'error':
        return progress.message;
      case 'cancelled':
        return t('tool.videoStudio.cancelled');
      default:
        return progress.message;
    }
  };

  // Cancel processing
  const handleCancel = () => {
    setProcessingState((prev) => ({
      ...prev,
      isProcessing: false,
      stage: 'cancelled',
      message: t('tool.videoStudio.cancelled'),
    }));
    toast.info(t('tool.videoStudio.processingCancelled'));
  };

  // Reset all
  const handleReset = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setVideoMetadata(null);
    setError(null);
    setProcessingState(INITIAL_PROCESSING_STATE);
    resetState();
  };

  // Get current settings for preset (excluding thumbnail - separate action)
  const getCurrentSettings = React.useCallback((): VideoPipelinePreset['settings'] => ({
    trimEnabled: state.trimEnabled,
    cutEnabled: state.cutEnabled,
    cutMode: state.cutMode,
    splitCount: state.splitCount,
    cropEnabled: state.cropEnabled,
    resizeEnabled: state.resizeEnabled,
    resizeWidth: state.resizeWidth,
    resizeHeight: state.resizeHeight,
    resizeLockAspect: state.resizeLockAspect,
    resizeMode: state.resizeMode,
    exportFormat: state.exportFormat,
    qualityPreset: state.qualityPreset,
    exportSuffix: state.exportSuffix,
  }), [state]);

  // Handle preset selection (load preset)
  const handleSelectPreset = (preset: VideoPipelinePreset) => {
    updateState({
      trimEnabled: preset.settings.trimEnabled,
      cutEnabled: preset.settings.cutEnabled,
      cutMode: preset.settings.cutMode,
      splitCount: preset.settings.splitCount,
      cropEnabled: preset.settings.cropEnabled,
      resizeEnabled: preset.settings.resizeEnabled,
      resizeWidth: preset.settings.resizeWidth,
      resizeHeight: preset.settings.resizeHeight,
      resizeLockAspect: preset.settings.resizeLockAspect,
      resizeMode: preset.settings.resizeMode,
      exportFormat: preset.settings.exportFormat,
      qualityPreset: preset.settings.qualityPreset,
      exportSuffix: preset.settings.exportSuffix,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <ToolHeader
          title={t('tool.videoStudio.title')}
          description={t('tool.videoStudio.description')}
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
        <div className="flex-1 p-4 md:p-6 overflow-auto space-y-4">
          <VideoPreview
            videoUrl={videoUrl}
            metadata={videoMetadata}
            cropArea={state.cropArea}
            trimRange={state.trimEnabled ? { start: state.trimStart, end: state.trimEnd } : null}
            showCropOverlay={state.cropEnabled}
            showTrimOverlay={state.trimEnabled}
            thumbnailTime={state.thumbnailTime}
            onFileSelect={handleFileSelect}
            onSeek={handleSeek}
            t={t}
          />

          {/* Thumbnail Extraction - Separate from Pipeline */}
          <ThumbnailPanel
            thumbnailTime={state.thumbnailTime}
            thumbnailFormat={state.thumbnailFormat}
            videoDuration={videoMetadata?.duration || 0}
            hasVideo={!!videoUrl}
            isExtracting={isExtractingThumbnail}
            onTimeChange={(time) => updateState({ thumbnailTime: time })}
            onFormatChange={(format) => updateState({ thumbnailFormat: format })}
            onSeekTo={handleSeek}
            onExtract={handleExtractThumbnail}
            t={t}
          />
        </div>

        {/* Pipeline Panel */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <PipelinePanel
            state={state}
            hasVideo={!!videoUrl}
            processingState={processingState}
            onToggleStep={handleToggleStep}
            onExport={handleExport}
            onCancel={handleCancel}
            onOpenPresets={() => setPresetModalOpen(true)}
            t={t}
          >
            {/* Trim Panel */}
            <TrimPanel
              data-step="trim"
              trimStart={state.trimStart}
              trimEnd={state.trimEnd || videoMetadata?.duration || 60}
              videoDuration={videoMetadata?.duration || 60}
              onStartChange={(start) => updateState({ trimStart: start })}
              onEndChange={(end) => updateState({ trimEnd: end })}
              onSeekTo={handleSeek}
              t={t}
            />

            {/* Cut Panel */}
            <CutPanel
              data-step="cut"
              cutMode={state.cutMode}
              cutSegments={state.cutSegments}
              splitCount={state.splitCount}
              videoDuration={videoMetadata?.duration || 60}
              onModeChange={(mode) => updateState({ cutMode: mode })}
              onSegmentsChange={handleCutSegmentsChange}
              onSplitCountChange={(count) => updateState({ splitCount: count })}
              onSeekTo={handleSeek}
              t={t}
            />

            {/* Crop Panel */}
            <CropPanel
              data-step="crop"
              cropArea={state.cropArea}
              videoWidth={videoMetadata?.width || 1920}
              videoHeight={videoMetadata?.height || 1080}
              onCropAreaChange={handleCropAreaChange}
              onResetCrop={handleResetCrop}
              t={t}
            />

            {/* Resize Panel */}
            <ResizePanel
              data-step="resize"
              width={state.resizeWidth}
              height={state.resizeHeight}
              lockAspect={state.resizeLockAspect}
              mode={state.resizeMode}
              originalWidth={videoMetadata?.width || 1920}
              originalHeight={videoMetadata?.height || 1080}
              onWidthChange={(width) => updateState({ resizeWidth: width })}
              onHeightChange={(height) => updateState({ resizeHeight: height })}
              onLockAspectChange={(locked) => updateState({ resizeLockAspect: locked })}
              onModeChange={(mode) => updateState({ resizeMode: mode })}
              t={t}
            />

            {/* Export Panel */}
            <ExportPanel
              data-step="export"
              format={state.exportFormat}
              qualityPreset={state.qualityPreset}
              suffix={state.exportSuffix}
              originalFileName={videoMetadata?.fileName || 'video'}
              onFormatChange={(format) => updateState({ exportFormat: format })}
              onQualityPresetChange={(preset) => updateState({ qualityPreset: preset })}
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

export const videoStudioTool: ToolDefinition<VideoStudioState> = {
  id: 'video-studio',
  title: 'Video Studio',
  description: 'Trim, cut, crop, resize, and convert videos',
  path: '/video-studio',
  icon: Video,
  keywords: [
    'video',
    'trim',
    'cut',
    'crop',
    'resize',
    'convert',
    'mp4',
    'webm',
    'editor',
    'thumbnail',
    'ffmpeg',
    'compress',
  ],
  category: 'Media',
  defaultState: DEFAULT_STATE,
  Component: VideoStudioTool,
};
