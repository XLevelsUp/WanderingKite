-- ═══════════════════════════════════════════════════════════════════════════
-- INVOICES — optional invoice numbering.
--
-- An entry can now be recorded WITHOUT entering the filed GST invoice series.
-- The operator chooses at creation time:
--
--   is_invoiced = true   → INV-<year>-NNNN — the filed GST invoice series
--   is_invoiced = false  → REF-<year>-NNNN — an internal, non-invoiced entry
--
-- Both series live in invoice_number (still UNIQUE NOT NULL) so that every
-- entry stays referable — in listings, in the PDF filename and on the printed
-- document. Keeping them in one column with distinct prefixes means the two
-- sequences can never collide, and getNextDocumentNumber() scans only its own
-- prefix, so a non-invoiced entry never consumes an INV- number and leaves no
-- gap in the filed sequence.
--
-- Numbering is deliberately independent of GST: a client with no GSTIN can
-- still be invoiced into the INV- series (the invoice simply carries no GST,
-- per calculateInvoiceTotals), and a client with a GSTIN can still be recorded
-- as a non-invoiced entry. The two decisions are unrelated.
--
-- Existing rows predate the choice and are all real invoices → default true.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS is_invoiced BOOLEAN NOT NULL DEFAULT true;

-- Every listing filters on this (the Invoiced / Non-invoiced / All tabs) and
-- always alongside the soft-delete filter, so the partial index matches the
-- shape of the query instead of indexing rows no listing will ever read.
CREATE INDEX IF NOT EXISTS idx_invoices_is_invoiced
  ON public.invoices(is_invoiced) WHERE deleted_at IS NULL;

COMMENT ON COLUMN public.invoices.is_invoiced IS
  'true = part of the filed GST invoice series (INV-); false = internal non-invoiced entry (REF-). One-way: a REF- entry can be converted to INV-, never the reverse.';
