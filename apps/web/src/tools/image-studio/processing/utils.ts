// Image Processing Utilities

import type { InterpolationQuality } from '../types';
import type { SmoothingQuality } from './types';

/**
 * Load an image from URL and return as HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    img.src = url;
  });
}

/**
 * Create a canvas with the given dimensions
 */
export function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }
  
  return { canvas, ctx };
}

/**
 * Map interpolation quality to canvas smoothing settings
 */
export function mapInterpolationQuality(quality: InterpolationQuality): SmoothingQuality {
  const mapping: Record<InterpolationQuality, SmoothingQuality> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
  };
  return mapping[quality];
}

/**
 * Apply smoothing quality to canvas context
 */
export function applySmoothing(
  ctx: CanvasRenderingContext2D,
  quality: SmoothingQuality
): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = quality;
}

/**
 * Disable smoothing for crisp edges
 */
export function disableSmoothing(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = false;
}

/**
 * Draw image to canvas
 */
export function drawImageToCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  targetCtx: CanvasRenderingContext2D,
  dx: number = 0,
  dy: number = 0,
  dWidth?: number,
  dHeight?: number
): void {
  if (dWidth !== undefined && dHeight !== undefined) {
    targetCtx.drawImage(source, dx, dy, dWidth, dHeight);
  } else {
    targetCtx.drawImage(source, dx, dy);
  }
}

/**
 * Convert canvas to blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = getMimeType(format);
    const qualityValue = format === 'png' ? undefined : quality / 100;
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      mimeType,
      qualityValue
    );
  });
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
  };
  return mimeTypes[format] || 'image/png';
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: string): string {
  const extensions: Record<string, string> = {
    png: '.png',
    jpeg: '.jpg',
    webp: '.webp',
  };
  return extensions[format] || '.png';
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, fileName: string): void {
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
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Clone canvas to new canvas
 */
export function cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(source.width, source.height);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

