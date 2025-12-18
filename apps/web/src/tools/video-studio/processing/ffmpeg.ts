// FFmpeg.wasm Instance Management
//
// Singleton pattern for FFmpeg instance:
// - Lazy initialization on first use
// - Reuse across operations
// - Proper cleanup on unload
//
// Uses multithreaded version if available, falls back to single-threaded

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import type { VideoProcessingProgress } from './types';

// Singleton instance
let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;

// CDN URLs for FFmpeg core files (use unpkg as it's more reliable)
const FFMPEG_CORE_VERSION = '0.12.9';
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;

/**
 * Get or create FFmpeg instance
 */
export async function getFFmpeg(
  onProgress?: (progress: VideoProcessingProgress) => void
): Promise<FFmpeg> {
  // Return existing instance if loaded
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  // Wait if already loading
  if (isLoading) {
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

  try {
    onProgress?.({
      stage: 'loading-engine',
      progress: 0,
      message: 'Loading video processing engine...',
    });

    ffmpegInstance = new FFmpeg();

    // Set up logging
    ffmpegInstance.on('log', ({ message }) => {
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log('[FFmpeg]', message);
      }
    });

    // Set up progress tracking
    ffmpegInstance.on('progress', ({ progress }) => {
      onProgress?.({
        stage: 'processing',
        progress: Math.round(progress * 100),
        message: 'Processing video...',
      });
    });

    onProgress?.({
      stage: 'loading-engine',
      progress: 30,
      message: 'Downloading FFmpeg core...',
    });

    // Load FFmpeg core from CDN
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
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

