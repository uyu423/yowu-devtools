// Image decoding utilities

import { SUPPORTED_INPUT_FORMATS } from './constants';

export interface DecodedImage {
  bitmap: ImageBitmap;
  width: number;
  height: number;
  hasAlpha: boolean;
}

export interface DecodeError {
  message: string;
  details?: string;
}

export type DecodeResult =
  | { success: true; image: DecodedImage }
  | { success: false; error: DecodeError };

/**
 * Validate file type
 */
export function validateFileType(file: File): boolean {
  return SUPPORTED_INPUT_FORMATS.includes(file.type as any);
}

/**
 * Detect if image has alpha channel
 * Note: This is a heuristic based on MIME type
 */
function detectAlphaChannel(mimeType: string): boolean {
  // SVG and PNG typically support transparency
  if (mimeType.includes('svg') || mimeType.includes('png')) {
    return true;
  }
  // WebP can support transparency
  if (mimeType.includes('webp')) {
    return true;
  }
  // AVIF can support transparency
  if (mimeType.includes('avif')) {
    return true;
  }
  // JPEG does not support transparency
  return false;
}

/**
 * Decode raster image (PNG, JPG, WebP, AVIF) using createImageBitmap
 */
async function decodeRasterImage(file: File): Promise<DecodeResult> {
  try {
    const bitmap = await createImageBitmap(file);

    return {
      success: true,
      image: {
        bitmap,
        width: bitmap.width,
        height: bitmap.height,
        hasAlpha: detectAlphaChannel(file.type),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to decode raster image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Decode SVG image
 * SVG requires: Blob URL → Image → ImageBitmap
 */
async function decodeSvgImage(file: File): Promise<DecodeResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        // If SVG has no intrinsic size, use default 512x512
        const width = img.naturalWidth || 512;
        const height = img.naturalHeight || 512;

        // Create ImageBitmap from loaded image
        const bitmap = await createImageBitmap(img);

        URL.revokeObjectURL(objectUrl);

        resolve({
          success: true,
          image: {
            bitmap,
            width,
            height,
            hasAlpha: true, // SVG can have transparency
          },
        });
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        resolve({
          success: false,
          error: {
            message: 'Failed to create ImageBitmap from SVG',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        success: false,
        error: {
          message: 'Failed to load SVG image',
          details: 'Image load error',
        },
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Decode image file (any supported format)
 * @param file - Input file
 * @returns DecodedImage or error
 */
export async function decodeImage(file: File): Promise<DecodeResult> {
  // Validate file type
  if (!validateFileType(file)) {
    return {
      success: false,
      error: {
        message: `Unsupported format: ${file.type}`,
        details: 'Please use SVG, PNG, JPG, WebP, or AVIF.',
      },
    };
  }

  // Handle SVG separately
  if (file.type === 'image/svg+xml') {
    return decodeSvgImage(file);
  }

  // Handle raster images
  return decodeRasterImage(file);
}

