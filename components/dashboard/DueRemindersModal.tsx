'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CalendarClock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { acknowledgeReminders } from '@/actions/reminders';
import {
  isReadyAtTime,
  istNowTime,
  nextDueLabel,
  type Reminder,
} from '@/lib/reminders';

const RECURRENCE_BADGE: Record<Reminder['recurrence'], string> = {
  DAILY: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  MONTHLY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ONE_TIME: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const RECURRENCE_LABEL: Record<Reminder['recurrence'], string> = {
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  ONE_TIME: 'One-time',
};

/** Ms until the next IST minute where an upcoming reminder becomes ready. */
function msUntilNextDue(upcoming: Reminder[]): number | null {
  if (upcoming.length === 0) return null;
  const now = istNowTime(); // "HH:MM"
  const times = upcoming
    .map((r) => r.due_time!.slice(0, 5))
    .filter((t) => t > now)
    .sort();
  if (times.length === 0) return 500; // already due — re-check immediately
  const [nh, nm] = now.split(':').map(Number);
  const [th, tm] = times[0].split(':').map(Number);
  // +2s cushion so the check lands just after the minute flips
  return ((th - nh) * 60 + (tm - nm)) * 60_000 + 2_000;
}

/**
 * Pops up when the admin has due, unacknowledged reminders (IST day).
 * Props receive ALL of today's unacknowledged reminders; this component
 * gates them by due_time:
 *   - no time / time passed → shown immediately on load,
 *   - future time → a timer fires the popup at that exact minute while the
 *     dashboard stays open.
 * Dismissing acknowledges ONLY the reminders currently shown, so a later
 * timed reminder still pops at its own time.
 */
export function DueRemindersModal({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  // Local ack log so a dismissed batch can't re-show before refresh lands.
  const [ackedIds, setAckedIds] = useState<Set<string>>(new Set());
  // Clock tick — bumped by the timer to re-evaluate readiness.
  const [, setTick] = useState(0);
  const busyRef = useRef(false);

  const pending = useMemo(
    () => reminders.filter((r) => !ackedIds.has(r.id)),
    [reminders, ackedIds]
  );
  const now = istNowTime();
  const ready = pending.filter((r) => isReadyAtTime(r, now));
  const upcoming = pending.filter((r) => !isReadyAtTime(r, now));

  const [open, setOpen] = useState(ready.length > 0);

  // Re-open when a timed reminder becomes ready.
  useEffect(() => {
    if (ready.length > 0) setOpen(true);
  }, [ready.length]);

  // Arm a timer for the next upcoming due_time (exact-minute popup).
  useEffect(() => {
    const ms = msUntilNextDue(upcoming);
    if (ms === null) return;
    const t = setTimeout(() => setTick((n) => n + 1), ms);
    return () => clearTimeout(t);
  }, [upcoming.map((r) => r.id).join(','), now.slice(0, 5)]); // eslint-disable-line react-hooks/exhaustive-deps

  const acknowledgeShown = async () => {
    if (busyRef.current || ready.length === 0) return;
    busyRef.current = true;
    const ids = ready.map((r) => r.id);
    setAckedIds((prev) => new Set([...prev, ...ids]));
    await acknowledgeReminders(ids);
    busyRef.current = false;
    router.refresh();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) void acknowledgeShown();
  };

  if (ready.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15">
              <Bell className="h-4 w-4 text-amber-400" />
            </span>
            Reminder{ready.length > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {ready.length} reminder{ready.length > 1 ? 's' : ''} due now.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {ready.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 break-words text-sm font-semibold text-white">
                  {r.title}
                </p>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RECURRENCE_BADGE[r.recurrence]}`}
                >
                  {RECURRENCE_LABEL[r.recurrence]}
                </span>
              </div>
              {r.note && (
                <p className="mt-1 break-words text-xs text-slate-400">{r.note}</p>
              )}
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                <CalendarClock className="h-3 w-3" />
                {nextDueLabel(r)}
              </p>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button
            onClick={() => handleOpenChange(false)}
            className="w-full bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400 sm:w-auto"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
