// Rotate/Flip Operation
//
// Applies rotation and flip transformations to the source canvas
// Uses canvas transform matrix for efficient transformation:
// - rotate() for rotation
// - scale(-1, 1) for horizontal flip
// - scale(1, -1) for vertical flip

import type { Rotation } from '../../types';
import { createCanvas } from '../utils';

export interface RotateOptions {
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

/**
 * Apply rotate/flip operation to canvas
 * 
 * @param source - Source canvas
 * @param options - Rotate options
 * @returns New canvas with transformed image
 */
export function applyRotate(
  source: HTMLCanvasElement,
  options: RotateOptions
): HTMLCanvasElement {
  const { rotation, flipHorizontal, flipVertical } = options;

  // Skip if no transformation
  if (rotation === 0 && !flipHorizontal && !flipVertical) {
    return source;
  }

  // Calculate output dimensions (swap width/height for 90/270 degree rotation)
  const swap = rotation === 90 || rotation === 270;
  const outputWidth = swap ? source.height : source.width;
  const outputHeight = swap ? source.width : source.height;

  // Create output canvas
  const { canvas, ctx } = createCanvas(outputWidth, outputHeight);

  // Move to center of canvas for transformations
  ctx.translate(outputWidth / 2, outputHeight / 2);

  // Apply rotation
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  // Apply flips
  const scaleX = flipHorizontal ? -1 : 1;
  const scaleY = flipVertical ? -1 : 1;
  if (flipHorizontal || flipVertical) {
    ctx.scale(scaleX, scaleY);
  }

  // Draw the image centered
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return canvas;
}

/**
 * Get rotation angle in degrees
 */
export function getRotationDegrees(rotation: Rotation): number {
  return rotation;
}

/**
 * Calculate output dimensions after rotation
 */
export function getRotatedDimensions(
  width: number,
  height: number,
  rotation: Rotation
): { width: number; height: number } {
  const swap = rotation === 90 || rotation === 270;
  return {
    width: swap ? height : width,
    height: swap ? width : height,
  };
}

/**
 * Rotate 90 degrees clockwise
 */
export function rotateClockwise(current: Rotation): Rotation {
  const rotations: Rotation[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(current);
  const nextIndex = (currentIndex + 1) % 4;
  return rotations[nextIndex];
}

/**
 * Rotate 90 degrees counter-clockwise
 */
export function rotateCounterClockwise(current: Rotation): Rotation {
  const rotations: Rotation[] = [0, 90, 180, 270];
  const currentIndex = rotations.indexOf(current);
  const nextIndex = (currentIndex + 3) % 4; // +3 is same as -1 mod 4
  return rotations[nextIndex];
}

