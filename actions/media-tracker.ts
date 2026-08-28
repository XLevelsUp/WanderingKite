'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { parseSupabaseError } from '@/lib/errorHandler';
import { writeAuditLog } from '@/lib/audit';
import { canManageMediaTracker } from '@/lib/access';
import {
  mediaRecordSchema,
  storageDeviceSchema,
  updateAssignmentSchema,
  type MediaRecordFormData,
  type StorageDeviceFormData,
  type UpdateAssignmentFormData,
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
    .select('role, can_manage_media_tracker')
    .eq('id', user.id)
    .single();

  if (!profile || !canManageMediaTracker(profile.role, profile.can_manage_media_tracker)) {
    throw new Error('Unauthorized');
  }
  return { supabase, user };
}

const RECORD_SELECT = `
  id, title, shoot_date, status, notes, created_at, updated_at,
  photo_count, video_count, photo_size_gb, video_size_gb, other_size_gb, content_logged_at,
  folder_path, content_tags, category,
  client_id, photography_booking_id, studio_booking_id,
  client:clients(id, name, phone),
  assigned_employee:profiles!assigned_employee_id(id, fullName, email),
  primary_storage:storage_devices!primary_storage_device_id(id, label, type, is_active),
  original_backup:storage_devices!original_backup_device_id(id, label, type, is_active),
  backup_copy:storage_devices!backup_copy_device_id(id, label, type, is_active),
  backup_copy_2:storage_devices!backup_copy_2_device_id(id, label, type, is_active)
`;

/** True once any content field carries a real (nonzero) value — used to
 * distinguish "content genuinely confirmed empty" from "never logged." */
function hasLoggableContent(input: MediaRecordFormData) {
  return (
    input.photoCount > 0 ||
    input.videoCount > 0 ||
    input.photoSizeGb > 0 ||
    input.videoSizeGb > 0 ||
    input.otherSizeGb > 0
  );
}

function toRow(input: MediaRecordFormData) {
  return {
    title: input.title,
    client_id: input.clientId ?? null,
    photography_booking_id: input.photographyBookingId ?? null,
    studio_booking_id: input.studioBookingId ?? null,
    shoot_date: input.shootDate || null,
    folder_path: input.folderPath || null,
    category: input.category || null,
    content_tags: input.contentTags ?? [],
    primary_storage_device_id: input.primaryStorageDeviceId ?? null,
    original_backup_device_id: input.originalBackupDeviceId ?? null,
    backup_copy_device_id: input.backupCopyDeviceId ?? null,
    backup_copy_2_device_id: input.backupCopy2DeviceId ?? null,
    photo_count: input.photoCount,
    video_count: input.videoCount,
    photo_size_gb: input.photoSizeGb,
    video_size_gb: input.videoSizeGb,
    other_size_gb: input.otherSizeGb,
    notes: input.notes || null,
  };
}

// ── Media records ────────────────────────────────────────────────────────────

export interface MediaRecordFilters {
  query?: string;
  status?: string;
  employeeId?: string;
  category?: string;
  /** When true, only records with no client_id (internal/archival imports). */
  unlinkedOnly?: boolean;
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
  if (filters.category) {
    dbQuery = dbQuery.eq('category', filters.category);
  }
  if (filters.unlinkedOnly) {
    dbQuery = dbQuery.is('client_id', null);
  }
  if (filters.query) {
    // Matches on title OR folder path so imported archival records (often
    // searched by drive/folder fragment rather than an exact title) surface
    // too. Commas would otherwise be parsed as PostgREST OR-clause
    // separators, so strip them from the search term.
    const safeQuery = filters.query.replace(/,/g, ' ').trim();
    dbQuery = dbQuery.or(
      `title.ilike.%${safeQuery}%,folder_path.ilike.%${safeQuery}%`
    );
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
      // Status/editor are no longer set from this form — every new record
      // starts unassigned; use the Editor Tracker page to assign it.
      status: 'NOT_STARTED',
      assigned_employee_id: null,
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

/** Same soft-delete as deleteMediaRecord (sets deleted_at, never removes the
 * row) applied to many records at once — for the list page's bulk-select. */
export async function bulkDeleteMediaRecords(ids: string[]) {
  const { supabase, user } = await requireAdmin();

  if (!ids || ids.length === 0) {
    return { deleted: 0 };
  }

  const { data: oldRows } = await supabase
    .from('media_records')
    .select('*')
    .in('id', ids)
    .is('deleted_at', null);

  const { error } = await supabase
    .from('media_records')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', ids);

  if (error) {
    logger.error('Failed to bulk delete media records', error);
    throw new Error(parseSupabaseError(error, 'Failed to delete media records.'));
  }

  for (const row of oldRows ?? []) {
    await writeAuditLog(supabase, {
      user_id: user.id,
      action: 'DELETE_MEDIA_RECORD',
      table_name: 'media_records',
      record_id: row.id,
      old_data: row,
    });
  }

  revalidatePath('/dashboard/media-tracker');
  revalidatePath('/dashboard/media-tracker/map');
  revalidatePath('/dashboard/media-tracker/editors');

  return { deleted: oldRows?.length ?? 0 };
}

// ── Storage slot operations (Copy / Transfer / Remove are all one update) ───

export type StorageSlot =
  | 'primary'
  | 'original_backup'
  | 'backup_copy'
  | 'backup_copy_2';

const SLOT_COLUMN: Record<StorageSlot, string> = {
  primary: 'primary_storage_device_id',
  original_backup: 'original_backup_device_id',
  backup_copy: 'backup_copy_device_id',
  backup_copy_2: 'backup_copy_2_device_id',
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
    otherSizeGb: number;
    folderPath?: string;
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
      other_size_gb: input.otherSizeGb,
      // Only touch folder_path when the caller actually passed it, so this
      // action stays safe to call from places that don't show that field.
      ...(input.folderPath !== undefined ? { folder_path: input.folderPath || null } : {}),
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
    .is('deleted_at', null)
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

/** Toggles a device between active and retired — keeps it visible in the
 * inventory (as "Retired") while hiding it from active-device pickers. */
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

/** Soft-deletes a device — removes it from the UI entirely. Blocked if any
 * media record still references it in one of its 4 storage slots, since
 * deleting those would silently erase real backup-location history; retire
 * it instead in that case. */
export async function deleteStorageDevice(id: string) {
  const { supabase, user } = await requireAdmin();

  const { count, error: refError } = await supabase
    .from('media_records')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .or(
      `primary_storage_device_id.eq.${id},original_backup_device_id.eq.${id},backup_copy_device_id.eq.${id},backup_copy_2_device_id.eq.${id}`
    );

  if (refError) {
    throw new Error(parseSupabaseError(refError, 'Failed to check device usage.'));
  }
  if (count && count > 0) {
    throw new Error(
      `Cannot delete — ${count} media record(s) still reference this device. Retire it instead.`
    );
  }

  const { data: oldRow } = await supabase
    .from('storage_devices')
    .select('*')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('storage_devices')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(parseSupabaseError(error, 'Failed to delete storage device.'));
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'DELETE_STORAGE_DEVICE',
    table_name: 'storage_devices',
    record_id: id,
    old_data: oldRow,
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

// ── CSV export ───────────────────────────────────────────────────────────────

function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/** Formats the current filtered record set as CSV for the "Export CSV" button. */
export async function exportMediaRecordsCsv(
  filters: MediaRecordFilters = {}
): Promise<string> {
  const records = await getMediaRecords(filters);

  const header = [
    'Title',
    'Client',
    'Folder Path',
    'Category',
    'Content Tags',
    'Status',
    'Shoot Date',
    'Assigned Editor',
    'Primary Storage',
    'Original Backup',
    'Backup Copy',
    'Backup Copy 2',
    'Photo Count',
    'Video Count',
    'Photo Size (GB)',
    'Video Size (GB)',
    'Unsorted Size (GB)',
    'Notes',
  ];

  const rows = (records as any[]).map((r) => [
    r.title,
    r.client?.name ?? '',
    r.folder_path ?? '',
    r.category ?? '',
    (r.content_tags ?? []).join('; '),
    r.status,
    r.shoot_date ?? '',
    r.assigned_employee?.fullName ?? r.assigned_employee?.email ?? '',
    r.primary_storage?.label ?? '',
    r.original_backup?.label ?? '',
    r.backup_copy?.label ?? '',
    r.backup_copy_2?.label ?? '',
    r.photo_count,
    r.video_count,
    r.photo_size_gb,
    r.video_size_gb,
    r.other_size_gb,
    r.notes ?? '',
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

// ── Assignment / status history (Editor Tracker page) ───────────────────────

const ASSIGNMENT_HISTORY_SELECT = `
  id, media_record_id, from_status, to_status, notes, created_at,
  from_employee:profiles!from_employee_id(id, fullName, email),
  to_employee:profiles!to_employee_id(id, fullName, email),
  changed_by_employee:profiles!changed_by(id, fullName, email)
`;

/** All assignment/status transitions, optionally scoped to one shoot —
 * newest first. Powers the Editor Tracker page's history feed/timeline. */
export async function getAssignmentHistory(mediaRecordId?: string) {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('media_assignment_history')
    .select(ASSIGNMENT_HISTORY_SELECT)
    .order('created_at', { ascending: false });

  if (mediaRecordId) {
    dbQuery = dbQuery.eq('media_record_id', mediaRecordId);
  }

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(
      parseSupabaseError(error, 'Failed to fetch assignment history.')
    );
  }
  return data ?? [];
}

/**
 * The ONLY function that changes a shoot's status/assigned editor. Records
 * the from -> to transition for both fields in media_assignment_history
 * before applying the change, so reassignments are never silently lossy.
 */
export async function updateAssignment(
  mediaRecordId: string,
  input: UpdateAssignmentFormData
) {
  const { supabase, user } = await requireAdmin();
  const parsed = updateAssignmentSchema.parse(input);

  const { data: current, error: fetchError } = await supabase
    .from('media_records')
    .select('status, assigned_employee_id')
    .eq('id', mediaRecordId)
    .single();

  if (fetchError || !current) {
    throw new Error(
      parseSupabaseError(fetchError, 'Failed to load media record.')
    );
  }

  const { error: updateError } = await supabase
    .from('media_records')
    .update({
      status: parsed.toStatus,
      assigned_employee_id: parsed.toEmployeeId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', mediaRecordId);

  if (updateError) {
    throw new Error(
      parseSupabaseError(updateError, 'Failed to update assignment.')
    );
  }

  const { data: historyRow, error: historyError } = await supabase
    .from('media_assignment_history')
    .insert({
      media_record_id: mediaRecordId,
      from_employee_id: current.assigned_employee_id,
      to_employee_id: parsed.toEmployeeId,
      from_status: current.status,
      to_status: parsed.toStatus,
      changed_by: user.id,
      notes: parsed.note || null,
    })
    .select()
    .single();

  if (historyError) {
    throw new Error(
      parseSupabaseError(historyError, 'Failed to record assignment history.')
    );
  }

  await writeAuditLog(supabase, {
    user_id: user.id,
    action: 'UPDATE_MEDIA_ASSIGNMENT',
    table_name: 'media_records',
    record_id: mediaRecordId,
    old_data: current,
    new_data: { status: parsed.toStatus, assigned_employee_id: parsed.toEmployeeId },
  });

  revalidatePath('/dashboard/media-tracker');
  revalidatePath('/dashboard/media-tracker/editors');
  revalidatePath(`/dashboard/media-tracker/${mediaRecordId}`);

  return historyRow;
}
