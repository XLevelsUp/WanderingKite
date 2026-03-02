import { type AssignmentStatus } from '@/lib/types/deployments';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AssignmentStatus;
  isOverdue?: boolean;
}

const CONFIG = {
  in_field: {
    label: 'In Field',
    className:
      'bg-blue-500/12 text-blue-400 border border-blue-500/25 ring-1 ring-inset ring-blue-500/10',
  },
  returned: {
    label: 'Returned',
    className:
      'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 ring-1 ring-inset ring-emerald-500/10',
  },
  maintenance: {
    label: 'Maintenance',
    className:
      'bg-red-500/12 text-red-400 border border-red-500/25 ring-1 ring-inset ring-red-500/10',
  },
  overdue: {
    label: 'Overdue',
    className:
      'bg-amber-500/12 text-amber-400 border border-amber-500/25 ring-1 ring-inset ring-amber-500/10',
  },
} as const;

export function StatusBadge({ status, isOverdue = false }: StatusBadgeProps) {
  const key = isOverdue && status === 'in_field' ? 'overdue' : status;
  const { label, className } = CONFIG[key];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tabular-nums tracking-wide',
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          key === 'in_field' && 'bg-blue-400',
          key === 'overdue' && 'bg-amber-400 animate-pulse',
          key === 'returned' && 'bg-emerald-400',
          key === 'maintenance' && 'bg-red-400',
        )}
      />
      {label}
    </span>
  );
}
