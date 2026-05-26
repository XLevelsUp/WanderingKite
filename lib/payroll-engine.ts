/**
 * lib/payroll-engine.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure, side-effect-free payroll calculation engine.
 * No database calls — takes raw numbers, returns a breakdown object.
 *
 * Formula:
 *   basePay      = (baseSalary / workingDays) × presentDays
 *   latePenalty  = lateDays × avgLateMinutes × latePenaltyPerMinute
 *   taxDeduction = floor(grossEarnings × TAX_RATE) if grossEarnings > TAX_SLAB
 *   netPayout    = basePay + overtime + bonus − latePenalty − unpaidLeaves
 *                  − taxDeduction − otherDeductions
 *
 * Half-Day counts as 0.5 presentDays.
 * All currency values are INR, rounded to 2 decimal places.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { PayrollInput, PayrollBreakdown } from './types/hr';

/** Basic TDS slab — simplified flat rate above ₹50,000/month gross */
const TAX_SLAB = 50_000;
const TAX_RATE = 0.10; // 10% TDS above slab

/** INR rate per overtime hour (default: 1.5× daily rate) */
const OVERTIME_MULTIPLIER = 1.5;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate payroll breakdown for a single employee-month.
 *
 * @param input  - See PayrollInput interface in lib/types/hr.ts
 * @returns      - PayrollBreakdown with all components rounded to 2dp
 */
export function calculatePayout(input: PayrollInput): PayrollBreakdown {
  const {
    baseSalary,
    workingDays,
    presentDays,
    lateDays,
    overtimeHours,
    bonusAmount,
    otherDeductions,
    latePenaltyPerMinute,
    avgLateMinutes,
  } = input;

  // Guard against division by zero
  const safeDays = workingDays > 0 ? workingDays : 1;

  // Daily rate
  const dailyRate = baseSalary / safeDays;

  // Base pay: proportional to days present (half-day = 0.5)
  const basePay = round2(dailyRate * presentDays);

  // Unpaid leave deduction: absent days beyond presentDays (already factored in basePay)
  // baseSalary - basePay = total unpaid portion; expose for transparency
  const unpaidLeaves = round2(Math.max(0, baseSalary - basePay));

  // Overtime: calculated at 1.5× hourly rate
  const hourlyRate = dailyRate / 8; // 8-hour workday
  const overtimeAmount = round2(overtimeHours * hourlyRate * OVERTIME_MULTIPLIER);

  // Late penalty: flat deduction per late-minute
  const latePenalty = round2(lateDays * avgLateMinutes * latePenaltyPerMinute);

  // Gross earnings (before tax, after late penalty)
  const grossEarnings = basePay + overtimeAmount + bonusAmount;

  // TDS: 10% on gross > ₹50,000/month
  const taxDeduction =
    grossEarnings > TAX_SLAB ? round2(grossEarnings * TAX_RATE) : 0;

  // Net payout
  const netPayout = round2(
    grossEarnings - latePenalty - taxDeduction - otherDeductions,
  );

  return {
    basePay,
    overtimeAmount,
    bonusAmount: round2(bonusAmount),
    latePenalty,
    unpaidLeaves,
    taxDeduction,
    otherDeductions: round2(otherDeductions),
    netPayout: Math.max(0, netPayout), // Never negative
    presentDays,
    lateDays,
    workingDays: safeDays,
  };
}

/**
 * Compute the number of "present day equivalents" from a list of attendance statuses.
 * PRESENT = 1.0, LATE = 1.0 (still full day), HALF_DAY = 0.5, ABSENT/ON_LEAVE = 0.0
 */
export function computePresentDays(
  statuses: string[],
): { presentDays: number; lateDays: number } {
  let presentDays = 0;
  let lateDays = 0;

  for (const s of statuses) {
    if (s === 'PRESENT') {
      presentDays += 1;
    } else if (s === 'LATE') {
      presentDays += 1;
      lateDays += 1;
    } else if (s === 'HALF_DAY') {
      presentDays += 0.5;
    }
    // ABSENT, ON_LEAVE → 0 contribution
  }

  return { presentDays, lateDays };
}

export interface AttendanceLogMin {
  date: string | Date;
  status: string;
}

/**
 * Compute present and late days normalized to a standard 30-day period.
 * Sundays are holidays and default marked as PRESENT (no unpaid leave contribution).
 * Working days (non-Sundays) without logs or marked ABSENT/ON_LEAVE contribute to unpaid leaves.
 */
export function computePresentDaysForMonth(
  month: number,
  year: number,
  logs: AttendanceLogMin[],
): { presentDays: number; lateDays: number } {
  // Get total days in month
  const totalDays = new Date(year, month, 0).getDate();
  
  let unpaidDays = 0;
  let lateDays = 0;

  // Create a map of date string (YYYY-MM-DD) to status
  const logMap = new Map<string, string>();
  for (const log of logs) {
    const dateStr = typeof log.date === 'string'
      ? log.date.split('T')[0]
      : log.date.toISOString().split('T')[0];
    logMap.set(dateStr, log.status);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month - 1, day);
    const isSunday = date.getDay() === 0;

    if (isSunday) {
      // Sundays are holidays: they are paid (present by default), so they never add to unpaid leaves.
      continue;
    }

    // Working day: check attendance log
    const status = logMap.get(dateStr);
    if (status) {
      if (status === 'ABSENT' || status === 'ON_LEAVE') {
        unpaidDays += 1.0;
      } else if (status === 'HALF_DAY') {
        unpaidDays += 0.5;
      } else if (status === 'LATE') {
        lateDays += 1;
      }
      // PRESENT -> 0 unpaid leaves
    } else {
      // Missing log on a working day defaults to ABSENT (1.0 unpaid leave day)
      unpaidDays += 1.0;
    }
  }

  // Base pay is calculated on a 30-day basis
  const presentDays = Math.max(0, 30 - unpaidDays);

  return { presentDays, lateDays };
}

/**
 * Parse a "HH:MM" or "HH:MM:SS" time string into minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

/**
 * Determine if an attendance entry is LATE given clock-in time and settings.
 * Returns 'LATE' if clockIn > studioStartTime + graceMinutes, else 'PRESENT'.
 */
export function deriveAttendanceStatus(
  clockIn: string,
  clockOut: string | null,
  studioStartTime: string,
  graceMinutes: number,
  halfDayThresholdHours: number,
): 'PRESENT' | 'LATE' | 'HALF_DAY' {
  const startMinutes = timeToMinutes(studioStartTime) + graceMinutes;
  const clockInMinutes = timeToMinutes(clockIn);

  const isLate = clockInMinutes > startMinutes;

  // Compute hours worked for half-day detection
  if (clockOut) {
    const workedMinutes = timeToMinutes(clockOut) - clockInMinutes;
    const workedHours = workedMinutes / 60;
    if (workedHours < halfDayThresholdHours) {
      return 'HALF_DAY';
    }
  }

  return isLate ? 'LATE' : 'PRESENT';
}
