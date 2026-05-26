'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { generatePayrollDraft } from '@/actions/hr/payroll';
import { Loader2, Plus, CheckCircle } from 'lucide-react';

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

export function GeneratePayrollForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [workingDays, setWorkingDays] = useState(30);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await generatePayrollDraft({ month, year, workingDays });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Payroll generated for ${MONTH_NAMES[month]} ${year}`);
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='rounded-2xl border border-primary/12 bg-[rgba(17,17,22,0.85)] backdrop-blur-md p-6'
    >
      <div className='mb-5'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>
          Generate
        </p>
        <h3 className='text-lg font-bold text-foreground'>New Payroll Batch</h3>
        <p className='text-xs text-foreground/45 mt-1'>
          Create DRAFT payroll records for all active employees.
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-5'>
        <div>
          <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
            Month
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className={`${inputClass} [&>option]:bg-[#1a1a24]`}
          >
            {MONTH_NAMES.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
            Year
          </label>
          <input
            type='number'
            min={2020}
            max={2050}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
            Working Days
          </label>
          <input
            type='number'
            min={1}
            max={31}
            value={workingDays}
            onChange={(e) => setWorkingDays(parseInt(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className='text-xs text-red-400 mb-4'>{error}</p>
      )}
      {success && (
        <p className='text-xs text-emerald-400 mb-4 flex items-center gap-1.5'>
          <CheckCircle className='w-3.5 h-3.5' />
          {success}
        </p>
      )}

      <button
        type='submit'
        disabled={isPending}
        className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all'
      >
        {isPending ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            Generating…
          </>
        ) : (
          <>
            <Plus className='h-4 w-4' />
            Generate Draft
          </>
        )}
      </button>
    </form>
  );
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
