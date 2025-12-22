// Image resizing utilities using OffscreenCanvas

import type { RenderFit, RenderBackground } from './constants';

export interface RenderOptions {
  fit: RenderFit;
  padding: number;
  background: RenderBackground;
  jpegQuality?: number; // 0-1, only for JPEG
}

export interface RenderResult {
  blob: Blob;
  width: number;
  height: number;
}

export interface RenderError {
  message: string;
  details?: string;
}

export type ResizeResult =
  | { success: true; result: RenderResult }
  | { success: false; error: RenderError };

/**
 * Calculate dimensions for 'contain' fit
 */
function calculateContainDimensions(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
  padding: number
): { width: number; height: number; x: number; y: number } {
  const availableWidth = targetWidth - padding * 2;
  const availableHeight = targetHeight - padding * 2;

  const scale = Math.min(
    availableWidth / srcWidth,
    availableHeight / srcHeight
  );

  const scaledWidth = srcWidth * scale;
  const scaledHeight = srcHeight * scale;

  return {
    width: scaledWidth,
    height: scaledHeight,
    x: (targetWidth - scaledWidth) / 2,
    y: (targetHeight - scaledHeight) / 2,
  };
}

/**
 * Calculate dimensions for 'cover' fit
 */
function calculateCoverDimensions(
  srcWidth: number,
  srcHeight: number,
  targetWidth: number,
  targetHeight: number,
  padding: number
): { width: number; height: number; x: number; y: number } {
  const availableWidth = targetWidth - padding * 2;
  const availableHeight = targetHeight - padding * 2;

  const scale = Math.max(
    availableWidth / srcWidth,
    availableHeight / srcHeight
  );

  const scaledWidth = srcWidth * scale;
  const scaledHeight = srcHeight * scale;

  return {
    width: scaledWidth,
    height: scaledHeight,
    x: padding + (availableWidth - scaledWidth) / 2,
    y: padding + (availableHeight - scaledHeight) / 2,
  };
}

/**
 * Calculate dimensions for 'fill' fit
 */
function calculateFillDimensions(
  targetWidth: number,
  targetHeight: number,
  padding: number
): { width: number; height: number; x: number; y: number } {
  return {
    width: targetWidth - padding * 2,
    height: targetHeight - padding * 2,
    x: padding,
    y: padding,
  };
}

/**
 * Parse CSS color to rgba components
 */
function parseColor(color: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  if (color === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Create a temporary canvas to parse color
  const canvas = new OffscreenCanvas(1, 1);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { r: 255, g: 255, b: 255, a: 1 }; // fallback to white
  }

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const imageData = ctx.getImageData(0, 0, 1, 1);
  const [r, g, b, a] = imageData.data;

  return { r, g, b, a: a / 255 };
}

/**
 * Render resized bitmap with specified options
 */
export async function renderResizedBitmap(
  sourceBitmap: ImageBitmap,
  targetWidth: number,
  targetHeight: number,
  options: RenderOptions
): Promise<ResizeResult> {
  try {
    // Create OffscreenCanvas
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d', {
      alpha: options.background === 'transparent',
    });

    if (!ctx) {
      return {
        success: false,
        error: {
          message: 'Failed to get 2D context from OffscreenCanvas',
        },
      };
    }

    // Fill background
    if (options.background !== 'transparent') {
      const bgColor = parseColor(options.background);
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Calculate dimensions based on fit mode
    let dims: { width: number; height: number; x: number; y: number };

    switch (options.fit) {
      case 'contain':
        dims = calculateContainDimensions(
          sourceBitmap.width,
          sourceBitmap.height,
          targetWidth,
          targetHeight,
          options.padding
        );
        break;
      case 'cover':
        dims = calculateCoverDimensions(
          sourceBitmap.width,
          sourceBitmap.height,
          targetWidth,
          targetHeight,
          options.padding
        );
        break;
      case 'fill':
        dims = calculateFillDimensions(
          targetWidth,
          targetHeight,
          options.padding
        );
        break;
      default:
        dims = calculateContainDimensions(
          sourceBitmap.width,
          sourceBitmap.height,
          targetWidth,
          targetHeight,
          options.padding
        );
    }

    // Draw image with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      sourceBitmap,
      dims.x,
      dims.y,
      dims.width,
      dims.height
    );

    // Convert to Blob (PNG format for now, will be converted later)
    const blob = await canvas.convertToBlob({
      type: 'image/png',
    });

    return {
      success: true,
      result: {
        blob,
        width: targetWidth,
        height: targetHeight,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to render resized bitmap',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Batch render multiple sizes
 */
export async function batchRenderSizes(
  sourceBitmap: ImageBitmap,
  sizes: number[],
  options: RenderOptions
): Promise<Map<number, RenderResult>> {
  const results = new Map<number, RenderResult>();

  for (const size of sizes) {
    const result = await renderResizedBitmap(
      sourceBitmap,
      size,
      size,
      options
    );

    if (result.success) {
      results.set(size, result.result);
    }
  }

  return results;
}

