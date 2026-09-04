import { SupabaseClient } from '@supabase/supabase-js';
import type { AttendanceLogWithEmployee, AttendanceSettingRow, AttendanceLogRow } from '@/lib/types/hr';

/**
 * AttendanceService
 * Decouples database queries from Server Actions.
 * Improves testability by allowing mock Supabase clients.
 */
export class AttendanceService {
  constructor(private supabase: SupabaseClient) {}

  async getSettings(dateStr?: string): Promise<AttendanceSettingRow | null> {
    const queryDate = dateStr || new Date().toISOString().split('T')[0];

    const { data } = await this.supabase
      .from('attendance_settings')
      .select('*')
      .lte('effectiveDate', queryDate)
      .order('effectiveDate', { ascending: false })
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (data) return data as AttendanceSettingRow;

    const { data: fallback } = await this.supabase
      .from('attendance_settings')
      .select('*')
      .order('effectiveDate', { ascending: true })
      .limit(1)
      .single();

    return (fallback as AttendanceSettingRow) ?? null;
  }

  async getMonthlyAttendance(month: number, year: number): Promise<AttendanceLogWithEmployee[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await this.supabase
      .from('attendance_logs')
      .select(`
        id, employeeId, date, clockIn, clockOut, status, totalHours, markedById, notes, createdAt, updatedAt,
        employee:employeeId(
          id, fullName, email,
          contract:employee_contracts(jobTitle, avatarUrl)
        )
      `)
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

  async getEmployeeMonthlyAttendance(employeeId: string, month: number, year: number): Promise<AttendanceLogRow[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await this.supabase
      .from('attendance_logs')
      .select('*')
      .eq('employeeId', employeeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) return [];
    return (data ?? []) as AttendanceLogRow[];
  }
}
