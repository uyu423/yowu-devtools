// FFmpeg.wasm Instance Management
//
// Singleton pattern for FFmpeg instance:
// - Lazy initialization on first use
// - Reuse across operations
// - Proper cleanup on unload
//
// Uses local FFmpeg core files from public/ffmpeg/

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { VideoProcessingProgress } from './types';

// Singleton instance
let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;
let isCancelled = false;

// AbortController for cancelling operations
let currentAbortController: AbortController | null = null;

// Local paths for FFmpeg core files (served from public/ffmpeg/)
const FFMPEG_BASE_URL = '/ffmpeg';

/**
 * Parse time string from FFmpeg log (format: HH:MM:SS.ms or SS.ms)
 */
function parseTimeString(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    // HH:MM:SS.ms format
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS.ms format
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  } else {
    // SS.ms format
    return parseFloat(timeStr);
  }
}

/**
 * Parse FFmpeg log line to extract progress time
 */
function parseFFmpegLogProgress(message: string): number | null {
  // Match time=HH:MM:SS.ms or time=SS.ms pattern
  const timeMatch = message.match(/time=(\d+:\d+:\d+\.\d+|\d+:\d+\.\d+|\d+\.\d+)/);
  if (timeMatch) {
    return parseTimeString(timeMatch[1]);
  }
  return null;
}

/**
 * Get or create FFmpeg instance
 */
export async function getFFmpeg(
  onProgress?: (progress: VideoProcessingProgress) => void,
  totalDuration?: number
): Promise<FFmpeg> {
  // Reset cancelled flag when getting new instance
  isCancelled = false;

  // Return existing instance if loaded
  if (ffmpegInstance && isLoaded) {
    // Re-setup progress handler with new duration
    if (onProgress && totalDuration) {
      setupProgressHandler(ffmpegInstance, onProgress, totalDuration);
    }
    return ffmpegInstance;
  }

  // Wait if already loading
  if (isLoading) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (isLoaded && ffmpegInstance) {
          clearInterval(checkInterval);
          if (onProgress && totalDuration) {
            setupProgressHandler(ffmpegInstance, onProgress, totalDuration);
          }
          resolve(ffmpegInstance);
        } else if (!isLoading && !isLoaded) {
          clearInterval(checkInterval);
          reject(new Error('FFmpeg loading failed'));
        }
      }, 100);
    });
  }

  // Start loading
  isLoading = true;

  try {
    onProgress?.({
      stage: 'loading-engine',
      progress: 0,
      message: 'Loading video processing engine...',
    });

    ffmpegInstance = new FFmpeg();

    // Set up progress handler with duration-based tracking
    if (onProgress && totalDuration) {
      setupProgressHandler(ffmpegInstance, onProgress, totalDuration);
    }

    onProgress?.({
      stage: 'loading-engine',
      progress: 10,
      message: 'Loading FFmpeg core files...',
    });

    // Load FFmpeg core from local files
    const coreURL = await toBlobURL(
      `${FFMPEG_BASE_URL}/ffmpeg-core.js`,
      'text/javascript'
    );

    onProgress?.({
      stage: 'loading-engine',
      progress: 50,
      message: 'Loading FFmpeg WASM...',
    });

    const wasmURL = await toBlobURL(
      `${FFMPEG_BASE_URL}/ffmpeg-core.wasm`,
      'application/wasm'
    );

    onProgress?.({
      stage: 'loading-engine',
      progress: 80,
      message: 'Initializing FFmpeg...',
    });

    await ffmpegInstance.load({
      coreURL,
      wasmURL,
    });

    onProgress?.({
      stage: 'loading-engine',
      progress: 100,
      message: 'Video processing engine ready!',
    });

    isLoaded = true;
    isLoading = false;

    return ffmpegInstance;
  } catch (error) {
    console.error('[FFmpeg] Failed to load:', error);
    isLoading = false;
    isLoaded = false;
    ffmpegInstance = null;

    throw new Error(
      `Failed to load FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if FFmpeg is loaded
 */
export function isFFmpegLoaded(): boolean {
  return isLoaded && ffmpegInstance !== null;
}

/**
 * Cleanup FFmpeg instance
 */
export function cleanupFFmpeg(): void {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch {
      // Ignore cleanup errors
    }
    ffmpegInstance = null;
    isLoaded = false;
  }
}

/**
 * Write file to FFmpeg virtual filesystem
 */
export async function writeFile(
  ffmpeg: FFmpeg,
  name: string,
  data: Uint8Array | string
): Promise<void> {
  await ffmpeg.writeFile(name, data);
}

/**
 * Read file from FFmpeg virtual filesystem
 */
export async function readFile(ffmpeg: FFmpeg, name: string): Promise<Uint8Array> {
  const data = await ffmpeg.readFile(name);
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }
  return data;
}

/**
 * Delete file from FFmpeg virtual filesystem
 */
export async function deleteFile(ffmpeg: FFmpeg, name: string): Promise<void> {
  try {
    await ffmpeg.deleteFile(name);
  } catch {
    // Ignore errors if file doesn't exist
  }
}

/**
 * Execute FFmpeg command with abort support
 */
export async function exec(ffmpeg: FFmpeg, args: string[]): Promise<number> {
  // Create new AbortController for this operation
  currentAbortController = new AbortController();
  
  try {
    const exitCode = await ffmpeg.exec(args, -1, { signal: currentAbortController.signal });
    if (exitCode !== 0 && !isCancelled) {
      throw new Error(`FFmpeg command failed with exit code ${exitCode}`);
    }
    return exitCode;
  } catch (error) {
    if (isCancelled || (error instanceof Error && error.name === 'AbortError')) {
      throw new Error('Operation cancelled');
    }
    throw error;
  } finally {
    currentAbortController = null;
  }
}

/**
 * Set up progress handler for FFmpeg instance
 */
function setupProgressHandler(
  ffmpeg: FFmpeg,
  onProgress: (progress: VideoProcessingProgress) => void,
  totalDuration: number
): void {
  // Use log parsing for more accurate progress
  ffmpeg.on('log', ({ message }) => {
    // Parse time from log message
    const currentTime = parseFFmpegLogProgress(message);
    if (currentTime !== null && totalDuration > 0) {
      const progress = Math.min(99, Math.round((currentTime / totalDuration) * 100));
      onProgress({
        stage: 'processing',
        progress,
        message: `Processing: ${formatDuration(currentTime)} / ${formatDuration(totalDuration)}`,
      });
    }
  });
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if operation was cancelled
 */
export function wasCancelled(): boolean {
  return isCancelled;
}

/**
 * Reset the cancelled state (call before starting a new operation)
 */
export function resetCancelledState(): void {
  isCancelled = false;
  currentAbortController = null;
}

/**
 * Cancel ongoing FFmpeg operation
 */
export function cancel(): void {
  isCancelled = true;

  // First, abort the current operation using AbortController
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  // Then terminate the FFmpeg instance to ensure complete cleanup
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch {
      // Ignore termination errors
    }
    ffmpegInstance = null;
    isLoaded = false;
    isLoading = false;
  }
}

/**
 * Convert ArrayBuffer to Uint8Array
 */
export function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

/**
 * Convert Uint8Array to Blob
 */
export function uint8ArrayToBlob(data: Uint8Array, mimeType: string): Blob {
  // Create a copy of the data to ensure proper ArrayBuffer type
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  return new Blob([buffer], { type: mimeType });
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  };
  return mimeTypes[format] || 'application/octet-stream';
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    mp4: '.mp4',
    webm: '.webm',
    png: '.png',
    jpeg: '.jpg',
    webp: '.webp',
  };
  return extensions[format] || '';
}
