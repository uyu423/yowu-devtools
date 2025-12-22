// ICO file export utilities

/**
 * ICO file format structure:
 * - ICONDIR (6 bytes): Header
 * - ICONDIRENTRY[] (16 bytes each): Directory entries
 * - Image data: PNG or BMP data for each entry
 */

interface IcoEntry {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Create ICO file from multiple PNG blobs
 * @param entries - Array of image entries (must be PNG format)
 * @returns ICO file as Blob
 */
export async function createIcoFile(entries: IcoEntry[]): Promise<Blob> {
  if (entries.length === 0) {
    throw new Error('At least one entry is required');
  }

  if (entries.length > 255) {
    throw new Error('ICO format supports maximum 255 entries');
  }

  // Sort entries by size (smaller first, standard practice)
  const sortedEntries = [...entries].sort((a, b) => a.width - b.width);

  // Read all PNG data as ArrayBuffers
  const imageDataArray = await Promise.all(
    sortedEntries.map((entry) => entry.blob.arrayBuffer())
  );

  // Calculate total size
  const headerSize = 6; // ICONDIR
  const dirEntrySize = 16; // ICONDIRENTRY
  const dirSize = headerSize + dirEntrySize * sortedEntries.length;
  const totalImageSize = imageDataArray.reduce(
    (sum, data) => sum + data.byteLength,
    0
  );
  const totalSize = dirSize + totalImageSize;

  // Create output buffer
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // Write ICONDIR header
  let offset = 0;
  view.setUint16(offset, 0, true); // Reserved (must be 0)
  offset += 2;
  view.setUint16(offset, 1, true); // Type (1 = ICO)
  offset += 2;
  view.setUint16(offset, sortedEntries.length, true); // Count
  offset += 2;

  // Write ICONDIRENTRY for each image
  let imageDataOffset = dirSize;

  sortedEntries.forEach((entry, index) => {
    const imageData = imageDataArray[index];
    const imageSize = imageData.byteLength;

    // Width (0 means 256)
    bytes[offset] = entry.width >= 256 ? 0 : entry.width;
    offset += 1;

    // Height (0 means 256)
    bytes[offset] = entry.height >= 256 ? 0 : entry.height;
    offset += 1;

    // Color palette (0 = no palette for PNG)
    bytes[offset] = 0;
    offset += 1;

    // Reserved (must be 0)
    bytes[offset] = 0;
    offset += 1;

    // Color planes (0 or 1)
    view.setUint16(offset, 1, true);
    offset += 2;

    // Bits per pixel (32 for PNG with alpha)
    view.setUint16(offset, 32, true);
    offset += 2;

    // Image data size
    view.setUint32(offset, imageSize, true);
    offset += 4;

    // Image data offset
    view.setUint32(offset, imageDataOffset, true);
    offset += 4;

    imageDataOffset += imageSize;
  });

  // Write image data
  imageDataArray.forEach((imageData) => {
    bytes.set(new Uint8Array(imageData), offset);
    offset += imageData.byteLength;
  });

  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Export icons as ICO file
 * Combines multiple PNG blobs into a single ICO file
 */
export async function exportAsIco(
  pngBlobs: Map<number, Blob>
): Promise<Blob> {
  const entries: IcoEntry[] = [];

  for (const [size, blob] of pngBlobs) {
    entries.push({
      blob,
      width: size,
      height: size,
    });
  }

  return createIcoFile(entries);
}

