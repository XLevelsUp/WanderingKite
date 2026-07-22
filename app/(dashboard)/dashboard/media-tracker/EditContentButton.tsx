'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateMediaRecordContent } from '@/actions/media-tracker';

/**
 * Quick photo/video count + size edit for one shoot — opens right where the
 * shoot is listed (Storage Map folders, etc.) so it can be corrected without
 * navigating to the record's own page.
 */
export function EditContentButton({
  recordId,
  recordTitle,
  photoCount,
  videoCount,
  photoSizeGb,
  videoSizeGb,
  otherSizeGb,
  compact = false,
}: {
  recordId: string;
  recordTitle: string;
  photoCount: number;
  videoCount: number;
  photoSizeGb: number;
  videoSizeGb: number;
  otherSizeGb: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState('');
  const [videos, setVideos] = useState('');
  const [photoSize, setPhotoSize] = useState('');
  const [videoSize, setVideoSize] = useState('');
  const [otherSize, setOtherSize] = useState('');
  const [busy, setBusy] = useState(false);

  const openDialog = () => {
    setPhotos(photoCount ? String(photoCount) : '');
    setVideos(videoCount ? String(videoCount) : '');
    setPhotoSize(photoSizeGb ? String(photoSizeGb) : '');
    setVideoSize(videoSizeGb ? String(videoSizeGb) : '');
    setOtherSize(otherSizeGb ? String(otherSizeGb) : '');
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateMediaRecordContent(recordId, {
        photoCount: photos ? Number(photos) : 0,
        videoCount: videos ? Number(videos) : 0,
        photoSizeGb: photoSize ? Number(photoSize) : 0,
        videoSizeGb: videoSize ? Number(videoSize) : 0,
        otherSizeGb: otherSize ? Number(otherSize) : 0,
      });
      toast.success('Content updated');
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update content');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={compact ? 'h-7 px-2 text-[11px]' : ''}
        onClick={openDialog}
      >
        <Pencil className="h-3 w-3 mr-1" />
        Edit content
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Edit content</DialogTitle>
            <DialogDescription>
              &ldquo;{recordTitle}&rdquo; — update without leaving this page.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ec-photos" className="text-xs">
                Photos
              </Label>
              <Input
                id="ec-photos"
                type="number"
                min="0"
                inputMode="numeric"
                value={photos}
                onChange={(e) => setPhotos(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ec-photo-size" className="text-xs">
                Photo size (GB)
              </Label>
              <Input
                id="ec-photo-size"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={photoSize}
                onChange={(e) => setPhotoSize(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ec-videos" className="text-xs">
                Videos
              </Label>
              <Input
                id="ec-videos"
                type="number"
                min="0"
                inputMode="numeric"
                value={videos}
                onChange={(e) => setVideos(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ec-video-size" className="text-xs">
                Video size (GB)
              </Label>
              <Input
                id="ec-video-size"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={videoSize}
                onChange={(e) => setVideoSize(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="ec-other-size" className="text-xs">
                Unsorted / Mixed (GB)
              </Label>
              <Input
                id="ec-other-size"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={otherSize}
                onChange={(e) => setOtherSize(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy} data-no-track>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
