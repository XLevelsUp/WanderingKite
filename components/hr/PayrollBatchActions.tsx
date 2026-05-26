'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveBatchPayroll, markBatchPaid } from '@/actions/hr/payroll';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import type { PayrollStatus } from '@/lib/types/hr';

interface BatchActionsProps {
  month: number;
  year: number;
  allStatuses: PayrollStatus[];
}

export function PayrollBatchActions({ month, year, allStatuses }: BatchActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allDraft = allStatuses.every((s) => s === 'DRAFT');
  const allApproved = allStatuses.every((s) => s === 'APPROVED');
  const anyApproved = allStatuses.some((s) => s === 'APPROVED');
  const allPaid = allStatuses.every((s) => s === 'PAID');

  if (allPaid) return null;

  function handleApproveAll() {
    setError(null);
    startTransition(async () => {
      const res = await approveBatchPayroll(month, year);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handlePaidAll() {
    const ref = window.prompt('Payment reference for batch (optional):', '');
    if (ref === null) return;
    setError(null);
    startTransition(async () => {
      const res = await markBatchPaid(month, year);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {(allDraft || anyApproved) && !allApproved && !allPaid && (
        <button
          onClick={handleApproveAll}
          disabled={isPending}
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/12 border border-blue-500/25 text-sm font-semibold text-blue-300 hover:bg-blue-500/22 disabled:opacity-50 transition-all'
        >
          {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <CheckCircle className='h-4 w-4' />}
          Approve All
        </button>
      )}

      {allApproved && (
        <button
          onClick={handlePaidAll}
          disabled={isPending}
          className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/22 disabled:opacity-50 transition-all'
        >
          {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <CreditCard className='h-4 w-4' />}
          Mark All Paid
        </button>
      )}

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  );
}
