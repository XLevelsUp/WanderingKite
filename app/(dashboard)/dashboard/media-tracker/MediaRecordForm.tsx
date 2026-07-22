'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientCombobox } from './ClientCombobox';
import {
  createMediaRecord,
  updateMediaRecord,
  getBookingsForClient,
  type ClientBookingOption,
} from '@/actions/media-tracker';
import { DEVICE_TYPE_LABEL } from './status';

interface ClientOption {
  id: string;
  name: string;
}
interface DeviceOption {
  id: string;
  label: string;
  type: string;
}

interface InitialData {
  title: string;
  clientId: string | null;
  photographyBookingId: string | null;
  studioBookingId: string | null;
  shootDate: string | null;
  folderPath: string | null;
  category: string | null;
  contentTags: string[] | null;
  primaryStorageDeviceId: string | null;
  originalBackupDeviceId: string | null;
  backupCopyDeviceId: string | null;
  backupCopy2DeviceId: string | null;
  photoCount: number;
  videoCount: number;
  photoSizeGb: number;
  videoSizeGb: number;
  otherSizeGb: number;
  notes: string | null;
}

const NONE = 'none';

export function MediaRecordForm({
  clients,
  devices,
  initialData,
  recordId,
  onDone,
}: {
  clients: ClientOption[];
  devices: DeviceOption[];
  initialData?: InitialData;
  recordId?: string;
  /** When set, called after a successful save instead of navigating away. */
  onDone?: () => void;
}) {
  const router = useRouter();
  const isEdit = !!recordId;

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [clientId, setClientId] = useState(initialData?.clientId ?? '');
  const [clientOptions, setClientOptions] = useState(clients);
  const [bookingId, setBookingId] = useState(
    initialData?.photographyBookingId || initialData?.studioBookingId || NONE
  );
  const [bookings, setBookings] = useState<ClientBookingOption[]>([]);
  const [shootDate, setShootDate] = useState(initialData?.shootDate ?? '');
  const [folderPath, setFolderPath] = useState(initialData?.folderPath ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [tagsInput, setTagsInput] = useState(
    (initialData?.contentTags ?? []).join(', ')
  );
  const [primaryDevice, setPrimaryDevice] = useState(
    initialData?.primaryStorageDeviceId ?? NONE
  );
  const [originalBackupDevice, setOriginalBackupDevice] = useState(
    initialData?.originalBackupDeviceId ?? NONE
  );
  const [backupCopyDevice, setBackupCopyDevice] = useState(
    initialData?.backupCopyDeviceId ?? NONE
  );
  const [backupCopy2Device, setBackupCopy2Device] = useState(
    initialData?.backupCopy2DeviceId ?? NONE
  );
  const [photoCount, setPhotoCount] = useState(
    initialData?.photoCount ? String(initialData.photoCount) : ''
  );
  const [videoCount, setVideoCount] = useState(
    initialData?.videoCount ? String(initialData.videoCount) : ''
  );
  const [photoSizeGb, setPhotoSizeGb] = useState(
    initialData?.photoSizeGb ? String(initialData.photoSizeGb) : ''
  );
  const [videoSizeGb, setVideoSizeGb] = useState(
    initialData?.videoSizeGb ? String(initialData.videoSizeGb) : ''
  );
  const [otherSizeGb, setOtherSizeGb] = useState(
    initialData?.otherSizeGb ? String(initialData.otherSizeGb) : ''
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [busy, setBusy] = useState(false);

  // Load bookings for the selected client (cascading picker).
  useEffect(() => {
    if (!clientId) {
      setBookings([]);
      return;
    }
    getBookingsForClient(clientId)
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [clientId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const selectedBooking = bookings.find((b) => b.id === bookingId);
    const contentTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const input = {
      title,
      clientId: clientId || undefined,
      photographyBookingId:
        selectedBooking?.type === 'PHOTOGRAPHY' ? bookingId : undefined,
      studioBookingId: selectedBooking?.type === 'STUDIO' ? bookingId : undefined,
      shootDate: shootDate || undefined,
      folderPath: folderPath || undefined,
      category: category || undefined,
      contentTags,
      primaryStorageDeviceId: primaryDevice !== NONE ? primaryDevice : undefined,
      originalBackupDeviceId:
        originalBackupDevice !== NONE ? originalBackupDevice : undefined,
      backupCopyDeviceId: backupCopyDevice !== NONE ? backupCopyDevice : undefined,
      backupCopy2DeviceId:
        backupCopy2Device !== NONE ? backupCopy2Device : undefined,
      photoCount: photoCount ? Number(photoCount) : 0,
      videoCount: videoCount ? Number(videoCount) : 0,
      photoSizeGb: photoSizeGb ? Number(photoSizeGb) : 0,
      videoSizeGb: videoSizeGb ? Number(videoSizeGb) : 0,
      otherSizeGb: otherSizeGb ? Number(otherSizeGb) : 0,
      notes: notes || undefined,
    };

    setBusy(true);
    try {
      if (isEdit) {
        await updateMediaRecord(recordId!, input);
        toast.success('Media record updated');
        if (onDone) onDone();
        else router.push(`/dashboard/media-tracker/${recordId}`);
      } else {
        await createMediaRecord(input);
        toast.success('Media record created');
        if (onDone) onDone();
        else router.push('/dashboard/media-tracker');
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="mr-title">Title</Label>
        <Input
          id="mr-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Wedding — Priya & Arjun"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Client (optional)</Label>
          <ClientCombobox
            value={clientId}
            onValueChange={setClientId}
            clients={clientOptions}
            onClientCreated={(c) =>
              setClientOptions((prev) => [c, ...prev])
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Linked Booking (optional)</Label>
          <Select
            value={bookingId}
            onValueChange={setBookingId}
            disabled={!clientId || bookings.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="No booking (standalone)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No booking (standalone)</SelectItem>
              {bookings.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mr-date">Shoot Date (optional)</Label>
        <Input
          id="mr-date"
          type="date"
          value={shootDate}
          onChange={(e) => setShootDate(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-border p-4 space-y-4">
        <p className="text-sm font-semibold">Storage &amp; Backup Locations</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Primary Storage</Label>
            <Select value={primaryDevice} onValueChange={setPrimaryDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not set</SelectItem>
                {devices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label} ({DEVICE_TYPE_LABEL[d.type] ?? d.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Original Backup</Label>
            <Select
              value={originalBackupDevice}
              onValueChange={setOriginalBackupDevice}
            >
              <SelectTrigger>
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not set</SelectItem>
                {devices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label} ({DEVICE_TYPE_LABEL[d.type] ?? d.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Backup Copy</Label>
            <Select value={backupCopyDevice} onValueChange={setBackupCopyDevice}>
              <SelectTrigger>
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not set</SelectItem>
                {devices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label} ({DEVICE_TYPE_LABEL[d.type] ?? d.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Backup Copy 2</Label>
            <Select value={backupCopy2Device} onValueChange={setBackupCopy2Device}>
              <SelectTrigger>
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not set</SelectItem>
                {devices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label} ({DEVICE_TYPE_LABEL[d.type] ?? d.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Only active devices are listed. Manage the device inventory from{' '}
          <span className="font-medium">Manage Devices</span> on the tracker page.
        </p>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-4">
        <p className="text-sm font-semibold">Content</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mr-photo-count">Photos</Label>
            <Input
              id="mr-photo-count"
              type="number"
              min="0"
              inputMode="numeric"
              value={photoCount}
              onChange={(e) => setPhotoCount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mr-photo-size">Photo size (GB)</Label>
            <Input
              id="mr-photo-size"
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={photoSizeGb}
              onChange={(e) => setPhotoSizeGb(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mr-video-count">Videos</Label>
            <Input
              id="mr-video-count"
              type="number"
              min="0"
              inputMode="numeric"
              value={videoCount}
              onChange={(e) => setVideoCount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mr-video-size">Video size (GB)</Label>
            <Input
              id="mr-video-size"
              type="number"
              min="0"
              step="0.1"
              inputMode="decimal"
              value={videoSizeGb}
              onChange={(e) => setVideoSizeGb(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mr-other-size">Unsorted / Mixed (GB)</Label>
          <Input
            id="mr-other-size"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={otherSizeGb}
            onChange={(e) => setOtherSizeGb(e.target.value)}
            placeholder="0"
          />
          <p className="text-xs text-slate-500">
            Use this when you know the total size but haven&apos;t split it
            into photos vs. videos yet — don&apos;t guess a split.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Sizes are used for the Storage Map&apos;s usage pie — videos usually
          take up far more space per item than photos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mr-folder-path">Folder Path (optional)</Label>
          <Input
            id="mr-folder-path"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="e.g. WK 2TB 01/Wandering Kite Studio/WK Corporates/Alusea"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mr-category">Category (optional)</Label>
          <Input
            id="mr-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Review Reel, Product Shoot, Wedding"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mr-tags">Content Tags (optional)</Label>
        <Input
          id="mr-tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Comma-separated, e.g. BTS, Final, RAW"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mr-notes">Notes (optional)</Label>
        <Textarea
          id="mr-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any details about this shoot's storage or editing status…"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={busy}>
          {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Record'}
        </Button>
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            router.push(
              isEdit ? `/dashboard/media-tracker/${recordId}` : '/dashboard/media-tracker'
            )
          }
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
