// Video Processing Module

// Pipeline
export { executeVideoPipeline, downloadResult, downloadMultiple } from './pipeline';

// Types
export type {
  VideoPipelineConfig,
  ThumbnailConfig,
  VideoProcessingProgress,
  VideoProcessingResult,
} from './types';
export { QUALITY_CRF_MAP, QUALITY_PRESET_MAP, FORMAT_CODEC_MAP } from './types';

// FFmpeg utilities
export {
  getFFmpeg,
  isFFmpegLoaded,
  cleanupFFmpeg,
  cancel as cancelFFmpeg,
  resetCancelledState,
  wasCancelled,
  getMimeType,
  getFileExtension,
} from './ffmpeg';

// Operations
export { extractThumbnail, downloadThumbnail } from './operations';

