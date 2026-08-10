-- ═══════════════════════════════════════════════════════════════════════════
-- INVOICES — soft delete.
-- Adds deleted_at so DRAFT/CANCELLED invoices can be removed from listings
-- without losing the row (audit trail, GST record-keeping). ISSUED/PAID
-- invoices are never deleted here — that restriction is enforced in
-- actions/invoices.ts (deleteInvoice), not in the DB, since it's a business
-- rule about invoice-number continuity, not a data-integrity constraint.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON public.invoices(deleted_at) WHERE deleted_at IS NULL;
