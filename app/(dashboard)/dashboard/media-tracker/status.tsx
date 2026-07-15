export type MediaRecordStatus =
  | 'NOT_STARTED'
  | 'EDITING'
  | 'REVIEW'
  | 'PRODUCTION_READY'
  | 'DELIVERED';

export const STATUS_META: Record<
  MediaRecordStatus,
  { label: string; cls: string; dot: string }
> = {
  NOT_STARTED: {
    label: 'Not Started',
    cls: 'bg-slate-500/12 text-slate-400 border border-slate-500/25',
    dot: 'bg-slate-400',
  },
  EDITING: {
    label: 'Editing',
    cls: 'bg-blue-500/12 text-blue-400 border border-blue-500/25',
    dot: 'bg-blue-400',
  },
  REVIEW: {
    label: 'Review',
    cls: 'bg-amber-500/12 text-amber-400 border border-amber-500/25',
    dot: 'bg-amber-400',
  },
  PRODUCTION_READY: {
    label: 'Production Ready',
    cls: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  DELIVERED: {
    label: 'Delivered',
    cls: 'bg-violet-500/12 text-violet-400 border border-violet-500/25',
    dot: 'bg-violet-400',
  },
};

export function MediaStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_META[status as MediaRecordStatus] ?? {
    label: status,
    cls: 'bg-white/5 text-foreground/40 border border-white/10',
    dot: 'bg-foreground/40',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export const DEVICE_TYPE_LABEL: Record<string, string> = {
  HDD: 'HDD',
  SSD: 'SSD',
  CLOUD: 'Cloud',
};

/**
 * A record is "at risk" when its footage exists somewhere (primary set) but
 * neither backup slot holds a device — a single-copy data-loss hazard.
 * Works on the joined record shape returned by getMediaRecords/getMediaRecord.
 */
export function hasBackupRisk(record: {
  primary_storage?: unknown;
  original_backup?: unknown;
  backup_copy?: unknown;
}): boolean {
  return (
    !!record.primary_storage && !record.original_backup && !record.backup_copy
  );
}

export function NoBackupPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-500/12 text-red-400 border border-red-500/25 whitespace-nowrap">
      ⚠ No Backup
    </span>
  );
}

/**
 * True when nobody has ever saved this shoot's Content section — distinct
 * from a shoot confirmed to have zero photos/videos (content_logged_at set,
 * but counts genuinely 0). Works on the joined record shape.
 */
export function hasUnloggedContent(record: {
  content_logged_at?: string | null;
}): boolean {
  return !record.content_logged_at;
}

export function NotLoggedPill() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/12 text-amber-400 border border-amber-500/25 whitespace-nowrap">
      ⚠ Content Not Logged
    </span>
  );
}
