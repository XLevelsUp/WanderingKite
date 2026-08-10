'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Cloud,
  FileQuestion,
  Folder,
  FolderClock,
  HardDrive,
  Image as ImageIcon,
  TriangleAlert,
  Video as VideoIcon,
} from 'lucide-react';
import {
  MediaStatusBadge,
  DEVICE_TYPE_LABEL,
  hasBackupRisk,
  hasUnloggedContent,
  NotLoggedPill,
} from '../status';
import {
  SlotActions,
  getEmptySlots,
  SLOT_LABEL,
  type DeviceOption,
} from '../SlotOpsDialogs';
import { EditContentButton } from '../EditContentButton';
import type { StorageSlot } from '@/actions/media-tracker';

interface Device {
  id: string;
  label: string;
  type: string;
  capacity: string | null;
  is_active: boolean;
}

interface DeviceEntry {
  record: any;
  slot: StorageSlot;
}

type FolderKind = 'photos' | 'videos' | 'unsorted' | 'empty' | 'unlogged';

const FOLDER_LABEL: Record<FolderKind, string> = {
  photos: 'Photos',
  videos: 'Videos',
  unsorted: 'Unsorted / Mixed',
  empty: 'Confirmed Empty',
  unlogged: 'Not Logged',
};

const SLOT_PILL: Record<StorageSlot, string> = {
  primary: 'bg-blue-500/12 text-blue-400 border-blue-500/25',
  original_backup: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
  backup_copy: 'bg-violet-500/12 text-violet-400 border-violet-500/25',
  backup_copy_2: 'bg-pink-500/12 text-pink-400 border-pink-500/25',
};

/** Parses free-text capacity like "2TB" / "500 GB" into GB. Null if unparseable. */
function parseCapacityToGb(capacity: string | null): number | null {
  if (!capacity) return null;
  const match = capacity.match(/([\d.]+)\s*(TB|GB|MB)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'TB') return value * 1024;
  if (unit === 'MB') return value / 1024;
  return value;
}

function DeviceIcon({ type, className }: { type: string; className?: string }) {
  return type === 'CLOUD' ? (
    <Cloud className={className} />
  ) : (
    <HardDrive className={className} />
  );
}

function CircularUtilization({
  count,
  maxCount,
  size = 40,
}: {
  count: number;
  maxCount: number;
  size?: number;
}) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ height: size, width: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90 transform"
        viewBox="0 0 40 40"
        width={size}
        height={size}
      >
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-700"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-300 ${
            percentage > 75
              ? 'text-red-500'
              : percentage > 50
                ? 'text-amber-500'
                : 'text-emerald-500'
          }`}
        />
      </svg>
      <span className="text-[11px] font-bold text-slate-300">{count}</span>
    </div>
  );
}

/**
 * Photos-vs-videos pie for one device, proportioned by GB (not item count) —
 * videos take far more space per item than photos, so a count-based split
 * would misrepresent actual usage. Clicking a slice (or its legend dot)
 * opens that content's folder, revealing the real shoot list.
 */
function ContentPie({
  photoCount,
  videoCount,
  photoSizeGb,
  videoSizeGb,
  otherSizeGb,
  onSelectPhotos,
  onSelectVideos,
  onSelectUnsorted,
}: {
  photoCount: number;
  videoCount: number;
  photoSizeGb: number;
  videoSizeGb: number;
  otherSizeGb: number;
  onSelectPhotos: () => void;
  onSelectVideos: () => void;
  onSelectUnsorted: () => void;
}) {
  const size = 128;
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const totalSizeGb = photoSizeGb + videoSizeGb + otherSizeGb;
  const photoLength = totalSizeGb > 0 ? (photoSizeGb / totalSizeGb) * circumference : 0;
  const videoLength = totalSizeGb > 0 ? (videoSizeGb / totalSizeGb) * circumference : 0;
  const otherLength = totalSizeGb > 0 ? (otherSizeGb / totalSizeGb) * circumference : 0;

  return (
    <div className="flex shrink-0 flex-col items-center gap-2.5">
      <div className="relative" style={{ height: size, width: size }}>
        <svg
          className="-rotate-90 transform"
          viewBox="0 0 120 120"
          width={size}
          height={size}
        >
          {totalSizeGb === 0 ? (
            <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="18" className="text-slate-700" />
          ) : (
            <>
              <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="18" className="text-slate-800" />
              {photoSizeGb > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeDasharray={`${photoLength} ${circumference - photoLength}`}
                  strokeDashoffset={0}
                  onClick={onSelectPhotos}
                  className="cursor-pointer text-amber-400 transition-opacity hover:opacity-80"
                  style={{ pointerEvents: 'stroke' }}
                />
              )}
              {videoSizeGb > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeDasharray={`${videoLength} ${circumference - videoLength}`}
                  strokeDashoffset={-photoLength}
                  onClick={onSelectVideos}
                  className="cursor-pointer text-sky-400 transition-opacity hover:opacity-80"
                  style={{ pointerEvents: 'stroke' }}
                />
              )}
              {otherSizeGb > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="18"
                  strokeDasharray={`${otherLength} ${circumference - otherLength}`}
                  strokeDashoffset={-(photoLength + videoLength)}
                  onClick={onSelectUnsorted}
                  className="cursor-pointer text-violet-400 transition-opacity hover:opacity-80"
                  style={{ pointerEvents: 'stroke' }}
                />
              )}
            </>
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{totalSizeGb.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500">GB used</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <button
          onClick={onSelectPhotos}
          disabled={photoCount === 0}
          className="flex items-center gap-1.5 disabled:opacity-40"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          Photos ({photoCount} · {photoSizeGb.toFixed(1)} GB)
        </button>
        <button
          onClick={onSelectVideos}
          disabled={videoCount === 0}
          className="flex items-center gap-1.5 disabled:opacity-40"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          Videos ({videoCount} · {videoSizeGb.toFixed(1)} GB)
        </button>
        <button
          onClick={onSelectUnsorted}
          disabled={otherSizeGb === 0}
          className="flex items-center gap-1.5 disabled:opacity-40"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
          Unsorted ({otherSizeGb.toFixed(1)} GB)
        </button>
      </div>
    </div>
  );
}

export function StorageMap({
  devices,
  records,
  isEmployee,
}: {
  devices: Device[];
  records: any[];
  isEmployee: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openFolder, setOpenFolder] = useState<FolderKind | null>(null);

  // Default to the first device once the list loads.
  useEffect(() => {
    if (!selectedId && devices.length > 0) setSelectedId(devices[0].id);
  }, [devices, selectedId]);

  // Reset folder view whenever the selected device changes.
  useEffect(() => {
    setOpenFolder(null);
  }, [selectedId]);

  const selectedDevice = devices.find((d) => d.id === selectedId) ?? null;

  // device id → entries (record + which slot points at this device)
  const entriesByDevice = useMemo(() => {
    const map = new Map<string, DeviceEntry[]>();
    for (const r of records) {
      const slots: [StorageSlot, any][] = [
        ['primary', r.primary_storage],
        ['original_backup', r.original_backup],
        ['backup_copy', r.backup_copy],
        ['backup_copy_2', r.backup_copy_2],
      ];
      for (const [slot, device] of slots) {
        if (device?.id) {
          const list = map.get(device.id) ?? [];
          list.push({ record: r, slot });
          map.set(device.id, list);
        }
      }
    }
    return map;
  }, [records]);

  const maxCount = useMemo(
    () =>
      Math.max(
        0,
        ...devices.map((d) => (entriesByDevice.get(d.id) ?? []).length)
      ),
    [devices, entriesByDevice]
  );

  const riskCount = useMemo(
    () => records.filter((r) => hasBackupRisk(r)).length,
    [records]
  );

  // Per-device GB total + shoot count — the same "how full is this drive"
  // view the old spreadsheet's pivot table gave, now computed live.
  const deviceTotals = useMemo(() => {
    return devices.map((d) => {
      const entries = entriesByDevice.get(d.id) ?? [];
      const totalGb = entries.reduce(
        (sum, { record }) =>
          sum +
          Number(record.photo_size_gb ?? 0) +
          Number(record.video_size_gb ?? 0) +
          Number(record.other_size_gb ?? 0),
        0
      );
      return { device: d, recordCount: entries.length, totalGb };
    });
  }, [devices, entriesByDevice]);

  const activeDeviceOptions: DeviceOption[] = devices
    .filter((d) => d.is_active)
    .map((d) => ({ id: d.id, label: d.label, type: d.type }));

  const selectedEntries = selectedDevice
    ? (entriesByDevice.get(selectedDevice.id) ?? [])
    : [];

  // Aggregate content stats for the selected device.
  const deviceStats = useMemo(() => {
    let totalPhotos = 0;
    let totalVideos = 0;
    let totalPhotoSizeGb = 0;
    let totalVideoSizeGb = 0;
    let totalOtherSizeGb = 0;
    const photoEntries: DeviceEntry[] = [];
    const videoEntries: DeviceEntry[] = [];
    const unsortedEntries: DeviceEntry[] = [];
    const emptyEntries: DeviceEntry[] = [];
    const unloggedEntries: DeviceEntry[] = [];

    for (const entry of selectedEntries) {
      const photos = entry.record.photo_count ?? 0;
      const videos = entry.record.video_count ?? 0;
      const otherSizeGb = Number(entry.record.other_size_gb ?? 0);
      totalPhotos += photos;
      totalVideos += videos;
      totalPhotoSizeGb += Number(entry.record.photo_size_gb ?? 0);
      totalVideoSizeGb += Number(entry.record.video_size_gb ?? 0);
      totalOtherSizeGb += otherSizeGb;
      if (photos > 0) photoEntries.push(entry);
      if (videos > 0) videoEntries.push(entry);
      if (otherSizeGb > 0) unsortedEntries.push(entry);
      if (photos === 0 && videos === 0 && otherSizeGb === 0) {
        if (hasUnloggedContent(entry.record)) {
          unloggedEntries.push(entry);
        } else {
          emptyEntries.push(entry);
        }
      }
    }

    return {
      totalPhotos,
      totalVideos,
      totalPhotoSizeGb,
      totalVideoSizeGb,
      totalOtherSizeGb,
      totalSizeGb: totalPhotoSizeGb + totalVideoSizeGb + totalOtherSizeGb,
      photoEntries,
      videoEntries,
      unsortedEntries,
      emptyEntries,
      unloggedEntries,
    };
  }, [selectedEntries]);

  const capacityGb = selectedDevice ? parseCapacityToGb(selectedDevice.capacity) : null;

  const folderEntries =
    openFolder === 'photos'
      ? deviceStats.photoEntries
      : openFolder === 'videos'
        ? deviceStats.videoEntries
        : openFolder === 'unsorted'
          ? deviceStats.unsortedEntries
          : openFolder === 'empty'
            ? deviceStats.emptyEntries
            : openFolder === 'unlogged'
              ? deviceStats.unloggedEntries
              : [];

  const renderShootRow = (record: any, slot: StorageSlot) => (
    <li key={`${record.id}-${slot}`} className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/dashboard/media-tracker/${record.id}`}
          className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-primary hover:underline"
        >
          {record.title}
        </Link>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${SLOT_PILL[slot]}`}
        >
          {SLOT_LABEL[slot]}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>{record.client?.name ?? 'Unknown client'}</span>
        <MediaStatusBadge status={record.status} />
        {(record.photo_count > 0 ||
          record.video_count > 0 ||
          Number(record.other_size_gb ?? 0) > 0) && (
          <span className="flex items-center gap-2">
            {record.photo_count > 0 && (
              <span className="flex items-center gap-0.5">
                <ImageIcon className="h-3 w-3" />
                {record.photo_count}
                {record.photo_size_gb > 0 &&
                  ` (${Number(record.photo_size_gb).toFixed(1)} GB)`}
              </span>
            )}
            {record.video_count > 0 && (
              <span className="flex items-center gap-0.5">
                <VideoIcon className="h-3 w-3" />
                {record.video_count}
                {record.video_size_gb > 0 &&
                  ` (${Number(record.video_size_gb).toFixed(1)} GB)`}
              </span>
            )}
            {Number(record.other_size_gb ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <FileQuestion className="h-3 w-3" />
                Unsorted ({Number(record.other_size_gb).toFixed(1)} GB)
              </span>
            )}
          </span>
        )}
        {hasBackupRisk(record) && (
          <span className="text-red-400 font-semibold">⚠ No backup</span>
        )}
        {hasUnloggedContent(record) && <NotLoggedPill />}
      </div>
      {!isEmployee && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <SlotActions
            recordId={record.id}
            recordTitle={record.title}
            slot={slot}
            currentDeviceId={selectedDevice?.id ?? null}
            emptySlots={getEmptySlots(record)}
            devices={activeDeviceOptions}
            compact
          />
          <EditContentButton
            recordId={record.id}
            recordTitle={record.title}
            photoCount={record.photo_count ?? 0}
            videoCount={record.video_count ?? 0}
            photoSizeGb={record.photo_size_gb ?? 0}
            videoSizeGb={record.video_size_gb ?? 0}
            otherSizeGb={record.other_size_gb ?? 0}
            folderPath={record.folder_path}
            compact
          />
        </div>
      )}
    </li>
  );

  return (
    <div className="space-y-6">
      {/* Backup-risk strip */}
      {riskCount > 0 && (
        <Link
          href="/dashboard/media-tracker"
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 transition-colors hover:bg-red-500/15"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <TriangleAlert className="h-5 w-5 text-red-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-red-400">
              {riskCount} shoot{riskCount > 1 ? 's have' : ' has'} no backup
            </p>
            <p className="text-xs text-red-400/70">
              Footage exists on only one device — a single failure loses it.
              Click to review in the list.
            </p>
          </div>
        </Link>
      )}

      {/* Per-device utilization summary — the old spreadsheet's pivot table,
          computed live from tracked records. */}
      {deviceTotals.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {deviceTotals.map(({ device, recordCount, totalGb }) => (
            <button
              key={device.id}
              onClick={() => setSelectedId(device.id)}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors hover:bg-accent ${
                device.id === selectedId
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border'
              }`}
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <DeviceIcon type={device.type} className="h-3.5 w-3.5" />
                {device.label}
              </span>
              <span className="text-lg font-bold">{totalGb.toFixed(1)} GB</span>
              <span className="text-xs text-slate-500">
                {recordCount} shoot{recordCount !== 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Explorer-style: device sidebar + selected-device contents */}
      {devices.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No storage devices yet — add some under Manage Devices.
        </p>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card md:h-[36rem] md:flex-row">
          {/* Sidebar — device list */}
          <div className="flex max-h-56 shrink-0 flex-col border-b border-border md:h-full md:max-h-none md:w-72 md:border-b-0 md:border-r">
            <p className="shrink-0 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Devices ({devices.length})
            </p>
            <div className="flex-1 overflow-y-auto p-2">
              {devices.map((d) => {
                const count = (entriesByDevice.get(d.id) ?? []).length;
                const isIdle = count === 0 && d.is_active;
                const isSelected = d.id === selectedId;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-transparent hover:bg-accent'
                    } ${!d.is_active ? 'opacity-60' : ''}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        d.type === 'CLOUD'
                          ? 'bg-sky-500/12 text-sky-400'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <DeviceIcon type={d.type} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {d.label}
                        </span>
                        {!d.is_active && (
                          <span className="shrink-0 rounded-full border border-slate-500/25 bg-slate-500/12 px-1.5 py-0 text-[9px] font-semibold uppercase text-slate-400">
                            Retired
                          </span>
                        )}
                      </span>
                      <span
                        className={`block truncate text-xs ${isIdle ? 'text-amber-400' : 'text-slate-500'}`}
                      >
                        {DEVICE_TYPE_LABEL[d.type] ?? d.type}
                        {d.capacity ? ` · ${d.capacity}` : ''}
                      </span>
                    </span>
                    <CircularUtilization count={count} maxCount={maxCount} size={32} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content pane — selected device's contents */}
          <div className="flex-1 overflow-y-auto p-5">
            {!selectedDevice ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Select a device to see what&apos;s stored on it.
              </p>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-start gap-5">
                  <ContentPie
                    photoCount={deviceStats.totalPhotos}
                    videoCount={deviceStats.totalVideos}
                    photoSizeGb={deviceStats.totalPhotoSizeGb}
                    videoSizeGb={deviceStats.totalVideoSizeGb}
                    otherSizeGb={deviceStats.totalOtherSizeGb}
                    onSelectPhotos={() => setOpenFolder('photos')}
                    onSelectVideos={() => setOpenFolder('videos')}
                    onSelectUnsorted={() => setOpenFolder('unsorted')}
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">
                      {selectedDevice.label}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {DEVICE_TYPE_LABEL[selectedDevice.type] ?? selectedDevice.type}
                      {selectedDevice.capacity ? ` · ${selectedDevice.capacity} capacity` : ' · capacity not set'}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {deviceStats.totalSizeGb.toFixed(1)} GB used
                      {capacityGb != null &&
                        ` of ${selectedDevice.capacity} (${Math.min(100, (deviceStats.totalSizeGb / capacityGb) * 100).toFixed(0)}%)`}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Click a slice or legend dot to open that folder.
                    </p>
                  </div>
                </div>

                {selectedEntries.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    Nothing is tracked on this device yet.
                  </p>
                ) : !openFolder ? (
                  // Folder view — Photos / Videos (and Other, if any shoots lack both)
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => setOpenFolder('photos')}
                      disabled={deviceStats.photoEntries.length === 0}
                      className="flex flex-col items-start gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Folder className="h-8 w-8 text-amber-400" />
                      <span className="text-sm font-semibold">Photos</span>
                      <span className="text-xs text-slate-500">
                        {deviceStats.photoEntries.length} shoot
                        {deviceStats.photoEntries.length !== 1 ? 's' : ''} ·{' '}
                        {deviceStats.totalPhotos} photos ·{' '}
                        {deviceStats.totalPhotoSizeGb.toFixed(1)} GB
                      </span>
                    </button>
                    <button
                      onClick={() => setOpenFolder('videos')}
                      disabled={deviceStats.videoEntries.length === 0}
                      className="flex flex-col items-start gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <Folder className="h-8 w-8 text-sky-400" />
                      <span className="text-sm font-semibold">Videos</span>
                      <span className="text-xs text-slate-500">
                        {deviceStats.videoEntries.length} shoot
                        {deviceStats.videoEntries.length !== 1 ? 's' : ''} ·{' '}
                        {deviceStats.totalVideos} videos ·{' '}
                        {deviceStats.totalVideoSizeGb.toFixed(1)} GB
                      </span>
                    </button>
                    {deviceStats.unsortedEntries.length > 0 && (
                      <button
                        onClick={() => setOpenFolder('unsorted')}
                        className="flex flex-col items-start gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent"
                      >
                        <FileQuestion className="h-8 w-8 text-violet-400" />
                        <span className="text-sm font-semibold">Unsorted / Mixed</span>
                        <span className="text-xs text-slate-500">
                          {deviceStats.unsortedEntries.length} shoot
                          {deviceStats.unsortedEntries.length !== 1 ? 's' : ''} ·{' '}
                          {deviceStats.totalOtherSizeGb.toFixed(1)} GB, split unknown
                        </span>
                      </button>
                    )}
                    {deviceStats.emptyEntries.length > 0 && (
                      <button
                        onClick={() => setOpenFolder('empty')}
                        className="flex flex-col items-start gap-2 rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent"
                      >
                        <Folder className="h-8 w-8 text-slate-400" />
                        <span className="text-sm font-semibold">Confirmed Empty</span>
                        <span className="text-xs text-slate-500">
                          {deviceStats.emptyEntries.length} shoot
                          {deviceStats.emptyEntries.length !== 1 ? 's' : ''} · reviewed,
                          no content
                        </span>
                      </button>
                    )}
                    {deviceStats.unloggedEntries.length > 0 && (
                      <button
                        onClick={() => setOpenFolder('unlogged')}
                        className="flex flex-col items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left transition-colors hover:bg-amber-500/10"
                      >
                        <FolderClock className="h-8 w-8 text-amber-400" />
                        <span className="text-sm font-semibold">Not Logged</span>
                        <span className="text-xs text-amber-400/80">
                          {deviceStats.unloggedEntries.length} shoot
                          {deviceStats.unloggedEntries.length !== 1 ? 's' : ''} · content
                          never reviewed
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  // Inside a folder — breadcrumb + filtered shoot list
                  <div className="space-y-3">
                    <button
                      onClick={() => setOpenFolder(null)}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {selectedDevice.label}
                      <span className="mx-1">/</span>
                      <span className="font-medium text-foreground">
                        {openFolder && FOLDER_LABEL[openFolder]}
                      </span>
                    </button>
                    <ul className="space-y-3">
                      {folderEntries.map(({ record, slot }: DeviceEntry) =>
                        renderShootRow(record, slot)
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
