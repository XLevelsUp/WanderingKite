'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contractSchema, type ContractFormData } from '@/lib/validations/hr';
import { updateContract } from '@/actions/hr/employees';
import { CheckCircle, Loader2, Pencil } from 'lucide-react';
import type { EmployeeContractRow } from '@/lib/types/hr';

interface ContractEditFormProps {
  contract: EmployeeContractRow;
}

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

export function ContractEditForm({ contract }: ContractEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      jobTitle: contract.jobTitle,
      employmentType: contract.employmentType,
      baseSalary: contract.baseSalary,
      incentive: contract.incentive ?? 0,
      joiningDate: contract.joiningDate,
      bankAccountName: contract.bankAccountName ?? '',
      bankAccountNumber: contract.bankAccountNumber ?? '',
      bankIFSC: contract.bankIFSC ?? '',
      upiId: contract.upiId ?? '',
      avatarUrl: contract.avatarUrl ?? '',
      notes: contract.notes ?? '',
      employeeNumber: contract.employeeNumber ?? '',
      department: contract.department ?? '',
      pfEnrolled: contract.pfEnrolled ?? false,
      pfContinued: contract.pfContinued ?? false,
      ptExempt: contract.ptExempt ?? false,
      tdsExempt: contract.tdsExempt ?? false,
      exemptionReason: contract.exemptionReason ?? '',
    },
  });

  function onSubmit(data: ContractFormData) {
    setSubmitError(null);
    startTransition(async () => {
      const res = await updateContract(contract.id, data);
      if (res.error) {
        setSubmitError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <div className='sm:col-span-2'>
          <FieldLabel required>Job Title</FieldLabel>
          <input {...register('jobTitle')} className={inputClass} placeholder='e.g. Senior Photographer' />
          <FieldError message={errors.jobTitle?.message} />
        </div>

        <div>
          <FieldLabel>Employee Number</FieldLabel>
          <input {...register('employeeNumber')} className={inputClass} placeholder='e.g. EMP-001' />
          <FieldError message={errors.employeeNumber?.message} />
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
          <FieldLabel>Avatar URL</FieldLabel>
          <input {...register('avatarUrl')} className={inputClass} placeholder='https://…' />
          <FieldError message={errors.avatarUrl?.message} />
        </div>

        <div>
          <FieldLabel>Account Holder Name</FieldLabel>
          <input {...register('bankAccountName')} className={inputClass} />
        </div>
        <div>
          <FieldLabel>Account Number</FieldLabel>
          <input {...register('bankAccountNumber')} className={inputClass} />
        </div>
        <div>
          <FieldLabel>IFSC Code</FieldLabel>
          <input {...register('bankIFSC')} className={`${inputClass} uppercase`} />
          <FieldError message={errors.bankIFSC?.message} />
        </div>
        <div>
          <FieldLabel>UPI ID</FieldLabel>
          <input {...register('upiId')} className={inputClass} />
        </div>

        <div className='sm:col-span-2'>
          <FieldLabel>Notes</FieldLabel>
          <textarea {...register('notes')} rows={3} className={`${inputClass} resize-none`} />
        </div>
      </div>

      {submitError && (
        <div className='rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400'>
          {submitError}
        </div>
      )}

      <div className='flex items-center justify-end gap-3 pt-2 border-t border-primary/12'>
        {saved && (
          <span className='flex items-center gap-1.5 text-xs text-emerald-400'>
            <CheckCircle className='w-3.5 h-3.5' />
            Saved
          </span>
        )}
        <button
          type='submit'
          disabled={isPending || !isDirty}
          className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all'
        >
          {isPending ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Saving…
            </>
          ) : (
            <>
              <Pencil className='h-4 w-4' />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
