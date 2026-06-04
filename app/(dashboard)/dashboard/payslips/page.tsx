import { getOwnPayslips } from '@/actions/hr/payroll';
import { Wallet, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = { title: 'My Payslips' };

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function EmployeePayslipsPage() {
  const payslips = await getOwnPayslips();

  return (
    <div className='p-6 md:p-8 space-y-8 max-w-5xl mx-auto'>
      {/* Header */}
      <div>
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
          <Wallet className='w-3 h-3' />
          Personal HR
        </p>
        <h1 className='text-3xl font-bold text-foreground tracking-tight'>
          My Payslips
        </h1>
        <p className='text-sm text-foreground/45 mt-1'>
          View and download your monthly salary slips.
        </p>
      </div>

      {payslips.length === 0 ? (
        <div className='rounded-xl border border-primary/12 bg-[rgba(17,17,22,0.6)] px-8 py-16 text-center'>
          <p className='text-sm text-foreground/40'>
            No payslips have been generated for you yet.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {payslips.map((slip) => (
            <Link
              key={slip.id}
              href={`/dashboard/payslips/${slip.id}`}
              className='flex items-center justify-between px-5 py-4 rounded-xl border border-primary/12 bg-[rgba(17,17,22,0.7)] hover:border-primary/25 transition-all group'
            >
              <div className='flex items-center gap-4'>
                <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all'>
                  <FileText className='w-5 h-5 text-primary opacity-70' />
                </div>
                <div>
                  <p className='font-semibold text-foreground text-sm group-hover:text-primary transition-colors'>
                    {MONTH_NAMES[slip.month]} {slip.year}
                  </p>
                  <p className='text-xs text-foreground/40 mt-0.5 uppercase tracking-wider font-semibold'>
                    {slip.status}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-6'>
                <div className='text-right'>
                  <p className='text-xs text-foreground/40'>Net Pay</p>
                  <p className='font-bold text-foreground'>{fmt(slip.netPayout)}</p>
                </div>
                <div className='p-2 hover:bg-white/5 rounded-lg transition-colors'>
                  <ArrowRight className='w-4 h-4 text-foreground/30 group-hover:text-foreground/60 transition-colors' />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
