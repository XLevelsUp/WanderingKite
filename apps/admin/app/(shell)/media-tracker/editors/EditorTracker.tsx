'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowRight,
  Calendar,
  FileText,
  HardDrive,
  History,
  User,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaStatusBadge, DEVICE_TYPE_LABEL, STATUS_META, type MediaRecordStatus } from '../status';
import { updateAssignment } from '@/actions/media-tracker';
import { useRouter } from 'next/navigation';

interface EmployeeOption {
  id: string;
  fullName: string | null;
}

const NONE = 'none';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function personLabel(person: { fullName: string | null; email: string } | null) {
  if (!person) return 'Unassigned';
  return person.fullName ?? person.email;
}

function ReassignDialog({
  record,
  employees,
  open,
  onOpenChange,
}: {
  record: any;
  employees: EmployeeOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [toEmployee, setToEmployee] = useState(
    record.assigned_employee?.id ?? NONE
  );
  const [toStatus, setToStatus] = useState<MediaRecordStatus>(
    record.status as MediaRecordStatus
  );
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      await updateAssignment(record.id, {
        toEmployeeId: toEmployee !== NONE ? toEmployee : null,
        toStatus,
        note: note || undefined,
      });
      toast.success('Assignment updated');
      onOpenChange(false);
      setNote('');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update assignment');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>Reassign — {record.title}</DialogTitle>
          <DialogDescription>
            Changes are recorded in this shoot&apos;s history — who it moved
            from, to whom, and at which stage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assigned Editor</Label>
            <Select value={toEmployee} onValueChange={setToEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Unassigned</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.fullName ?? 'Unnamed'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stage</Label>
            <Select
              value={toStatus}
              onValueChange={(v) => setToStatus(v as MediaRecordStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_META) as MediaRecordStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-note">Note (optional)</Label>
            <Textarea
              id="assign-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Why this change, or anything the next person should know…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            data-no-track
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Read-only shoot summary — opens in-place instead of navigating to the
 * full detail page, so staff never leave the Editor Tracker. */
function ViewShootDialog({
  record,
  open,
  onOpenChange,
}: {
  record: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record.title}</DialogTitle>
          <DialogDescription>
            {record.client?.name ?? 'No client'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <MediaStatusBadge status={record.status} />
            <span className="flex items-center gap-1 text-slate-500">
              <User className="h-3.5 w-3.5" />
              {personLabel(record.assigned_employee)}
            </span>
          </div>
          {record.shoot_date && (
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(record.shoot_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
          {record.category && (
            <div className="flex items-center gap-2 text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              {record.category}
            </div>
          )}
          {record.folder_path && (
            <div className="flex items-center gap-2 text-slate-400 break-all font-mono text-xs">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              {record.folder_path}
            </div>
          )}
          {record.primary_storage && (
            <div className="flex items-center gap-2 text-slate-400">
              <HardDrive className="h-3.5 w-3.5" />
              {record.primary_storage.label}{' '}
              <span className="text-slate-500">
                ({DEVICE_TYPE_LABEL[record.primary_storage.type] ??
                  record.primary_storage.type})
              </span>
            </div>
          )}
          {record.notes && (
            <p className="rounded-lg border border-border p-3 text-slate-400">
              {record.notes}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoryList({ entries }: { entries: any[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No assignment changes recorded yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((h) => (
        <li key={h.id} className="rounded-xl border border-border p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              {personLabel(h.from_employee)}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            <span className="flex items-center gap-1.5 font-medium">
              <User className="h-3.5 w-3.5 text-slate-500" />
              {personLabel(h.to_employee)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <MediaStatusBadge status={h.from_status} />
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <MediaStatusBadge status={h.to_status} />
          </div>
          {h.notes && <p className="mt-1.5 text-xs text-slate-400">{h.notes}</p>}
          <p className="mt-1.5 text-xs text-slate-500">
            {formatDate(h.created_at)}
            {h.changed_by_employee && ` · by ${personLabel(h.changed_by_employee)}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** Whole history for ONE shoot, condensed into a single box — the full
 * editor chain and stage chain rendered left-to-right (oldest first),
 * instead of one box per transition. */
function ShootHistoryChain({ entries }: { entries: any[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No assignment changes recorded yet.
      </p>
    );
  }

  // Entries arrive newest-first; walk oldest -> newest for a left-to-right chain.
  const chronological = [...entries].reverse();
  const first = chronological[0];

  return (
    <div className="rounded-xl border border-border p-4 text-sm space-y-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Editor
        </span>
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-slate-500" />
          {personLabel(first.from_employee)}
        </span>
        {chronological.map((h) => (
          <span key={`emp-${h.id}`} className="flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            <User className="h-3.5 w-3.5 text-slate-500" />
            {personLabel(h.to_employee)}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Stage
        </span>
        <MediaStatusBadge status={first.from_status} />
        {chronological.map((h) => (
          <span key={`status-${h.id}`} className="flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            <MediaStatusBadge status={h.to_status} />
          </span>
        ))}
      </div>

      {(() => {
        const latest = chronological[chronological.length - 1];
        return (
          <p className="border-t border-border pt-3 text-xs text-slate-500">
            Last updated {formatDate(latest.created_at)}
            {latest.changed_by_employee &&
              ` · by ${personLabel(latest.changed_by_employee)}`}
            {latest.notes && ` — ${latest.notes}`}
          </p>
        );
      })()}
    </div>
  );
}

export function EditorTracker({
  records,
  employees,
  history,
  isEmployee,
  initialRecordId,
}: {
  records: any[];
  employees: EmployeeOption[];
  history: any[];
  isEmployee: boolean;
  initialRecordId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialRecordId);
  const [reassignTarget, setReassignTarget] = useState<any | null>(null);
  const [viewTarget, setViewTarget] = useState<any | null>(null);

  const selectedRecord = records.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Shoot list — each item expands its own history directly beneath it */}
      <div className="rounded-2xl border border-border bg-card">
        <p className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Shoots ({records.length})
        </p>
        <div className="divide-y divide-border">
          {records.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No media records yet.
            </p>
          ) : (
            records.map((r) => {
              const isSelected = r.id === selectedId;
              const recordHistory = history.filter(
                (h) => h.media_record_id === r.id
              );
              return (
                <div key={r.id}>
                  <button
                    onClick={() => setSelectedId(isSelected ? null : r.id)}
                    className={`flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {r.title}
                      </span>
                      <MediaStatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        {personLabel(r.assigned_employee)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewTarget(r);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400 hover:text-foreground hover:bg-accent"
                        >
                          View
                        </span>
                        {!isEmployee && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReassignTarget(r);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400 hover:text-foreground hover:bg-accent"
                          >
                            <UserCog className="h-3 w-3" />
                            Reassign
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="bg-background/40 px-4 pb-4 pt-1">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <History className="h-3.5 w-3.5" />
                          History
                        </p>
                        {!isEmployee && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReassignTarget(r)}
                          >
                            <UserCog className="h-3.5 w-3.5 mr-1.5" />
                            Reassign
                          </Button>
                        )}
                      </div>
                      <ShootHistoryChain entries={recordHistory} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Changes across all shoots — shown when nothing is selected */}
      {!selectedRecord && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-slate-500" />
            Recent Changes
          </p>
          <HistoryList entries={history} />
        </div>
      )}

      {reassignTarget && (
        <ReassignDialog
          record={reassignTarget}
          employees={employees}
          open={!!reassignTarget}
          onOpenChange={(open) => {
            if (!open) setReassignTarget(null);
          }}
        />
      )}

      {viewTarget && (
        <ViewShootDialog
          record={viewTarget}
          open={!!viewTarget}
          onOpenChange={(open) => {
            if (!open) setViewTarget(null);
          }}
        />
      )}
    </div>
  );
}
