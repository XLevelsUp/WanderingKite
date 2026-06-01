'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBatchPayroll } from '@/actions/hr/payroll';
import { Loader2 } from 'lucide-react';

interface ClearBatchButtonProps {
  month: number;
  year: number;
  monthName: string;
}

export function ClearBatchButton({ month, year, monthName }: ClearBatchButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(`Are you sure you want to clear the entire draft batch for ${monthName} ${year}? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteBatchPayroll(month, year);
      if (res && 'error' in res && res.error) {
        alert(res.error);
      } else {
        router.refresh();
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
