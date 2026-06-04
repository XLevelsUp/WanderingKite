'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBatchPayroll } from '@/actions/hr/payroll';
import { Loader2 } from 'lucide-react';
import { useNotifications } from '@/components/ui/useNotifications';

interface ClearBatchButtonProps {
  month: number;
  year: number;
  monthName: string;
  isSuperAdmin?: boolean;
}

export function ClearBatchButton({ month, year, monthName, isSuperAdmin = false }: ClearBatchButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showModal, removeModal } = useNotifications();

  if (!isSuperAdmin) return null;

  function handleClick() {
    const modalId = showModal({
      title: 'Clear Draft Batch',
      description: `Are you sure you want to clear the entire draft batch for ${monthName} ${year}? This action cannot be undone.`,
      confirmText: 'Clear Batch',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: () => {
        startTransition(async () => {
          const res = await deleteBatchPayroll(month, year);
          if (res && 'error' in res && res.error) {
            alert(res.error);
          } else {
            router.refresh();
          }
        });
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className='px-3.5 py-1.5 rounded-xl bg-red-500/12 border border-red-500/25 hover:bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 inline-flex items-center gap-1'
      title="Delete Draft Batch"
    >
      {isPending && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
      Clear
    </button>
  );
}
