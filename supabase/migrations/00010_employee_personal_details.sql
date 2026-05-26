-- ============================================================================
-- EMPLOYEE PERSONAL DETAILS — Migration v10
-- Adds personal demographic fields to the profiles table.
-- All columns are nullable — safe to run on existing data.
-- ============================================================================

-- Gender enum
DO $$ BEGIN
  CREATE TYPE public.gender_type AS ENUM (
    'MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Add columns to profiles ──────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS "dateOfBirth"           DATE,
  ADD COLUMN IF NOT EXISTS phone                   TEXT,
  ADD COLUMN IF NOT EXISTS gender                  public.gender_type,
  ADD COLUMN IF NOT EXISTS "bloodGroup"            TEXT,
  ADD COLUMN IF NOT EXISTS "panNumber"             TEXT;

-- ── Indexes for common lookups ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON public.profiles(phone);

CREATE INDEX IF NOT EXISTS idx_profiles_dob
  ON public.profiles("dateOfBirth");

-- ── Verification query (run after applying to confirm) ───────────────────────
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- AND column_name IN ('dateOfBirth','phone','gender','bloodGroup','panNumber')
-- ORDER BY column_name;
