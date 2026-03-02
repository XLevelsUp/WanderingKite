-- ============================================================================
-- FIX: Postgres Functions and Type Mismatch
-- ============================================================================

-- 1. Update get_user_role to return the new "UserRole" enum
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS "UserRole" AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Update handle_new_user to use the new 'EMPLOYEE' role instead of 'STAFF'
-- and handle the new fullName column name (camelCase)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, "fullName", role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'fullName'), 
    'EMPLOYEE'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Cleanup: Drop the old enums IF they are no longer in use by any columns
-- This is optional but keeps the database clean. We skip it to avoid errors if some legacy table still uses them.
-- DROP TYPE IF EXISTS user_role;
-- DROP TYPE IF EXISTS equipment_status;
-- DROP TYPE IF EXISTS rental_status;
