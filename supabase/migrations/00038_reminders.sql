-- ═══════════════════════════════════════════════════════════════════════════
-- REMINDERS — personal reminders for ADMIN / SUPER_ADMIN dashboard users.
-- Each reminder is private to its creator (user_id = auth.uid()).
-- Recurrence: DAILY (every day), MONTHLY (day_of_month, clamped to short
-- months in app logic), ONE_TIME (due_date; deactivated after acknowledgment).
-- due_time (optional, IST) delays the popup until that time of day; without
-- it the reminder fires on first dashboard visit of the due day.
-- last_acknowledged_on stores the IST calendar date of the last dismissal so
-- the due-popup never re-appears on the same day.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create the reminders table
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    note TEXT,
    recurrence TEXT NOT NULL CHECK (recurrence IN ('DAILY', 'MONTHLY', 'ONE_TIME')),
    day_of_month SMALLINT CHECK (day_of_month BETWEEN 1 AND 31),
    due_date DATE,
    due_time TIME,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_acknowledged_on DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT reminders_monthly_needs_day
        CHECK (recurrence <> 'MONTHLY' OR day_of_month IS NOT NULL),
    CONSTRAINT reminders_one_time_needs_date
        CHECK (recurrence <> 'ONE_TIME' OR due_date IS NOT NULL)
);

CREATE INDEX reminders_user_id_idx ON public.reminders(user_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies — owner-only access, restricted to ADMIN / SUPER_ADMIN roles
CREATE POLICY "Admins can view own reminders"
ON public.reminders FOR SELECT
USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can create own reminders"
ON public.reminders FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can update own reminders"
ON public.reminders FOR UPDATE
USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
)
WITH CHECK (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can delete own reminders"
ON public.reminders FOR DELETE
USING (
  user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);
