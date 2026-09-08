import { getOwnAttendance } from '@/actions/hr/attendance';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'My Attendance' };

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
  LATE: 'bg-amber-500/12 text-amber-400 border border-amber-500/25',
  ABSENT: 'bg-red-500/12 text-red-400 border border-red-500/25',
  HALF_DAY: 'bg-blue-500/12 text-blue-400 border border-blue-500/25',
  ON_LEAVE: 'bg-purple-500/12 text-purple-400 border border-purple-500/25',
  ON_AID_LEAVE: 'bg-indigo-500/12 text-indigo-400 border border-indigo-500/25',
};

export default async function EmployeeAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();

  const logs = await getOwnAttendance(month, year);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  // Stats
  const present = logs.filter(l => l.status === 'PRESENT').length;
  const late = logs.filter(l => l.status === 'LATE').length;
  const absent = logs.filter(l => l.status === 'ABSENT').length;
  const leaves = logs.filter(l => l.status === 'ON_LEAVE').length;

  return (
    <div className='p-6 md:p-8 space-y-8 max-w-5xl mx-auto'>
      {/* Header */}
      <div>
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
          <Calendar className='w-3 h-3' />
          Personal HR
        </p>
        <h1 className='text-3xl font-bold text-foreground tracking-tight'>
          My Attendance
        </h1>
        <p className='text-sm text-foreground/45 mt-1'>
          View your clock-ins and attendance history.
        </p>
      </div>

      {/* Month Navigation & Stats */}
      <div className='flex flex-col sm:flex-row gap-5 items-center justify-between bg-[rgba(17,17,22,0.6)] border border-primary/12 rounded-xl p-5'>
        <div className='flex items-center gap-4'>
          <Link
            href={`/attendance?month=${prevMonth}&year=${prevYear}`}
            className='px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-foreground/60 transition-colors'
          >
            &larr; Prev
          </Link>
          <span className='font-bold text-foreground min-w-[120px] text-center'>
            {MONTH_NAMES[month]} {year}
          </span>
          <Link
            href={`/attendance?month=${nextMonth}&year=${nextYear}`}
            className='px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-foreground/60 transition-colors'
          >
            Next &rarr;
          </Link>
        </div>

        <div className='flex items-center gap-4 text-xs font-semibold'>
          <div className='flex flex-col items-center'><span className='text-emerald-400 text-lg'>{present}</span> <span className='text-foreground/40'>Present</span></div>
          <div className='flex flex-col items-center'><span className='text-amber-400 text-lg'>{late}</span> <span className='text-foreground/40'>Late</span></div>
          <div className='flex flex-col items-center'><span className='text-red-400 text-lg'>{absent}</span> <span className='text-foreground/40'>Absent</span></div>
          <div className='flex flex-col items-center'><span className='text-purple-400 text-lg'>{leaves}</span> <span className='text-foreground/40'>Leave</span></div>
        </div>
      </div>

      {/* Logs Table */}
      <div className='border border-primary/12 rounded-xl bg-[rgba(17,17,22,0.7)] overflow-hidden'>
        <table className='w-full text-left text-sm whitespace-nowrap'>
          <thead className='bg-primary/5 text-xs uppercase tracking-wider text-primary/70 font-semibold border-b border-primary/10'>
            <tr>
              <th className='px-5 py-3'>Date</th>
              <th className='px-5 py-3'>Status</th>
              <th className='px-5 py-3'>Clock In</th>
              <th className='px-5 py-3'>Clock Out</th>
              <th className='px-5 py-3'>Notes</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-white/5'>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-5 py-12 text-center text-foreground/40'>
                  No attendance logs found for this month.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const badge = STATUS_COLORS[log.status] || 'bg-white/10 text-white/70 border border-white/10';
                return (
                  <tr key={log.id} className='hover:bg-white/[0.02] transition-colors'>
                    <td className='px-5 py-3.5 font-medium text-foreground/80'>
                      {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className='px-5 py-3.5'>
                      <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold ${badge}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-5 py-3.5'>
                      {log.clockIn ? (
                        <div className='flex items-center gap-1.5 text-foreground/70'>
                          <Clock className='w-3.5 h-3.5 opacity-50' />
                          {log.clockIn.slice(0, 5)}
                        </div>
                      ) : (
                        <span className='text-foreground/20'>--:--</span>
                      )}
                    </td>
                    <td className='px-5 py-3.5'>
                      {log.clockOut ? (
                        <div className='flex items-center gap-1.5 text-foreground/70'>
                          <Clock className='w-3.5 h-3.5 opacity-50' />
                          {log.clockOut.slice(0, 5)}
                        </div>
                      ) : (
                        <span className='text-foreground/20'>--:--</span>
                      )}
                    </td>
                    <td className='px-5 py-3.5 text-foreground/50 max-w-[200px] truncate'>
                      {log.notes || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
