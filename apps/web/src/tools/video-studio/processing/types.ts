// Video Processing Types

import type {
  CropArea,
  ResizeMode,
  QualityPreset,
  ExportFormat,
  CutSegment,
  ThumbnailFormat,
} from '../types';

/**
 * Pipeline step configuration
 */
export interface VideoPipelineConfig {
  trim: {
    enabled: boolean;
    start: number; // seconds
    end: number; // seconds
  };
  cut: {
    enabled: boolean;
    segments: CutSegment[];
  };
  crop: {
    enabled: boolean;
    area: CropArea | null;
  };
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    mode: ResizeMode;
  };
  export: {
    format: ExportFormat;
    qualityPreset: QualityPreset;
    fileName: string;
  };
}

/**
 * Thumbnail extraction configuration
 */
export interface ThumbnailConfig {
  time: number; // seconds
  format: ThumbnailFormat;
  fileName: string;
}

/**
 * Processing progress callback
 */
export interface VideoProcessingProgress {
  stage: 'loading-engine' | 'preparing' | 'processing' | 'finalizing' | 'complete' | 'error' | 'cancelled';
  progress: number; // 0-100
  message: string;
  currentStep?: string;
}

/**
 * Processing result
 */
export interface VideoProcessingResult {
  success: boolean;
  blobs?: Blob[]; // Multiple blobs for split operation
  error?: string;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
  };
}

/**
 * FFmpeg log levels
 */
export type FFmpegLogLevel = 'quiet' | 'error' | 'warning' | 'info' | 'verbose' | 'debug';

/**
 * Quality preset mappings to FFmpeg CRF values
 * Lower CRF = higher quality, larger file
 */
export const QUALITY_CRF_MAP: Record<QualityPreset, number> = {
  fast: 28,      // Fast encoding, acceptable quality
  balanced: 23,  // Default, good balance
  high: 18,      // High quality, slower encoding
};

/**
 * Quality preset mappings to FFmpeg preset values
 */
export const QUALITY_PRESET_MAP: Record<QualityPreset, string> = {
  fast: 'veryfast',
  balanced: 'medium',
  high: 'slow',
};

/**
 * Format to codec mapping
 */
export const FORMAT_CODEC_MAP: Record<ExportFormat, { video: string; audio: string }> = {
  mp4: { video: 'libx264', audio: 'aac' },
  webm: { video: 'libvpx-vp9', audio: 'libopus' },
};

