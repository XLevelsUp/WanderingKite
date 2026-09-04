'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarClock, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  const now = istNowTime();
  const times = upcoming
    .map((r) => r.due_time!.slice(0, 5))
    .filter((t) => t > now)
    .sort();
  if (times.length === 0) return 500;
  const [nh, nm] = now.split(':').map(Number);
  const [th, tm] = times[0].split(':').map(Number);
  return ((th - nh) * 60 + (tm - nm)) * 60_000 + 2_000;
}

/**
 * Non-blocking top-centre banner that persists across navigation.
 *
 * Each reminder has its own "Got it" button with a per-reminder confirmation.
 * The × header button dismisses ALL remaining reminders (with its own confirm).
 */
export function DueRemindersBanner({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [ackedIds, setAckedIds] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);
  // null = closed | 'all' = dismiss-all confirm | reminder id = per-item confirm
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const busyRef = useRef(false);

  const pending = useMemo(
    () => reminders.filter((r) => !ackedIds.has(r.id)),
    [reminders, ackedIds],
  );

  const now = istNowTime();
  const ready = pending.filter((r) => isReadyAtTime(r, now));
  const upcoming = pending.filter((r) => !isReadyAtTime(r, now));

  const [visible, setVisible] = useState(ready.length > 0);

  useEffect(() => {
    if (ready.length > 0) setVisible(true);
  }, [ready.length]);

  useEffect(() => {
    const ms = msUntilNextDue(upcoming);
    if (ms === null) return;
    const t = setTimeout(() => setTick((n) => n + 1), ms);
    return () => clearTimeout(t);
  }, [upcoming.map((r) => r.id).join(','), now.slice(0, 5)]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Acknowledge a specific set of ids, update local state & refresh. */
  const ackIds = async (ids: string[]) => {
    if (busyRef.current || ids.length === 0) return;
    busyRef.current = true;
    setAckedIds((prev) => new Set([...prev, ...ids]));
    await acknowledgeReminders(ids);
    busyRef.current = false;
    router.refresh();
  };

  /** Confirm clicked for a single reminder */
  const handleAckOne = async () => {
    if (!confirmTarget || confirmTarget === 'all') return;
    await ackIds([confirmTarget]);
    setConfirmTarget(null);
  };

  /** Confirm clicked for dismiss-all */
  const handleAckAll = async () => {
    await ackIds(ready.map((r) => r.id));
    setVisible(false);
    setConfirmTarget(null);
  };

  // Derive the reminder being confirmed for single-item dialog
  const confirmingReminder =
    confirmTarget && confirmTarget !== 'all'
      ? ready.find((r) => r.id === confirmTarget) ?? null
      : null;

  if (ready.length === 0) return null;

  return (
    <>
      {/* ── Non-blocking top-centre banner ───────────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="due-banner"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed top-4 left-1/2 z-[300] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 pointer-events-auto"
          >
            <div className="rounded-2xl border border-amber-500/25 bg-slate-900/95 shadow-2xl shadow-amber-500/5 backdrop-blur-xl ring-1 ring-white/5 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
                    <Bell className="h-3.5 w-3.5 text-amber-400" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">
                      {ready.length} Reminder{ready.length > 1 ? 's' : ''} Due
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Acknowledge each one individually below.
                    </p>
                  </div>
                </div>
                {/* Dismiss ALL button */}
                <button
                  onClick={() => setConfirmTarget('all')}
                  aria-label="Dismiss all reminders"
                  className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Per-reminder rows */}
              <ul className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                {ready.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 px-4 py-3">
                    {/* Reminder info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-semibold text-white">
                          {r.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RECURRENCE_BADGE[r.recurrence]}`}
                        >
                          {RECURRENCE_LABEL[r.recurrence]}
                        </span>
                      </div>
                      {r.note && (
                        <p className="mt-0.5 text-xs text-slate-400 break-words">{r.note}</p>
                      )}
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <CalendarClock className="h-3 w-3 shrink-0" />
                        {nextDueLabel(r)}
                      </p>
                    </div>

                    {/* Per-reminder "Got it" */}
                    <button
                      onClick={() => setConfirmTarget(r.id)}
                      aria-label={`Got it — ${r.title}`}
                      className="shrink-0 flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors mt-0.5"
                    >
                      <Check className="h-3 w-3" />
                      Got it
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Per-reminder confirm dialog ──────────────────────────────────── */}
      <Dialog
        open={!!confirmingReminder}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
      >
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </span>
              Acknowledge Reminder?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Mark &ldquo;{confirmingReminder?.title}&rdquo; as done for today?
              You won&apos;t be reminded again until the next due cycle.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmTarget(null)}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Keep Visible
            </Button>
            <Button
              onClick={handleAckOne}
              className="bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
            >
              Yes, Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dismiss-all confirm dialog ───────────────────────────────────── */}
      <Dialog
        open={confirmTarget === 'all'}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
      >
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15">
                <Bell className="h-3.5 w-3.5 text-amber-400" />
              </span>
              Dismiss All Reminders?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This will mark all {ready.length} reminder
              {ready.length > 1 ? 's' : ''} as acknowledged for today.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmTarget(null)}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Keep Visible
            </Button>
            <Button
              onClick={handleAckAll}
              className="bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
            >
              Yes, Dismiss All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
