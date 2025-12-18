// Image Studio Types

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CustomAspectRatio {
  width: number;
  height: number;
}

export type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | 'custom';

export type ResizeMode = 'contain' | 'cover' | 'stretch';

export type InterpolationQuality = 'low' | 'medium' | 'high';

export type Rotation = 0 | 90 | 180 | 270;

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ImageStudioState {
  // Pipeline step activation
  cropEnabled: boolean;
  resizeEnabled: boolean;
  rotateEnabled: boolean;

  // Crop settings
  cropAspectRatio: AspectRatio;
  cropCustomRatio: CustomAspectRatio;
  cropArea: CropArea | null;

  // Resize settings
  resizeWidth: number;
  resizeHeight: number;
  resizeLockAspect: boolean;
  resizeMode: ResizeMode;
  resizeQuality: InterpolationQuality;

  // Rotate/Flip settings
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;

  // Export settings
  exportFormat: ExportFormat;
  exportQuality: number; // 0-100, for JPEG/WebP only
  exportSuffix: string;
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  type: string;
}

export interface PipelineStep {
  id: 'crop' | 'resize' | 'rotate' | 'export';
  name: string;
  enabled: boolean;
  icon: React.ElementType;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: 'idle' | 'loading' | 'processing' | 'exporting' | 'complete' | 'error';
  error: string | null;
}

export interface Preset {
  id: string;
  name: string;
  createdAt: number;
  state: Omit<ImageStudioState, 'cropArea'>;
}

