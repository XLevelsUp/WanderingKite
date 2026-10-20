import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-6 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all hover:scale-105 duration-200"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
