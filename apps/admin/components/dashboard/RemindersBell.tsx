'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createReminder,
  updateReminder,
  deleteReminder,
  type ReminderInput,
} from '@/actions/reminders';
import {
  isUnacknowledgedToday,
  nextDueLabel,
  type Reminder,
  type ReminderRecurrence,
} from '@/lib/reminders';

const RECURRENCE_BADGE: Record<ReminderRecurrence, string> = {
  DAILY: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  MONTHLY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ONE_TIME: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const RECURRENCE_LABEL: Record<ReminderRecurrence, string> = {
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  ONE_TIME: 'One-time',
};

interface FormState {
  title: string;
  note: string;
  recurrence: ReminderRecurrence;
  dayOfMonth: string;
  dueDate: string;
  dueTime: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  note: '',
  recurrence: 'DAILY',
  dayOfMonth: '',
  dueDate: '',
  dueTime: '',
};

/**
 * Top-right reminders control — mirrors NotificationBell's trigger + dropdown
 * pattern. Badge shows total active reminders; due-today items are
 * highlighted amber inside the panel. Create/edit/delete happen in dialogs
 * launched from the panel.
 */
export function RemindersBell({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<Reminder | null>(null);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  const dueCount = reminders.filter((r) => isUnacknowledgedToday(r)).length;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (r: Reminder) => {
    setEditing(r);
    setForm({
      title: r.title,
      note: r.note ?? '',
      recurrence: r.recurrence,
      dayOfMonth: r.day_of_month ? String(r.day_of_month) : '',
      dueDate: r.due_date ?? '',
      dueTime: r.due_time ? r.due_time.slice(0, 5) : '',
    });
    setEditorOpen(true);
  };

  const handleSave = async () => {
    const input: ReminderInput = {
      title: form.title,
      note: form.note,
      recurrence: form.recurrence,
      dayOfMonth: form.dayOfMonth ? Number(form.dayOfMonth) : undefined,
      dueDate: form.dueDate || undefined,
      dueTime: form.dueTime || undefined,
    };
    setBusy(true);
    const result = editing
      ? await updateReminder(editing.id, input)
      : await createReminder(input);
    setBusy(false);

    if (!result.success) {
      toast.error(result.error || 'Something went wrong');
      return;
    }
    toast.success(editing ? 'Reminder updated' : 'Reminder created');
    setEditorOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    const result = await deleteReminder(deleting.id);
    setBusy(false);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete reminder');
      return;
    }
    toast.success('Reminder deleted');
    setDeleting(null);
    router.refresh();
  };

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        onClick={() => setPanelOpen((o) => !o)}
        aria-label="My reminders"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-300 transition-colors hover:border-amber-500/30 hover:text-amber-400"
      >
        <BellRing className="h-5 w-5" />
        {reminders.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
              dueCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {reminders.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 max-h-96 w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl sm:w-80"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 p-3 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                My Reminders
              </span>
              <Button
                size="sm"
                onClick={openCreate}
                className="h-7 bg-amber-500 px-2 text-[11px] font-semibold text-slate-950 hover:bg-amber-400"
              >
                <Plus className="mr-1 h-3 w-3" />
                New
              </Button>
            </div>

            <div className="space-y-1.5 p-2">
              {reminders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No reminders yet. Create one to get a popup on its due day.
                </div>
              ) : (
                reminders.map((r) => {
                  const due = isUnacknowledgedToday(r);
                  return (
                    <div
                      key={r.id}
                      className={`rounded-xl border p-3 transition-colors ${
                        due
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-white">
                              {r.title}
                            </p>
                            <span
                              className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${RECURRENCE_BADGE[r.recurrence]}`}
                            >
                              {RECURRENCE_LABEL[r.recurrence]}
                            </span>
                            {due && (
                              <span className="shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-slate-950">
                                Due
                              </span>
                            )}
                          </div>
                          {r.note && (
                            <p className="mt-0.5 truncate text-[10px] text-slate-400">
                              {r.note}
                            </p>
                          )}
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                            <CalendarClock className="h-2.5 w-2.5" />
                            {nextDueLabel(r)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            onClick={() => openEdit(r)}
                            aria-label={`Edit reminder: ${r.title}`}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleting(r)}
                            aria-label={`Delete reminder: ${r.title}`}
                            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? 'Edit Reminder' : 'New Reminder'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              You&apos;ll get a popup on the dashboard when it&apos;s due.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title" className="text-slate-300">
                Title
              </Label>
              <Input
                id="reminder-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Pay studio rent"
                className="border-slate-800 bg-slate-950/40 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-note" className="text-slate-300">
                Note <span className="text-slate-500">(optional)</span>
              </Label>
              <Textarea
                id="reminder-note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
                placeholder="Any details…"
                className="border-slate-800 bg-slate-950/40 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Repeats</Label>
              <Select
                value={form.recurrence}
                onValueChange={(v) =>
                  setForm({ ...form, recurrence: v as ReminderRecurrence })
                }
              >
                <SelectTrigger className="border-slate-800 bg-slate-950/40 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white">
                  <SelectItem value="DAILY">Daily — every day</SelectItem>
                  <SelectItem value="MONTHLY">
                    Monthly — a day each month
                  </SelectItem>
                  <SelectItem value="ONE_TIME">
                    One-time — a specific date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.recurrence === 'MONTHLY' && (
              <div className="space-y-2">
                <Label htmlFor="reminder-day" className="text-slate-300">
                  Day of month (1–31)
                </Label>
                <Input
                  id="reminder-day"
                  type="number"
                  min={1}
                  max={31}
                  value={form.dayOfMonth}
                  onChange={(e) =>
                    setForm({ ...form, dayOfMonth: e.target.value })
                  }
                  placeholder="e.g. 5"
                  className="border-slate-800 bg-slate-950/40 text-white"
                />
                <p className="text-xs text-slate-500">
                  Fires on the last day of shorter months (e.g. day 31 → Feb 28).
                </p>
              </div>
            )}

            {form.recurrence === 'ONE_TIME' && (
              <div className="space-y-2">
                <Label htmlFor="reminder-date" className="text-slate-300">
                  Date
                </Label>
                <Input
                  id="reminder-date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="border-slate-800 bg-slate-950/40 text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="text-slate-300">
                Time <span className="text-slate-500">(optional, IST)</span>
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                className="border-slate-800 bg-slate-950/40 text-white"
              />
              <p className="text-xs text-slate-500">
                With a time, the popup fires at that exact minute while the
                dashboard is open — or as soon as you next open it. Without a
                time, it fires on your first visit of the day.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditorOpen(false)}
              disabled={busy}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={busy}
              className="bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
            >
              {busy ? 'Saving…' : editing ? 'Save Changes' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete reminder?</DialogTitle>
            <DialogDescription className="text-slate-400">
              &ldquo;{deleting?.title}&rdquo; will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={busy}
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={busy}
              className="bg-rose-600 font-semibold text-white hover:bg-rose-500"
            >
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
