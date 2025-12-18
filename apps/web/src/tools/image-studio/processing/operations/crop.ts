// Crop Operation
//
// Extracts a rectangular region from the source canvas
// Uses drawImage with source rectangle parameters for efficient cropping

import type { CropArea } from '../../types';
import { createCanvas } from '../utils';

/**
 * Apply crop operation to canvas
 * 
 * @param source - Source canvas
 * @param area - Crop area (x, y, width, height in pixels)
 * @returns New canvas with cropped image
 */
export function applyCrop(
  source: HTMLCanvasElement,
  area: CropArea
): HTMLCanvasElement {
  // Validate and clamp crop area to source bounds
  const clampedArea = clampCropArea(area, source.width, source.height);
  
  // Skip if crop area equals source size (no-op)
  if (
    clampedArea.x === 0 &&
    clampedArea.y === 0 &&
    clampedArea.width === source.width &&
    clampedArea.height === source.height
  ) {
    return source;
  }

  // Create output canvas with crop dimensions
  const { canvas, ctx } = createCanvas(clampedArea.width, clampedArea.height);

  // Draw the cropped region
  // drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(
    source,
    clampedArea.x,      // Source X
    clampedArea.y,      // Source Y
    clampedArea.width,  // Source Width
    clampedArea.height, // Source Height
    0,                  // Dest X
    0,                  // Dest Y
    clampedArea.width,  // Dest Width
    clampedArea.height  // Dest Height
  );

  return canvas;
}

/**
 * Clamp crop area to valid bounds within source image
 */
function clampCropArea(area: CropArea, maxWidth: number, maxHeight: number): CropArea {
  // Ensure non-negative position
  const x = Math.max(0, Math.round(area.x));
  const y = Math.max(0, Math.round(area.y));
  
  // Ensure minimum size of 1px
  const width = Math.max(1, Math.round(area.width));
  const height = Math.max(1, Math.round(area.height));
  
  // Clamp to source bounds
  return {
    x: Math.min(x, maxWidth - 1),
    y: Math.min(y, maxHeight - 1),
    width: Math.min(width, maxWidth - x),
    height: Math.min(height, maxHeight - y),
  };
}

/**
 * Calculate crop area from aspect ratio
 * Centers the crop area within the source dimensions
 */
export function calculateCropAreaFromAspectRatio(
  sourceWidth: number,
  sourceHeight: number,
  aspectRatio: number
): CropArea {
  const sourceAspect = sourceWidth / sourceHeight;
  
  let cropWidth: number;
  let cropHeight: number;
  
  if (sourceAspect > aspectRatio) {
    // Source is wider than target aspect ratio
    // Constrain by height
    cropHeight = sourceHeight;
    cropWidth = Math.round(cropHeight * aspectRatio);
  } else {
    // Source is taller than target aspect ratio
    // Constrain by width
    cropWidth = sourceWidth;
    cropHeight = Math.round(cropWidth / aspectRatio);
  }
  
  // Center the crop area
  const x = Math.round((sourceWidth - cropWidth) / 2);
  const y = Math.round((sourceHeight - cropHeight) / 2);
  
  return { x, y, width: cropWidth, height: cropHeight };
}

