/**
 * HR & Payroll TypeScript types
 * Mirrors the Supabase DB schema (camelCase column convention from migration 00009).
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'ON_AID_LEAVE' | 'LEAVE';

export type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'REJECTED';

// ── Raw DB Rows ────────────────────────────────────────────────────────────

export interface EmployeeContractRow {
  id: string;
  profileId: string;
  jobTitle: string;
  employmentType: EmploymentType;
  baseSalary: number;
  incentive: number;
  joiningDate: string; // ISO date string
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankIFSC: string | null;
  upiId: string | null;
  avatarUrl: string | null;
  notes: string | null;
  isActive: boolean;
  deactivatedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Statutory Compliance & Config
  employeeNumber: string | null;
  department: string | null;
  pfEnrolled: boolean;
  pfContinued: boolean;
  ptExempt: boolean;
  tdsExempt: boolean;
  exemptionReason: string | null;
}

export interface AttendanceLogRow {
  id: string;
  employeeId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  clockIn: string | null; // HH:MM:SS
  clockOut: string | null; // HH:MM:SS
  status: AttendanceStatus;
  totalHours: number | null; // DB-computed
  markedById: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecordRow {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  lateDays: number;
  baseSalary: number;
  basePay: number;
  overtimeAmount: number;
  bonusAmount: number;
  latePenalty: number;
  unpaidLeaves: number;
  taxDeduction: number;
  otherDeductions: number;
  netPayout: number;
  incentive: number;
  status: PayrollStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  paymentRef: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // New columns from migration v10
  absentDays: number;
  leaveDays: number;
  paidLeavesUsed: number;
  halfDays: number;
  onAidLeaveDays: number;
  deductionDays: number;
  perDaySalary: number;
  deductionsTotal: number;
  incentiveHours: number;
  overtimeHours: number;

  // Statutory Deductions
  pfAmount: number;
  ptAmount: number;
  tdsAmount: number;
  grossEarnings: number;
}

export interface AttendanceSettingRow {
  id: string;
  studioStartTime: string; // HH:MM:SS
  graceMinutes: number;
  halfDayThresholdHours: number;
  latePenaltyPerMinute: number;
  allowedPaidLeavesPerMonth: number; // New field from migration v10
  updatedAt: string;

  // Statutory Settings
  pfWageCeiling: number;
  pfContributionPercent: number;
  pfAutoEnrollAboveCeiling: boolean;
  ptState: string;
  ptDeductionFrequency: 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY';
  tdsRegime: string;
  enablePF: boolean;
  enablePT: boolean;
  enableTDS: boolean;
  ptSlabs: any;
}

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

// ── Joined / Enriched Shapes ───────────────────────────────────────────────

/** Employee profile joined with contract — used in the HR employee list */
export interface HREmployee {
  id: string; // profiles.id
  email: string;
  fullName: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
  branch: { id: string; name: string } | null;
  contract: EmployeeContractRow | null;
  // Personal details (new in migration 00010)
  dateOfBirth: string | null;   // ISO date string YYYY-MM-DD
  phone: string | null;
  gender: GenderType | null;
  bloodGroup: string | null;
  panNumber: string | null;
}

/** Attendance log row joined with the employee's name */
export interface AttendanceLogWithEmployee extends AttendanceLogRow {
  employee: {
    id: string;
    fullName: string | null;
    email: string;
    contract: { jobTitle: string; avatarUrl: string | null } | null;
  };
}

/** Full payroll record joined with employee info */
export interface PayrollRecordWithEmployee extends PayrollRecordRow {
  employee: {
    id: string;
    fullName: string | null;
    email: string;
    contract: {
      jobTitle: string;
      employmentType?: EmploymentType;
      department?: string | null;
      employeeNumber?: string | null;
      joiningDate?: string;
      avatarUrl: string | null;
      bankAccountName?: string | null;
      bankAccountNumber?: string | null;
      bankIFSC?: string | null;
      upiId?: string | null;
    } | null;
  };
}

// ── Payroll Engine Input/Output ────────────────────────────────────────────

export interface PayrollInput {
  baseSalary: number;
  month: number;
  workingDays: number;
  presentDays: number;    // Half-Day = 0.5
  lateDays: number;
  overtimeHours: number;
  bonusAmount: number;
  otherDeductions: number;
  latePenaltyPerMinute: number;
  avgLateMinutes: number; // Average late minutes for those days

  // New inputs from migration v10
  absentDays?: number;
  leaveDays?: number;
  paidLeavesUsed?: number;
  halfDays?: number;
  onAidLeaveDays?: number;
  deductionDays?: number;
  incentiveAmount?: number;

  // Compliance Flags
  employmentType?: EmploymentType;
  pfEnrolled?: boolean;
  pfContinued?: boolean;
  ptExempt?: boolean;
  tdsExempt?: boolean;
  
  // Tax override
  taxDeduction?: number;
  
  // Compliance Settings
  pfWageCeiling?: number;
  pfContributionPercent?: number;
  ptSlabs?: any[];
  ptDeductionFrequency?: 'MONTHLY' | 'HALF_YEARLY' | 'YEARLY';
  enablePF?: boolean;
  enablePT?: boolean;
  enableTDS?: boolean;
}

export interface PayrollBreakdown {
  basePay: number;
  overtimeAmount: number;
  incentiveAmount: number;
  bonusAmount: number;
  latePenalty: number;
  unpaidLeaves: number;
  taxDeduction: number;
  otherDeductions: number;
  netPayout: number;
  presentDays: number;
  lateDays: number;
  workingDays: number;

  // New breakdown fields
  absentDays: number;
  leaveDays: number;
  paidLeavesUsed: number;
  halfDays: number;
  onAidLeaveDays: number;
  deductionDays: number;
  perDaySalary: number;
  deductionsTotal: number;
  overtimeHours: number;

  // Compliance Breakdown
  grossEarnings: number;
  pfAmount: number;
  ptAmount: number;
  tdsAmount: number;
}
