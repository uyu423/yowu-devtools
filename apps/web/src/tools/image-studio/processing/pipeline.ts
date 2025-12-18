// Image Processing Pipeline Orchestrator
//
// This module chains image processing operations efficiently:
// 1. Load source image once
// 2. Execute only enabled steps in order: crop -> resize -> rotate
// 3. Each step receives the previous step's output canvas
// 4. Export final canvas to the target format
//
// Key optimizations:
// - Operations are chained without intermediate encoding/decoding
// - Only enabled steps are executed
// - Canvas is reused when possible
// - Memory is cleaned up after processing

import type { PipelineConfig, ProcessingProgress, ProcessingResult } from './types';
import { loadImage, createCanvas, canvasToBlob, downloadBlob, getFileExtension } from './utils';
import { applyCrop } from './operations/crop';
import { applyResize } from './operations/resize';
import { applyRotate } from './operations/rotate';

/**
 * Execute the image processing pipeline
 * 
 * @param imageUrl - Source image URL
 * @param config - Pipeline configuration
 * @param onProgress - Progress callback
 * @returns Processing result with blob and metadata
 */
export async function executePipeline(
  imageUrl: string,
  config: PipelineConfig,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  try {
    // Stage 1: Load source image
    onProgress?.({
      stage: 'loading',
      progress: 0,
      message: 'Loading image...',
    });

    const sourceImage = await loadImage(imageUrl);
    
    // Create initial canvas from source image
    const { canvas: initialCanvas, ctx } = createCanvas(sourceImage.width, sourceImage.height);
    ctx.drawImage(sourceImage, 0, 0);
    let canvas = initialCanvas;

    // Track which steps are enabled for progress calculation
    const enabledSteps = [
      config.crop.enabled && config.crop.area,
      config.resize.enabled,
      config.rotate.enabled && (config.rotate.rotation !== 0 || config.rotate.flipHorizontal || config.rotate.flipVertical),
    ].filter(Boolean);
    
    const totalSteps = enabledSteps.length + 1; // +1 for export
    let currentStep = 0;

    // Stage 2: Crop (if enabled and has valid area)
    if (config.crop.enabled && config.crop.area) {
      currentStep++;
      onProgress?.({
        stage: 'crop',
        progress: Math.round((currentStep / totalSteps) * 100),
        message: 'Cropping image...',
      });

      canvas = applyCrop(canvas, config.crop.area);
    }

    // Stage 3: Resize (if enabled)
    if (config.resize.enabled) {
      currentStep++;
      onProgress?.({
        stage: 'resize',
        progress: Math.round((currentStep / totalSteps) * 100),
        message: 'Resizing image...',
      });

      canvas = applyResize(canvas, {
        width: config.resize.width,
        height: config.resize.height,
        mode: config.resize.mode,
        quality: config.resize.quality,
      });
    }

    // Stage 4: Rotate/Flip (if enabled and has transformations)
    if (config.rotate.enabled) {
      const hasTransform = 
        config.rotate.rotation !== 0 || 
        config.rotate.flipHorizontal || 
        config.rotate.flipVertical;

      if (hasTransform) {
        currentStep++;
        onProgress?.({
          stage: 'rotate',
          progress: Math.round((currentStep / totalSteps) * 100),
          message: 'Applying transformations...',
        });

        canvas = applyRotate(canvas, {
          rotation: config.rotate.rotation,
          flipHorizontal: config.rotate.flipHorizontal,
          flipVertical: config.rotate.flipVertical,
        });
      }
    }

    // Stage 5: Export
    onProgress?.({
      stage: 'export',
      progress: 95,
      message: 'Exporting image...',
    });

    const blob = await canvasToBlob(
      canvas,
      config.export.format,
      config.export.quality
    );

    onProgress?.({
      stage: 'export',
      progress: 100,
      message: 'Complete!',
    });

    return {
      success: true,
      blob,
      metadata: {
        width: canvas.width,
        height: canvas.height,
        format: config.export.format,
        size: blob.size,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Execute pipeline and download result
 */
export async function executeAndDownload(
  imageUrl: string,
  config: PipelineConfig,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  const result = await executePipeline(imageUrl, config, onProgress);

  if (result.success && result.blob) {
    const extension = getFileExtension(config.export.format);
    const fileName = config.export.fileName.replace(/\.[^/.]+$/, '') + extension;
    downloadBlob(result.blob, fileName);
  }

  return result;
}

/**
 * Preview the pipeline result without downloading
 * Returns a data URL for preview
 */
export async function previewPipeline(
  imageUrl: string,
  config: PipelineConfig
): Promise<string | null> {
  const result = await executePipeline(imageUrl, config);

  if (result.success && result.blob) {
    return URL.createObjectURL(result.blob);
  }

  return null;
}

