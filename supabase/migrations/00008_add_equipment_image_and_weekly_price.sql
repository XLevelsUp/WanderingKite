-- ============================================================
-- Migration 00008: Add image_url and weekly_price to equipment
-- Run this once in the Supabase SQL editor
-- ============================================================

-- Add image_url column (nullable — not all equipment will have an image)
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- Add weeklyPrice column (optional weekly rental rate, camelCase to match migration 00002)
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS "weeklyPrice" NUMERIC(10, 2) DEFAULT 0;

-- Done!
