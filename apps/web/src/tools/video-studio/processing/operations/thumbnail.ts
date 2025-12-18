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

    // Clamp time to valid range (use 0 if time exceeds a reasonable limit)
    // Note: We can't know exact duration without probing, but we validate on the UI side
    // If time is too large, clamp to 0 to at least get the first frame
    const seekTime = Math.max(0, config.time);
    console.log('[Thumbnail] Seek time:', seekTime);

    // Build FFmpeg arguments for frame extraction
    // Put -ss AFTER -i for more accurate seeking (input seeking vs output seeking)
    const args = [
      '-i', inputFileName,            // Input file
      '-ss', seekTime.toString(),     // Seek to time (after input for accuracy)
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
    let outputData: Uint8Array;
    try {
      outputData = await readFile(ffmpeg, outputFileName);
    } catch (readError) {
      console.error('[Thumbnail] Failed to read output file:', readError);
      // Check if this is because the file doesn't exist (FFmpeg didn't create it)
      throw new Error('Failed to extract frame. The seek time may be beyond the video duration.');
    }
    
    console.log('[Thumbnail] Output data size:', outputData.byteLength);
    
    if (outputData.byteLength === 0) {
      throw new Error('Extracted frame is empty. Try a different time position.');
    }
    
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

