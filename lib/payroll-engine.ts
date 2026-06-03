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
    month,
    workingDays,
    presentDays,
    lateDays,
    overtimeHours,
    bonusAmount,
    otherDeductions,
    latePenaltyPerMinute,
    avgLateMinutes,

    absentDays = 0,
    leaveDays = 0,
    paidLeavesUsed = 0,
    halfDays = 0,
    onAidLeaveDays = 0,
    deductionDays = 0,
    incentiveAmount = 0,

    // Compliance Flags
    employmentType = 'FULL_TIME',
    pfEnrolled = false,
    pfContinued = false,
    ptExempt = false,
    tdsExempt = false,

    // Compliance Settings
    pfWageCeiling = 15000,
    pfContributionPercent = 12,
    ptSlabs = [
      { min: 0, max: 3500, amount: 0 },
      { min: 3501, max: 5000, amount: 22.50 },
      { min: 5001, max: 7500, amount: 52.50 },
      { min: 7501, max: 10000, amount: 115.00 },
      { min: 10001, max: 12500, amount: 171.00 },
      { min: 12501, max: 999999999, amount: 208.33 }
    ],
    ptDeductionFrequency = 'MONTHLY',
    enablePF = true,
    enablePT = true,
    enableTDS = true,
  } = input;

  // Guard against division by zero
  const safeDays = workingDays > 0 ? workingDays : 1;

  // Per-day salary and deductions total
  const perDaySalary = round2(baseSalary / safeDays);
  const deductionsTotal = round2(deductionDays * perDaySalary);

  // Base Pay = Base Salary - Deductions Total
  const basePay = round2(baseSalary - deductionsTotal);

  // Total working hours based on calendar days in month (8 hours per day)
  const totalWorkingHours = safeDays * 8;
  const hourlyRate = baseSalary / totalWorkingHours;

  // Incentive and Overtime amounts
  const finalIncentiveAmount = round2(incentiveAmount);
  const overtimeAmount = round2(overtimeHours * hourlyRate);

  // Late penalty: flat deduction per late-minute
  const latePenalty = round2(lateDays * avgLateMinutes * latePenaltyPerMinute);

  // Gross earnings (before tax, after late penalty and adjustments)
  const grossEarnings = round2(basePay + overtimeAmount + finalIncentiveAmount + bonusAmount - latePenalty);

  // --- STATUTORY COMPLIANCE (PF, PT, TDS) ---
  let pfAmount = 0;
  let ptAmount = 0;
  let tdsAmount = 0;

  const isExemptType = employmentType === 'INTERN';

  // 1. Provident Fund (PF)
  if (enablePF && !isExemptType) {
    // Apply PF if enrolled, continued, or base salary is below or equal to ceiling
    if (pfEnrolled || pfContinued || baseSalary <= pfWageCeiling) {
      // PF is calculated on earned basePay, capped at the wage ceiling
      const pfBasis = Math.min(basePay, pfWageCeiling);
      pfAmount = round2(pfBasis * (pfContributionPercent / 100));
    }
  }

  // 2. Professional Tax (PT)
  if (enablePT && !isExemptType && !ptExempt) {
    let monthlySlabAmount = 0;
    // Find the matching slab for the gross earnings
    for (const slab of ptSlabs) {
      const min = slab.min || 0;
      const max = slab.max || Infinity;
      if (grossEarnings >= min && grossEarnings <= max) {
        monthlySlabAmount = slab.amount;
        break;
      }
    }

    if (ptDeductionFrequency === 'HALF_YEARLY') {
      if (month === 2 || month === 8) {
        ptAmount = monthlySlabAmount * 6;
      }
    } else if (ptDeductionFrequency === 'YEARLY') {
      if (month === 3) {
        ptAmount = monthlySlabAmount * 12;
      }
    } else {
      ptAmount = monthlySlabAmount;
    }
  }

  // 3. Tax Deducted at Source (TDS) - New Regime FY 2025-26
  if (enableTDS && !isExemptType && !tdsExempt) {
    const projectedAnnual = grossEarnings * 12;

    // Apply Section 87A rebate (Nil tax if <= 12,00,000)
    if (projectedAnnual > 1200000) {
      let annualTax = 0;
      let remaining = projectedAnnual;

      // Slab calculations
      if (remaining > 2400000) {
        annualTax += (remaining - 2400000) * 0.30;
        remaining = 2400000;
      }
      if (remaining > 2000000) {
        annualTax += (remaining - 2000000) * 0.25;
        remaining = 2000000;
      }
      if (remaining > 1600000) {
        annualTax += (remaining - 1600000) * 0.20;
        remaining = 1600000;
      }
      if (remaining > 1200000) {
        annualTax += (remaining - 1200000) * 0.15;
        remaining = 1200000;
      }
      if (remaining > 800000) {
        annualTax += (remaining - 800000) * 0.10;
        remaining = 800000;
      }
      if (remaining > 400000) {
        annualTax += (remaining - 400000) * 0.05;
        remaining = 400000;
      }

      tdsAmount = round2(annualTax / 12);
    }
  }

  // Backwards compatibility for arbitrary taxDeduction passed in via override
  const finalTaxDeduction = input.taxDeduction !== undefined ? input.taxDeduction : tdsAmount;

  // Net payout
  const netPayout = round2(
    grossEarnings - pfAmount - ptAmount - finalTaxDeduction - otherDeductions,
  );

  return {
    basePay,
    overtimeAmount,
    incentiveAmount: finalIncentiveAmount,
    bonusAmount: round2(bonusAmount),
    latePenalty,
    unpaidLeaves: deductionsTotal, // unpaid leaves exposed as deductionsTotal
    taxDeduction: finalTaxDeduction,
    otherDeductions: round2(otherDeductions),
    netPayout: Math.max(0, netPayout), // Never negative
    presentDays,
    lateDays,
    workingDays: safeDays,

    // New breakdown fields
    absentDays,
    leaveDays,
    paidLeavesUsed,
    halfDays,
    onAidLeaveDays,
    deductionDays,
    perDaySalary,
    deductionsTotal,
    overtimeHours,

    // Statutory Breakdown
    grossEarnings,
    pfAmount,
    ptAmount,
    tdsAmount: finalTaxDeduction,
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
 * Compute present and late days normalized to the calendar month days.
 * Sundays are holidays and default marked as PRESENT (no unpaid leave contribution).
 * Working days (non-Sundays) without logs or marked ABSENT/LEAVE/ON_LEAVE contribute to unpaid leaves.
 */
export function computePresentDaysForMonth(
  month: number,
  year: number,
  logs: AttendanceLogMin[],
  allowedPaidLeaves: number = 0,
): {
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  paidLeavesUsed: number;
  halfDays: number;
  onAidLeaveDays: number;
  deductionDays: number;
} {
  // Get total days in month
  const totalDays = new Date(year, month, 0).getDate();
  
  let absentDays = 0;
  let leaveDays = 0;
  let halfDays = 0;
  let onAidLeaveDays = 0;
  let lateDays = 0;
  let presentDaysCount = 0;

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
      // Sundays are holidays: paid by default (so they never add to unpaid leaves).
      continue;
    }

    // Working day: check attendance log
    const status = logMap.get(dateStr);
    if (status) {
      if (status === 'ABSENT') {
        absentDays += 1.0;
      } else if (status === 'LEAVE' || status === 'ON_LEAVE') {
        leaveDays += 1.0;
      } else if (status === 'HALF_DAY') {
        halfDays += 1.0;
      } else if (status === 'ON_AID_LEAVE') {
        onAidLeaveDays += 1.0;
      } else if (status === 'LATE') {
        lateDays += 1;
      } else if (status === 'PRESENT') {
        presentDaysCount += 1.0;
      }
    } else {
      // Missing log on a working day defaults to ABSENT
      absentDays += 1.0;
    }
  }

  // Quota paid leaves logic applies to both absent days and leave days
  const totalAbsences = leaveDays + absentDays;
  const paidLeavesUsed = Math.min(totalAbsences, allowedPaidLeaves);
  const unpaidLeaveDays = Math.max(0, totalAbsences - paidLeavesUsed);

  // Deduction days (half days, and whatever unpaid absences are left)
  const deductionDays = (halfDays * 0.5) + unpaidLeaveDays;

  // Net present days
  const presentDays = Math.max(0, totalDays - deductionDays);

  return {
    presentDays,
    lateDays,
    absentDays,
    leaveDays,
    paidLeavesUsed,
    halfDays,
    onAidLeaveDays,
    deductionDays,
  };
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
