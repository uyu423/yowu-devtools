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
  const inputFileName = 'input' + getInputExtension(videoFile.type);
  const outputFileName = `thumbnail${getFileExtension(config.format)}`;

  try {
    // Get FFmpeg instance
    const ffmpeg = await getFFmpeg(onProgress);

    onProgress?.({
      stage: 'preparing',
      progress: 0,
      message: 'Preparing to extract thumbnail...',
    });

    // Write input file to virtual filesystem
    const inputData = await videoFile.arrayBuffer();
    await writeFile(ffmpeg, inputFileName, arrayBufferToUint8Array(inputData));

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

    // Execute FFmpeg command
    await exec(ffmpeg, args);

    onProgress?.({
      stage: 'finalizing',
      progress: 80,
      message: 'Creating image file...',
    });

    // Read output file
    const outputData = await readFile(ffmpeg, outputFileName);
    const blob = uint8ArrayToBlob(outputData, getMimeType(config.format));

    // Cleanup virtual filesystem
    await deleteFile(ffmpeg, inputFileName);
    await deleteFile(ffmpeg, outputFileName);

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
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Extraction failed',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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

