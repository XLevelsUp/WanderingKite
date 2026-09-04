'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  FileQuestion,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Link2,
  Pencil,
  User,
  UserCog,
  Video as VideoIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaStatusBadge, DEVICE_TYPE_LABEL, hasBackupRisk, NoBackupPill, hasUnloggedContent, NotLoggedPill } from '../status';
import { MediaRecordForm } from '../MediaRecordForm';
import { SlotActions, getEmptySlots } from '../SlotOpsDialogs';
import type { StorageSlot } from '@/actions/media-tracker';
import { DeleteMediaRecordButton } from '@/components/dashboard/DeleteMediaRecordButton';

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function DeviceValue({
  device,
}: {
  device: { label: string; type: string; is_active: boolean } | null;
}) {
  if (!device) return <span className="text-slate-500">Not set</span>;
  return (
    <span>
      {device.label}{' '}
      <span className="text-slate-500">
        ({DEVICE_TYPE_LABEL[device.type] ?? device.type})
      </span>
      {!device.is_active && (
        <span className="ml-1.5 text-[10px] uppercase text-amber-500 font-semibold">
          Retired
        </span>
      )}
    </span>
  );
}

export function MediaRecordDetail({
  record,
  isEmployee,
  clients,
  devices,
}: {
  record: any;
  isEmployee: boolean;
  clients: { id: string; name: string }[];
  devices: { id: string; label: string; type: string }[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <MediaRecordForm
        clients={clients}
        devices={devices}
        recordId={record.id}
        initialData={{
          title: record.title,
          clientId: record.client_id,
          photographyBookingId: record.photography_booking_id,
          studioBookingId: record.studio_booking_id,
          shootDate: record.shoot_date,
          folderPath: record.folder_path,
          category: record.category,
          contentTags: record.content_tags,
          primaryStorageDeviceId: record.primary_storage?.id ?? null,
          originalBackupDeviceId: record.original_backup?.id ?? null,
          backupCopyDeviceId: record.backup_copy?.id ?? null,
          backupCopy2DeviceId: record.backup_copy_2?.id ?? null,
          photoCount: record.photo_count ?? 0,
          videoCount: record.video_count ?? 0,
          photoSizeGb: record.photo_size_gb ?? 0,
          videoSizeGb: record.video_size_gb ?? 0,
          otherSizeGb: record.other_size_gb ?? 0,
          notes: record.notes,
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <MediaStatusBadge status={record.status} />
        <div className="flex items-center gap-2">
          <Link href={`/media-tracker/editors?record=${record.id}`}>
            <Button size="sm" variant="outline">
              <UserCog className="h-3.5 w-3.5 mr-1.5" />
              Manage Assignment
            </Button>
          </Link>
          {!isEmployee && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <DeleteMediaRecordButton recordId={record.id} recordTitle={record.title} />
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <InfoRow icon={User} label="Client" value={record.client?.name ?? '— (no client)'} />
        {record.category && (
          <InfoRow
            icon={FileText}
            label="Category"
            value={
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-500/12 text-slate-300 border border-slate-500/25">
                {record.category}
              </span>
            }
          />
        )}
        {record.folder_path && (
          <InfoRow
            icon={FileText}
            label="Folder Path"
            value={<span className="break-all font-mono text-xs">{record.folder_path}</span>}
          />
        )}
        {record.content_tags && record.content_tags.length > 0 && (
          <InfoRow
            icon={FileText}
            label="Content Tags"
            value={
              <span className="flex flex-wrap gap-1.5">
                {record.content_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            }
          />
        )}
        {(record.photography_booking_id || record.studio_booking_id) && (
          <InfoRow
            icon={Link2}
            label="Linked Booking"
            value={record.photography_booking_id ? 'Photography Booking' : 'Studio Booking'}
          />
        )}
        {record.shoot_date && (
          <InfoRow
            icon={Calendar}
            label="Shoot Date"
            value={new Date(record.shoot_date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          />
        )}
        <InfoRow
          icon={User}
          label="Assigned Editor"
          value={
            record.assigned_employee
              ? record.assigned_employee.fullName ?? record.assigned_employee.email
              : 'Unassigned'
          }
        />
        <InfoRow
          icon={ImageIcon}
          label="Content"
          value={
            hasUnloggedContent(record) ? (
              <NotLoggedPill />
            ) : (
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                  {record.photo_count ?? 0} photos ·{' '}
                  {Number(record.photo_size_gb ?? 0).toFixed(1)} GB
                </span>
                <span className="flex items-center gap-1">
                  <VideoIcon className="h-3.5 w-3.5 text-slate-500" />
                  {record.video_count ?? 0} videos ·{' '}
                  {Number(record.video_size_gb ?? 0).toFixed(1)} GB
                </span>
                {Number(record.other_size_gb ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <FileQuestion className="h-3.5 w-3.5 text-slate-500" />
                    Unsorted ·{' '}
                    {Number(record.other_size_gb).toFixed(1)} GB
                  </span>
                )}
              </span>
            )
          }
        />
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between gap-2 mb-1 px-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Storage &amp; Backup
          </p>
          {hasBackupRisk(record) && <NoBackupPill />}
        </div>
        {(
          [
            ['primary', 'Primary Storage', record.primary_storage],
            ['original_backup', 'Original Backup', record.original_backup],
            ['backup_copy', 'Backup Copy', record.backup_copy],
            ['backup_copy_2', 'Backup Copy 2', record.backup_copy_2],
          ] as [StorageSlot, string, any][]
        ).map(([slot, label, device]) => (
          <InfoRow
            key={slot}
            icon={HardDrive}
            label={label}
            value={
              <div className="space-y-2">
                <DeviceValue device={device} />
                {!isEmployee && (
                  <SlotActions
                    recordId={record.id}
                    recordTitle={record.title}
                    slot={slot}
                    currentDeviceId={device?.id ?? null}
                    emptySlots={getEmptySlots(record)}
                    devices={devices}
                    compact
                  />
                )}
              </div>
            }
          />
        ))}
      </div>

      {record.notes && (
        <div className="rounded-xl border border-border p-4">
          <InfoRow icon={FileText} label="Notes" value={record.notes} />
        </div>
      )}

      <p className="text-xs text-slate-500">
        Created {new Date(record.created_at).toLocaleString('en-IN')} · Updated{' '}
        {new Date(record.updated_at).toLocaleString('en-IN')}
      </p>
    </div>
  );
}
