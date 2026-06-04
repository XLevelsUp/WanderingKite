'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  unifiedOnboardingSchema,
  type UnifiedOnboardingFormData,
  BLOOD_GROUP_OPTIONS,
} from '@/lib/validations/hr';
import { createAndOnboardEmployee } from '@/actions/hr/employees';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  User,
  Contact,
  Shield,
  FileText,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
}

interface Manager {
  id: string;
  fullName: string | null;
}

interface UnifiedOnboardingFormProps {
  branches: Branch[];
  managers: Manager[];
  nextEmployeeNumber?: string;
}

const STEPS = [
  { id: 1, label: 'Account',        icon: User,     description: 'Name, email & password' },
  { id: 2, label: 'Personal',       icon: Contact,  description: 'DOB, phone & identity'  },
  { id: 3, label: 'System Access',  icon: Shield,   description: 'Role, branch & manager' },
  { id: 4, label: 'Contract',       icon: FileText,  description: 'Job title & salary'    },
  { id: 5, label: 'Bank & Payment', icon: CreditCard, description: 'Optional bank details' },
] as const;

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-150 disabled:opacity-40';

const selectClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all [&>option]:bg-[#1a1a24]';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
      {children}
      {required && <span className='text-red-400 ml-1'>*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className='mt-1 text-xs text-red-400'>{message}</p>;
}

export function UnifiedOnboardingForm({ branches, managers, nextEmployeeNumber }: UnifiedOnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<UnifiedOnboardingFormData>({
    resolver: zodResolver(unifiedOnboardingSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      dateOfBirth: '',
      phone: '',
      gender: undefined,
      bloodGroup: '',
      panNumber: '',
      role: 'EMPLOYEE',
      branchId: '',
      managerId: '',
      jobTitle: '',
      employmentType: 'FULL_TIME',
      baseSalary: 0,
      incentive: 0,
      joiningDate: new Date().toISOString().split('T')[0],
      bankAccountName: '',
      bankAccountNumber: '',
      bankIFSC: '',
      upiId: '',
      avatarUrl: '',
      notes: '',
      employeeNumber: '',
      department: '',
      pfEnrolled: false,
      pfContinued: false,
      ptExempt: false,
      tdsExempt: false,
      exemptionReason: '',
    },
  });

  const selectedRole = watch('role');

  // Fields validated per step before advancing
  const STEP_FIELDS: Record<number, (keyof UnifiedOnboardingFormData)[]> = {
    1: ['fullName', 'email', 'password'],
    2: ['dateOfBirth', 'phone', 'gender', 'bloodGroup', 'panNumber'],
    3: ['role'],
    4: ['jobTitle', 'employmentType', 'baseSalary', 'joiningDate', 'incentive'],
    5: [],
  };

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // ── KEY FIX: form has no onSubmit — only the final button fires handleSubmit
  // This prevents pressing Enter on any input field from submitting mid-flow.
  function handleFinalSubmit() {
    setSubmitError(null);
    handleSubmit((data) => {
      startTransition(async () => {
        const result = await createAndOnboardEmployee(data);
        if (result.error) {
          setSubmitError(result.error);
        } else {
          setSuccess(true);
          setTimeout(() => router.push('/admin/employees'), 2000);
        }
      });
    })();
  }

  // Block Enter from submitting mid-flow; advance step instead
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step < STEPS.length) nextStep();
    }
  }

  if (success) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-5'>
        <div className='w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center ring-1 ring-emerald-500/30'>
          <CheckCircle className='w-10 h-10 text-emerald-400' />
        </div>
        <div className='text-center'>
          <p className='text-xl font-bold text-foreground'>Employee onboarded!</p>
          <p className='text-sm text-foreground/50 mt-1'>
            Account created and HR contract activated. Redirecting…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      {/* ── Step Progress ─────────────────────────────────────────────────── */}
      <div className='relative mb-12'>
        {/* Connecting line */}
        <div className='absolute top-4 left-0 right-0 flex items-center px-4'>
          {STEPS.slice(0, -1).map((s) => (
            <div
              key={s.id}
              className={`flex-1 h-px transition-colors duration-300 ${
                step > s.id ? 'bg-emerald-500/40' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className='relative flex items-start justify-between'>
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isComplete = step > s.id;
            const isActive = step === s.id;
            return (
              <button
                key={s.id}
                type='button'
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex flex-col items-center gap-2 ${step > s.id ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 z-10 relative ${
                    isActive
                      ? 'bg-primary text-black ring-2 ring-primary/30 shadow-[0_0_16px_hsl(var(--primary)/0.4)]'
                      : isComplete
                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                        : 'bg-white/[0.05] text-foreground/30 ring-1 ring-white/10'
                  }`}
                >
                  {isComplete ? <CheckCircle className='w-4 h-4' /> : <Icon className='w-3.5 h-3.5' />}
                </div>
                <div className='text-center'>
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive ? 'text-foreground' : isComplete ? 'text-emerald-400/70' : 'text-foreground/30'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className='text-[10px] text-foreground/25 hidden sm:block'>{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form (no onSubmit — prevents Enter-key mid-flow submission) ──── */}
      <form onKeyDown={handleKeyDown}>

        {/* ── Step 1: Account ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>Step 1 of 5</p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Create Account</h3>
              <p className='text-sm text-foreground/50'>Set up the employee's login credentials.</p>
            </div>

            <div className='space-y-5'>
              <div>
                <FieldLabel required>Full Name</FieldLabel>
                <input {...register('fullName')} placeholder='e.g. Priya Sharma' autoComplete='off' className={inputClass} />
                <FieldError message={errors.fullName?.message} />
              </div>

              <div>
                <FieldLabel required>Work Email</FieldLabel>
                <input type='email' {...register('email')} placeholder='e.g. priya@wanderingkite.com' autoComplete='off' className={inputClass} />
                <FieldError message={errors.email?.message} />
              </div>

              <div>
                <FieldLabel required>Password</FieldLabel>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder='Minimum 6 characters'
                    autoComplete='new-password'
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60 transition-colors'
                  >
                    {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
                <p className='mt-1.5 text-xs text-foreground/35'>The employee can change this after first login.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Personal Details ──────────────────────────────────────── */}
        {step === 2 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>Step 2 of 5</p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Personal Details</h3>
              <p className='text-sm text-foreground/50'>Employee personal and identity information.</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div>
                <FieldLabel required>Date of Birth</FieldLabel>
                <input type='date' {...register('dateOfBirth')} className={inputClass} />
                <FieldError message={errors.dateOfBirth?.message} />
              </div>

              <div>
                <FieldLabel required>Gender</FieldLabel>
                <select {...register('gender')} className={selectClass}>
                  <option value=''>Select gender</option>
                  <option value='MALE'>Male</option>
                  <option value='FEMALE'>Female</option>
                  <option value='OTHER'>Other</option>
                  <option value='PREFER_NOT_TO_SAY'>Prefer not to say</option>
                </select>
                <FieldError message={errors.gender?.message} />
              </div>

              <div className='sm:col-span-2'>
                <FieldLabel required>Mobile Number</FieldLabel>
                <input
                  type='tel'
                  {...register('phone')}
                  placeholder='e.g. +91 98765 43210'
                  className={inputClass}
                />
                <FieldError message={errors.phone?.message} />
              </div>

              <div>
                <FieldLabel>Blood Group</FieldLabel>
                <select {...register('bloodGroup')} className={selectClass}>
                  <option value=''>Unknown / Not provided</option>
                  {BLOOD_GROUP_OPTIONS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                <FieldError message={errors.bloodGroup?.message} />
              </div>

              <div>
                <FieldLabel>PAN Number</FieldLabel>
                <input
                  {...register('panNumber')}
                  placeholder='e.g. ABCDE1234F'
                  className={`${inputClass} uppercase`}
                  maxLength={10}
                />
                <FieldError message={errors.panNumber?.message} />
                <p className='mt-1 text-xs text-foreground/30'>Required for salary TDS deductions.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: System Access ─────────────────────────────────────────── */}
        {step === 3 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>Step 3 of 5</p>
              <h3 className='text-xl font-bold text-foreground mb-1'>System Access</h3>
              <p className='text-sm text-foreground/50'>Set the employee's role and organisational placement.</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='sm:col-span-2'>
                <FieldLabel required>Role</FieldLabel>
                <select {...register('role')} className={selectClass}>
                  <option value='EMPLOYEE'>Employee (Staff)</option>
                  <option value='ADMIN'>Admin (Manager)</option>
                  <option value='SUPER_ADMIN'>Super Admin</option>
                </select>
                <FieldError message={errors.role?.message} />
                <p className='mt-1.5 text-xs text-foreground/35'>Determines what the employee can access.</p>
              </div>

              <div>
                <FieldLabel>Branch</FieldLabel>
                <select {...register('branchId')} className={selectClass}>
                  <option value=''>No Branch / HQ</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {selectedRole === 'EMPLOYEE' && (
                <div>
                  <FieldLabel>Manager</FieldLabel>
                  <select {...register('managerId')} className={selectClass}>
                    <option value=''>No Manager</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName || 'Unnamed Admin'}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 4: Contract ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>Step 4 of 5</p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Contract Details</h3>
              <p className='text-sm text-foreground/50'>Define the employment terms and compensation.</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='sm:col-span-2'>
                <FieldLabel required>Job Title</FieldLabel>
                <input {...register('jobTitle')} placeholder='e.g. Senior Photographer' className={inputClass} />
                <FieldError message={errors.jobTitle?.message} />
              </div>

              <div>
                <FieldLabel>Employee ID</FieldLabel>
                <input
                  {...register('employeeNumber')}
                  className={`${inputClass} cursor-not-allowed opacity-70`}
                  placeholder={nextEmployeeNumber || 'Auto-generated (e.g. WK-001)'}
                  readOnly
                  disabled
                />
              </div>

              <div>
                <FieldLabel>Department</FieldLabel>
                <input {...register('department')} className={inputClass} placeholder='e.g. Design' />
                <FieldError message={errors.department?.message} />
              </div>

              <div>
                <FieldLabel required>Employment Type</FieldLabel>
                <select {...register('employmentType')} className={selectClass}>
                  <option value='FULL_TIME'>Full-Time</option>
                  <option value='PART_TIME'>Part-Time</option>
                  <option value='CONTRACT'>Contract</option>
                  <option value='INTERN'>Intern</option>
                </select>
                <FieldError message={errors.employmentType?.message} />
              </div>

              <div>
                <FieldLabel required>Joining Date</FieldLabel>
                <input type='date' {...register('joiningDate')} className={inputClass} />
                <FieldError message={errors.joiningDate?.message} />
              </div>

              <div>
                <FieldLabel required>Base Salary (₹ / month)</FieldLabel>
                <input
                  type='number'
                  min={0}
                  step={100}
                  {...register('baseSalary', { valueAsNumber: true })}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      e.target.value = '0';
                      e.target.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  placeholder='e.g. 25000'
                  className={inputClass}
                />
                <FieldError message={errors.baseSalary?.message} />
              </div>

              <div>
                <FieldLabel>Monthly Incentive (₹ / month)</FieldLabel>
                <input
                  type='number'
                  min={0}
                  step={100}
                  {...register('incentive', { valueAsNumber: true })}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      e.target.value = '0';
                      e.target.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  placeholder='e.g. 2000'
                  className={inputClass}
                />
                <FieldError message={errors.incentive?.message} />
              </div>

              <div className='sm:col-span-2 pt-4 border-t border-primary/12'>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Statutory Compliance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="pfEnrolled" {...register('pfEnrolled')} className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" />
                    <label htmlFor="pfEnrolled" className="text-sm font-semibold text-foreground/80">Enrolled in PF</label>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="pfContinued" {...register('pfContinued')} className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" />
                    <label htmlFor="pfContinued" className="text-sm font-semibold text-foreground/80">PF Continued {'>'} 15k</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="ptExempt" {...register('ptExempt')} className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" />
                    <label htmlFor="ptExempt" className="text-sm font-semibold text-foreground/80">Exempt from PT</label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="tdsExempt" {...register('tdsExempt')} className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" />
                    <label htmlFor="tdsExempt" className="text-sm font-semibold text-foreground/80">Exempt from TDS</label>
                  </div>

                  <div className='sm:col-span-2'>
                    <FieldLabel>Exemption Reason</FieldLabel>
                    <input {...register('exemptionReason')} className={inputClass} placeholder='Required if exempt...' />
                  </div>
                </div>
              </div>

              <div className='sm:col-span-2'>
                <FieldLabel>Notes / Remarks</FieldLabel>
                <textarea {...register('notes')} rows={3} placeholder='Optional HR notes…' className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Bank & Payment ───────────────────────────────────────── */}
        {step === 5 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>Step 5 of 5</p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Bank & Payment Details</h3>
              <p className='text-sm text-foreground/50'>Optional — add bank details for salary disbursement.</p>
            </div>

            {/* Review summary card */}
            <div className='rounded-xl bg-white/[0.025] border border-white/8 p-4 space-y-1'>
              <p className='text-[10px] font-semibold uppercase tracking-wider text-primary/60 mb-2'>Review Summary</p>
              <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs'>
                <span className='text-foreground/40'>Name</span>
                <span className='text-foreground/80 font-medium'>{getValues('fullName')}</span>
                <span className='text-foreground/40'>Email</span>
                <span className='text-foreground/80 font-medium'>{getValues('email')}</span>
                <span className='text-foreground/40'>Phone</span>
                <span className='text-foreground/80 font-medium'>{getValues('phone')}</span>
                <span className='text-foreground/40'>DOB</span>
                <span className='text-foreground/80 font-medium'>
                  {getValues('dateOfBirth')
                    ? new Date(getValues('dateOfBirth')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
                <span className='text-foreground/40'>Role</span>
                <span className='text-foreground/80 font-medium'>{getValues('role').replace('_', ' ')}</span>
                <span className='text-foreground/40'>Job Title</span>
                <span className='text-foreground/80 font-medium'>{getValues('jobTitle')}</span>
                <span className='text-foreground/40'>Salary</span>
                <span className='text-foreground/80 font-medium font-mono'>
                  ₹{Number(getValues('baseSalary')).toLocaleString('en-IN')} / mo
                </span>
                {Number(getValues('incentive')) > 0 && (
                  <>
                    <span className='text-foreground/40'>Incentive</span>
                    <span className='text-foreground/80 font-medium font-mono'>
                      ₹{Number(getValues('incentive')).toLocaleString('en-IN')} / mo
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='sm:col-span-2'>
                <FieldLabel>Account Holder Name</FieldLabel>
                <input {...register('bankAccountName')} placeholder='Full name as per bank' className={inputClass} />
              </div>

              <div>
                <FieldLabel>Account Number</FieldLabel>
                <input {...register('bankAccountNumber')} placeholder='xxxxxxxxxxxxxxxxx' className={inputClass} />
              </div>

              <div>
                <FieldLabel>IFSC Code</FieldLabel>
                <input {...register('bankIFSC')} placeholder='e.g. SBIN0001234' className={`${inputClass} uppercase`} />
                <FieldError message={errors.bankIFSC?.message} />
              </div>

              <div className='sm:col-span-2'>
                <FieldLabel>UPI ID</FieldLabel>
                <input {...register('upiId')} placeholder='e.g. name@upi' className={inputClass} />
              </div>

              <div className='sm:col-span-2'>
                <FieldLabel>Avatar URL</FieldLabel>
                <input {...register('avatarUrl')} placeholder='https://…' className={inputClass} />
                <FieldError message={errors.avatarUrl?.message} />
              </div>
            </div>

            {submitError && (
              <div className='rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400'>
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <div className='flex items-center justify-between mt-10 pt-6 border-t border-primary/12'>
          {step > 1 ? (
            <button
              type='button'
              onClick={prevStep}
              className='flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/12 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
            >
              <ChevronLeft className='h-4 w-4' />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length ? (
            <button
              type='button'
              onClick={nextStep}
              className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary/12 border border-primary/35 text-sm font-semibold text-primary hover:bg-primary/20 hover:border-primary/60 transition-all'
            >
              Continue
              <ChevronRight className='h-4 w-4' />
            </button>
          ) : (
            <button
              type='button'
              onClick={handleFinalSubmit}
              disabled={isPending}
              className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
            >
              {isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Creating employee…
                </>
              ) : (
                <>
                  <CheckCircle className='h-4 w-4' />
                  Create & Onboard
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
