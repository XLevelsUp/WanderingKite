/**
 * Reminder types and due-date logic.
 *
 * "Today" is always computed in IST (Asia/Kolkata) — the business timezone —
 * so a reminder's day flips at midnight IST regardless of server region.
 *
 * Recurrence semantics:
 *   DAILY    → due every day.
 *   MONTHLY  → due on `day_of_month`, clamped to the last day of shorter
 *              months (day 31 fires on Feb 28/29, Apr 30, ... — never skips).
 *   ONE_TIME → due on `due_date`; if missed it STAYS due until acknowledged,
 *              then is deactivated (completed).
 */

export type ReminderRecurrence = 'DAILY' | 'MONTHLY' | 'ONE_TIME';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  recurrence: ReminderRecurrence;
  day_of_month: number | null;
  due_date: string | null; // YYYY-MM-DD
  due_time: string | null; // HH:MM or HH:MM:SS (IST); null = any time of day
  is_active: boolean;
  last_acknowledged_on: string | null; // YYYY-MM-DD (IST calendar date)
  created_at: string;
  updated_at: string;
}

export interface IstToday {
  iso: string; // YYYY-MM-DD
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  daysInMonth: number;
}

/** Current calendar date in IST. en-CA locale formats as YYYY-MM-DD. */
export function istToday(): IstToday {
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
  const [year, month, day] = iso.split('-').map(Number);
  // new Date(y, m, 0) = last day of month m (1-indexed here)
  const daysInMonth = new Date(year, month, 0).getDate();
  return { iso, year, month, day, daysInMonth };
}

export function isDueToday(r: Reminder, today: IstToday = istToday()): boolean {
  if (!r.is_active) return false;
  switch (r.recurrence) {
    case 'DAILY':
      return true;
    case 'MONTHLY':
      if (!r.day_of_month) return false;
      // Clamp: day 31 fires on the LAST day of short months, never skips.
      return today.day === Math.min(r.day_of_month, today.daysInMonth);
    case 'ONE_TIME':
      // Stays due if missed (<=) until acknowledged.
      return !!r.due_date && r.due_date <= today.iso;
    default:
      return false;
  }
}

export function isUnacknowledgedToday(
  r: Reminder,
  today: IstToday = istToday()
): boolean {
  return (
    isDueToday(r, today) &&
    (!r.last_acknowledged_on || r.last_acknowledged_on < today.iso)
  );
}

/** Current IST wall-clock time as "HH:MM" (24h). */
export function istNowTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

/**
 * Whether a due-today reminder is READY to pop right now: either it has no
 * due_time, or the IST clock has reached it. (Day-level dueness is checked
 * separately via isUnacknowledgedToday.)
 */
export function isReadyAtTime(r: Reminder, nowHHMM: string = istNowTime()): boolean {
  if (!r.due_time) return true;
  return r.due_time.slice(0, 5) <= nowHHMM;
}

/** "4:00 PM" display for a HH:MM[:SS] time string. */
export function formatDueTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Human label for the widget list, e.g. "Every day · 10:00 AM". */
export function nextDueLabel(r: Reminder): string {
  const timeSuffix = r.due_time ? ` · ${formatDueTime(r.due_time)}` : '';
  switch (r.recurrence) {
    case 'DAILY':
      return `Every day${timeSuffix}`;
    case 'MONTHLY':
      return `Monthly · day ${r.day_of_month}${timeSuffix}`;
    case 'ONE_TIME': {
      if (!r.due_date) return 'One-time';
      const [y, m, d] = r.due_date.split('-').map(Number);
      const label = new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `On ${label}${timeSuffix}`;
    }
    default:
      return '';
  }
}
