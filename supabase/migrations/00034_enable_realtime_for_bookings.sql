-- Migration: 00034_enable_realtime_for_bookings.sql
-- Purpose: Enable Supabase Realtime (logical replication) for booking tables so that the Super Admin dashboard can receive real-time notifications via WebSockets.

BEGIN;

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.photography_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.studio_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_bookings;

COMMIT;
