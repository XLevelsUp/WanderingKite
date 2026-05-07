import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

/**
 * Reads a small version of the image and returns a base64 encoded placeholder.
 * For simplicity, this uses a pre-generated 10x10 px blurred version placed alongside the image.
 * In a real implementation you could generate it with Sharp or another image library.
 */
export function getBlurPlaceholder(imagePath: string): string {
  try {
    const placeholderPath = path.join(path.dirname(imagePath), `${path.basename(imagePath, path.extname(imagePath))}_placeholder.png`);
    const data = fs.readFileSync(placeholderPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch (error) {
    // Fallback transparent pixel
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAlEB9k3LrcgAAAAASUVORK5CYII=';
  }
}
