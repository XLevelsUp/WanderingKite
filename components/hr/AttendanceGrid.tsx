'use client';

import React, { useMemo, useState, useTransition, useEffect } from 'react';
import type { AttendanceLogWithEmployee, AttendanceStatus, AttendanceSettingRow } from '@/lib/types/hr';
import { X, Loader2, CheckCircle, Clock, FileText, Settings, Sliders } from 'lucide-react';
import { upsertAttendanceLog, deleteAttendanceLog, updateAttendanceSettings } from '@/actions/hr/attendance';
import { useRouter } from 'next/navigation';

interface AttendanceGridProps {
  month: number;
  year: number;
  employees: {
    id: string;
    fullName: string | null;
    email: string;
    jobTitle: string | null;
    avatarUrl: string | null;
  }[];
  logs: AttendanceLogWithEmployee[];
  settings?: AttendanceSettingRow | null;
}

// ── Status styling ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AttendanceStatus | 'UNMARKED',
  { label: string; short: string; cell: string; dot: string }
> = {
  PRESENT: {
    label: 'Present',
    short: 'P',
    cell: 'bg-emerald-500/18 text-emerald-300 border-emerald-500/30 ring-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  LATE: {
    label: 'Late',
    short: 'L',
    cell: 'bg-amber-500/15 text-amber-300 border-amber-500/25 ring-amber-500/15',
    dot: 'bg-amber-400',
  },
  HALF_DAY: {
    label: 'Half Day',
    short: 'H',
    cell: 'bg-orange-500/15 text-orange-300 border-orange-500/25 ring-orange-500/15',
    dot: 'bg-orange-400',
  },
  ABSENT: {
    label: 'Absent',
    short: 'A',
    cell: 'bg-red-500/12 text-red-400 border-red-500/20 ring-red-500/10',
    dot: 'bg-red-400',
  },
  ON_LEAVE: {
    label: 'Leave',
    short: 'LV',
    cell: 'bg-pink-500/12 text-pink-400 border-pink-500/20 ring-pink-500/10',
    dot: 'bg-pink-400',
  },
  ON_AID_LEAVE: {
    label: 'On-Aid Leave',
    short: 'OAL',
    cell: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25 ring-indigo-500/15',
    dot: 'bg-indigo-400',
  },
  LEAVE: {
    label: 'Leave',
    short: 'LV',
    cell: 'bg-pink-500/12 text-pink-400 border-pink-500/20 ring-pink-500/10',
    dot: 'bg-pink-400',
  },
  UNMARKED: {
    label: 'Unmarked',
    short: '—',
    cell: 'bg-white/[0.03] text-foreground/20 border-white/8',
    dot: 'bg-white/20',
  },
};

// ── Helper: build indexed lookup ───────────────────────────────────────────

function buildLogIndex(logs: AttendanceLogWithEmployee[]) {
  const index = new Map<string, AttendanceLogWithEmployee>();
  for (const log of logs) {
    const key = `${log.employeeId}::${log.date}`;
    index.set(key, log);
  }
  return index;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function isWeekend(day: number, month: number, year: number) {
  const d = new Date(year, month - 1, day);
  return d.getDay() === 0 || d.getDay() === 6;
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ── Avatar chip ─────────────────────────────────────────────────────────────

function AvatarChip({
  name,
  title,
  avatarUrl,
}: {
  name: string | null;
  title: string | null;
  avatarUrl: string | null;
}) {
  const initials = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className='flex items-center gap-2 min-w-0'>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ?? ''}
          className='w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-primary/20'
        />
      ) : (
        <div className='w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 ring-1 ring-primary/20'>
          {initials}
        </div>
      )}
      <div className='min-w-0'>
        <p className='text-xs font-medium text-foreground/85 truncate leading-tight'>
          {name ?? '—'}
        </p>
        {title && (
          <p className='text-[10px] text-foreground/40 truncate leading-tight'>
            {title}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Legend ──────────────────────────────────────────────────────────────────

function Legend() {
  const items = Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'UNMARKED');
  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5'>
      {items.map(([key, cfg]) => (
        <div key={key} className='flex items-center gap-1.5'>
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className='text-xs text-foreground/50'>{cfg.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export function AttendanceGrid({
  month,
  year,
  employees,
  logs,
  settings,
}: AttendanceGridProps) {
  const router = useRouter();
  const totalDays = getDaysInMonth(month, year);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const logIndex = useMemo(() => buildLogIndex(logs), [logs]);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'ATTENDANCE' | 'COMPLIANCE'>('ATTENDANCE');
  const [settingsPending, startSettingsTransition] = useTransition();
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    studioStartTime: settings?.studioStartTime ?? '09:00',
    graceMinutes: settings?.graceMinutes ?? 15,
    halfDayThresholdHours: settings?.halfDayThresholdHours ?? 4.0,
    latePenaltyPerMinute: settings?.latePenaltyPerMinute ?? 0,
    allowedPaidLeavesPerMonth: settings?.allowedPaidLeavesPerMonth ?? 0,
    pfWageCeiling: settings?.pfWageCeiling ?? 15000,
    pfContributionPercent: settings?.pfContributionPercent ?? 12,
    pfAutoEnrollAboveCeiling: settings?.pfAutoEnrollAboveCeiling ?? false,
    ptState: settings?.ptState ?? 'Tamil Nadu',
    ptDeductionFrequency: settings?.ptDeductionFrequency ?? 'MONTHLY',
    tdsRegime: settings?.tdsRegime ?? 'New Regime FY 2025-26',
    enablePF: settings?.enablePF ?? true,
    enablePT: settings?.enablePT ?? true,
    enableTDS: settings?.enableTDS ?? true,
  });

  const [editingCell, setEditingCell] = useState<{
    employeeId: string;
    fullName: string;
    avatarUrl: string | null;
    jobTitle: string | null;
    date: string;
    status: AttendanceStatus | 'UNMARKED';
    clockIn: string;
    clockOut: string;
    notes: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!editingCell) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        setEditingCell(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, isPending]);

  const STATUS_OPTIONS: { value: AttendanceStatus | 'UNMARKED'; label: string; cls: string; dot: string }[] = [
    { value: 'PRESENT', label: 'Present', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    { value: 'LATE', label: 'Late', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/25', dot: 'bg-amber-400' },
    { value: 'HALF_DAY', label: 'Half Day', cls: 'bg-orange-500/15 text-orange-300 border-orange-500/25', dot: 'bg-orange-400' },
    { value: 'ABSENT', label: 'Absent', cls: 'bg-red-500/12 text-red-400 border-red-500/20', dot: 'bg-red-400' },
    { value: 'ON_LEAVE', label: 'Leave', cls: 'bg-pink-500/12 text-pink-400 border-pink-500/20', dot: 'bg-pink-400' },
    { value: 'ON_AID_LEAVE', label: 'On-Aid Leave', cls: 'bg-indigo-500/12 text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-400' },
    { value: 'UNMARKED', label: 'Unmarked', cls: 'bg-white/[0.04] text-foreground/45 border-white/10', dot: 'bg-white/20' },
  ];


  const MONTH_NAME = new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
  });

  if (employees.length === 0) {
    return (
      <div className='rounded-xl border border-primary/12 bg-[rgba(17,17,22,0.6)] px-8 py-16 text-center text-sm text-foreground/40'>
        No active employees to display.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4'>
        <Legend />
        
        <button
          type='button'
          onClick={() => setShowSettings(true)}
          className='flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-xs font-bold text-primary hover:border-primary/50 transition-all'
        >
          <Settings className='w-3.5 h-3.5' />
          Company Leave & Late Policy
        </button>
      </div>

      {/* Scrollable grid wrapper */}
      <div className='overflow-x-auto rounded-xl border border-primary/15 bg-[rgba(17,17,22,0.85)] backdrop-blur-md'>
        <table className='min-w-full border-collapse'>
          <thead>
            <tr className='border-b border-primary/12'>
              {/* Employee column header */}
              <th className='sticky left-0 z-10 bg-[rgba(17,17,22,0.98)] min-w-[180px] px-4 py-3 text-left text-xs font-semibold text-primary uppercase tracking-widest opacity-80'>
                Employee
              </th>
              {/* Day headers */}
              {days.map((day) => {
                const weekend = isWeekend(day, month, year);
                const date = new Date(year, month - 1, day);
                const dayName = date.toLocaleString('en-IN', { weekday: 'short' });
                return (
                  <th
                    key={day}
                    className={`min-w-[44px] px-1 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                      weekend ? 'text-foreground/25' : 'text-primary opacity-75'
                    }`}
                  >
                    <div className='flex flex-col items-center gap-0.5'>
                      <span>{day}</span>
                      <span className='text-[9px] font-normal opacity-70'>{dayName}</span>
                    </div>
                  </th>
                );
              })}
              {/* Summary column */}
              <th className='sticky right-0 z-10 bg-[rgba(17,17,22,0.98)] min-w-[80px] px-4 py-3 text-center text-xs font-semibold text-primary uppercase tracking-widest opacity-80'>
                Days
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              let presentCount = 0;
              return (
                <tr
                  key={emp.id}
                  className='border-b border-primary/8 hover:bg-primary/[0.03] transition-colors duration-100'
                >
                  {/* Employee info */}
                  <td className='sticky left-0 z-10 bg-[rgba(17,17,22,0.92)] px-4 py-2.5'>
                    <AvatarChip
                      name={emp.fullName}
                      title={emp.jobTitle}
                      avatarUrl={emp.avatarUrl}
                    />
                  </td>

                  {/* Day cells */}
                  {days.map((day) => {
                    const dateStr = isoDate(year, month, day);
                    const log = logIndex.get(`${emp.id}::${dateStr}`);
                    const weekend = isWeekend(day, month, year);
                    const status: AttendanceStatus | 'UNMARKED' = log?.status ?? 'UNMARKED';
                    const cfg = STATUS_CONFIG[status];

                    if (status === 'PRESENT' || status === 'LATE') presentCount++;
                    else if (status === 'HALF_DAY') presentCount += 0.5;

                    return (
                      <td key={day} className='px-1 py-2'>
                        <button
                          type='button'
                          onClick={() => {
                            setSubmitError(null);
                            setSuccess(false);
                            setEditingCell({
                              employeeId: emp.id,
                              fullName: emp.fullName ?? emp.email,
                              avatarUrl: emp.avatarUrl,
                              jobTitle: emp.jobTitle,
                              date: dateStr,
                              status: log?.status ?? 'UNMARKED',
                              clockIn: log?.clockIn ? log.clockIn.slice(0, 5) : '',
                              clockOut: log?.clockOut ? log.clockOut.slice(0, 5) : '',
                              notes: log?.notes ?? '',
                            });
                          }}
                          title={`${emp.fullName} — ${dateStr}: ${cfg.label} (Click to edit)`}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-semibold border transition-all mx-auto cursor-pointer hover:scale-[1.08] hover:ring-2 hover:ring-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/60 ${
                            weekend && !log
                              ? 'bg-white/[0.015] border-white/5 text-foreground/15 hover:bg-white/[0.06] hover:border-white/15'
                              : `${cfg.cell} hover:brightness-110`
                          }`}
                        >
                          {weekend && !log ? '—' : cfg.short}
                        </button>
                      </td>
                    );
                  })}

                  {/* Summary */}
                  <td className='sticky right-0 z-10 bg-[rgba(17,17,22,0.92)] px-4 py-2.5 text-center'>
                    <span className='text-sm font-semibold text-foreground/80 tabular-nums'>
                      {presentCount}
                    </span>
                    <span className='text-xs text-foreground/35'>/{totalDays}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Individual Attendance Edit Modal ────────────────────────────────── */}
      {editingCell && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/75 backdrop-blur-sm'
            onClick={() => !isPending && setEditingCell(null)}
          />

          {/* Panel */}
          <div className='relative z-10 w-full max-w-md bg-[rgba(17,17,22,0.98)] border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200'>
            {/* Header */}
            <div className='px-6 py-5 border-b border-primary/12 flex items-start justify-between flex-shrink-0'>
              <div className='flex items-center gap-3 min-w-0'>
                {editingCell.avatarUrl ? (
                  <img
                    src={editingCell.avatarUrl}
                    alt={editingCell.fullName}
                    className='w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 flex-shrink-0'
                  />
                ) : (
                  <div className='w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-primary/20 flex-shrink-0'>
                    {editingCell.fullName.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')}
                  </div>
                )}
                <div className='min-w-0'>
                  <h2 className='text-base font-bold text-foreground truncate leading-tight'>
                    {editingCell.fullName}
                  </h2>
                  <p className='text-xs text-foreground/45 truncate mt-0.5'>
                    {editingCell.jobTitle || 'Staff'} • {new Date(editingCell.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => !isPending && setEditingCell(null)}
                className='text-foreground/40 hover:text-foreground/70 p-1.5 rounded-lg hover:bg-white/5 transition-colors mt-0.5'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              {/* Status Section */}
              <div className='space-y-2'>
                <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider'>
                  Attendance Status
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = editingCell.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() =>
                          setEditingCell((prev) => prev ? { ...prev, status: opt.value } : null)
                        }
                        className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all hover:bg-white/[0.02] ${
                          isSelected
                            ? `${opt.cls} ring-2 ring-primary/25 scale-[1.02] shadow-[0_0_12px_rgba(255,255,255,0.03)]`
                            : 'border-white/8 text-foreground/50 bg-transparent'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Inputs (Only shown if marked as Present, Late, or Half Day) */}
              {editingCell.status !== 'UNMARKED' && editingCell.status !== 'ABSENT' && editingCell.status !== 'ON_LEAVE' && (
                <div className='grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-150'>
                  <div>
                    <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <Clock className='w-3.5 h-3.5 text-primary/70' />
                      Clock In
                    </label>
                    <input
                      type='time'
                      value={editingCell.clockIn}
                      onChange={(e) =>
                        setEditingCell((prev) => prev ? { ...prev, clockIn: e.target.value } : null)
                      }
                      className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/85 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all [color-scheme:dark]'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <Clock className='w-3.5 h-3.5 text-primary/70' />
                      Clock Out
                    </label>
                    <input
                      type='time'
                      value={editingCell.clockOut}
                      onChange={(e) =>
                        setEditingCell((prev) => prev ? { ...prev, clockOut: e.target.value } : null)
                      }
                      className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/85 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all [color-scheme:dark]'
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className='space-y-1.5'>
                <label className='block text-xs font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-1.5'>
                  <FileText className='w-3.5 h-3.5 text-primary/70' />
                  Remarks / Notes
                </label>
                <textarea
                  value={editingCell.notes}
                  rows={3}
                  onChange={(e) =>
                    setEditingCell((prev) => prev ? { ...prev, notes: e.target.value } : null)
                  }
                  placeholder='Optional notes regarding delay, leave approval, etc...'
                  className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 placeholder-foreground/25 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none'
                />
              </div>
            </div>

            {/* Footer */}
            <div className='px-6 py-4 border-t border-primary/12 flex-shrink-0 bg-white/[0.01]'>
              {submitError && (
                <p className='text-xs text-red-400 mb-3'>{submitError}</p>
              )}
              {success && (
                <p className='text-xs text-emerald-400 mb-3 flex items-center gap-1.5'>
                  <CheckCircle className='w-3.5 h-3.5' />
                  Attendance updated successfully
                </p>
              )}

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => !isPending && setEditingCell(null)}
                  disabled={isPending}
                  className='px-5 py-2.5 rounded-xl border border-white/12 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setSubmitError(null);
                    setSuccess(false);
                    startTransition(async () => {
                      if (editingCell.status === 'UNMARKED') {
                        // Delete
                        const res = await deleteAttendanceLog(editingCell.employeeId, editingCell.date);
                        if (res.error) {
                          setSubmitError(res.error);
                        } else {
                          setSuccess(true);
                          router.refresh();
                          setTimeout(() => {
                            setEditingCell(null);
                            setSuccess(false);
                          }, 1200);
                        }
                      } else {
                        // Upsert
                        const payload = {
                          employeeId: editingCell.employeeId,
                          date: editingCell.date,
                          status: editingCell.status,
                          clockIn: editingCell.clockIn || undefined,
                          clockOut: editingCell.clockOut || undefined,
                          notes: editingCell.notes || undefined,
                        };
                        const res = await upsertAttendanceLog(payload);
                        if (res.error) {
                          setSubmitError(res.error);
                        } else {
                          setSuccess(true);
                          router.refresh();
                          setTimeout(() => {
                            setEditingCell(null);
                            setSuccess(false);
                          }, 1200);
                        }
                      }
                    });
                  }}
                  disabled={isPending}
                  className='flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.02)]'
                >
                  {isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle className='h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Company Policy / Attendance Settings Modal ───────────────────────── */}
      {showSettings && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/75 backdrop-blur-sm'
            onClick={() => !settingsPending && setShowSettings(false)}
          />

          {/* Panel */}
          <div className='relative z-10 w-full max-w-sm bg-[rgba(17,17,22,0.98)] border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200'>
            {/* Header */}
            <div className='px-6 py-5 border-b border-primary/12 flex items-start justify-between flex-shrink-0'>
              <div>
                <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-0.5'>
                  Configuration
                </p>
                <h2 className='text-base font-bold text-foreground'>
                  Company Policy Settings
                </h2>
              </div>
              <button
                type='button'
                onClick={() => !settingsPending && setShowSettings(false)}
                className='text-foreground/40 hover:text-foreground/70 p-1.5 rounded-lg hover:bg-white/5 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Tabs */}
            <div className='flex border-b border-primary/12'>
              <button 
                type='button' 
                onClick={() => setSettingsTab('ATTENDANCE')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${settingsTab === 'ATTENDANCE' ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-foreground/80'}`}
              >
                Attendance Policy
              </button>
              <button 
                type='button' 
                onClick={() => setSettingsTab('COMPLIANCE')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${settingsTab === 'COMPLIANCE' ? 'border-primary text-primary' : 'border-transparent text-foreground/50 hover:text-foreground/80'}`}
              >
                Statutory Compliance
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4 text-xs'>
              {settingsTab === 'ATTENDANCE' ? (
                <div className="space-y-4">
              <div>
                <label className='block text-[10px] font-semibold text-primary uppercase tracking-widest mb-1.5'>
                  Monthly Paid Leave Quota
                </label>
                <input
                  type='number'
                  min={0}
                  max={31}
                  value={settingsForm.allowedPaidLeavesPerMonth}
                  onFocus={() => {
                    if (settingsForm.allowedPaidLeavesPerMonth === 0) {
                      setSettingsForm((prev) => ({ ...prev, allowedPaidLeavesPerMonth: '' as any }));
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                      setSettingsForm((prev) => ({ ...prev, allowedPaidLeavesPerMonth: 0 }));
                    }
                  }}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      allowedPaidLeavesPerMonth: parseInt(e.target.value) || 0,
                    }))
                  }
                  className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:ring-2 focus:ring-primary/30 transition-all focus:outline-none'
                />
                <span className='text-[10px] text-foreground/35 mt-1 block leading-normal'>
                  Uniform allowed paid leaves per employee per month. Leave days within quota reclassify automatically without salary deduction.
                </span>
              </div>

              <div>
                <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                  Studio Work Start Time
                </label>
                <input
                  type='text'
                  placeholder='HH:MM'
                  value={settingsForm.studioStartTime}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      studioStartTime: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:ring-2 focus:ring-primary/30 transition-all focus:outline-none'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                    Grace (Mins)
                  </label>
                  <input
                    type='number'
                    min={0}
                    value={settingsForm.graceMinutes}
                    onFocus={() => {
                      if (settingsForm.graceMinutes === 0) {
                        setSettingsForm((prev) => ({ ...prev, graceMinutes: '' as any }));
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                        setSettingsForm((prev) => ({ ...prev, graceMinutes: 0 }));
                      }
                    }}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        graceMinutes: parseInt(e.target.value) || 0,
                      }))
                    }
                    className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:ring-2 focus:ring-primary/30 transition-all focus:outline-none'
                  />
                </div>

                <div>
                  <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                    Half-Day (Hrs)
                  </label>
                  <input
                    type='number'
                    min={1}
                    value={settingsForm.halfDayThresholdHours}
                    onFocus={() => {
                      if (settingsForm.halfDayThresholdHours === 0) {
                        setSettingsForm((prev) => ({ ...prev, halfDayThresholdHours: '' as any }));
                      }
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        setSettingsForm((prev) => ({ ...prev, halfDayThresholdHours: 4.0 }));
                      }
                    }}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        halfDayThresholdHours: parseFloat(e.target.value) || 4.0,
                      }))
                    }
                    className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:ring-2 focus:ring-primary/30 transition-all focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>
                  Late Penalty / Min (₹)
                </label>
                <input
                  type='number'
                  min={0}
                  step={0.5}
                  value={settingsForm.latePenaltyPerMinute}
                  onFocus={() => {
                    if (settingsForm.latePenaltyPerMinute === 0) {
                      setSettingsForm((prev) => ({ ...prev, latePenaltyPerMinute: '' as any }));
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                      setSettingsForm((prev) => ({ ...prev, latePenaltyPerMinute: 0 }));
                    }
                  }}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      latePenaltyPerMinute: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:ring-2 focus:ring-primary/30 transition-all focus:outline-none'
                />
              </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div>
                      <h4 className="font-semibold text-foreground/90">Enable Provident Fund (PF)</h4>
                      <p className="text-[10px] text-foreground/45 mt-0.5">Deduct 12% for eligible employees</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.enablePF} onChange={(e) => setSettingsForm(prev => ({ ...prev, enablePF: e.target.checked }))} />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {settingsForm.enablePF && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-white/5 bg-black/20">
                      <div>
                        <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>Wage Ceiling (₹)</label>
                        <input
                          type='number'
                          value={settingsForm.pfWageCeiling}
                          onChange={(e) => setSettingsForm((prev) => ({ ...prev, pfWageCeiling: parseFloat(e.target.value) || 0 }))}
                          className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30'
                        />
                      </div>
                      <div>
                        <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>Contribution (%)</label>
                        <input
                          type='number'
                          value={settingsForm.pfContributionPercent}
                          onChange={(e) => setSettingsForm((prev) => ({ ...prev, pfContributionPercent: parseFloat(e.target.value) || 0 }))}
                          className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30'
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground/90">Enable Professional Tax (PT)</h4>
                        <p className="text-[10px] text-foreground/45 mt-0.5">{settingsForm.ptState} Slab Structure</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settingsForm.enablePT} onChange={(e) => setSettingsForm(prev => ({ ...prev, enablePT: e.target.checked }))} />
                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    {settingsForm.enablePT && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <label className='block text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-1.5'>Deduction Cycle</label>
                        <select
                          value={settingsForm.ptDeductionFrequency || 'MONTHLY'}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, ptDeductionFrequency: e.target.value as any }))}
                          className='w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none'
                        >
                          <option value="MONTHLY" className="bg-background text-foreground">Monthly</option>
                          <option value="HALF_YEARLY" className="bg-background text-foreground">Half-Yearly (Feb & Aug)</option>
                          <option value="YEARLY" className="bg-background text-foreground">Yearly (March)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div>
                      <h4 className="font-semibold text-foreground/90">Enable Income Tax (TDS)</h4>
                      <p className="text-[10px] text-foreground/45 mt-0.5">{settingsForm.tdsRegime}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.enableTDS} onChange={(e) => setSettingsForm(prev => ({ ...prev, enableTDS: e.target.checked }))} />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='px-6 py-4 border-t border-primary/12 flex-shrink-0 bg-white/[0.01]'>
              {settingsError && (
                <p className='text-[10px] text-red-400 mb-3 leading-normal'>{settingsError}</p>
              )}
              {settingsSuccess && (
                <p className='text-[10px] text-emerald-400 mb-3 flex items-center gap-1.5'>
                  <CheckCircle className='w-3.5 h-3.5' />
                  Settings updated successfully!
                </p>
              )}

              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => !settingsPending && setShowSettings(false)}
                  disabled={settingsPending}
                  className='px-4 py-2.5 rounded-xl border border-white/12 text-xs font-semibold text-foreground/60 hover:text-foreground hover:bg-white/5 transition-all'
                >
                  Close
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setSettingsError(null);
                    setSettingsSuccess(false);
                    startSettingsTransition(async () => {
                      const res = await updateAttendanceSettings({
                        studioStartTime: settingsForm.studioStartTime.slice(0, 5),
                        graceMinutes: settingsForm.graceMinutes,
                        halfDayThresholdHours: settingsForm.halfDayThresholdHours,
                        latePenaltyPerMinute: settingsForm.latePenaltyPerMinute,
                        allowedPaidLeavesPerMonth: settingsForm.allowedPaidLeavesPerMonth,
                        pfWageCeiling: settingsForm.pfWageCeiling,
                        pfContributionPercent: settingsForm.pfContributionPercent,
                        pfAutoEnrollAboveCeiling: settingsForm.pfAutoEnrollAboveCeiling,
                        ptState: settingsForm.ptState,
                        ptDeductionFrequency: settingsForm.ptDeductionFrequency,
                        tdsRegime: settingsForm.tdsRegime,
                        enablePF: settingsForm.enablePF,
                        enablePT: settingsForm.enablePT,
                        enableTDS: settingsForm.enableTDS,
                      });
                      if (res.error) {
                        setSettingsError(res.error);
                      } else {
                        setSettingsSuccess(true);
                        router.refresh();
                        setTimeout(() => {
                          setShowSettings(false);
                          setSettingsSuccess(false);
                        }, 1200);
                      }
                    });
                  }}
                  disabled={settingsPending}
                  className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(255,255,255,0.02)]'
                >
                  {settingsPending ? (
                    <>
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle className='h-3.5 w-3.5' />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
