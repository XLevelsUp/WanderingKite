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
import { AttendanceService } from '@/lib/services/AttendanceService';
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

export async function getAttendanceSettings(dateStr?: string): Promise<AttendanceSettingRow | null> {
  const supabase = await createClient();
  const service = new AttendanceService(supabase);
  return service.getSettings(dateStr);
}

export async function updateAttendanceSettings(data: AttendanceSettingsData) {
  const { supabase } = await requireAdmin();

  const result = attendanceSettingsSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const now = new Date();
  let nextMonth = now.getMonth() + 2; // +1 for 0-indexed, +1 for next month
  let year = now.getFullYear();
  if (nextMonth > 12) {
    nextMonth = 1;
    year += 1;
  }
  const effectiveDate = `${year}-${String(nextMonth).padStart(2, '0')}-01`;

  // Upsert the settings row for the effectiveDate
  const { data: existing } = await supabase
    .from('attendance_settings')
    .select('id')
    .eq('effectiveDate', effectiveDate)
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
      .insert({ ...result.data, effectiveDate });
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
  const service = new AttendanceService(supabase);
  return service.getMonthlyAttendance(month, year);
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
  const service = new AttendanceService(supabase);
  return service.getEmployeeMonthlyAttendance(employeeId, month, year);
}

/**
 * Get attendance logs for the logged-in employee over a month.
 */
export async function getOwnAttendance(
  month: number,
  year: number,
): Promise<AttendanceLogRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('employeeId', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) return [];
  return (data ?? []) as AttendanceLogRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE: Single log
// Helper to get employee's joiningDate or fallback profile createdAt date
async function getEmployeeStartDate(supabase: any, employeeId: string): Promise<string | null> {
  const { data: contract } = await supabase
    .from('employee_contracts')
    .select('joiningDate')
    .eq('profileId', employeeId)
    .maybeSingle();

  if (contract?.joiningDate) {
    return contract.joiningDate;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('createdAt')
    .eq('id', employeeId)
    .maybeSingle();

  if (profile?.createdAt) {
    return profile.createdAt.split('T')[0];
  }

  return null;
}

/** Upsert a single attendance log (admin can set any status + times) */
export async function upsertAttendanceLog(formData: AttendanceLogFormData) {
  const { supabase, userId } = await requireAdmin();

  const result = attendanceLogSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { employeeId, date, clockIn, clockOut, status, notes } = result.data;

  const startDate = await getEmployeeStartDate(supabase, employeeId);
  if (startDate && date < startDate) {
    return { error: `Cannot mark attendance prior to the employee's joining date (${startDate}).` };
  }

  // Auto-derive status from clock times if both are provided and status not explicitly set
  let finalStatus = status;
  if (clockIn && finalStatus === 'ABSENT') {
    const settings = await getAttendanceSettings(date);
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
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/attendance');
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
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/attendance');
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
  const settings = await getAttendanceSettings(date);

  // Fetch joining dates for all employees in the entries
  const employeeIds = entries.map((e) => e.employeeId);
  const [contractsRes, profilesRes] = await Promise.all([
    supabase.from('employee_contracts').select('profileId, joiningDate').in('profileId', employeeIds),
    supabase.from('profiles').select('id, createdAt').in('id', employeeIds),
  ]);

  const startDates = new Map<string, string>();
  for (const c of contractsRes.data ?? []) {
    if (c.joiningDate) startDates.set(c.profileId, c.joiningDate);
  }
  for (const p of profilesRes.data ?? []) {
    if (!startDates.has(p.id) && p.createdAt) {
      startDates.set(p.id, p.createdAt.split('T')[0]);
    }
  }

  const rows = [];
  for (const entry of entries) {
    const startDate = startDates.get(entry.employeeId);
    if (startDate && date < startDate) {
      continue; // Skip logs before joining date
    }

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

    rows.push({
      employeeId: entry.employeeId,
      date,
      clockIn: entry.clockIn || null,
      clockOut: entry.clockOut || null,
      status,
      markedById: userId,
    });
  }

  if (rows.length === 0) {
    return { error: 'All selected entries are prior to the employees\' joining dates.' };
  }

  const { error } = await supabase
    .from('attendance_logs')
    .upsert(rows, { onConflict: 'employeeId,date' });

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/attendance');
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
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/attendance');
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
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/attendance');
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
    .select('profileId, joiningDate')
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

  const settings = await getAttendanceSettings(startDateStr);
  const rows: any[] = [];

  for (const date of dates) {
    for (const emp of employees) {
      if (emp.joiningDate && date < emp.joiningDate) {
        continue; // Skip logs before joining date
      }

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

  if (rows.length === 0) {
    return { error: 'All dates in the range are prior to the active employees\' joining dates.' };
  }

  const { error } = await supabase
    .from('attendance_logs')
    .upsert(rows, { onConflict: 'employeeId,date' });

  if (error) return { error: error.message };

  revalidatePath('/admin/attendance');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/attendance');
  return { success: true, count: rows.length };
}

