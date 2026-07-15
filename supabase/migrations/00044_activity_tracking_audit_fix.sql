-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVITY TRACKING — Phase 3: defense-in-depth for audit_logs.user_id.
-- The application layer (lib/audit.ts writeAuditLog) now always passes
-- user_id explicitly, but give it a DB-level fallback so a forgotten
-- caller never silently writes an orphan row with no attribution.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.audit_logs
  ALTER COLUMN user_id SET DEFAULT auth.uid();
