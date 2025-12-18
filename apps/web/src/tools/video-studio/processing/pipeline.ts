// Video Processing Pipeline Orchestrator
//
// This module chains video processing operations using FFmpeg:
// 1. Load source video into FFmpeg virtual filesystem
// 2. Build filter complex for enabled steps
// 3. Execute single FFmpeg command with all filters
// 4. Export to target format
//
// Key optimizations:
// - Single FFmpeg command for all operations (no intermediate files)
// - Filter complex for efficient chaining
// - Proper cleanup of virtual filesystem

import type { VideoPipelineConfig, VideoProcessingProgress, VideoProcessingResult } from './types';
import { QUALITY_CRF_MAP, QUALITY_PRESET_MAP } from './types';
import {
  getFFmpeg,
  writeFile,
  readFile,
  deleteFile,
  exec,
  arrayBufferToUint8Array,
  uint8ArrayToBlob,
  getMimeType,
  getFileExtension,
  wasCancelled,
  cleanupFFmpeg,
} from './ffmpeg';

/**
 * Execute the video processing pipeline
 */
export async function executeVideoPipeline(
  videoFile: File,
  config: VideoPipelineConfig,
  onProgress?: (progress: VideoProcessingProgress) => void,
  videoDuration?: number
): Promise<VideoProcessingResult> {
  const inputFileName = 'input' + getInputExtension(videoFile.type);
  const outputFileName = `output${getFileExtension(config.export.format)}`;

  // Calculate expected output duration based on trim settings
  let expectedDuration = videoDuration || 0;
  if (config.trim.enabled && config.trim.end > config.trim.start) {
    expectedDuration = config.trim.end - config.trim.start;
  }

  try {
    // Get FFmpeg instance with duration for progress tracking
    const ffmpeg = await getFFmpeg(onProgress, expectedDuration);

    onProgress?.({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing video...',
    });

    // Write input file to virtual filesystem
    const inputData = await videoFile.arrayBuffer();
    await writeFile(ffmpeg, inputFileName, arrayBufferToUint8Array(inputData));

    // Check for cancellation
    if (wasCancelled()) {
      return { success: false, error: 'Operation cancelled' };
    }

    onProgress?.({
      stage: 'preparing',
      progress: 30,
      message: 'Building processing pipeline...',
    });

    // Build FFmpeg arguments
    const args = buildFFmpegArgs(inputFileName, outputFileName, config);

    onProgress?.({
      stage: 'processing',
      progress: 0,
      message: 'Processing video...',
    });

    // Execute FFmpeg command
    await exec(ffmpeg, args);

    // Check for cancellation after exec (if terminated, this won't be reached normally)
    if (wasCancelled()) {
      return { success: false, error: 'Operation cancelled' };
    }

    onProgress?.({
      stage: 'finalizing',
      progress: 90,
      message: 'Finalizing output...',
    });

    // Read output file
    const outputData = await readFile(ffmpeg, outputFileName);
    const blob = uint8ArrayToBlob(outputData, getMimeType(config.export.format));

    // Cleanup virtual filesystem
    await deleteFile(ffmpeg, inputFileName);
    await deleteFile(ffmpeg, outputFileName);

    // Final cancellation check
    if (wasCancelled()) {
      return { success: false, error: 'Operation cancelled' };
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Processing complete!',
    });

    return {
      success: true,
      blobs: [blob],
      metadata: {
        format: config.export.format,
        size: blob.size,
      },
    };
  } catch (error) {
    console.error('[Pipeline] Error during video processing:', error);
    
    // Check if error was due to cancellation
    if (wasCancelled()) {
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: 'Operation cancelled',
      });
      return { success: false, error: 'Operation cancelled' };
    }

    // Check for codec-related or memory errors that corrupt FFmpeg instance
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isCorruptingError = 
      errorMessage.includes('memory') ||
      errorMessage.includes('RuntimeError') ||
      errorMessage.includes('exit code') ||
      errorMessage.includes('failed');

    if (isCorruptingError) {
      console.log('[Pipeline] Cleaning up FFmpeg instance due to corrupting error');
      cleanupFFmpeg();
    }

    onProgress?.({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Processing failed',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Build FFmpeg arguments from pipeline config
 */
function buildFFmpegArgs(
  inputFileName: string,
  outputFileName: string,
  config: VideoPipelineConfig
): string[] {
  const args: string[] = ['-i', inputFileName];
  const filters: string[] = [];

  // Trim (using seek and duration for efficiency)
  if (config.trim.enabled && (config.trim.start > 0 || config.trim.end > 0)) {
    // For trim, we use -ss and -to which are more efficient
    args.unshift('-to', config.trim.end.toString());
    args.unshift('-ss', config.trim.start.toString());
  }

  // Crop filter
  if (config.crop.enabled && config.crop.area) {
    const { x, y, width, height } = config.crop.area;
    filters.push(`crop=${width}:${height}:${x}:${y}`);
  }

  // Resize filter
  if (config.resize.enabled) {
    const scaleFilter = buildScaleFilter(config.resize.width, config.resize.height, config.resize.mode);
    filters.push(scaleFilter);
  }

  // Add filter complex if any filters are present
  if (filters.length > 0) {
    args.push('-vf', filters.join(','));
  }

  // Output codec and quality settings
  if (config.export.format === 'mp4') {
    args.push(
      '-c:v', 'libx264',
      '-preset', QUALITY_PRESET_MAP[config.export.qualityPreset],
      '-crf', QUALITY_CRF_MAP[config.export.qualityPreset].toString(),
      '-c:a', 'aac',
      '-b:a', '128k'
    );
  } else if (config.export.format === 'webm') {
    // Use VP8 (libvpx) instead of VP9 for better compatibility with ffmpeg.wasm
    // VP9 (libvpx-vp9) is not always available in ffmpeg.wasm builds
    args.push(
      '-c:v', 'libvpx',
      '-crf', QUALITY_CRF_MAP[config.export.qualityPreset].toString(),
      '-b:v', '1M', // VP8 requires bitrate alongside CRF
      '-c:a', 'libvorbis', // Use Vorbis instead of Opus for better compatibility
      '-b:a', '128k'
    );
  }

  // Overwrite output without asking
  args.push('-y');

  // Output file
  args.push(outputFileName);

  return args;
}

/**
 * Build scale filter based on resize mode
 */
function buildScaleFilter(width: number, height: number, mode: string): string {
  switch (mode) {
    case 'contain':
      // Scale to fit within bounds, preserving aspect ratio
      // Use -1 for auto-calculate one dimension, with 2-divisibility for codec compatibility
      return `scale='min(${width},iw)':'min(${height},ih)':force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
    
    case 'cover':
      // Scale to fill bounds, cropping if necessary
      return `scale='if(gt(iw/ih,${width}/${height}),${width},-2)':'if(gt(iw/ih,${width}/${height}),-2,${height})',crop=${width}:${height}`;
    
    case 'stretch':
    default:
      // Stretch to exact dimensions, ignoring aspect ratio
      return `scale=${width}:${height}`;
  }
}

/**
 * Get input file extension from MIME type
 */
function getInputExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/x-matroska': '.mkv',
  };
  return extensions[mimeType] || '.mp4';
}

/**
 * Download processing result
 */
export function downloadResult(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download multiple files as separate downloads
 * (For split operation)
 */
export function downloadMultiple(blobs: Blob[], baseFileName: string, format: string): void {
  const extension = getFileExtension(format);
  blobs.forEach((blob, index) => {
    const fileName = `${baseFileName}_part${index + 1}${extension}`;
    downloadResult(blob, fileName);
  });
}

