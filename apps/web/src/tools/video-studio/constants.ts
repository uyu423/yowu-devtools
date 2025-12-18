import type { VideoStudioState, QualityPreset, PipelineStep } from './types';
import { Scissors, ScissorsLineDashed, Crop, Maximize2, Download } from 'lucide-react';

export const DEFAULT_STATE: VideoStudioState = {
  // Pipeline steps - all disabled by default (thumbnail is separate)
  trimEnabled: false,
  cutEnabled: false,
  cropEnabled: false,
  resizeEnabled: false,

  // Thumbnail settings (separate from pipeline - outputs image, not video)
  thumbnailTime: 0,
  thumbnailFormat: 'jpeg',

  // Trim settings
  trimStart: 0,
  trimEnd: 0,

  // Cut settings
  cutSegments: [],

  // Crop settings
  cropArea: null,

  // Resize settings
  resizeWidth: 1920,
  resizeHeight: 1080,
  resizeLockAspect: true,
  resizeMode: 'contain',

  // Export settings
  exportFormat: 'mp4',
  qualityPreset: 'balanced',
  exportSuffix: '',
};

export const QUALITY_PRESET_OPTIONS: { value: QualityPreset; label: string; description: string }[] = [
  { value: 'fast', label: 'Fast', description: 'Faster encoding, larger file size' },
  { value: 'balanced', label: 'Balanced', description: 'Good balance of speed and quality' },
  { value: 'high', label: 'High Quality', description: 'Best quality, slower encoding' },
];

export const RESIZE_MODE_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: 'contain', label: 'Contain', description: 'Fit within bounds, may have letterbox' },
  { value: 'cover', label: 'Cover', description: 'Fill bounds, may crop edges' },
  { value: 'stretch', label: 'Stretch', description: 'Ignore aspect ratio' },
];

export const EXPORT_FORMAT_OPTIONS: { value: string; label: string; mimeType: string; extension: string }[] = [
  { value: 'mp4', label: 'MP4 (H.264)', mimeType: 'video/mp4', extension: '.mp4' },
  { value: 'webm', label: 'WebM (VP9)', mimeType: 'video/webm', extension: '.webm' },
];

// Pipeline steps for video processing (thumbnail is separate - it outputs image, not video)
export const PIPELINE_STEPS: Omit<PipelineStep, 'enabled'>[] = [
  { id: 'trim', name: 'Trim', icon: Scissors },
  { id: 'cut', name: 'Cut / Split', icon: ScissorsLineDashed },
  { id: 'crop', name: 'Crop', icon: Crop },
  { id: 'resize', name: 'Resize', icon: Maximize2 },
  { id: 'export', name: 'Export', icon: Download },
];

// Thumbnail formats (separate from video pipeline)
export const THUMBNAIL_FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG', mimeType: 'image/png', extension: '.png' },
  { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', extension: '.jpg' },
  { value: 'webp', label: 'WebP', mimeType: 'image/webp', extension: '.webp' },
];

// Maximum file size in bytes (500MB for video)
export const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Warning threshold for mobile (300MB)
export const MOBILE_WARNING_THRESHOLD = 300 * 1024 * 1024;

// Supported input formats
export const SUPPORTED_INPUT_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// Common resize presets for video
export const RESIZE_PRESETS = [
  { label: '480p', width: 854, height: 480 },
  { label: '720p (HD)', width: 1280, height: 720 },
  { label: '1080p (Full HD)', width: 1920, height: 1080 },
  { label: '1440p (2K)', width: 2560, height: 1440 },
  { label: '2160p (4K)', width: 3840, height: 2160 },
];

// Time format helpers
export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':').reverse();
  let seconds = 0;
  
  if (parts[0]) {
    const secParts = parts[0].split('.');
    seconds += parseFloat(secParts[0]) || 0;
    if (secParts[1]) {
      seconds += parseFloat(`0.${secParts[1]}`) || 0;
    }
  }
  if (parts[1]) seconds += (parseInt(parts[1]) || 0) * 60;
  if (parts[2]) seconds += (parseInt(parts[2]) || 0) * 3600;
  
  return seconds;
};

// Processing stage messages
export const PROCESSING_MESSAGES: Record<string, string> = {
  'loading-engine': 'Loading video processing engine...',
  'preparing': 'Preparing video...',
  'processing': 'Processing video...',
  'finalizing': 'Finalizing output...',
  'complete': 'Processing complete!',
  'error': 'An error occurred',
  'cancelled': 'Processing cancelled',
};

