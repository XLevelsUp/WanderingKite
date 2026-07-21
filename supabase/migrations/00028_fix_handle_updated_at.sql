-- =============================================================================
-- Migration: 00028_fix_handle_updated_at.sql
-- =============================================================================
-- Purpose:
--   Update public.handle_updated_at() to dynamically handle both snake_case (updated_at)
--   and camelCase (updatedAt) fields, resolving trigger failures on tables using snake_case.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Try setting snake_case updated_at
  BEGIN
    NEW.updated_at = now();
  EXCEPTION WHEN undefined_column THEN
    -- If undefined_column, try setting camelCase updatedAt
    BEGIN
      NEW."updatedAt" = now();
    EXCEPTION WHEN undefined_column THEN
      -- If neither exists, do nothing
      NULL;
    END;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
