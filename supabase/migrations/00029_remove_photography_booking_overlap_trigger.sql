-- Migration: 00029_remove_photography_booking_overlap_trigger.sql
-- Purpose: Remove the photography booking overlap trigger to allow multiple bookings on the same date/time slot.

BEGIN;

DROP TRIGGER IF EXISTS trg_check_photography_booking_overlap ON public.photography_bookings;

COMMIT;
