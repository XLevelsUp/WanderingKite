'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { parseSupabaseError } from '@/lib/errorHandler';
import { writeAuditLog } from '@/lib/audit';
import {
  mediaRecordSchema,
  storageDeviceSchema,
  type MediaRecordFormData,
  type StorageDeviceFormData,
} from '@/lib/validations/media-tracker';

// ── Role gate (pattern from actions/equipment.ts) ────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }
  return { supabase, user };
}

const RECORD_SELECT = `
  id, title, shoot_date, status, notes, created_at, updated_at,
  photo_count, video_count, photo_size_gb, video_size_gb, content_logged_at,
  client_id, photography_booking_id, studio_booking_id,
  client:clients(id, name, phone),
  assigned_employee:profiles!assigned_employee_id(id, fullName, email),
  primary_storage:storage_devices!primary_storage_device_id(id, label, type, is_active),
  original_backup:storage_devices!original_backup_device_id(id, label, type, is_active),
  backup_copy:storage_devices!backup_copy_device_id(id, label, type, is_active)
`;

/** True once any content field carries a real (nonzero) value — used to
 * distinguish "content genuinely confirmed empty" from "never logged." */
function hasLoggableContent(input: MediaRecordFormData) {
  return (
    input.photoCount > 0 ||
    input.videoCount > 0 ||
    input.photoSizeGb > 0 ||
    input.videoSizeGb > 0
  );
}

function toRow(input: MediaRecordFormData) {
  return {
    title: input.title,
    client_id: input.clientId,
    photography_booking_id: input.photographyBookingId ?? null,
    studio_booking_id: input.studioBookingId ?? null,
    shoot_date: input.shootDate || null,
    primary_storage_device_id: input.primaryStorageDeviceId ?? null,
    original_backup_device_id: input.originalBackupDeviceId ?? null,
    backup_copy_device_id: input.backupCopyDeviceId ?? null,
    assigned_employee_id: input.assignedEmployeeId ?? null,
    status: input.status,
    photo_count: input.photoCount,
    video_count: input.videoCount,
    photo_size_gb: input.photoSizeGb,
    video_size_gb: input.videoSizeGb,
    notes: input.notes || null,
  };
}

// ── Media records ────────────────────────────────────────────────────────────

export interface MediaRecordFilters {
  query?: string;
  status?: string;
  employeeId?: string;
}

export async function getMediaRecords(filters: MediaRecordFilters = {}) {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('media_records')
    .select(RECORD_SELECT)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters.status) {
    dbQuery = dbQuery.eq('status', filters.status);
  }
  if (filters.employeeId) {
    dbQuery = dbQuery.eq('assigned_employee_id', filters.employeeId);
  }
  if (filters.query) {
    dbQuery = dbQuery.ilike('title', `%${filters.query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch media records.'));
  }
  return data ?? [];
}

export async function getMediaRecord(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_records')
    .select(RECORD_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch media record.'));
  }
  return data;
}

export async function createMediaRecord(input: MediaRecordFormData) {
  const { supabase, user } = await requireAdmin();
  const parsed = mediaRecordSchema.parse(input);

  const { data, error } = await supabase
    .from('media_records')
    .insert({
      ...toRow(parsed),
      created_by: user.id,
      content_logged_at: hasLoggableContent(parsed)
        ? new Date().toISOString()
        : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to create media record.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'CREATE_MEDIA_RECORD',
    table_name: 'media_records',
    record_id: data.id,
    new_data: data,
  });

  revalidatePath('/dashboard/media-tracker');
}

export async function updateMediaRecord(id: string, input: MediaRecordFormData) {
  const { supabase, user } = await requireAdmin();
  const parsed = mediaRecordSchema.parse(input);

  const { data: oldRow } = await supabase
    .from('media_records')
    .select('*')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('media_records')
    .update({
      ...toRow(parsed),
      updated_at: new Date().toISOString(),
      // Only ever advances to "logged" — never un-logs a previously
      // confirmed shoot just because this particular save left content blank.
      ...(hasLoggableContent(parsed)
        ? { content_logged_at: new Date().toISOString() }
        : {}),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update media record.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_MEDIA_RECORD',
    table_name: 'media_records',
    record_id: id,
    old_data: oldRow,
    new_data: data,
  });

  revalidatePath('/dashboard/media-tracker');
  revalidatePath(`/dashboard/media-tracker/${id}`);
}

export async function deleteMediaRecord(id: string) {
  const { supabase, user } = await requireAdmin();

  const { data: oldRow } = await supabase
    .from('media_records')
    .select('*')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('media_records')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    logger.error('Failed to delete media record', error);
    throw new Error(parseSupabaseError(error, 'Failed to delete media record.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'DELETE_MEDIA_RECORD',
    table_name: 'media_records',
    record_id: id,
    old_data: oldRow,
  });

  revalidatePath('/dashboard/media-tracker');
}

// ── Storage slot operations (Copy / Transfer / Remove are all one update) ───

export type StorageSlot = 'primary' | 'original_backup' | 'backup_copy';

const SLOT_COLUMN: Record<StorageSlot, string> = {
  primary: 'primary_storage_device_id',
  original_backup: 'original_backup_device_id',
  backup_copy: 'backup_copy_device_id',
};

/**
 * Sets one of a record's three storage slots to a device (or clears it).
 * UI verbs map onto this single action:
 *   Copy    = fill an empty slot with a device
 *   Transfer= overwrite a slot with a different device
 *   Remove  = set the slot to null
 * This updates TRACKING metadata only — no physical files are touched.
 */
export async function setStorageSlot(
  recordId: string,
  slot: StorageSlot,
  deviceId: string | null
) {
  const { supabase, user } = await requireAdmin();

  const column = SLOT_COLUMN[slot];
  if (!column) throw new Error('Invalid storage slot');

  const { data: oldRow } = await supabase
    .from('media_records')
    .select(column)
    .eq('id', recordId)
    .single();

  const { error } = await supabase
    .from('media_records')
    .update({ [column]: deviceId, updated_at: new Date().toISOString() })
    .eq('id', recordId);

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update storage slot.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'SET_STORAGE_SLOT',
    table_name: 'media_records',
    record_id: recordId,
    old_data: oldRow,
    new_data: { [column]: deviceId },
  });

  revalidatePath('/dashboard/media-tracker');
  revalidatePath('/dashboard/media-tracker/map');
  revalidatePath(`/dashboard/media-tracker/${recordId}`);
}

/** Quick inline edit for a shoot's photo/video/size stats — used by the
 * Storage Map so content can be corrected without leaving the page. */
export async function updateMediaRecordContent(
  id: string,
  input: {
    photoCount: number;
    videoCount: number;
    photoSizeGb: number;
    videoSizeGb: number;
  }
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('media_records')
    .update({
      photo_count: input.photoCount,
      video_count: input.videoCount,
      photo_size_gb: input.photoSizeGb,
      video_size_gb: input.videoSizeGb,
      // This dialog exists specifically to review/confirm content, so a
      // save here always counts as "logged" — even if every value is 0.
      content_logged_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update content.'));
  }
  revalidatePath('/dashboard/media-tracker');
  revalidatePath('/dashboard/media-tracker/map');
  revalidatePath(`/dashboard/media-tracker/${id}`);
}

// ── Storage devices ──────────────────────────────────────────────────────────

export async function getStorageDevices(activeOnly = false) {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('storage_devices')
    .select('*')
    .order('label', { ascending: true });

  if (activeOnly) {
    dbQuery = dbQuery.eq('is_active', true);
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to fetch storage devices.'));
  }
  return data ?? [];
}

export async function createStorageDevice(input: StorageDeviceFormData) {
  const { supabase, user } = await requireAdmin();
  const parsed = storageDeviceSchema.parse(input);

  const { data, error } = await supabase
    .from('storage_devices')
    .insert({
      label: parsed.label,
      type: parsed.type,
      capacity: parsed.capacity || null,
      notes: parsed.notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to create storage device.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'CREATE_STORAGE_DEVICE',
    table_name: 'storage_devices',
    record_id: data.id,
    new_data: data,
  });

  revalidatePath('/dashboard/media-tracker/devices');
}

export async function updateStorageDevice(
  id: string,
  input: StorageDeviceFormData
) {
  const { supabase, user } = await requireAdmin();
  const parsed = storageDeviceSchema.parse(input);

  const { data: oldRow } = await supabase
    .from('storage_devices')
    .select('*')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('storage_devices')
    .update({
      label: parsed.label,
      type: parsed.type,
      capacity: parsed.capacity || null,
      notes: parsed.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update storage device.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_STORAGE_DEVICE',
    table_name: 'storage_devices',
    record_id: id,
    old_data: oldRow,
    new_data: data,
  });

  revalidatePath('/dashboard/media-tracker/devices');
}

/** Toggles a device between active and retired — devices are never hard-deleted. */
export async function setStorageDeviceActive(id: string, isActive: boolean) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from('storage_devices')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to update device status.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'SET_STORAGE_DEVICE_ACTIVE',
    table_name: 'storage_devices',
    record_id: id,
    new_data: { is_active: isActive },
  });

  revalidatePath('/dashboard/media-tracker/devices');
}

// ── Booking lookup for the optional client-shoot link ───────────────────────

export interface ClientBookingOption {
  id: string;
  type: 'PHOTOGRAPHY' | 'STUDIO';
  dateTime: string | null;
  label: string;
}

export async function getBookingsForClient(
  clientId: string
): Promise<ClientBookingOption[]> {
  const supabase = await createClient();

  const [photoRes, studioRes] = await Promise.all([
    supabase
      .from('photography_bookings')
      .select('id, date_time, session_type')
      .eq('client_id', clientId),
    supabase
      .from('studio_bookings')
      .select('id, date_time, purpose')
      .eq('client_id', clientId),
  ]);

  const photo = (photoRes.data ?? []).map((b: any) => ({
    id: b.id,
    type: 'PHOTOGRAPHY' as const,
    dateTime: b.date_time,
    label: `Photography — ${b.session_type ?? 'Session'}${b.date_time ? ` (${new Date(b.date_time).toLocaleDateString('en-IN')})` : ''}`,
  }));

  const studio = (studioRes.data ?? []).map((b: any) => ({
    id: b.id,
    type: 'STUDIO' as const,
    dateTime: b.date_time,
    label: `Studio — ${b.purpose ?? 'Booking'}${b.date_time ? ` (${new Date(b.date_time).toLocaleDateString('en-IN')})` : ''}`,
  }));

  return [...photo, ...studio].sort((a, b) => {
    if (!a.dateTime) return 1;
    if (!b.dateTime) return -1;
    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
  });
}
