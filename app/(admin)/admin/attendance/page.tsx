import { getMonthlyAttendance } from '@/actions/hr/attendance';
import { getHREmployees } from '@/actions/hr/employees';
import { AttendanceGrid } from '@/components/hr/AttendanceGrid';
import { BulkAttendanceModal } from '@/components/hr/BulkAttendanceModal';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Attendance — Admin' };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const month = parseInt(sp.month ?? String(now.getMonth() + 1), 10);
  const year = parseInt(sp.year ?? String(now.getFullYear()), 10);

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  const prevLink = `/admin/attendance?month=${prevDate.getMonth() + 1}&year=${prevDate.getFullYear()}`;
  const nextLink = `/admin/attendance?month=${nextDate.getMonth() + 1}&year=${nextDate.getFullYear()}`;

  const MONTH_NAME = new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const [logs, allEmployees] = await Promise.all([
    getMonthlyAttendance(month, year),
    getHREmployees(),
  ]);

  // Only active employees for the grid
  const activeEmployees = allEmployees
    .filter((e) => e.contract?.isActive !== false)
    .map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      jobTitle: e.contract?.jobTitle ?? null,
      avatarUrl: e.contract?.avatarUrl ?? null,
    }));

  // Employee list for BulkModal (minimal shape)
  const bulkEmployeeList = activeEmployees.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    email: e.email,
    jobTitle: e.jobTitle,
  }));

  return (
    <div className='p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
            <CalendarDays className='w-3 h-3' />
            HR Management
          </p>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>
            Attendance
          </h1>
          <p className='text-sm text-foreground/45 mt-1'>
            Monthly attendance register for all active employees.
          </p>
        </div>

        <BulkAttendanceModal employees={bulkEmployeeList} />
      </div>

      {/* Month navigator */}
      <div className='flex items-center gap-3'>
        <Link
          href={prevLink}
          className='flex items-center justify-center w-9 h-9 rounded-xl border border-primary/25 text-foreground/50 hover:text-foreground hover:bg-primary/8 transition-all'
        >
          <ChevronLeft className='h-4 w-4' />
        </Link>

        <span className='text-base font-semibold text-foreground min-w-[160px] text-center'>
          {MONTH_NAME}
        </span>

        <Link
          href={nextLink}
          aria-disabled={isCurrentMonth}
          className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
            isCurrentMonth
              ? 'border-white/8 text-foreground/20 pointer-events-none'
              : 'border-primary/25 text-foreground/50 hover:text-foreground hover:bg-primary/8'
          }`}
        >
          <ChevronRight className='h-4 w-4' />
        </Link>
      </div>

      {/* Grid */}
      <AttendanceGrid
        month={month}
        year={year}
        employees={activeEmployees}
        logs={logs}
      />
    </div>
  );
}
