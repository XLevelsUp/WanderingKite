import { getPayrollForMonth } from '@/actions/hr/payroll';
import { PayrollSummaryCard } from '@/components/hr/PayrollSummaryCard';
import { PayrollBatchActions } from '@/components/hr/PayrollBatchActions';
import { ArrowLeft, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PayrollStatus } from '@/lib/types/hr';

export const metadata = { title: 'Payroll Batch — Admin' };

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function PayrollBatchPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: monthParam } = await params;

  // Expected format: YYYY-MM
  const parts = monthParam.split('-');
  if (parts.length !== 2) notFound();

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) notFound();

  const records = await getPayrollForMonth(month, year);

  if (records.length === 0) {
    return (
      <div className='p-6 md:p-8 max-w-5xl mx-auto space-y-8'>
        <Link
          href='/admin/payroll'
          className='inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Payroll
        </Link>
        <div className='rounded-xl border border-primary/12 bg-[rgba(17,17,22,0.6)] px-8 py-16 text-center'>
          <p className='text-sm text-foreground/40'>
            No payroll records found for {MONTH_NAMES[month]} {year}.
          </p>
          <Link
            href='/admin/payroll'
            className='mt-4 inline-block text-xs text-primary hover:underline'
          >
            Generate payroll for this month →
          </Link>
        </div>
      </div>
    );
  }

  const allStatuses = records.map((r) => r.status) as PayrollStatus[];
  const totalNet = records.reduce((sum, r) => sum + r.netPayout, 0);
  const totalPaid = records.filter((r) => r.status === 'PAID').length;

  return (
    <div className='p-6 md:p-8 max-w-5xl mx-auto space-y-8'>
      {/* Back */}
      <Link
        href='/admin/payroll'
        className='inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Payroll
      </Link>

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
            <DollarSign className='w-3 h-3' />
            Payroll Batch
          </p>
          <h1 className='text-3xl font-bold text-foreground tracking-tight'>
            {MONTH_NAMES[month]} {year}
          </h1>
          <p className='text-sm text-foreground/45 mt-1'>
            {records.length} employee{records.length !== 1 ? 's' : ''} — Total payout:{' '}
            <span className='text-foreground/80 font-semibold'>{fmt(totalNet)}</span>
            {' '}— {totalPaid}/{records.length} paid
          </p>
        </div>

        <PayrollBatchActions month={month} year={year} allStatuses={allStatuses} />
      </div>

      {/* Cards grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
        {records.map((record) => (
          <PayrollSummaryCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
}
