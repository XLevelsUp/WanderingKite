import { z } from 'zod';

// ── Employee Contract ──────────────────────────────────────────────────────

export const contractSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  baseSalary: z
    .number()
    .min(0, 'Salary must be non-negative'),
  incentive: z
    .number()
    .min(0, 'Incentive must be non-negative'),
  joiningDate: z.string().min(1, 'Joining date is required'), // ISO date
  bankAccountName: z.string().min(1, 'Account holder name is required').max(200),
  bankAccountNumber: z.string().min(1, 'Account number is required').max(50),
  bankIFSC: z
    .string()
    .regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/i, 'Invalid IFSC code'),
  upiId: z.string().max(100).optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  employeeNumber: z.string().max(50).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  pfEnrolled: z.boolean().optional(),
  pfContinued: z.boolean().optional(),
  ptExempt: z.boolean().optional(),
  tdsExempt: z.boolean().optional(),
  exemptionReason: z.string().max(1000).optional().or(z.literal('')),
});

export type ContractFormData = z.infer<typeof contractSchema>;

// ── HR Employee Onboarding (links profile + contract) ──────────────────────

export const hrOnboardingSchema = z.object({
  // Step 1 — Select existing profile
  profileId: z.string().uuid('Select a valid employee profile'),
  // Step 2 — Contract
  ...contractSchema.shape,
});

export type HROnboardingFormData = z.infer<typeof hrOnboardingSchema>;

// ── Unified Create + Onboard (single form: new profile + contract) ──────────

export const unifiedOnboardingSchema = z.object({
  // Step 1 — Personal info (account creation)
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Step 2 — Personal details (required: DOB, phone, gender; optional: blood group, PAN)
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine((val) => {
    const dob = new Date(val);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return dob <= eighteenYearsAgo;
  }, 'Employee must be at least 18 years old (Indian Labour Law)'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\).]{7,15}$/, 'Invalid phone number format'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    message: 'Gender is required',
  }),
  bloodGroup: z.string().optional().or(z.literal('')),
  panNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v),
      'Invalid PAN format (e.g. ABCDE1234F)',
    ),
  // Step 3 — System access
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE']),
  branchId: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  // Step 4 — Contract (reuse contractSchema fields)
  ...contractSchema.shape,
});

export type UnifiedOnboardingFormData = z.infer<typeof unifiedOnboardingSchema>;

// ── Personal Details (profile fields, editable separately) ─────────────────

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

export const BLOOD_GROUP_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-',
] as const;

export const personalDetailsSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine((val) => {
    const dob = new Date(val);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return dob <= eighteenYearsAgo;
  }, 'Employee must be at least 18 years old'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-\(\).]{7,15}$/, 'Invalid phone number format'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    message: 'Gender is required',
  }),
  bloodGroup: z.string().optional().or(z.literal('')),
  panNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v),
      'Invalid PAN format (e.g. ABCDE1234F)',
    ),
});

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;

// For the edit form on the employee detail page
export const updateProfileDetailsSchema = personalDetailsSchema;

// ── Attendance Log ─────────────────────────────────────────────────────────

export const attendanceLogSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  date: z.string().min(1, 'Date is required'), // YYYY-MM-DD
  clockIn: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM')
    .optional()
    .or(z.literal('')),
  clockOut: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM')
    .optional()
    .or(z.literal('')),
  status: z.enum(['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE', 'ON_AID_LEAVE', 'LEAVE']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type AttendanceLogFormData = z.infer<typeof attendanceLogSchema>;

// ── Bulk Attendance (one date, multiple employees) ─────────────────────────

export const bulkAttendanceEntrySchema = z.object({
  employeeId: z.string().uuid(),
  status: z.enum(['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE', 'ON_AID_LEAVE', 'LEAVE']),
  clockIn: z.string().optional().or(z.literal('')),
  clockOut: z.string().optional().or(z.literal('')),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  entries: z.array(bulkAttendanceEntrySchema).min(1, 'At least one entry required'),
});

export type BulkAttendanceFormData = z.infer<typeof bulkAttendanceSchema>;

// ── Payroll Generation ─────────────────────────────────────────────────────

export const payrollGenerateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  workingDays: z.number().int().min(1).max(31, 'Working days cannot exceed 31'),
});

export type PayrollGenerateData = z.infer<typeof payrollGenerateSchema>;

// ── Payroll Override (manual adjustments per employee) ─────────────────────

export const payrollOverrideSchema = z.object({
  bonusAmount: z.number().min(0).default(0),
  taxDeduction: z.number().min(0).default(0),
  otherDeductions: z.number().min(0).default(0),
  incentive: z.number().min(0).default(0),
  overtimeHours: z.number().min(0).default(0),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type PayrollOverrideData = z.infer<typeof payrollOverrideSchema>;

// ── Payroll Approval ───────────────────────────────────────────────────────

export const payrollApproveSchema = z.object({
  recordId: z.string().uuid('Invalid payroll record ID'),
});

export const payrollPaidSchema = z.object({
  recordId: z.string().uuid('Invalid payroll record ID'),
  paymentRef: z.string().max(200).optional().or(z.literal('')),
});

// ── Attendance Settings ────────────────────────────────────────────────────

export const attendanceSettingsSchema = z.object({
  studioStartTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format: HH:MM'),
  graceMinutes: z.number().int().min(0).max(60),
  halfDayThresholdHours: z.number().min(1).max(12),
  latePenaltyPerMinute: z.number().min(0),
  allowedPaidLeavesPerMonth: z.number().int().min(0).max(31).default(0),
  
  pfWageCeiling: z.number().min(0).default(15000),
  pfContributionPercent: z.number().min(0).max(100).default(12),
  pfAutoEnrollAboveCeiling: z.boolean().default(false),
  ptState: z.string().default('Tamil Nadu'),
  ptDeductionFrequency: z.enum(['MONTHLY', 'HALF_YEARLY', 'YEARLY']).default('MONTHLY'),
  tdsRegime: z.string().default('New Regime FY 2025-26'),
  enablePF: z.boolean().default(true),
  enablePT: z.boolean().default(true),
  enableTDS: z.boolean().default(true),
});

export type AttendanceSettingsData = z.infer<typeof attendanceSettingsSchema>;
