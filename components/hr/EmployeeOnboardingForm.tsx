'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hrOnboardingSchema, type HROnboardingFormData } from '@/lib/validations/hr';
import { createHREmployee } from '@/actions/hr/employees';
import { CheckCircle, ChevronRight, ChevronLeft, Loader2, User, FileText, CreditCard } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

interface HROnboardingFormProps {
  availableProfiles: Profile[];
}

const STEPS = [
  { id: 1, label: 'Select Employee', icon: User },
  { id: 2, label: 'Contract Details', icon: FileText },
  { id: 3, label: 'Bank & Payment', icon: CreditCard },
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

export function HROnboardingForm({ availableProfiles }: HROnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<HROnboardingFormData>({
    resolver: zodResolver(hrOnboardingSchema),
    defaultValues: {
      profileId: '',
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
    },
  });

  const STEP_FIELDS: Record<number, (keyof HROnboardingFormData)[]> = {
    1: ['profileId'],
    2: ['jobTitle', 'employmentType', 'baseSalary', 'joiningDate', 'incentive'],
    3: [],
  };

  async function nextStep() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function onSubmit(data: HROnboardingFormData) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createHREmployee(data);
      if (result.error) {
        setSubmitError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/admin/employees'), 1500);
      }
    });
  }

  if (success) {
    return (
      <div className='flex flex-col items-center justify-center py-20 gap-4'>
        <div className='w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center'>
          <CheckCircle className='w-8 h-8 text-emerald-400' />
        </div>
        <p className='text-lg font-semibold text-foreground'>Employee onboarded!</p>
        <p className='text-sm text-foreground/50'>Redirecting to employee list…</p>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Step progress */}
      <div className='flex items-center gap-0 mb-10'>
        {STEPS.map((s, idx) => (
          <div key={s.id} className='flex items-center flex-1 last:flex-none'>
            <button
              type='button'
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex items-center gap-2 group ${step > s.id ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  step === s.id
                    ? 'bg-primary text-black ring-2 ring-primary/30'
                    : step > s.id
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'bg-white/[0.05] text-foreground/30 ring-1 ring-white/10'
                }`}
              >
                {step > s.id ? <CheckCircle className='w-4 h-4' /> : s.id}
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  step === s.id ? 'text-foreground' : 'text-foreground/40'
                }`}
              >
                {s.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-4 ${step > s.id ? 'bg-emerald-500/30' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Step 1: Select Profile ────────────────────────────────────── */}
        {step === 1 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>
                Step 1
              </p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Select Employee Profile</h3>
              <p className='text-sm text-foreground/50'>
                Choose an existing system profile to link an HR contract to.
              </p>
            </div>

            <div>
              <FieldLabel required>Employee</FieldLabel>
              <select {...register('profileId')} className={selectClass}>
                <option value=''>— Select a profile —</option>
                {availableProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName ? `${p.fullName} (${p.email})` : p.email} — {p.role}
                  </option>
                ))}
              </select>
              <FieldError message={errors.profileId?.message} />
              {availableProfiles.length === 0 && (
                <p className='mt-2 text-xs text-amber-400'>
                  All existing profiles already have HR contracts. Add a new user via the Employees section first.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Contract Details ──────────────────────────────────── */}
        {step === 2 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>
                Step 2
              </p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Contract Details</h3>
              <p className='text-sm text-foreground/50'>
                Define the employment terms and compensation.
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='sm:col-span-2'>
                <FieldLabel required>Job Title</FieldLabel>
                <input
                  {...register('jobTitle')}
                  placeholder='e.g. Senior Photographer'
                  className={inputClass}
                />
                <FieldError message={errors.jobTitle?.message} />
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
                <input
                  type='date'
                  {...register('joiningDate')}
                  className={inputClass}
                />
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

              <div className='sm:col-span-2'>
                <FieldLabel>Notes / Remarks</FieldLabel>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder='Optional HR notes…'
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Bank Details ──────────────────────────────────────── */}
        {step === 3 && (
          <div className='space-y-6'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>
                Step 3
              </p>
              <h3 className='text-xl font-bold text-foreground mb-1'>Bank & Payment Details</h3>
              <p className='text-sm text-foreground/50'>
                Optional — add bank details for salary disbursement.
              </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <div className='sm:col-span-2'>
                <FieldLabel>Account Holder Name</FieldLabel>
                <input
                  {...register('bankAccountName')}
                  placeholder='Full name as per bank'
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>Account Number</FieldLabel>
                <input
                  {...register('bankAccountNumber')}
                  placeholder='xxxxxxxxxxxxxxxxx'
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>IFSC Code</FieldLabel>
                <input
                  {...register('bankIFSC')}
                  placeholder='e.g. SBIN0001234'
                  className={`${inputClass} uppercase`}
                />
                <FieldError message={errors.bankIFSC?.message} />
              </div>

              <div className='sm:col-span-2'>
                <FieldLabel>UPI ID</FieldLabel>
                <input
                  {...register('upiId')}
                  placeholder='e.g. name@upi'
                  className={inputClass}
                />
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className='rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400'>
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────────────────── */}
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

          {step < 3 ? (
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
              type='submit'
              disabled={isPending}
              className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all'
            >
              {isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle className='h-4 w-4' />
                  Create Contract
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
