'use client';

import { useTransition } from 'react';
import { quickReturnAction } from '@/actions/deployments';
import { CheckCircle, Loader2 } from 'lucide-react';

interface QuickReturnButtonProps {
  assignmentId: string;
  equipmentName: string;
}

export function QuickReturnButton({
  assignmentId,
  equipmentName,
}: QuickReturnButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleReturn() {
    startTransition(async () => {
      const result = await quickReturnAction(assignmentId);
      if (!result.success) {
        // Non-blocking — toast/alert could be added here
        console.error('[QuickReturn] Failed:', result.error);
      }
    });
  }

  return (
    <button
      onClick={handleReturn}
      disabled={isPending}
      title={`Mark ${equipmentName} as returned`}
      aria-label={`Quick return: ${equipmentName}`}
      className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
        hover:bg-emerald-500/20 hover:border-emerald-500/35 hover:text-emerald-300
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40'
    >
      {isPending ? (
        <>
          <Loader2 className='w-3.5 h-3.5 animate-spin' />
          Returning…
        </>
      ) : (
        <>
          <CheckCircle className='w-3.5 h-3.5' />
          Quick Return
        </>
      )}
    </button>
  );
}
