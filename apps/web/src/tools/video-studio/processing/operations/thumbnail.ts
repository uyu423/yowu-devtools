// Thumbnail Extraction Operation
//
// Extracts a single frame from the video at a specified time
// Uses FFmpeg to extract frame and convert to target image format

import type { ThumbnailConfig, VideoProcessingProgress, VideoProcessingResult } from '../types';
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
} from '../ffmpeg';

/**
 * Extract thumbnail from video
 */
export async function extractThumbnail(
  videoFile: File,
  config: ThumbnailConfig,
  onProgress?: (progress: VideoProcessingProgress) => void
): Promise<VideoProcessingResult> {
  console.log('[Thumbnail] Starting extraction...', {
    fileName: videoFile.name,
    fileSize: videoFile.size,
    fileType: videoFile.type,
    config,
  });

  const inputFileName = 'input' + getInputExtension(videoFile.type);
  const outputFileName = `thumbnail${getFileExtension(config.format)}`;
  console.log('[Thumbnail] File names:', { inputFileName, outputFileName });

  try {
    // Get FFmpeg instance
    console.log('[Thumbnail] Getting FFmpeg instance...');
    const ffmpeg = await getFFmpeg(onProgress);
    console.log('[Thumbnail] FFmpeg instance obtained');

    onProgress?.({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing to extract thumbnail...',
    });

    // Write input file to virtual filesystem
    console.log('[Thumbnail] Reading video file as ArrayBuffer...');
    const inputData = await videoFile.arrayBuffer();
    console.log('[Thumbnail] ArrayBuffer size:', inputData.byteLength);
    
    console.log('[Thumbnail] Writing to virtual filesystem...');
    await writeFile(ffmpeg, inputFileName, arrayBufferToUint8Array(inputData));
    console.log('[Thumbnail] File written to VFS');

    onProgress?.({
      stage: 'processing',
      progress: 30,
      message: 'Extracting frame...',
    });

    // Build FFmpeg arguments for frame extraction
    const args = [
      '-ss', config.time.toString(),  // Seek to time
      '-i', inputFileName,            // Input file
      '-vframes', '1',                // Extract 1 frame
      '-q:v', '2',                    // High quality
    ];

    // Format-specific options
    if (config.format === 'jpeg') {
      args.push('-f', 'image2');
    } else if (config.format === 'webp') {
      args.push('-c:v', 'libwebp', '-lossless', '0', '-compression_level', '4');
    }

    args.push('-y', outputFileName);

    console.log('[Thumbnail] Executing FFmpeg with args:', args);
    // Execute FFmpeg command
    await exec(ffmpeg, args);
    console.log('[Thumbnail] FFmpeg execution completed');

    onProgress?.({
      stage: 'finalizing',
      progress: 80,
      message: 'Creating image file...',
    });

    // Read output file
    console.log('[Thumbnail] Reading output file from VFS...');
    const outputData = await readFile(ffmpeg, outputFileName);
    console.log('[Thumbnail] Output data size:', outputData.byteLength);
    
    const blob = uint8ArrayToBlob(outputData, getMimeType(config.format));
    console.log('[Thumbnail] Blob created:', blob.size, 'bytes', blob.type);

    // Cleanup virtual filesystem
    console.log('[Thumbnail] Cleaning up VFS...');
    await deleteFile(ffmpeg, inputFileName);
    await deleteFile(ffmpeg, outputFileName);
    console.log('[Thumbnail] Cleanup completed');

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Thumbnail extracted!',
    });

    return {
      success: true,
      blobs: [blob],
      metadata: {
        format: config.format,
        size: blob.size,
      },
    };
  } catch (error) {
    console.error('[Thumbnail] Extraction failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Extraction failed';
    
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
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
 * Download thumbnail
 */
export function downloadThumbnail(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

