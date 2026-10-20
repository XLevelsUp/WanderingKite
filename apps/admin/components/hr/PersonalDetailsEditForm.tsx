'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  personalDetailsSchema,
  type PersonalDetailsFormData,
  BLOOD_GROUP_OPTIONS,
} from '@/lib/validations/hr';
import { updateProfileDetails } from '@/actions/hr/employees';
import { CheckCircle, Loader2, Pencil } from 'lucide-react';
import type { HREmployee } from '@/lib/types/hr';

interface PersonalDetailsEditFormProps {
  employee: HREmployee;
  readOnly?: boolean;
}

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-150 disabled:opacity-40';

const selectClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all [&>option]:bg-[#1a1a24] disabled:opacity-40';

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

export function PersonalDetailsEditForm({ employee, readOnly = false }: PersonalDetailsEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      dateOfBirth: employee.dateOfBirth ?? '',
      phone: employee.phone ?? '',
      gender: employee.gender ?? undefined,
      bloodGroup: employee.bloodGroup ?? '',
      panNumber: employee.panNumber ?? '',
    },
  });

  function onSubmit(data: PersonalDetailsFormData) {
    setSubmitError(null);
    startTransition(async () => {
      const res = await updateProfileDetails(employee.id, data);
      if (res.error) {
        setSubmitError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <div>
          <FieldLabel required>Date of Birth</FieldLabel>
          <input type='date' {...register('dateOfBirth')} className={inputClass} disabled={readOnly} />
          <FieldError message={errors.dateOfBirth?.message} />
        </div>

        <div>
          <FieldLabel required>Gender</FieldLabel>
          <select {...register('gender')} className={selectClass} disabled={readOnly}>
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
            disabled={readOnly}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <FieldLabel>Blood Group</FieldLabel>
          <select {...register('bloodGroup')} className={selectClass} disabled={readOnly}>
            <option value=''>Unknown</option>
            {BLOOD_GROUP_OPTIONS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>PAN Number</FieldLabel>
          <input
            {...register('panNumber')}
            placeholder='e.g. ABCDE1234F'
            className={`${inputClass} uppercase`}
            maxLength={10}
            disabled={readOnly}
          />
          <FieldError message={errors.panNumber?.message} />
        </div>
      </div>

      {submitError && (
        <div className='rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-400'>
          {submitError}
        </div>
      )}

      {!readOnly && (
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
      )}
    </form>
  );
}
