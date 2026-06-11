-- =============================================================================
-- Migration: 00024_client_dashboard_phase_2.sql (Part 1: Schema & Indexes)
-- =============================================================================
-- Purpose:
--   1. Create enums: BookingStatus, RentalStatus, IdProofStatus.
--   2. Alter clients table to support auth_user_id for Supabase Auth sync.
--      ON DELETE SET NULL is used for auth_user_id to ensure client profiles
--      and transaction history remain in the ERP system for financial audits.
--   3. Alter common equipment table to support client portal catalogs:
--      - available_for_rental BOOLEAN DEFAULT TRUE
--      - available_for_studio BOOLEAN DEFAULT FALSE
--   4. Create tables: client_id_proofs, rental_bookings, 
--      _RentalBookingToEquipment, studio_bookings,
--      _StudioBookingToEquipment, photography_bookings, album_details.
--      - client_id_proofs has client_id UNIQUE constraint. This represents the
--        business rule that each client is allowed a single verified active ID
--        proof record. Re-uploads overwrite the existing record and reset the 
--        verification status to 'PENDING'.
--      - Enable RLS directly after each table creation to prevent unguarded states.
--   5. Apply CHECK constraints, exact monetary scales, indexes.
-- =============================================================================

BEGIN;

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE public."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'BookingStatus ENUM already exists — skipping creation.';
END $$;

DO $$ BEGIN
  CREATE TYPE public."RentalStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RETURNED', 'DAMAGED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'RentalStatus ENUM already exists — skipping creation.';
END $$;

DO $$ BEGIN
  CREATE TYPE public."IdProofStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'IdProofStatus ENUM already exists — skipping creation.';
END $$;

-- 2. Alter clients table to support auth_user_id (ON DELETE SET NULL for audit retention)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Alter common equipment table to support rental/studio catalog distinctions
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS available_for_rental BOOLEAN DEFAULT TRUE;
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS available_for_studio BOOLEAN DEFAULT FALSE;

-- 4. Create client_id_proofs table (Single active ID proof business rule enforced by UNIQUE constraint)
CREATE TABLE IF NOT EXISTS public.client_id_proofs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  id_type        TEXT NOT NULL,
  file_url       TEXT NOT NULL,
  status         public."IdProofStatus" DEFAULT 'PENDING'::public."IdProofStatus" NOT NULL,
  reject_reason  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.client_id_proofs ENABLE ROW LEVEL SECURITY;

-- 5. Create rental_bookings table
CREATE TABLE IF NOT EXISTS public.rental_bookings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  start_date         TIMESTAMPTZ NOT NULL,
  end_date           TIMESTAMPTZ NOT NULL,
  purpose            TEXT,
  status             public."RentalStatus" DEFAULT 'PENDING'::public."RentalStatus" NOT NULL,
  pickup_condition   TEXT,
  return_condition   TEXT,
  returned_at        TIMESTAMPTZ,
  damage_cost        NUMERIC(10,2) CHECK (damage_cost >= 0),
  damage_description TEXT,
  agreement_url      TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_rental_dates CHECK (end_date > start_date)
);
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;

-- 6. Create join table _RentalBookingToEquipment (Prisma style many-to-many, pointing to common equipment table)
CREATE TABLE IF NOT EXISTS public."_RentalBookingToEquipment" (
  "A" UUID NOT NULL REFERENCES public.rental_bookings(id) ON DELETE CASCADE,
  "B" UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY ("A", "B")
);
ALTER TABLE public."_RentalBookingToEquipment" ENABLE ROW LEVEL SECURITY;

-- 7. Create studio_bookings table
CREATE TABLE IF NOT EXISTS public.studio_bookings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date_time          TIMESTAMPTZ NOT NULL,
  duration_hours     INTEGER NOT NULL,
  purpose            TEXT NOT NULL,
  status             public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
  amount_paid        NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (amount_paid >= 0),
  additional_charges NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (additional_charges >= 0),
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_studio_duration CHECK (duration_hours > 0)
);
ALTER TABLE public.studio_bookings ENABLE ROW LEVEL SECURITY;

-- 8. Create join table _StudioBookingToEquipment (Prisma style many-to-many, pointing to common equipment table)
CREATE TABLE IF NOT EXISTS public."_StudioBookingToEquipment" (
  "A" UUID NOT NULL REFERENCES public.studio_bookings(id) ON DELETE CASCADE,
  "B" UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY ("A", "B")
);
ALTER TABLE public."_StudioBookingToEquipment" ENABLE ROW LEVEL SECURITY;

-- 9. Create photography_bookings table
CREATE TABLE IF NOT EXISTS public.photography_bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  session_type  TEXT NOT NULL,
  date_time     TIMESTAMPTZ NOT NULL,
  location      TEXT NOT NULL,
  notes         TEXT,
  people_count  INTEGER,
  status        public."BookingStatus" DEFAULT 'PENDING'::public."BookingStatus" NOT NULL,
  amount_paid   NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (amount_paid >= 0),
  advance_paid  NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (advance_paid >= 0),
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT chk_photo_people CHECK (people_count IS NULL OR people_count > 0)
);
ALTER TABLE public.photography_bookings ENABLE ROW LEVEL SECURITY;

-- 10. Create album_details table
CREATE TABLE IF NOT EXISTS public.album_details (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID NOT NULL UNIQUE REFERENCES public.photography_bookings(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  delivery_date  TIMESTAMPTZ,
  download_link  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.album_details ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Indexes for query performance and fast conflict checks
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_client_id_proofs_client_status ON public.client_id_proofs(client_id, status);
CREATE INDEX IF NOT EXISTS idx_rental_bookings_client_status ON public.rental_bookings(client_id, status);
CREATE INDEX IF NOT EXISTS idx_rental_booking_to_equip_b ON public."_RentalBookingToEquipment"("B");
CREATE INDEX IF NOT EXISTS idx_studio_bookings_client_time ON public.studio_bookings(client_id, date_time);
CREATE INDEX IF NOT EXISTS idx_studio_booking_to_equip_b ON public."_StudioBookingToEquipment"("B");
CREATE INDEX IF NOT EXISTS idx_photography_bookings_client_time ON public.photography_bookings(client_id, date_time);

-- Indexing for conflict checks (Dates/Datetime & Status)
CREATE INDEX IF NOT EXISTS idx_rental_bookings_dates_status ON public.rental_bookings(start_date, end_date, status);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_datetime_status ON public.studio_bookings(date_time, status);
CREATE INDEX IF NOT EXISTS idx_photography_bookings_datetime_status ON public.photography_bookings(date_time, status);

COMMIT;
