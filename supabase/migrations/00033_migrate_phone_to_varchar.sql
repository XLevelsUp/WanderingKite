-- Migration: 00033_migrate_phone_to_varchar.sql
-- Purpose: Migrate phone number columns from TEXT to VARCHAR(15) for clients and profiles.

BEGIN;

-- Convert phone column in clients to VARCHAR(15)
ALTER TABLE public.clients 
  ALTER COLUMN phone TYPE VARCHAR(15);

-- Convert phone column in profiles to VARCHAR(15)
ALTER TABLE public.profiles 
  ALTER COLUMN phone TYPE VARCHAR(15);

COMMIT;
