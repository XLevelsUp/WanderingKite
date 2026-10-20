'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { generatePayrollDraft, checkUnmarkedAttendance, autoFillMissingAttendance } from '@/actions/hr/payroll';
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
  const workingDays = new Date(year, month, 0).getDate();

  // State for the unmarked warning modal
  const [unmarkedEmployees, setUnmarkedEmployees] = useState<
    { employeeId: string; fullName: string; email: string; unmarkedDates: string[] }[] | null
  >(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  async function runPayrollGeneration() {
    setError(null);
    setSuccess(null);
    const res = await generatePayrollDraft({ month, year, workingDays });
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Payroll generated for ${MONTH_NAMES[month]} ${year}`);
      setUnmarkedEmployees(null);
      router.refresh();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      // 1. Check for unmarked attendance first
      const checkRes = await checkUnmarkedAttendance(month, year);
      if (checkRes.error) {
        setError(checkRes.error);
        return;
      }

      if (checkRes.unmarked && checkRes.unmarked.length > 0) {
        setUnmarkedEmployees(checkRes.unmarked);
        return;
      }

      // 2. Generate payroll if no unmarked days
      await runPayrollGeneration();
    });
  }

  async function handleAutoFill(fillType: 'PRESENT' | 'ABSENT') {
    setError(null);
    setSuccess(null);
    setIsAutoFilling(true);
    const res = await autoFillMissingAttendance(month, year, fillType);
    setIsAutoFilling(false);
    if (res.error) {
      setError(res.error);
    } else {
      startTransition(async () => {
        await runPayrollGeneration();
      });
    }
  }

  return (
    <>
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

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5'>
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
              value={isNaN(year) ? '' : year}
              onFocus={() => {
                if (year === 0) {
                  setYear(NaN);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                  setYear(0);
                }
              }}
              onChange={(e) => setYear(parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
              Working Days (Auto-derived)
            </label>
            <div className='w-full px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-bold text-primary flex items-center justify-center h-[42px]'>
              {workingDays} Days
            </div>
          </div>
        </div>

        {error && (
          <p className='text-xs text-red-400 mb-4 leading-normal'>{error}</p>
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
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_16px_hsl(var(--primary)/0.15)]'
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

      {/* Option A: Warning & Auto-fill Dialog Modal */}
      {unmarkedEmployees && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
          <div className='w-full max-w-lg rounded-2xl border border-primary/20 bg-[#12121a] p-6 shadow-2xl animate-in scale-in duration-200'>
            <div className='mb-4'>
              <h3 className='text-lg font-bold text-foreground flex items-center gap-2 text-amber-400'>
                ⚠️ Unmarked Attendance Detected
              </h3>
              <p className='text-xs text-foreground/50 mt-1.5'>
                The following employees have unmarked days in {MONTH_NAMES[month]} {year}. Unresolved days will default to Absent (reducing base pay).
              </p>
            </div>

            {/* Scrollable list of employees & unmarked days */}
            <div className='max-h-48 overflow-y-auto space-y-2.5 mb-5 pr-1.5 scrollbar-thin'>
              {unmarkedEmployees.map((emp) => (
                <div key={emp.employeeId} className='p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='font-bold text-foreground'>{emp.fullName}</span>
                    <span className='text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20'>
                      {emp.unmarkedDates.length} day{emp.unmarkedDates.length !== 1 ? 's' : ''} missing
                    </span>
                  </div>
                  <p className='text-foreground/45 text-[10px] break-words'>
                    Dates: {emp.unmarkedDates.join(', ')}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className='flex flex-col sm:flex-row justify-end gap-2.5'>
              <button
                type='button'
                onClick={() => setUnmarkedEmployees(null)}
                className='px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-foreground/70 transition-all order-3 sm:order-1'
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={isAutoFilling || isPending}
                onClick={() => handleAutoFill('ABSENT')}
                className='px-4 py-2.5 rounded-xl border border-red-500/25 bg-red-500/8 hover:bg-red-500/15 text-red-400 text-xs font-semibold disabled:opacity-50 transition-all order-2'
              >
                {isAutoFilling ? 'Processing…' : 'Mark as Absent'}
              </button>
              <button
                type='button'
                disabled={isAutoFilling || isPending}
                onClick={() => handleAutoFill('PRESENT')}
                className='px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold disabled:opacity-50 transition-all order-1 sm:order-3 shadow-[0_0_16px_hsl(var(--primary)/0.25)]'
              >
                {isAutoFilling || isPending ? 'Generating…' : 'Auto-Fill as Present'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
