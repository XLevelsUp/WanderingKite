-- ============================================================================
-- HR & PAYROLL SYSTEM — Migration v9
-- Fully idempotent. Safe to run fresh or on a partial state.
-- Adds: employee_contracts, attendance_logs, payroll_records, attendance_settings
-- ============================================================================

-- ============================================================================
-- STAGE 1: ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.attendance_status AS ENUM (
    'PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'ON_LEAVE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payroll_status AS ENUM (
    'DRAFT', 'APPROVED', 'PAID'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.employment_type AS ENUM (
    'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STAGE 2: TABLES
-- ============================================================================

-- ---------------------------------------------------------------------------
-- employee_contracts
-- 1:1 extension of profiles — stores HR-specific contract & bank details
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_contracts (
  id               UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId"      UUID                   NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  "jobTitle"       TEXT                   NOT NULL DEFAULT 'Staff',
  "employmentType" public.employment_type NOT NULL DEFAULT 'FULL_TIME',
  "baseSalary"     NUMERIC(12,2)          NOT NULL DEFAULT 0 CHECK ("baseSalary" >= 0),
  "joiningDate"    DATE                   NOT NULL DEFAULT CURRENT_DATE,
  "bankAccountName"   TEXT,
  "bankAccountNumber" TEXT,
  "bankIFSC"          TEXT,
  "upiId"             TEXT,
  "avatarUrl"      TEXT,
  notes            TEXT,
  "isActive"       BOOLEAN                NOT NULL DEFAULT TRUE,
  "deactivatedAt"  TIMESTAMPTZ,
  "createdAt"      TIMESTAMPTZ            NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ            NOT NULL DEFAULT now()
);

-- If the table already existed with employmentType as TEXT, migrate it to the enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'employee_contracts'
      AND column_name = 'employmentType' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.employee_contracts
      DROP CONSTRAINT IF EXISTS "employee_contracts_employmentType_check";
    ALTER TABLE public.employee_contracts
      ALTER COLUMN "employmentType" TYPE public.employment_type
      USING "employmentType"::text::public.employment_type;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ec_profile_id ON public.employee_contracts("profileId");
CREATE INDEX IF NOT EXISTS idx_ec_is_active  ON public.employee_contracts("isActive");

-- ---------------------------------------------------------------------------
-- attendance_settings
-- Single-row global config for attendance rules
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_settings (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "studioStartTime"        TIME         NOT NULL DEFAULT '09:00:00',
  "graceMinutes"           INTEGER      NOT NULL DEFAULT 15,
  "halfDayThresholdHours"  NUMERIC(4,2) NOT NULL DEFAULT 4.0,
  "latePenaltyPerMinute"   NUMERIC(8,4) NOT NULL DEFAULT 0,
  "updatedAt"              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO public.attendance_settings
  ("studioStartTime", "graceMinutes", "halfDayThresholdHours", "latePenaltyPerMinute")
SELECT '09:00:00', 15, 4.0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.attendance_settings);

-- ---------------------------------------------------------------------------
-- attendance_logs
-- One row per employee per calendar day.
-- Drop & recreate if old incompatible schema exists (userId-based schema).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'attendance_logs'
      AND column_name = 'userId'  -- old incompatible column
  ) THEN
    DROP TABLE public.attendance_logs CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id           UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId" UUID                     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date         DATE                     NOT NULL,
  "clockIn"    TIME,
  "clockOut"   TIME,
  status       public.attendance_status NOT NULL DEFAULT 'ABSENT',
  "totalHours" NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN "clockIn" IS NOT NULL AND "clockOut" IS NOT NULL
      THEN ROUND(EXTRACT(EPOCH FROM ("clockOut" - "clockIn")) / 3600.0, 2)
      ELSE 0
    END
  ) STORED,
  "markedById"   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes        TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_attendance_employee_date UNIQUE ("employeeId", date)
);

CREATE INDEX IF NOT EXISTS idx_al_employee_id ON public.attendance_logs("employeeId");
CREATE INDEX IF NOT EXISTS idx_al_date         ON public.attendance_logs(date);
CREATE INDEX IF NOT EXISTS idx_al_status       ON public.attendance_logs(status);

-- ---------------------------------------------------------------------------
-- payroll_records
-- Monthly payroll snapshot per employee
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payroll_records (
  id                UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId"      UUID                  NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month             SMALLINT              NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              SMALLINT              NOT NULL CHECK (year >= 2020),
  "workingDays"     SMALLINT              NOT NULL DEFAULT 26,
  "presentDays"     NUMERIC(5,2)          NOT NULL DEFAULT 0,
  "lateDays"        SMALLINT              NOT NULL DEFAULT 0,
  "baseSalary"      NUMERIC(12,2)         NOT NULL,
  "basePay"         NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "overtimeAmount"  NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "bonusAmount"     NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "latePenalty"     NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "unpaidLeaves"    NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "taxDeduction"    NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "otherDeductions" NUMERIC(12,2)         NOT NULL DEFAULT 0,
  "netPayout"       NUMERIC(12,2)         NOT NULL DEFAULT 0,
  status            public.payroll_status NOT NULL DEFAULT 'DRAFT',
  "approvedBy"      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  "approvedAt"      TIMESTAMPTZ,
  "paidAt"          TIMESTAMPTZ,
  "paymentRef"      TEXT,
  notes             TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payroll_employee_month_year UNIQUE ("employeeId", month, year)
);

CREATE INDEX IF NOT EXISTS idx_pr_employee_id ON public.payroll_records("employeeId");
CREATE INDEX IF NOT EXISTS idx_pr_month_year  ON public.payroll_records(year, month);
CREATE INDEX IF NOT EXISTS idx_pr_status      ON public.payroll_records(status);

-- ============================================================================
-- STAGE 3: AUTO-UPDATE TRIGGERS
-- Uses DROP IF EXISTS for full idempotency
-- ============================================================================

DROP TRIGGER IF EXISTS set_ec_updated_at ON public.employee_contracts;
CREATE TRIGGER set_ec_updated_at
  BEFORE UPDATE ON public.employee_contracts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_al_updated_at ON public.attendance_logs;
CREATE TRIGGER set_al_updated_at
  BEFORE UPDATE ON public.attendance_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_pr_updated_at ON public.payroll_records;
CREATE TRIGGER set_pr_updated_at
  BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- STAGE 4: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.employee_contracts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;

-- ── employee_contracts ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "admins_all"                ON public.employee_contracts;
DROP POLICY IF EXISTS "employees_read_own"         ON public.employee_contracts;
DROP POLICY IF EXISTS "Admins view all contracts"  ON public.employee_contracts;
DROP POLICY IF EXISTS "Admins manage contracts"    ON public.employee_contracts;

CREATE POLICY "Admins view all contracts"
  ON public.employee_contracts FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
    OR "profileId" = auth.uid()
  );

CREATE POLICY "Admins manage contracts"
  ON public.employee_contracts FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- ── attendance_logs ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Employees view own attendance"      ON public.attendance_logs;
DROP POLICY IF EXISTS "Admins manage attendance"           ON public.attendance_logs;
DROP POLICY IF EXISTS "Employees can self-log attendance"  ON public.attendance_logs;
DROP POLICY IF EXISTS "Employees can update own clock"     ON public.attendance_logs;

CREATE POLICY "Employees view own attendance"
  ON public.attendance_logs FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
    OR "employeeId" = auth.uid()
  );

CREATE POLICY "Admins manage attendance"
  ON public.attendance_logs FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Employees can self-log attendance"
  ON public.attendance_logs FOR INSERT
  WITH CHECK ("employeeId" = auth.uid());

CREATE POLICY "Employees can update own clock"
  ON public.attendance_logs FOR UPDATE
  USING (
    "employeeId" = auth.uid()
    AND public.get_user_role(auth.uid()) = 'EMPLOYEE'
  );

-- ── payroll_records ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Employees view own payroll" ON public.payroll_records;
DROP POLICY IF EXISTS "Admins manage payroll"       ON public.payroll_records;

CREATE POLICY "Employees view own payroll"
  ON public.payroll_records FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
    OR "employeeId" = auth.uid()
  );

CREATE POLICY "Admins manage payroll"
  ON public.payroll_records FOR ALL
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- ── attendance_settings ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins view settings"         ON public.attendance_settings;
DROP POLICY IF EXISTS "Super admins manage settings"  ON public.attendance_settings;

CREATE POLICY "Admins view settings"
  ON public.attendance_settings FOR SELECT
  USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Super admins manage settings"
  ON public.attendance_settings FOR ALL
  USING (public.get_user_role(auth.uid()) = 'SUPER_ADMIN');
