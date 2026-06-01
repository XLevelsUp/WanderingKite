'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  attendanceLogSchema,
  bulkAttendanceSchema,
  attendanceSettingsSchema,
  type AttendanceLogFormData,
  type BulkAttendanceFormData,
  type AttendanceSettingsData,
} from '@/lib/validations/hr';
import { deriveAttendanceStatus } from '@/lib/payroll-engine';
import type { AttendanceLogRow, AttendanceLogWithEmployee, AttendanceSettingRow, AttendanceStatus } from '@/lib/types/hr';

// ─────────────────────────────────────────────────────────────────────────────
// GUARDS
// ─────────────────────────────────────────────────────────────────────────────

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
    redirect('/dashboard');
  }

  return { supabase, userId: user.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ: Settings
// ─────────────────────────────────────────────────────────────────────────────

export async function getAttendanceSettings(): Promise<AttendanceSettingRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('attendance_settings')
    .select('*')
    .limit(1)
    .single();
  return (data as AttendanceSettingRow) ?? null;
}

export async function updateAttendanceSettings(data: AttendanceSettingsData) {
  const { supabase } = await requireAdmin();

  const result = attendanceSettingsSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  // Upsert the single settings row
  const { data: existing } = await supabase
    .from('attendance_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('attendance_settings')
      .update(result.data)
      .eq('id', existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from('attendance_settings')
      .insert(result.data);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/attendance');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ: Attendance Logs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all attendance logs for a specific month + year.
 * Returns rows enriched with employee profile + contract data.
 */
export async function getMonthlyAttendance(
  month: number,
  year: number,
): Promise<AttendanceLogWithEmployee[]> {
  const { supabase } = await requireAdmin();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;



  const { data, error } = await supabase
    .from('attendance_logs')
    .select(
      `
      id, employeeId, date, clockIn, clockOut, status, totalHours, markedById, notes, createdAt, updatedAt,
      employee:employeeId(
        id, fullName, email,
        contract:employee_contracts(jobTitle, avatarUrl)
      )
    `,
    )
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    ...row,
    employee: {
      id: row.employee?.id,
      fullName: row.employee?.fullName ?? null,
      email: row.employee?.email ?? '',
      contract: Array.isArray(row.employee?.contract)
        ? (row.employee.contract[0] ?? null)
        : (row.employee?.contract ?? null),
    },
  }));
}

/**
 * Get attendance logs for a specific employee over a month.
 */
export async function getEmployeeMonthlyAttendance(
  employeeId: string,
  month: number,
  year: number,
): Promise<AttendanceLogRow[]> {
  const supabase = await createClient();

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;



  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('employeeId', employeeId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) return [];
  return (data ?? []) as AttendanceLogRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE: Single log
// ─────────────────────────────────────────────────────────────────────────────

/** Upsert a single attendance log (admin can set any status + times) */
export async function upsertAttendanceLog(formData: AttendanceLogFormData) {
  const { supabase, userId } = await requireAdmin();

  const result = attendanceLogSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { employeeId, date, clockIn, clockOut, status, notes } = result.data;

  // Auto-derive status from clock times if both are provided and status not explicitly set
  let finalStatus = status;
  if (clockIn && finalStatus === 'ABSENT') {
    const settings = await getAttendanceSettings();
    if (settings) {
      finalStatus = deriveAttendanceStatus(
        clockIn,
        clockOut || null,
        settings.studioStartTime,
        settings.graceMinutes,
        settings.halfDayThresholdHours,
      );
    }
  }

  const { error } = await supabase.from('attendance_logs').upsert(
    {
      employeeId,
      date,
      clockIn: clockIn || null,
      clockOut: clockOut || null,
      status: finalStatus,
      markedById: userId,
      notes: notes || null,
    },
    { onConflict: 'employeeId,date' },
  );

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  return { success: true };
}

/** Delete a single attendance log (unmark) */
export async function deleteAttendanceLog(employeeId: string, date: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('attendance_logs')
    .delete()
    .eq('employeeId', employeeId)
    .eq('date', date);

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  return { success: true };
}


// ─────────────────────────────────────────────────────────────────────────────
// WRITE: Bulk mark attendance for a date
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkMarkAttendance(formData: BulkAttendanceFormData) {
  const { supabase, userId } = await requireAdmin();

  const result = bulkAttendanceSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { date, entries } = result.data;
  const settings = await getAttendanceSettings();

  const rows = entries.map((entry) => {
    let status = entry.status;

    // Auto-derive if clocking in on a non-explicit status
    if (entry.clockIn && status === 'PRESENT' && settings) {
      status = deriveAttendanceStatus(
        entry.clockIn,
        entry.clockOut || null,
        settings.studioStartTime,
        settings.graceMinutes,
        settings.halfDayThresholdHours,
      );
    }

    return {
      employeeId: entry.employeeId,
      date,
      clockIn: entry.clockIn || null,
      clockOut: entry.clockOut || null,
      status,
      markedById: userId,
    };
  });

  const { error } = await supabase
    .from('attendance_logs')
    .upsert(rows, { onConflict: 'employeeId,date' });

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  return { success: true, count: rows.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE: Employee self clock-in / clock-out
// ─────────────────────────────────────────────────────────────────────────────

export async function logClockIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5); // HH:MM

  const settings = await getAttendanceSettings();
  const status = settings
    ? deriveAttendanceStatus(now, null, settings.studioStartTime, settings.graceMinutes, settings.halfDayThresholdHours)
    : 'PRESENT';

  // Check if already clocked in today
  const { data: existing } = await supabase
    .from('attendance_logs')
    .select('id, clockIn')
    .eq('employeeId', user.id)
    .eq('date', today)
    .single();

  if (existing?.clockIn) {
    return { error: 'Already clocked in for today' };
  }

  const { error } = await supabase.from('attendance_logs').upsert(
    { employeeId: user.id, date: today, clockIn: now, status, markedById: user.id },
    { onConflict: 'employeeId,date' },
  );

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  return { success: true, clockIn: now, status };
}

export async function logClockOut() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().slice(0, 5);

  // Must have clocked in
  const { data: existing } = await supabase
    .from('attendance_logs')
    .select('id, clockIn, status')
    .eq('employeeId', user.id)
    .eq('date', today)
    .single();

  if (!existing?.clockIn) {
    return { error: 'You have not clocked in today' };
  }

  const settings = await getAttendanceSettings();
  let status = existing.status;

  if (existing.clockIn && settings) {
    status = deriveAttendanceStatus(
      existing.clockIn,
      now,
      settings.studioStartTime,
      settings.graceMinutes,
      settings.halfDayThresholdHours,
    );
  }

  const { error } = await supabase
    .from('attendance_logs')
    .update({ clockOut: now, status })
    .eq('id', existing.id);

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  return { success: true, clockOut: now };
}

/** Bulk mark attendance for a date range for all active employees */
export async function bulkMarkRangeAttendance(
  startDateStr: string,
  endDateStr: string,
  status: AttendanceStatus,
) {
  const { supabase, userId } = await requireAdmin();

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Invalid start or end date' };
  }

  if (start > end) {
    return { error: 'Start date must be before or equal to end date' };
  }

  // Get active employees
  const { data: employees, error: empError } = await supabase
    .from('employee_contracts')
    .select('profileId')
    .eq('isActive', true);

  if (empError) return { error: empError.message };
  if (!employees || employees.length === 0) {
    return { error: 'No active employees found to mark' };
  }

  // Generate date range
  const dates: string[] = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  // Limit to prevent huge payloads (e.g. max 62 days at once)
  if (dates.length > 62) {
    return { error: 'Date range cannot exceed 62 days' };
  }

  const settings = await getAttendanceSettings();
  const rows: any[] = [];

  for (const date of dates) {
    for (const emp of employees) {
      let clockIn: string | null = null;
      let clockOut: string | null = null;

      // If status is PRESENT/LATE/HALF_DAY, set a standard clock-in based on settings
      if (['PRESENT', 'LATE', 'HALF_DAY'].includes(status)) {
        clockIn = settings?.studioStartTime ? settings.studioStartTime.slice(0, 5) : '09:00';
        if (status === 'PRESENT') {
          clockOut = '18:00';
        } else if (status === 'HALF_DAY') {
          clockOut = '13:00';
        } else if (status === 'LATE') {
          const grace = settings?.graceMinutes ?? 15;
          const [h, m] = clockIn.split(':').map(Number);
          const totalMins = h * 60 + m + grace + 5;
          const lateH = String(Math.floor(totalMins / 60)).padStart(2, '0');
          const lateM = String(totalMins % 60).padStart(2, '0');
          clockIn = `${lateH}:${lateM}`;
          clockOut = '18:00';
        }
      }

      rows.push({
        employeeId: emp.profileId,
        date,
        clockIn: clockIn ? `${clockIn}:00` : null,
        clockOut: clockOut ? `${clockOut}:00` : null,
        status,
        markedById: userId,
      });
    }
  }

  const { error } = await supabase
    .from('attendance_logs')
    .upsert(rows, { onConflict: 'employeeId,date' });

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  return { success: true, count: employees.length * dates.length };
}

