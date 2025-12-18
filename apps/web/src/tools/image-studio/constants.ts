import type { ImageStudioState, AspectRatio, PipelineStep } from './types';
import { Crop, Maximize2, RotateCw, Download } from 'lucide-react';

export const DEFAULT_STATE: ImageStudioState = {
  // Pipeline steps - all disabled by default
  cropEnabled: false,
  resizeEnabled: false,
  rotateEnabled: false,

  // Crop settings
  cropAspectRatio: 'free',
  cropCustomRatio: { width: 16, height: 9 },
  cropArea: null,

  // Resize settings
  resizeWidth: 1920,
  resizeHeight: 1080,
  resizeLockAspect: true,
  resizeMode: 'contain',
  resizeQuality: 'high',

  // Rotate/Flip settings
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,

  // Export settings
  exportFormat: 'png',
  exportQuality: 85,
  exportSuffix: '',
};

export const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; ratio?: number }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1 (Square)', ratio: 1 },
  { value: '4:3', label: '4:3', ratio: 4 / 3 },
  { value: '3:2', label: '3:2', ratio: 3 / 2 },
  { value: '16:9', label: '16:9 (Widescreen)', ratio: 16 / 9 },
  { value: '2:3', label: '2:3 (Portrait)', ratio: 2 / 3 },
  { value: 'custom', label: 'Custom' },
];

export const RESIZE_MODE_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: 'contain', label: 'Contain', description: 'Fit within bounds, may have padding' },
  { value: 'cover', label: 'Cover', description: 'Fill bounds, may crop' },
  { value: 'stretch', label: 'Stretch', description: 'Ignore aspect ratio' },
];

export const QUALITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'low', label: 'Low (Fast)' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High (Best)' },
];

export const ROTATION_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: '0°' },
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' },
];

export const EXPORT_FORMAT_OPTIONS: { value: string; label: string; mimeType: string; extension: string }[] = [
  { value: 'png', label: 'PNG', mimeType: 'image/png', extension: '.png' },
  { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', extension: '.jpg' },
  { value: 'webp', label: 'WebP', mimeType: 'image/webp', extension: '.webp' },
];

export const PIPELINE_STEPS: Omit<PipelineStep, 'enabled'>[] = [
  { id: 'crop', name: 'Crop', icon: Crop },
  { id: 'rotate', name: 'Rotate / Flip', icon: RotateCw },
  { id: 'resize', name: 'Resize', icon: Maximize2 },
  { id: 'export', name: 'Export', icon: Download },
];

// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Supported input formats
export const SUPPORTED_INPUT_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];

// Common resize presets
export const RESIZE_PRESETS = [
  { label: 'HD (1280×720)', width: 1280, height: 720 },
  { label: 'Full HD (1920×1080)', width: 1920, height: 1080 },
  { label: '2K (2560×1440)', width: 2560, height: 1440 },
  { label: '4K (3840×2160)', width: 3840, height: 2160 },
  { label: 'Square (1024×1024)', width: 1024, height: 1024 },
  { label: 'Instagram (1080×1080)', width: 1080, height: 1080 },
  { label: 'Twitter Header (1500×500)', width: 1500, height: 500 },
];

