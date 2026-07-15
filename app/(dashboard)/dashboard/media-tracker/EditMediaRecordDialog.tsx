'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaRecordForm } from './MediaRecordForm';
import type { MediaRecordStatus } from './status';

/**
 * Row-level Edit button for the Media Tracker list — opens the full record
 * form in a dialog so admins can edit without leaving the main page.
 */
export function EditMediaRecordDialog({
  record,
  clients,
  employees,
  devices,
}: {
  record: any;
  clients: { id: string; name: string }[];
  employees: { id: string; fullName: string | null }[];
  devices: { id: string; label: string; type: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${record.title}`}
      >
        <Pencil className="h-3.5 w-3.5 mr-1" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit — {record.title}</DialogTitle>
            <DialogDescription>
              Update storage locations, editor, or status.
            </DialogDescription>
          </DialogHeader>
          <MediaRecordForm
            clients={clients}
            employees={employees}
            devices={devices}
            recordId={record.id}
            onDone={() => setOpen(false)}
            initialData={{
              title: record.title,
              clientId: record.client_id,
              photographyBookingId: record.photography_booking_id,
              studioBookingId: record.studio_booking_id,
              shootDate: record.shoot_date,
              primaryStorageDeviceId: record.primary_storage?.id ?? null,
              originalBackupDeviceId: record.original_backup?.id ?? null,
              backupCopyDeviceId: record.backup_copy?.id ?? null,
              assignedEmployeeId: record.assigned_employee?.id ?? null,
              status: record.status as MediaRecordStatus,
              photoCount: record.photo_count ?? 0,
              videoCount: record.video_count ?? 0,
              photoSizeGb: record.photo_size_gb ?? 0,
              videoSizeGb: record.video_size_gb ?? 0,
              notes: record.notes,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
