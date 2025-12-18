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

// Local paths for FFmpeg core files (served from public/ffmpeg/)
const FFMPEG_BASE_URL = '/ffmpeg';

/**
 * Get or create FFmpeg instance
 */
export async function getFFmpeg(
  onProgress?: (progress: VideoProcessingProgress) => void
): Promise<FFmpeg> {
  // Return existing instance if loaded
  if (ffmpegInstance && isLoaded) {
    console.log('[FFmpeg] Returning cached instance');
    return ffmpegInstance;
  }

  // Wait if already loading
  if (isLoading) {
    console.log('[FFmpeg] Waiting for existing load operation...');
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (isLoaded && ffmpegInstance) {
          clearInterval(checkInterval);
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
  console.log('[FFmpeg] Starting to load FFmpeg...');

  try {
    onProgress?.({
      stage: 'loading-engine',
      progress: 0,
      message: 'Loading video processing engine...',
    });

    ffmpegInstance = new FFmpeg();

    // Set up logging - always log for debugging
    ffmpegInstance.on('log', ({ message }) => {
      console.log('[FFmpeg Log]', message);
    });

    // Set up progress tracking
    ffmpegInstance.on('progress', ({ progress }) => {
      console.log('[FFmpeg Progress]', Math.round(progress * 100) + '%');
      onProgress?.({
        stage: 'processing',
        progress: Math.round(progress * 100),
        message: 'Processing video...',
      });
    });

    onProgress?.({
      stage: 'loading-engine',
      progress: 10,
      message: 'Loading FFmpeg core files...',
    });

    console.log('[FFmpeg] Loading core files from:', FFMPEG_BASE_URL);

    // Load FFmpeg core from local files
    const coreURL = await toBlobURL(
      `${FFMPEG_BASE_URL}/ffmpeg-core.js`,
      'text/javascript'
    );
    console.log('[FFmpeg] Core JS loaded');

    onProgress?.({
      stage: 'loading-engine',
      progress: 50,
      message: 'Loading FFmpeg WASM...',
    });

    const wasmURL = await toBlobURL(
      `${FFMPEG_BASE_URL}/ffmpeg-core.wasm`,
      'application/wasm'
    );
    console.log('[FFmpeg] Core WASM loaded');

    onProgress?.({
      stage: 'loading-engine',
      progress: 80,
      message: 'Initializing FFmpeg...',
    });

    await ffmpegInstance.load({
      coreURL,
      wasmURL,
    });

    console.log('[FFmpeg] FFmpeg loaded successfully!');

    onProgress?.({
      stage: 'loading-engine',
      progress: 100,
      message: 'Video processing engine ready!',
    });

    isLoaded = true;
    isLoading = false;

    return ffmpegInstance;
  } catch (error) {
    console.error('[FFmpeg] Failed to load FFmpeg:', error);
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
 * Execute FFmpeg command
 */
export async function exec(ffmpeg: FFmpeg, args: string[]): Promise<void> {
  await ffmpeg.exec(args);
}

/**
 * Cancel ongoing FFmpeg operation
 */
export function cancel(ffmpeg: FFmpeg): void {
  try {
    ffmpeg.terminate();
    // Reinitialize for future use
    ffmpegInstance = null;
    isLoaded = false;
  } catch {
    // Ignore cancel errors
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

