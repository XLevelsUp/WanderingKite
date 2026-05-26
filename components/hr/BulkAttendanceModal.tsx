'use client';

import { useState, useTransition, useRef } from 'react';
import { bulkMarkAttendance } from '@/actions/hr/attendance';
import { CalendarDays, X, Loader2, CheckCircle, Users } from 'lucide-react';
import type { AttendanceStatus } from '@/lib/types/hr';

interface Employee {
  id: string;
  fullName: string | null;
  email: string;
  jobTitle: string | null;
}

interface BulkAttendanceModalProps {
  employees: Employee[];
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; cls: string }[] = [
  {
    value: 'PRESENT',
    label: 'Present',
    cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    value: 'LATE',
    label: 'Late',
    cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    value: 'HALF_DAY',
    label: 'Half Day',
    cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  {
    value: 'ABSENT',
    label: 'Absent',
    cls: 'bg-red-500/12 text-red-400 border-red-500/20',
  },
  {
    value: 'ON_LEAVE',
    label: 'On Leave',
    cls: 'bg-blue-500/12 text-blue-400 border-blue-500/20',
  },
];

const inputClass =
  'px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all [&>option]:bg-[#1a1a24]';

export function BulkAttendanceModal({ employees }: BulkAttendanceModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    count?: number;
  } | null>(null);

  // Per-employee status state
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    () =>
      Object.fromEntries(employees.map((e) => [e.id, 'PRESENT' as AttendanceStatus])),
  );

  function setAllStatus(s: AttendanceStatus) {
    setStatuses(Object.fromEntries(employees.map((e) => [e.id, s])));
  }

  function handleSubmit() {
    setResult(null);
    const entries = employees.map((e) => ({
      employeeId: e.id,
      status: statuses[e.id] ?? 'PRESENT',
    }));

    startTransition(async () => {
      const res = await bulkMarkAttendance({ date, entries });
      setResult(res as any);
      if (res.success) {
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 1500);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className='flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-sm font-semibold text-primary hover:bg-primary/18 hover:border-primary/60 transition-all duration-200'
      >
        <CalendarDays className='h-4 w-4' />
        Bulk Mark Attendance
      </button>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={() => !isPending && setOpen(false)}
      />

      {/* Panel */}
      <div className='relative z-10 w-full max-w-xl bg-[rgba(17,17,22,0.98)] border border-primary/18 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='px-6 py-5 border-b border-primary/12 flex items-start justify-between flex-shrink-0'>
          <div>
            <div className='flex items-center gap-2 mb-0.5'>
              <Users className='w-4 h-4 text-primary' />
              <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70'>
                Attendance
              </p>
            </div>
            <h2 className='text-lg font-bold text-foreground'>Bulk Mark Attendance</h2>
          </div>
          <button
            onClick={() => !isPending && setOpen(false)}
            className='text-foreground/40 hover:text-foreground/70 p-1 rounded-lg hover:bg-white/5 transition-colors mt-0.5'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Date & quick-set */}
        <div className='px-6 py-4 border-b border-primary/8 flex-shrink-0 space-y-3'>
          <div className='flex items-center gap-4'>
            <div>
              <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1'>
                Date
              </label>
              <input
                type='date'
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className='px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all'
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1'>
                Set All
              </label>
              <div className='flex flex-wrap gap-1.5'>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => setAllStatus(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all hover:opacity-90 ${opt.cls}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Employee list */}
        <div className='flex-1 overflow-y-auto'>
          <table className='w-full'>
            <thead className='sticky top-0 bg-[rgba(17,17,22,0.98)]'>
              <tr className='border-b border-primary/10'>
                <th className='px-6 py-2.5 text-left text-xs font-semibold text-primary uppercase tracking-widest opacity-70'>
                  Employee
                </th>
                <th className='px-4 py-2.5 text-left text-xs font-semibold text-primary uppercase tracking-widest opacity-70'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const currentStatus = statuses[emp.id] ?? 'PRESENT';
                const statusCfg = STATUS_OPTIONS.find((o) => o.value === currentStatus);

                return (
                  <tr
                    key={emp.id}
                    className='border-b border-primary/6 hover:bg-primary/[0.03] transition-colors'
                  >
                    <td className='px-6 py-3'>
                      <p className='text-sm font-medium text-foreground/85'>
                        {emp.fullName ?? emp.email}
                      </p>
                      {emp.jobTitle && (
                        <p className='text-xs text-foreground/40'>{emp.jobTitle}</p>
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          setStatuses((prev) => ({
                            ...prev,
                            [emp.id]: e.target.value as AttendanceStatus,
                          }))
                        }
                        className={`${inputClass} ${statusCfg?.cls ?? ''}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-primary/12 flex-shrink-0'>
          {result?.error && (
            <p className='text-xs text-red-400 mb-3'>{result.error}</p>
          )}
          {result?.success && (
            <p className='text-xs text-emerald-400 mb-3 flex items-center gap-1.5'>
              <CheckCircle className='w-3.5 h-3.5' />
              Marked {result.count} employee{result.count !== 1 ? 's' : ''} successfully
            </p>
          )}

          <div className='flex justify-end gap-3'>
            <button
              onClick={() => !isPending && setOpen(false)}
              disabled={isPending}
              className='px-5 py-2.5 rounded-xl border border-white/12 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || employees.length === 0}
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
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
