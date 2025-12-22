// Icon Converter Web Worker
// Handles heavy image processing tasks off the main thread

import type {
  OutputFormat,
  RenderFit,
  RenderBackground,
} from './constants';
import { decodeImage } from './decodeImage';
import { renderResizedBitmap, batchRenderSizes } from './renderResizedBitmap';
import { exportAsIco } from './exportIco';
import { exportAsZip } from './exportZip';

// ============================================================================
// Message Types
// ============================================================================

export interface WorkerRequest {
  id: string;
  type: 'convert';
  file: File;
  selectedSizes: number[];
  outputFormat: OutputFormat;
  renderOptions: {
    fit: RenderFit;
    padding: number;
    background: RenderBackground;
    jpegQuality: number;
  };
}

export interface WorkerProgress {
  id: string;
  type: 'progress';
  current: number;
  total: number;
  message: string;
}

export interface WorkerSuccess {
  id: string;
  type: 'success';
  results: Array<{
    size: number;
    blob: Blob;
    url: string;
  }>;
  downloadBlob?: Blob;
  downloadFilename?: string;
}

export interface WorkerError {
  id: string;
  type: 'error';
  message: string;
  details?: string;
}

export type WorkerResponse =
  | WorkerProgress
  | WorkerSuccess
  | WorkerError;

// ============================================================================
// Format Conversion
// ============================================================================

/**
 * Convert PNG blob to target format
 */
async function convertBlobFormat(
  pngBlob: Blob,
  targetFormat: OutputFormat,
  jpegQuality: number
): Promise<Blob> {
  if (targetFormat === 'ico') {
    // ICO format is handled separately
    return pngBlob;
  }

  if (targetFormat === 'png') {
    // Already PNG
    return pngBlob;
  }

  // Convert to WebP or JPEG
  const bitmap = await createImageBitmap(pngBlob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  ctx.drawImage(bitmap, 0, 0);

  const mimeType =
    targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';
  const quality = targetFormat === 'jpeg' ? jpegQuality : 0.92;

  return canvas.convertToBlob({
    type: mimeType,
    quality,
  });
}

// ============================================================================
// Main Conversion Logic
// ============================================================================

async function processConversion(
  request: WorkerRequest
): Promise<WorkerResponse> {
  const { id, file, selectedSizes, outputFormat, renderOptions } = request;

  try {
    // Step 1: Decode image
    self.postMessage({
      id,
      type: 'progress',
      current: 1,
      total: 5,
      message: 'Decoding image...',
    } satisfies WorkerProgress);

    const decodeResult = await decodeImage(file);

    if (!decodeResult.success) {
      return {
        id,
        type: 'error',
        message: decodeResult.error.message,
        details: decodeResult.error.details,
      };
    }

    const { bitmap } = decodeResult.image;

    // Step 2: Render all sizes as PNG
    self.postMessage({
      id,
      type: 'progress',
      current: 2,
      total: 5,
      message: `Rendering ${selectedSizes.length} sizes...`,
    } satisfies WorkerProgress);

    const pngResults = await batchRenderSizes(
      bitmap,
      selectedSizes,
      renderOptions
    );

    if (pngResults.size === 0) {
      return {
        id,
        type: 'error',
        message: 'Failed to render any sizes',
      };
    }

    // Step 3: Convert to target format
    self.postMessage({
      id,
      type: 'progress',
      current: 3,
      total: 5,
      message: `Converting to ${outputFormat.toUpperCase()}...`,
    } satisfies WorkerProgress);

    const convertedBlobs = new Map<number, Blob>();

    for (const [size, result] of pngResults) {
      const converted = await convertBlobFormat(
        result.blob,
        outputFormat,
        renderOptions.jpegQuality
      );
      convertedBlobs.set(size, converted);
    }

    // Step 4: Create download file (ICO or ZIP)
    self.postMessage({
      id,
      type: 'progress',
      current: 4,
      total: 5,
      message: 'Creating download file...',
    } satisfies WorkerProgress);

    let downloadBlob: Blob | undefined;
    let downloadFilename: string | undefined;

    if (outputFormat === 'ico') {
      // Use PNG blobs for ICO (PNG is better supported in ICO format)
      const pngBlobs = new Map<number, Blob>();
      for (const [size, result] of pngResults) {
        pngBlobs.set(size, result.blob);
      }
      downloadBlob = await exportAsIco(pngBlobs);
      downloadFilename = 'favicon.ico';
    } else {
      // Create ZIP for other formats
      downloadBlob = await exportAsZip(
        convertedBlobs,
        outputFormat === 'png'
          ? 'png'
          : outputFormat === 'webp'
            ? 'webp'
            : 'jpeg'
      );
      downloadFilename = `icons-${outputFormat}.zip`;
    }

    // Step 5: Create object URLs for preview
    self.postMessage({
      id,
      type: 'progress',
      current: 5,
      total: 5,
      message: 'Finalizing...',
    } satisfies WorkerProgress);

    const results = Array.from(convertedBlobs.entries()).map(
      ([size, blob]) => ({
        size,
        blob,
        url: URL.createObjectURL(blob),
      })
    );

    return {
      id,
      type: 'success',
      results,
      downloadBlob,
      downloadFilename,
    };
  } catch (error) {
    return {
      id,
      type: 'error',
      message: 'Conversion failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Worker Event Handler
// ============================================================================

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;

  if (request.type === 'convert') {
    const response = await processConversion(request);
    self.postMessage(response);
  }
};

