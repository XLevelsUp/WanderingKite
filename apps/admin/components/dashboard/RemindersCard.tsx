'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BellRing, CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

export function RemindersCard({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<Reminder | null>(null);
  const [busy, setBusy] = useState(false);

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
    <>
      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <BellRing className="h-5 w-5 text-amber-400" />
              My Reminders
            </CardTitle>
            <CardDescription className="mt-1">
              Daily, monthly or one-time — pops up when due.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openCreate}
            className="shrink-0 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
          >
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No reminders yet. Create one to get a popup on its due day.
            </p>
          ) : (
            <ul className="space-y-3">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold text-white">
                        {r.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RECURRENCE_BADGE[r.recurrence]}`}
                      >
                        {RECURRENCE_LABEL[r.recurrence]}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {r.note}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                      <CalendarClock className="h-3 w-3" />
                      {nextDueLabel(r)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => openEdit(r)}
                      aria-label={`Edit reminder: ${r.title}`}
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleting(r)}
                      aria-label={`Delete reminder: ${r.title}`}
                      className="rounded-md p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
