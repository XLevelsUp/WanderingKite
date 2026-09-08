import imageCompression from 'browser-image-compression';

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compresses an image entirely in the browser before upload — resizes to a
 * max 1920px long side and re-encodes at ~80 quality. PNGs stay PNG (keeps
 * transparency); everything else becomes JPEG. GIFs and already-small files
 * pass through untouched (GIFs to avoid flattening animation to one frame).
 */
export async function compressImageClient(file: File): Promise<CompressResult> {
  const originalSize = file.size;

  if (file.type === 'image/gif' || file.size < 200 * 1024) {
    return { file, originalSize, compressedSize: file.size };
  }

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 1920,
    initialQuality: 0.8,
    useWebWorker: true,
    fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
  });

  return {
    file: compressed,
    originalSize,
    compressedSize: compressed.size,
  };
}
