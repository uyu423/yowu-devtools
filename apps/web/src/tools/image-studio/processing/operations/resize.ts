// Resize Operation
//
// Resizes the source canvas to target dimensions
// Supports three modes:
// - contain: Fit within bounds, preserving aspect ratio (may have transparent padding)
// - cover: Fill bounds, preserving aspect ratio (may crop)
// - stretch: Ignore aspect ratio, stretch to exact dimensions

import type { ResizeMode, InterpolationQuality } from '../../types';
import { createCanvas, applySmoothing, mapInterpolationQuality } from '../utils';

export interface ResizeOptions {
  width: number;
  height: number;
  mode: ResizeMode;
  quality: InterpolationQuality;
}

/**
 * Apply resize operation to canvas
 * 
 * @param source - Source canvas
 * @param options - Resize options
 * @returns New canvas with resized image
 */
export function applyResize(
  source: HTMLCanvasElement,
  options: ResizeOptions
): HTMLCanvasElement {
  const { width, height, mode, quality } = options;
  
  // Skip if target size equals source size
  if (width === source.width && height === source.height && mode === 'stretch') {
    return source;
  }

  // Create output canvas
  const { canvas, ctx } = createCanvas(width, height);
  
  // Apply smoothing based on quality setting
  applySmoothing(ctx, mapInterpolationQuality(quality));

  // Calculate draw parameters based on mode
  const drawParams = calculateDrawParams(
    source.width,
    source.height,
    width,
    height,
    mode
  );

  // Clear canvas (for transparent backgrounds in 'contain' mode)
  ctx.clearRect(0, 0, width, height);

  // Draw the resized image
  if (mode === 'cover') {
    // For cover mode, we need to draw from a cropped source region
    ctx.drawImage(
      source,
      drawParams.sx,     // Source X
      drawParams.sy,     // Source Y
      drawParams.sw,     // Source Width
      drawParams.sh,     // Source Height
      drawParams.dx,     // Dest X
      drawParams.dy,     // Dest Y
      drawParams.dw,     // Dest Width
      drawParams.dh      // Dest Height
    );
  } else {
    // For contain and stretch, draw entire source to calculated destination
    ctx.drawImage(
      source,
      0,                 // Source X
      0,                 // Source Y
      source.width,      // Source Width
      source.height,     // Source Height
      drawParams.dx,     // Dest X
      drawParams.dy,     // Dest Y
      drawParams.dw,     // Dest Width
      drawParams.dh      // Dest Height
    );
  }

  return canvas;
}

interface DrawParams {
  sx: number;  // Source X
  sy: number;  // Source Y
  sw: number;  // Source Width
  sh: number;  // Source Height
  dx: number;  // Destination X
  dy: number;  // Destination Y
  dw: number;  // Destination Width
  dh: number;  // Destination Height
}

/**
 * Calculate draw parameters based on resize mode
 */
function calculateDrawParams(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode
): DrawParams {
  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  switch (mode) {
    case 'contain': {
      // Fit entire image within target bounds
      let dw: number;
      let dh: number;
      
      if (sourceAspect > targetAspect) {
        // Source is wider - constrain by width
        dw = targetWidth;
        dh = Math.round(targetWidth / sourceAspect);
      } else {
        // Source is taller - constrain by height
        dh = targetHeight;
        dw = Math.round(targetHeight * sourceAspect);
      }
      
      // Center the image
      const dx = Math.round((targetWidth - dw) / 2);
      const dy = Math.round((targetHeight - dh) / 2);
      
      return {
        sx: 0,
        sy: 0,
        sw: sourceWidth,
        sh: sourceHeight,
        dx,
        dy,
        dw,
        dh,
      };
    }

    case 'cover': {
      // Fill entire target bounds, cropping if necessary
      let sw: number;
      let sh: number;
      
      if (sourceAspect > targetAspect) {
        // Source is wider - constrain by height, crop sides
        sh = sourceHeight;
        sw = Math.round(sourceHeight * targetAspect);
      } else {
        // Source is taller - constrain by width, crop top/bottom
        sw = sourceWidth;
        sh = Math.round(sourceWidth / targetAspect);
      }
      
      // Center the crop
      const sx = Math.round((sourceWidth - sw) / 2);
      const sy = Math.round((sourceHeight - sh) / 2);
      
      return {
        sx,
        sy,
        sw,
        sh,
        dx: 0,
        dy: 0,
        dw: targetWidth,
        dh: targetHeight,
      };
    }

    case 'stretch':
    default: {
      // Stretch to exact dimensions, ignoring aspect ratio
      return {
        sx: 0,
        sy: 0,
        sw: sourceWidth,
        sh: sourceHeight,
        dx: 0,
        dy: 0,
        dw: targetWidth,
        dh: targetHeight,
      };
    }
  }
}

/**
 * Calculate dimensions maintaining aspect ratio
 */
export function calculateAspectRatioDimensions(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  constrainBy: 'width' | 'height'
): { width: number; height: number } {
  const aspectRatio = sourceWidth / sourceHeight;
  
  if (constrainBy === 'width') {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  } else {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  }
}

