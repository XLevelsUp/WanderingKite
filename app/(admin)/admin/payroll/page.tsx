import { getPayrollMonths } from '@/actions/hr/payroll';
import { GeneratePayrollForm } from '@/components/hr/GeneratePayrollForm';
import { ClearBatchButton } from '@/components/hr/ClearBatchButton';
import { DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Payroll — Admin' };

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_PRIORITY: Record<string, number> = {
  DRAFT: 0,
  APPROVED: 1,
  PAID: 2,
};

function getBatchStatus(statuses: string[]) {
  if (statuses.every((s) => s === 'PAID')) return 'PAID';
  if (statuses.every((s) => s === 'APPROVED' || s === 'PAID')) return 'APPROVED';
  return 'DRAFT';
}

const BATCH_BADGE: Record<string, string> = {
  DRAFT: 'bg-white/8 text-foreground/50 border border-white/12',
  APPROVED: 'bg-blue-500/12 text-blue-400 border border-blue-500/25',
  PAID: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
};

export default async function PayrollPage() {
  const batches = await getPayrollMonths();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isSuperAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'SUPER_ADMIN') isSuperAdmin = true;
  }

  return (
    <div className='p-6 md:p-8 space-y-8 max-w-5xl mx-auto'>
      {/* Header */}
      <div>
        <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-75 mb-1 flex items-center gap-2'>
          <DollarSign className='w-3 h-3' />
          HR Management
        </p>
        <h1 className='text-3xl font-bold text-foreground tracking-tight'>
          Payroll
        </h1>
        <p className='text-sm text-foreground/45 mt-1'>
          Generate and manage monthly payroll for all employees.
        </p>
      </div>

      {/* Generate form */}
      <GeneratePayrollForm />

      {/* Batch list */}
      {batches.length > 0 && (
        <div>
          <h2 className='text-base font-semibold text-foreground mb-4'>
            Payroll History
          </h2>
          <div className='space-y-2'>
            {batches.map((batch) => {
              const batchStatus = getBatchStatus(batch.statuses);
              const badgeCls = BATCH_BADGE[batchStatus];
              const total = batch.statuses.length;
              const paid = batch.statuses.filter((s) => s === 'PAID').length;
              const approved = batch.statuses.filter((s) => s === 'APPROVED').length;

              return (
                <div
                  key={`${batch.year}-${batch.month}`}
                  className='flex items-center justify-between px-5 py-4 rounded-xl border border-primary/12 bg-[rgba(17,17,22,0.7)] hover:border-primary/25 transition-all flex-row'
                >
                  <Link
                    href={`/admin/payroll/${batch.year}-${String(batch.month).padStart(2, '0')}`}
                    className='flex items-center gap-4 flex-1 min-w-0 group'
                  >
                    <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all'>
                      <DollarSign className='w-5 h-5 text-primary opacity-70' />
                    </div>
                    <div className='min-w-0'>
                      <p className='font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate'>
                        {MONTH_NAMES[batch.month]} {batch.year}
                      </p>
                      <p className='text-xs text-foreground/40 mt-0.5'>
                        {paid}/{total} paid
                        {approved > 0 && `, ${approved} approved`}
                      </p>
                    </div>
                  </Link>

                  <div className='flex items-center gap-3.5 flex-shrink-0 ml-4'>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeCls}`}>
                      {batchStatus}
                    </span>

                    {batchStatus !== 'PAID' && (
                      <ClearBatchButton
                        month={batch.month}
                        year={batch.year}
                        monthName={MONTH_NAMES[batch.month]}
                        isSuperAdmin={isSuperAdmin}
                      />
                    )}

                    <Link
                      href={`/admin/payroll/${batch.year}-${String(batch.month).padStart(2, '0')}`}
                      className='p-1.5 hover:bg-white/5 rounded-lg transition-colors group'
                    >
                      <ArrowRight className='w-4 h-4 text-foreground/30 group-hover:text-foreground/60 transition-colors' />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
