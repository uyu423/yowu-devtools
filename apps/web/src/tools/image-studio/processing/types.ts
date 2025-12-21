// Image Processing Types

import type { CropArea, ResizeMode, InterpolationQuality, Rotation, ExportFormat } from '../types';

/**
 * Pipeline step configuration
 */
export interface PipelineConfig {
  crop: {
    enabled: boolean;
    area: CropArea | null;
  };
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    mode: ResizeMode;
    quality: InterpolationQuality;
  };
  rotate: {
    enabled: boolean;
    rotation: Rotation;
    flipHorizontal: boolean;
    flipVertical: boolean;
  };
  export: {
    format: ExportFormat;
    quality: number; // 0-100
    fileName: string;
  };
}

/**
 * Processing progress callback
 */
export interface ProcessingProgress {
  stage: 'loading' | 'crop' | 'resize' | 'rotate' | 'export';
  progress: number; // 0-100
  message: string;
}

/**
 * Processing result
 */
export interface ProcessingResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

/**
 * Canvas context with image smoothing settings
 */
export type SmoothingQuality = 'low' | 'medium' | 'high';

/**
 * Operation function type
 */
export type ImageOperation = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => HTMLCanvasElement;

