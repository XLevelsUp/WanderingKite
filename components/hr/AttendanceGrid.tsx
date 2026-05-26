'use client';

import React, { useMemo } from 'react';
import type { AttendanceLogWithEmployee, AttendanceStatus } from '@/lib/types/hr';

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
    label: 'On Leave',
    short: 'OL',
    cell: 'bg-blue-500/12 text-blue-400 border-blue-500/20 ring-blue-500/10',
    dot: 'bg-blue-400',
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
}: AttendanceGridProps) {
  const totalDays = getDaysInMonth(month, year);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const logIndex = useMemo(() => buildLogIndex(logs), [logs]);

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
      <Legend />

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
                        <div
                          title={`${emp.fullName} — ${dateStr}: ${cfg.label}`}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-semibold border transition-all mx-auto ${
                            weekend && !log
                              ? 'bg-white/[0.015] border-white/5 text-foreground/15'
                              : cfg.cell
                          }`}
                        >
                          {weekend && !log ? '—' : cfg.short}
                        </div>
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
    </div>
  );
}
