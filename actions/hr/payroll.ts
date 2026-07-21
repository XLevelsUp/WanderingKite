'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  payrollGenerateSchema,
  payrollOverrideSchema,
  type PayrollGenerateData,
  type PayrollOverrideData,
} from '@/lib/validations/hr';
import {
  calculatePayout,
  computePresentDaysForMonth,
} from '@/lib/payroll-engine';
import { getAttendanceSettings } from './attendance';
import type { PayrollRecordWithEmployee } from '@/lib/types/hr';

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

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
    redirect('/dashboard');
  }

  return { supabase, userId: user.id };
}

async function requireSuperAdmin() {
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

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return { supabase, userId: user.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all payroll records for a given month+year, with employee info joined.
 */
export async function getPayrollForMonth(
  month: number,
  year: number,
): Promise<PayrollRecordWithEmployee[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('payroll_records')
    .select(
      `
      *,
      employee:employeeId(
        id, fullName, email,
        contract:employee_contracts(
          jobTitle, department, employeeNumber, avatarUrl,
          bankAccountName, bankAccountNumber, bankIFSC, upiId
        )
      )
    `,
    )
    .eq('month', month)
    .eq('year', year)
    .order('createdAt', { ascending: true });

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    ...row,
    employee: {
      id: row.employee?.id ?? row.employeeId,
      fullName: row.employee?.fullName ?? null,
      email: row.employee?.email ?? '',
      contract: Array.isArray(row.employee?.contract)
        ? (row.employee.contract[0] ?? null)
        : (row.employee?.contract ?? null),
    },
  }));
}

/**
 * Get a single payroll record by ID with full employee data.
 */
export async function getPayslip(recordId: string): Promise<PayrollRecordWithEmployee | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('payroll_records')
    .select(
      `
      *,
      employee:employeeId(
        id, fullName, email,
        branches(name),
        contract:employee_contracts(
          jobTitle, department, employeeNumber, employmentType, joiningDate, avatarUrl,
          bankAccountName, bankAccountNumber, bankIFSC, upiId
        )
      )
    `,
    )
    .eq('id', recordId)
    .single();

  if (error || !data) return null;

  const row = data as any;

  // Employees can only view their own payslips; admins can view all
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile?.role ?? '');
  if (!isAdmin && row.employeeId !== user.id) redirect('/dashboard');

  return {
    ...row,
    employee: {
      id: row.employee?.id ?? row.employeeId,
      fullName: row.employee?.fullName ?? null,
      email: row.employee?.email ?? '',
      contract: Array.isArray(row.employee?.contract)
        ? (row.employee.contract[0] ?? null)
        : (row.employee?.contract ?? null),
    },
  };
}

/**
 * Get all payslips for the currently logged in employee.
 */
export async function getOwnPayslips(): Promise<PayrollRecordWithEmployee[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('payroll_records')
    .select(`
      *,
      employee:employeeId(
        id, fullName, email,
        contract:employee_contracts(
          jobTitle, department, employeeNumber, avatarUrl
        )
      )
    `)
    .eq('employeeId', user.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    ...row,
    employee: {
      id: row.employee?.id ?? row.employeeId,
      fullName: row.employee?.fullName ?? null,
      email: row.employee?.email ?? '',
      contract: Array.isArray(row.employee?.contract)
        ? (row.employee.contract[0] ?? null)
        : (row.employee?.contract ?? null),
    },
  }));
}

/**
 * Get all distinct month/year combos that have payroll records (for the index page).
 */
export async function getPayrollMonths(): Promise<{ month: number; year: number; statuses: string[] }[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('payroll_records')
    .select('month, year, status')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) return [];

  // Group by month+year
  const grouped = new Map<string, { month: number; year: number; statuses: string[] }>();
  for (const row of data ?? []) {
    const key = `${row.year}-${row.month}`;
    if (!grouped.has(key)) {
      grouped.set(key, { month: row.month, year: row.year, statuses: [] });
    }
    grouped.get(key)!.statuses.push(row.status);
  }

  return Array.from(grouped.values());
}

/**
 * Get all payroll records for a specific employee.
 */
export async function getEmployeePayrollHistory(employeeId: string): Promise<PayrollRecordWithEmployee[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from('payroll_records')
    .select(
      `
      *,
      employee:employeeId(
        id, fullName, email,
        contract:employee_contracts(
          jobTitle, department, employeeNumber, avatarUrl,
          bankAccountName, bankAccountNumber, bankIFSC, upiId
        )
      )
    `
    )
    .eq('employeeId', employeeId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    ...row,
    employee: {
      ...row.employee,
      contract: Array.isArray(row.employee?.contract)
        ? row.employee.contract[0]
        : row.employee?.contract,
    },
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE DRAFT
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Checks for any active employees in the given month who have working days (Monday-Saturday)
 * on or after their joiningDate with no attendance log.
 * Returns a list of employees with the dates and count of unmarked days.
 */
export async function checkUnmarkedAttendance(month: number, year: number) {
  const { supabase } = await requireAdmin();

  // Fetch all active employees
  const { data: contracts, error: contractError } = await supabase
    .from('employee_contracts')
    .select('profileId, joiningDate, profiles(fullName, email)')
    .eq('isActive', true);

  if (contractError) return { error: contractError.message };
  if (!contracts || contracts.length === 0) return { unmarked: [] };

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Fetch all logs for this month
  const { data: logs, error: logsError } = await supabase
    .from('attendance_logs')
    .select('employeeId, date')
    .gte('date', startDate)
    .lte('date', endDate);

  if (logsError) return { error: logsError.message };

  // Create a fast lookup map of employeeId -> Set of date strings
  const logMap = new Map<string, Set<string>>();
  for (const log of logs ?? []) {
    if (!logMap.has(log.employeeId)) {
      logMap.set(log.employeeId, new Set<string>());
    }
    logMap.get(log.employeeId)!.add(log.date);
  }

  const result = [];

  for (const contract of contracts) {
    const profileId = contract.profileId;
    const joiningDate = contract.joiningDate;
    const profile = contract.profiles as any;
    const fullName = profile?.fullName || 'Unknown';
    const email = profile?.email || '';

    // If joiningDate is after this month, skip them entirely
    if (joiningDate && joiningDate > endDate) {
      continue;
    }

    const unmarkedDates = [];
    const empLogs = logMap.get(profileId) ?? new Set<string>();

    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, day);
      const isSunday = dateObj.getDay() === 0;

      if (isSunday) continue; // Sundays are holidays

      // Skip days before they joined
      if (joiningDate && dateStr < joiningDate) {
        continue;
      }

      if (!empLogs.has(dateStr)) {
        unmarkedDates.push(dateStr);
      }
    }

    if (unmarkedDates.length > 0) {
      result.push({
        employeeId: profileId,
        fullName,
        email,
        unmarkedDates,
      });
    }
  }

  return { unmarked: result };
}

/**
 * Auto-fills missing attendance logs for the given list of unmarked dates/employees.
 * Can fill as either 'PRESENT' or 'ABSENT'.
 */
export async function autoFillMissingAttendance(
  month: number,
  year: number,
  fillType: 'PRESENT' | 'ABSENT',
) {
  const { supabase, userId } = await requireAdmin();

  // Call checkUnmarkedAttendance to find exactly what is missing
  const { unmarked, error } = await checkUnmarkedAttendance(month, year);
  if (error) return { error };
  if (!unmarked || unmarked.length === 0) return { success: true, count: 0 };

  const settings = await getAttendanceSettings(`${year}-${String(month).padStart(2, '0')}-01`);
  const rows = [];

  for (const item of unmarked) {
    for (const date of item.unmarkedDates) {
      let clockIn: string | null = null;
      let clockOut: string | null = null;

      if (fillType === 'PRESENT') {
        clockIn = settings?.studioStartTime ? settings.studioStartTime.slice(0, 5) : '09:00';
        clockOut = '18:00';
      }

      rows.push({
        employeeId: item.employeeId,
        date,
        clockIn: clockIn ? `${clockIn}:00` : null,
        clockOut: clockOut ? `${clockOut}:00` : null,
        status: fillType,
        markedById: userId,
      });
    }
  }

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from('attendance_logs')
      .upsert(rows, { onConflict: 'employeeId,date' });

    if (upsertError) return { error: upsertError.message };
  }

  revalidatePath('/admin/attendance');
  revalidatePath('/admin/payroll');
  return { success: true, count: rows.length };
}

/**
 * Generate payroll drafts for all active employees for the given month/year.
 * Prevents duplicates. Reads attendance_logs + attendance_settings to compute the breakdown.
 */
export async function generatePayrollDraft(formData: PayrollGenerateData) {
  const { supabase } = await requireAdmin();

  const result = payrollGenerateSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { month, year } = result.data;

  // 0. Prevent future payroll generation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return {
      error: `You cannot generate payroll for a future month (${month}/${year}). Please wait until the month has started.`,
    };
  }

  // 1. Prevent duplicate payroll generation: check if any records exist for this month/year
  const { data: existingRecords, error: checkError } = await supabase
    .from('payroll_records')
    .select('id')
    .eq('month', month)
    .eq('year', year)
    .limit(1);

  if (checkError) {
    return { error: 'Failed to verify existing payroll records: ' + checkError.message };
  }

  if (existingRecords && existingRecords.length > 0) {
    return {
      error: `Payroll records already exist for ${MONTH_NAMES[month]} ${year}. You cannot generate duplicate payrolls. If you need to recreate them, please delete the existing records first.`,
    };
  }

  // Fetch all active employee contracts with compliance flags
  const { data: contracts, error: contractError } = await supabase
    .from('employee_contracts')
    .select('profileId, baseSalary, incentive, employmentType, pfEnrolled, pfContinued, ptExempt, tdsExempt, joiningDate')
    .eq('isActive', true);

  if (contractError) return { error: contractError.message };
  if (!contracts?.length) return { error: 'No active employees found' };

  // Fetch settings for paid leave quota and late penalty based on the month
  const queryDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const settings = await getAttendanceSettings(queryDate);
  const latePenaltyPerMinute = settings?.latePenaltyPerMinute ?? 0;
  const allowedPaidLeaves = settings?.allowedPaidLeavesPerMonth ?? 0;

  let created = 0;
  const errors: string[] = [];

  // Determine working days dynamically from the calendar month
  const calendarWorkingDays = new Date(year, month, 0).getDate();

  for (const contract of contracts) {
    const { profileId, baseSalary, incentive, employmentType, pfEnrolled, pfContinued, ptExempt, tdsExempt, joiningDate } = contract;

    // Build date range
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Skip employees who joined after this month
    if (joiningDate && joiningDate > endDate) {
      continue;
    }

    // Fetch attendance for this employee in the month
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('date, status, clockIn')
      .eq('employeeId', profileId)
      .gte('date', startDate)
      .lte('date', endDate);

    // Compute present days with paid leave quota rule
    const {
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      paidLeavesUsed,
      halfDays,
      onAidLeaveDays,
      deductionDays,
    } = computePresentDaysForMonth(month, year, logs ?? [], allowedPaidLeaves, joiningDate);

    // Estimate average late minutes (15 min if late)
    const avgLateMinutes = lateDays > 0 ? 15 : 0;

    const breakdown = calculatePayout({
      month,
      baseSalary: baseSalary ?? 0,
      workingDays: calendarWorkingDays,
      presentDays,
      lateDays,
      overtimeHours: 0,
      bonusAmount: 0,
      otherDeductions: 0,
      latePenaltyPerMinute,
      avgLateMinutes,

      absentDays,
      leaveDays,
      paidLeavesUsed,
      halfDays,
      onAidLeaveDays,
      deductionDays,
      incentiveAmount: incentive ?? 0,

      // Compliance Flags
      employmentType,
      pfEnrolled,
      pfContinued,
      ptExempt,
      tdsExempt,

      // Compliance Settings
      pfWageCeiling: settings?.pfWageCeiling,
      pfContributionPercent: settings?.pfContributionPercent,
      ptSlabs: settings?.ptSlabs,
      ptDeductionFrequency: settings?.ptDeductionFrequency,
      enablePF: settings?.enablePF,
      enablePT: settings?.enablePT,
      enableTDS: settings?.enableTDS,
    });

    const finalNetPayout = breakdown.netPayout;

    const { error: insertError } = await supabase
      .from('payroll_records')
      .insert({
        employeeId: profileId,
        month,
        year,
        workingDays: calendarWorkingDays,
        presentDays: breakdown.presentDays,
        lateDays: breakdown.lateDays,
        baseSalary: baseSalary ?? 0,
        basePay: breakdown.basePay,
        overtimeAmount: breakdown.overtimeAmount,
        bonusAmount: breakdown.bonusAmount,
        latePenalty: breakdown.latePenalty,
        unpaidLeaves: breakdown.unpaidLeaves,
        taxDeduction: breakdown.taxDeduction,
        otherDeductions: breakdown.otherDeductions,
        netPayout: Math.round(finalNetPayout * 100) / 100,
        incentive: breakdown.incentiveAmount, // Saves calculated incentive
        status: 'DRAFT',

        // Granular columns from migration v10
        absentDays: breakdown.absentDays,
        leaveDays: breakdown.leaveDays,
        paidLeavesUsed: breakdown.paidLeavesUsed,
        halfDays: breakdown.halfDays,
        onAidLeaveDays: breakdown.onAidLeaveDays,
        deductionDays: breakdown.deductionDays,
        perDaySalary: breakdown.perDaySalary,
        deductionsTotal: breakdown.deductionsTotal,
        incentiveHours: 0,
        overtimeHours: breakdown.overtimeHours,

        // Statutory Deductions
        grossEarnings: breakdown.grossEarnings,
        pfAmount: breakdown.pfAmount,
        ptAmount: breakdown.ptAmount,
        tdsAmount: breakdown.tdsAmount,
      });

    if (insertError) {
      errors.push(`${profileId}: ${insertError.message}`);
    } else {
      created++;
    }
  }

  if (errors.length > 0) {
    return { error: `Generated ${created} drafts with failures: ` + errors.join(', ') };
  }

  revalidatePath('/admin/payroll');
  return { success: true, created };
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERRIDE (adjust bonuses / deductions per employee)
// ─────────────────────────────────────────────────────────────────────────────

export async function updatePayrollOverride(
  recordId: string,
  data: PayrollOverrideData,
) {
  const { supabase } = await requireAdmin();

  const result = payrollOverrideSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  // Fetch full current record to re-compute calculations, including employee contract
  const { data: record } = await supabase
    .from('payroll_records')
    .select(`
      *,
      employee:employeeId(
        contract:employee_contracts(
          employmentType, pfEnrolled, pfContinued, ptExempt, tdsExempt
        )
      )
    `)
    .eq('id', recordId)
    .single();

  if (!record) return { error: 'Payroll record not found' };

  // Block modifications on approved/paid records
  if (record.status !== 'DRAFT') {
    return { error: 'Only DRAFT records can be modified' };
  }

  const { bonusAmount, taxDeduction, otherDeductions, incentive: incentiveAmount, overtimeHours, notes } = result.data;

  // Extract nested contract safely
  const contract = Array.isArray(record.employee?.contract)
    ? record.employee.contract[0]
    : record.employee?.contract;

  // Fetch settings for compliance calculations
  const queryDate = `${record.year}-${String(record.month).padStart(2, '0')}-01`;
  const settings = await getAttendanceSettings(queryDate);

  // Re-calculate using the payroll-engine
  const breakdown = calculatePayout({
    month: record.month,
    baseSalary: record.baseSalary ?? 0,
    workingDays: record.workingDays ?? 30,
    presentDays: record.presentDays ?? 30,
    lateDays: record.lateDays ?? 0,
    overtimeHours,
    bonusAmount,
    otherDeductions,
    latePenaltyPerMinute: 0, // Carry over existing computed late penalty
    avgLateMinutes: 0,

    absentDays: record.absentDays ?? 0,
    leaveDays: record.leaveDays ?? 0,
    paidLeavesUsed: record.paidLeavesUsed ?? 0,
    halfDays: record.halfDays ?? 0,
    onAidLeaveDays: record.onAidLeaveDays ?? 0,
    deductionDays: record.deductionDays ?? 0,
    incentiveAmount,
    
    // Pass explicitly requested tax deduction via override
    taxDeduction,

    // Compliance Flags
    employmentType: contract?.employmentType,
    pfEnrolled: contract?.pfEnrolled,
    pfContinued: contract?.pfContinued,
    ptExempt: contract?.ptExempt,
    tdsExempt: contract?.tdsExempt,

    // Compliance Settings
    pfWageCeiling: settings?.pfWageCeiling,
    pfContributionPercent: settings?.pfContributionPercent,
    ptSlabs: settings?.ptSlabs,
    ptDeductionFrequency: settings?.ptDeductionFrequency,
    enablePF: settings?.enablePF,
    enablePT: settings?.enablePT,
    enableTDS: settings?.enableTDS,
  });

  const finalLatePenalty = record.latePenalty ?? 0;
  const finalTaxDeduction = taxDeduction;

  const grossEarnings = breakdown.basePay + breakdown.overtimeAmount + breakdown.incentiveAmount + bonusAmount;
  const netPayout = Math.max(0, grossEarnings - finalLatePenalty - finalTaxDeduction - otherDeductions);

  const { error } = await supabase
    .from('payroll_records')
    .update({
      bonusAmount,
      taxDeduction: breakdown.taxDeduction,
      otherDeductions,
      incentiveHours: 0,
      overtimeHours,
      incentive: breakdown.incentiveAmount,
      overtimeAmount: breakdown.overtimeAmount,
      netPayout: Math.round(breakdown.netPayout * 100) / 100,
      notes: notes || null,
      
      // Statutory
      grossEarnings: breakdown.grossEarnings,
      pfAmount: breakdown.pfAmount,
      ptAmount: breakdown.ptAmount,
      tdsAmount: breakdown.tdsAmount,
    })
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  revalidatePath(`/admin/payroll/${record.year}-${String(record.month).padStart(2, '0')}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW: DRAFT → APPROVED → PAID
// ─────────────────────────────────────────────────────────────────────────────

export async function approvePayroll(recordId: string) {
  const { supabase, userId } = await requireAdmin();

  const { data: record } = await supabase
    .from('payroll_records')
    .select('status')
    .eq('id', recordId)
    .single();

  if (!record) return { error: 'Record not found' };
  if (record.status !== 'DRAFT') return { error: 'Only DRAFT records can be approved' };

  const { error } = await supabase
    .from('payroll_records')
    .update({ status: 'APPROVED', approvedBy: userId, approvedAt: new Date().toISOString() })
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function approveBatchPayroll(month: number, year: number) {
  const { supabase, userId } = await requireAdmin();

  const { error } = await supabase
    .from('payroll_records')
    .update({ status: 'APPROVED', approvedBy: userId, approvedAt: new Date().toISOString() })
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'DRAFT');

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function rejectBatchPayroll(month: number, year: number) {
  const { supabase } = await requireSuperAdmin();

  const { error } = await supabase
    .from('payroll_records')
    .update({ status: 'REJECTED' })
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'DRAFT');

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function rejectPayroll(recordId: string) {
  const { supabase } = await requireSuperAdmin();

  const { data: record } = await supabase
    .from('payroll_records')
    .select('status')
    .eq('id', recordId)
    .single();

  if (!record) return { error: 'Record not found' };
  if (record.status !== 'DRAFT') return { error: 'Only DRAFT records can be rejected' };

  const { error } = await supabase
    .from('payroll_records')
    .update({ status: 'REJECTED' })
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}


export async function markPayrollPaid(recordId: string, paymentRef?: string) {
  const { supabase } = await requireAdmin();

  const { data: record } = await supabase
    .from('payroll_records')
    .select('status')
    .eq('id', recordId)
    .single();

  if (!record) return { error: 'Record not found' };
  if (record.status !== 'APPROVED') return { error: 'Only APPROVED records can be marked PAID' };

  const { error } = await supabase
    .from('payroll_records')
    .update({
      status: 'PAID',
      paidAt: new Date().toISOString(),
      paymentRef: paymentRef || null,
    })
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function markBatchPaid(month: number, year: number) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('payroll_records')
    .update({ status: 'PAID', paidAt: new Date().toISOString() })
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'APPROVED');

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function deletePayrollRecord(recordId: string) {
  const { supabase } = await requireSuperAdmin();

  const { data: record } = await supabase
    .from('payroll_records')
    .select('status, month, year')
    .eq('id', recordId)
    .single();

  if (!record) return { error: 'Record not found' };
  if (record.status === 'PAID') {
    return { error: 'Paid payroll records cannot be deleted' };
  }

  const { error } = await supabase
    .from('payroll_records')
    .delete()
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  revalidatePath(`/admin/payroll/${record.year}-${String(record.month).padStart(2, '0')}`);
  return { success: true };
}

export async function deleteBatchPayroll(month: number, year: number) {
  const { supabase } = await requireSuperAdmin();

  const { error } = await supabase
    .from('payroll_records')
    .delete()
    .eq('month', month)
    .eq('year', year)
    .neq('status', 'PAID');

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  revalidatePath(`/admin/payroll/${year}-${String(month).padStart(2, '0')}`);
  return { success: true };
}
