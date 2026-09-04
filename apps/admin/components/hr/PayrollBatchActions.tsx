'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveBatchPayroll, rejectBatchPayroll, markBatchPaid, deleteBatchPayroll } from '@/actions/hr/payroll';
import { CheckCircle, CreditCard, Loader2, XCircle, Trash2 } from 'lucide-react';
import type { PayrollStatus } from '@/lib/types/hr';
import { useNotifications } from '@/components/ui/useNotifications';

interface BatchActionsProps {
  month: number;
  year: number;
  allStatuses: PayrollStatus[];
  isSuperAdmin?: boolean;
}

export function PayrollBatchActions({ month, year, allStatuses, isSuperAdmin = false }: BatchActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showModal, removeModal } = useNotifications();

  const anyDraft = allStatuses.some((s) => s === 'DRAFT');
  const allApproved = allStatuses.every((s) => s === 'APPROVED');
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

  function handleRejectAll() {
    setError(null);
    startTransition(async () => {
      const res = await rejectBatchPayroll(month, year);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleDeleteAll() {
    const modalId = showModal({
      title: 'Delete Draft Batch',
      description: 'Are you sure you want to delete all draft payroll records for this month? This cannot be undone.',
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: () => {
        removeModal(modalId);
        setError(null);
        startTransition(async () => {
          const res = await deleteBatchPayroll(month, year);
          if (res.error) setError(res.error);
          else router.refresh();
        });
      }
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
      {anyDraft && (
        <>
          <button
            onClick={handleApproveAll}
            disabled={isPending}
            className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/12 border border-blue-500/25 text-sm font-semibold text-blue-300 hover:bg-blue-500/22 disabled:opacity-50 transition-all'
          >
            {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <CheckCircle className='h-4 w-4' />}
            Approve All
          </button>

          {isSuperAdmin && (
            <>
              <button
                onClick={handleRejectAll}
                disabled={isPending}
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/12 border border-amber-500/25 text-sm font-semibold text-amber-300 hover:bg-amber-500/22 disabled:opacity-50 transition-all'
              >
                {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <XCircle className='h-4 w-4' />}
                Reject All
              </button>

              <button
                onClick={handleDeleteAll}
                disabled={isPending}
                className='flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/12 border border-red-500/25 text-sm font-semibold text-red-300 hover:bg-red-500/22 disabled:opacity-50 transition-all'
              >
                {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
                Delete Draft Batch
              </button>
            </>
          )}
        </>
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

