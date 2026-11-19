'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { moveGalleryImage, setShootCover } from '@/actions/shoots-admin';
import { DeleteGalleryImageButton } from './DeleteGalleryImageButton';

type Img = { id: string; url: string; alt_text: string | null };

/** Album images in website order: set cover, move earlier/later, delete. */
export function GalleryManager({ shootId, images, coverUrl }: { shootId: string; images: Img[]; coverUrl: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e: any) {
        window.alert(e.message || 'Something went wrong');
      }
    });

  if (images.length === 0) {
    return <div className="rounded-xl border border-dashed border-white/5 bg-white/5 py-12 text-center text-muted-foreground">No images added yet.</div>;
  }

  return (
    <ol className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${pending ? 'pointer-events-none opacity-60' : ''}`}>
      {images.map((img, i) => {
        const isCover = img.url === coverUrl;
        return (
          <li key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <img src={img.url} alt={img.alt_text || 'Gallery image'} className="h-full w-full object-cover" />
            <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{i + 1}</span>
            {isCover && (
              <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black">
                <Star className="h-3 w-3 fill-current" /> Cover
              </span>
            )}
            <DeleteGalleryImageButton id={img.id} shootId={shootId} />
            {/* Controls visible on hover (desktop) and always on touch screens. */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              {!isCover && (
                <button type="button" onClick={() => run(() => setShootCover(shootId, img.url))} className="mr-auto rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-black">
                  Set cover
                </button>
              )}
              <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => run(() => moveGalleryImage(shootId, img.id, -1))} className="rounded-md bg-white/90 p-1 text-black disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Move later" disabled={i === images.length - 1} onClick={() => run(() => moveGalleryImage(shootId, img.id, 1))} className="rounded-md bg-white/90 p-1 text-black disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
