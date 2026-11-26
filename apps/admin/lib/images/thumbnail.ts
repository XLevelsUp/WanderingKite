import imageCompression from 'browser-image-compression';

/**
 * Website thumbnails (800px wide WebP) stored next to each original as `<name>.w800.webp`.
 * The marketing site uses them in grids/cards when present and falls back to the original
 * when absent — keep THUMB_WIDTH and the naming in sync with apps/marketing/lib/images.ts
 * and scripts/generate-thumbnails.mjs.
 */
export const THUMB_WIDTH = 800;

export const thumbPathFor = (path: string) => `${path.replace(/\.[a-z0-9]+$/i, '')}.w${THUMB_WIDTH}.webp`;

/** Builds an 800px-wide WebP from an image file in the browser. Returns null for GIFs (animation) or on failure. */
export async function makeThumbnail(file: File): Promise<File | null> {
  if (file.type === 'image/gif') return null;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    // browser-image-compression limits the LONG side, so convert the target width into a long-side limit.
    const longSide = Math.round((THUMB_WIDTH * Math.max(width, height)) / width);
    return await imageCompression(file, {
      maxWidthOrHeight: Math.min(longSide, Math.max(width, height)),
      initialQuality: 0.72,
      fileType: 'image/webp',
      useWebWorker: true,
    });
  } catch {
    return null;
  }
}
