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

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
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
        contract:employee_contracts(jobTitle, avatarUrl)
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
          jobTitle, employmentType, joiningDate, avatarUrl,
          bankAccountName, upiId
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

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(profile?.role ?? '');
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

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE DRAFT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate payroll drafts for all active employees for the given month/year.
 * Skips employees that already have a record for this period.
 * Reads attendance_logs + attendance_settings to compute the breakdown.
 */
export async function generatePayrollDraft(formData: PayrollGenerateData) {
  const { supabase } = await requireAdmin();

  const result = payrollGenerateSchema.safeParse(formData);
  if (!result.success) {
    return { error: 'Validation failed', details: result.error.flatten() };
  }

  const { month, year, workingDays } = result.data;

  // Build date range
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  // Fetch all active employee contracts
  const { data: contracts, error: contractError } = await supabase
    .from('employee_contracts')
    .select('profileId, baseSalary')
    .eq('isActive', true);

  if (contractError) return { error: contractError.message };
  if (!contracts?.length) return { error: 'No active employees found' };

  // Fetch settings for late penalty
  const settings = await getAttendanceSettings();
  const latePenaltyPerMinute = settings?.latePenaltyPerMinute ?? 0;

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const contract of contracts) {
    const { profileId, baseSalary } = contract;

    // Skip if record already exists
    const { data: existing } = await supabase
      .from('payroll_records')
      .select('id')
      .eq('employeeId', profileId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Fetch attendance for this employee in the month
    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('date, status, clockIn')
      .eq('employeeId', profileId)
      .gte('date', startDate)
      .lte('date', endDate);

    const { presentDays, lateDays } = computePresentDaysForMonth(month, year, logs ?? []);

    // Estimate average late minutes (15 min if late — can be refined with actual clock data)
    const avgLateMinutes = lateDays > 0 ? 15 : 0;

    const breakdown = calculatePayout({
      baseSalary: baseSalary ?? 0,
      workingDays,
      presentDays,
      lateDays,
      overtimeHours: 0,
      bonusAmount: 0,
      otherDeductions: 0,
      latePenaltyPerMinute,
      avgLateMinutes,
    });

    const { error: insertError } = await supabase
      .from('payroll_records')
      .insert({
        employeeId: profileId,
        month,
        year,
        workingDays,
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
        netPayout: breakdown.netPayout,
        status: 'DRAFT',
      });

    if (insertError) {
      errors.push(`${profileId}: ${insertError.message}`);
    } else {
      created++;
    }
  }

  revalidatePath('/admin/payroll');
  return { success: true, created, skipped, errors };
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

  // Fetch current record to re-compute netPayout
  const { data: record } = await supabase
    .from('payroll_records')
    .select('basePay, baseSalary, workingDays, presentDays, lateDays, latePenalty')
    .eq('id', recordId)
    .single();

  if (!record) return { error: 'Payroll record not found' };

  // Block modifications on approved/paid records
  const { data: statusRow } = await supabase
    .from('payroll_records')
    .select('status')
    .eq('id', recordId)
    .single();

  if (statusRow?.status !== 'DRAFT') {
    return { error: 'Only DRAFT records can be modified' };
  }

  const { overtimeAmount, bonusAmount, taxDeduction, otherDeductions, notes } = result.data;
  const grossEarnings = (record.basePay ?? 0) + overtimeAmount + bonusAmount;
  const netPayout = Math.max(
    0,
    grossEarnings - (record.latePenalty ?? 0) - taxDeduction - otherDeductions,
  );

  const { error } = await supabase
    .from('payroll_records')
    .update({
      overtimeAmount,
      bonusAmount,
      taxDeduction,
      otherDeductions,
      netPayout: Math.round(netPayout * 100) / 100,
      notes: notes || null,
    })
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
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
    .update({ status: 'APPROVED', approvedById: userId, approvedAt: new Date().toISOString() })
    .eq('id', recordId);

  if (error) return { error: error.message };

  revalidatePath('/admin/payroll');
  return { success: true };
}

export async function approveBatchPayroll(month: number, year: number) {
  const { supabase, userId } = await requireAdmin();

  const { error } = await supabase
    .from('payroll_records')
    .update({ status: 'APPROVED', approvedById: userId, approvedAt: new Date().toISOString() })
    .eq('month', month)
    .eq('year', year)
    .eq('status', 'DRAFT');

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
