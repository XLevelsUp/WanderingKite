-- 00021_equipment_management_improvements.sql

-- 1. Clean up duplicate categories in the `equipment` table
UPDATE public.equipment
SET category_name = 'Camera'
WHERE category_name ILIKE 'Cameras';

UPDATE public.equipment
SET category_name = 'Lens'
WHERE category_name ILIKE 'Lenses';

-- Remove duplicate names from `categories` table (optional but good practice)
-- Delete 'Cameras' if 'Camera' exists
DELETE FROM public.categories
WHERE name ILIKE 'Cameras' AND EXISTS (SELECT 1 FROM public.categories WHERE name ILIKE 'Camera');

-- Delete 'Lenses' if 'Lens' exists
DELETE FROM public.categories
WHERE name ILIKE 'Lenses' AND EXISTS (SELECT 1 FROM public.categories WHERE name ILIKE 'Lens');

-- 2. Create the equipment_maintenance_history table
CREATE TABLE IF NOT EXISTS public.equipment_maintenance_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE,
    maintenance_type text NOT NULL CHECK (maintenance_type IN ('SERVICE', 'REPAIR')),
    cost decimal(10,2) NOT NULL,
    date date NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS for equipment_maintenance_history
ALTER TABLE public.equipment_maintenance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view maintenance history"
    ON public.equipment_maintenance_history FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert maintenance history"
    ON public.equipment_maintenance_history FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Add UNIQUE constraint to serialNumber
-- Note: If you have duplicate serial numbers, this command will fail. 
-- You can find duplicates by running:
-- SELECT "serialNumber", COUNT(*) FROM public.equipment GROUP BY "serialNumber" HAVING COUNT(*) > 1;
-- Please resolve duplicates before running this next line.

ALTER TABLE public.equipment ADD CONSTRAINT equipment_serial_number_key UNIQUE ("serialNumber");
