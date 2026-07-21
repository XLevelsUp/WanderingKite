-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT INVOICING — invoices + invoice_items
--
-- Lets ADMIN+ staff roll a client's completed photography/studio/rental
-- bookings (plus custom line items) into a single GST invoice, with an
-- optional invoice-level discount (percentage or flat).
--
-- Money is stored as INTEGER (whole rupees), matching the convention set by
-- 00032_confirm_db_monetary_precision.sql for booking amounts — the values
-- an invoice pulls its line items from are already whole-rupee integers.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   TEXT UNIQUE NOT NULL,
  client_id        UUID NOT NULL REFERENCES public.clients(id),
  issue_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status           "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',

  subtotal         INTEGER NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_type    "DiscountType",
  discount_value   NUMERIC(10,2) CHECK (discount_value IS NULL OR discount_value >= 0),
  discount_amount  INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  taxable_amount   INTEGER NOT NULL DEFAULT 0 CHECK (taxable_amount >= 0),
  gst_rate         NUMERIC(5,2) NOT NULL DEFAULT 18 CHECK (gst_rate >= 0),
  gst_amount       INTEGER NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  total            INTEGER NOT NULL DEFAULT 0 CHECK (total >= 0),

  business_gstin   TEXT,
  client_gstin     TEXT,
  notes            TEXT,

  created_by_id    UUID REFERENCES public.profiles(id),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

DROP TRIGGER IF EXISTS set_updated_at ON public.invoices;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

  description       TEXT NOT NULL,
  -- 'PHOTOGRAPHY' | 'STUDIO' | 'RENTAL' | 'CUSTOM' — no FK since the source
  -- booking lives in one of three separate tables (polymorphic reference).
  source_type       TEXT,
  source_booking_id UUID,

  quantity          INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price        INTEGER NOT NULL CHECK (unit_price >= 0),
  amount            INTEGER NOT NULL CHECK (amount >= 0),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_source_booking ON public.invoice_items(source_booking_id)
  WHERE source_booking_id IS NOT NULL;

-- 4. RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin+ can view invoices" ON public.invoices
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can manage invoices" ON public.invoices
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

CREATE POLICY "Admin+ can view invoice items" ON public.invoice_items
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));
CREATE POLICY "Admin+ can manage invoice items" ON public.invoice_items
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'DEVELOPER'));

COMMIT;
