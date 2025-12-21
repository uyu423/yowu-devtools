// Video Studio Types

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResizeMode = 'contain' | 'cover' | 'stretch';

export type QualityPreset = 'fast' | 'balanced' | 'high';

export type ExportFormat = 'mp4' | 'webm';

export interface TimeRange {
  start: number; // seconds
  end: number; // seconds
}

export interface CutSegment {
  id: string;
  start: number; // seconds
  end: number; // seconds
}

export interface VideoStudioState {
  // Pipeline step activation (thumbnail is separate - outputs image, not video)
  trimEnabled: boolean;
  cutEnabled: boolean;
  cropEnabled: boolean;
  resizeEnabled: boolean;

  // Thumbnail settings (separate from pipeline)
  thumbnailTime: number;
  thumbnailFormat: ThumbnailFormat; // seconds

  // Trim settings
  trimStart: number; // seconds
  trimEnd: number; // seconds

  // Cut settings
  cutSegments: CutSegment[];

  // Crop settings
  cropArea: CropArea | null;

  // Resize settings
  resizeWidth: number;
  resizeHeight: number;
  resizeLockAspect: boolean;
  resizeMode: ResizeMode;

  // Export settings
  exportFormat: ExportFormat;
  qualityPreset: QualityPreset;
  exportSuffix: string;
}

export interface VideoMetadata {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  duration: number; // seconds
  type: string;
}

export interface PipelineStep {
  id: 'trim' | 'cut' | 'crop' | 'resize' | 'export';
  name: string;
  enabled: boolean;
  icon: React.ElementType;
}

export type ThumbnailFormat = 'png' | 'jpeg' | 'webp';

export type ProcessingStage =
  | 'idle'
  | 'loading-engine'
  | 'preparing'
  | 'processing'
  | 'finalizing'
  | 'complete'
  | 'error'
  | 'cancelled';

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0-100
  stage: ProcessingStage;
  message: string;
  error: string | null;
  canCancel: boolean;
}

export interface Preset {
  id: string;
  name: string;
  createdAt: number;
  state: Omit<VideoStudioState, 'cropArea' | 'cutSegments'>;
}

