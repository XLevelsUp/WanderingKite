'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { istToday, type Reminder } from '@/lib/reminders';

// ── Role gate (pattern from actions/rental-policy.ts) ───────────────────────
async function requireAdminOrSuper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }
  return { supabase, user, role: profile.role };
}

// ── Validation ───────────────────────────────────────────────────────────────
const reminderSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    note: z.string().max(2000).optional().or(z.literal('')),
    recurrence: z.enum(['DAILY', 'MONTHLY', 'ONE_TIME']),
    dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
      .optional(),
    dueTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Invalid time')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((v, ctx) => {
    if (v.recurrence === 'MONTHLY' && !v.dayOfMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dayOfMonth'],
        message: 'Pick a day of the month',
      });
    }
    if (v.recurrence === 'ONE_TIME' && !v.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: 'Pick a date',
      });
    }
  });

export type ReminderInput = z.infer<typeof reminderSchema>;

type Result = { success: boolean; error?: string };

/** Maps validated input to a DB row, clearing fields that don't apply. */
function toRow(input: ReminderInput) {
  return {
    title: input.title,
    note: input.note || null,
    recurrence: input.recurrence,
    day_of_month: input.recurrence === 'MONTHLY' ? input.dayOfMonth : null,
    due_date: input.recurrence === 'ONE_TIME' ? input.dueDate : null,
    due_time: input.dueTime || null, // optional exact time (IST), any recurrence
  };
}

// ── Actions ──────────────────────────────────────────────────────────────────

export async function getMyReminders(): Promise<Reminder[]> {
  const { supabase, user } = await requireAdminOrSuper();

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch reminders', error);
    return [];
  }
  return (data ?? []) as Reminder[];
}

export async function createReminder(input: ReminderInput): Promise<Result> {
  try {
    const { supabase, user } = await requireAdminOrSuper();
    const parsed = reminderSchema.parse(input);

    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      ...toRow(parsed),
    });

    if (error) throw new Error(error.message);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    logger.error('createReminder failed', err);
    return { success: false, error: err?.errors?.[0]?.message || err?.message || 'Failed to create reminder' };
  }
}

export async function updateReminder(
  id: string,
  input: ReminderInput
): Promise<Result> {
  try {
    const { supabase, user } = await requireAdminOrSuper();
    const parsed = reminderSchema.parse(input);

    const { error } = await supabase
      .from('reminders')
      .update({ ...toRow(parsed), updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id); // belt & braces on top of RLS

    if (error) throw new Error(error.message);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    logger.error('updateReminder failed', err);
    return { success: false, error: err?.errors?.[0]?.message || err?.message || 'Failed to update reminder' };
  }
}

export async function deleteReminder(id: string): Promise<Result> {
  try {
    const { supabase, user } = await requireAdminOrSuper();

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    logger.error('deleteReminder failed', err);
    return { success: false, error: err?.message || 'Failed to delete reminder' };
  }
}

/**
 * Marks the given reminders as acknowledged for today (IST). One-time
 * reminders are additionally deactivated (completed).
 */
export async function acknowledgeReminders(ids: string[]): Promise<Result> {
  if (ids.length === 0) return { success: true };
  try {
    const { supabase, user } = await requireAdminOrSuper();
    const today = istToday().iso;

    const { error } = await supabase
      .from('reminders')
      .update({ last_acknowledged_on: today, updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    // Complete one-time reminders.
    const { error: completeError } = await supabase
      .from('reminders')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)
      .eq('recurrence', 'ONE_TIME');

    if (completeError) throw new Error(completeError.message);

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    logger.error('acknowledgeReminders failed', err);
    return { success: false, error: err?.message || 'Failed to acknowledge reminders' };
  }
}
