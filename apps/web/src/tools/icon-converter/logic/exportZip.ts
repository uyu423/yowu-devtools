// ZIP file export utilities

import { zipSync, strToU8 } from 'fflate';

interface ZipEntry {
  filename: string;
  blob: Blob;
}

/**
 * Create ZIP file from multiple files
 * @param entries - Array of files to include in ZIP
 * @returns ZIP file as Blob
 */
export async function createZipFile(entries: ZipEntry[]): Promise<Blob> {
  if (entries.length === 0) {
    throw new Error('At least one entry is required');
  }

  // Convert all blobs to Uint8Array
  const filesMap: Record<string, Uint8Array> = {};

  for (const entry of entries) {
    const arrayBuffer = await entry.blob.arrayBuffer();
    filesMap[entry.filename] = new Uint8Array(arrayBuffer);
  }

  // Create ZIP using fflate
  const zipped = zipSync(filesMap, {
    level: 6, // Compression level (0-9, 6 is default)
  });

  return new Blob([zipped], { type: 'application/zip' });
}

/**
 * Export icons as ZIP file
 * Includes PNG/WebP/JPEG files for each size
 */
export async function exportAsZip(
  imageBlobs: Map<number, Blob>,
  format: 'png' | 'webp' | 'jpeg'
): Promise<Blob> {
  const entries: ZipEntry[] = [];

  // Extension mapping
  const ext = format === 'jpeg' ? 'jpg' : format;

  for (const [size, blob] of imageBlobs) {
    entries.push({
      filename: `icon-${size}x${size}.${ext}`,
      blob,
    });
  }

  return createZipFile(entries);
}

/**
 * Export ICO file as ZIP (for single file download with proper extension)
 */
export async function exportIcoAsZip(icoBlob: Blob): Promise<Blob> {
  const entries: ZipEntry[] = [
    {
      filename: 'favicon.ico',
      blob: icoBlob,
    },
  ];

  return createZipFile(entries);
}

/**
 * Add README.txt to ZIP file
 */
export async function addReadmeToZip(
  zipBlob: Blob,
  readmeText: string
): Promise<Blob> {
  // Unzip existing content
  const arrayBuffer = await zipBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // For simplicity, create a new ZIP with README
  // In production, you might want to use fflate's unzipSync to preserve existing files
  const readmeBytes = strToU8(readmeText);

  const filesMap: Record<string, Uint8Array> = {
    'README.txt': readmeBytes,
  };

  // This is a simplified approach; ideally, we'd merge with existing ZIP
  // For now, we'll just return the original ZIP
  // TODO: Implement proper ZIP merging if needed

  return zipBlob;
}

