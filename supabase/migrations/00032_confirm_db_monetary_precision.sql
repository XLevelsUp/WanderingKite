-- Migration: 00032_confirm_db_monetary_precision.sql
-- Purpose: Ensure monetary fields are INTEGER to avoid decimal issues and overflows

BEGIN;

ALTER TABLE public.studio_bookings 
  ALTER COLUMN amount_paid TYPE INTEGER USING ROUND(amount_paid)::INTEGER,
  ALTER COLUMN additional_charges TYPE INTEGER USING ROUND(additional_charges)::INTEGER;

ALTER TABLE public.photography_bookings 
  ALTER COLUMN amount_paid TYPE INTEGER USING ROUND(amount_paid)::INTEGER,
  ALTER COLUMN advance_paid TYPE INTEGER USING ROUND(advance_paid)::INTEGER;

ALTER TABLE public.rental_bookings 
  ALTER COLUMN damage_cost TYPE INTEGER USING ROUND(damage_cost)::INTEGER;

COMMIT;
