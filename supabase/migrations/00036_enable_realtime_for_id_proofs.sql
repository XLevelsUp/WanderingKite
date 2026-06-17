-- Migration: 00036_enable_realtime_for_id_proofs.sql
-- Purpose: Enable Supabase Realtime for client_id_proofs so super admin gets notified

BEGIN;

-- Add client_id_proofs to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_id_proofs;

COMMIT;
