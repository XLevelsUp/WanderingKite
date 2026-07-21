-- Add new columns to equipment table
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS is_rental boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS equipment_type text DEFAULT 'RENTAL' NOT NULL CHECK (equipment_type IN ('RENTAL', 'STUDIO_SPACE')),
ADD COLUMN IF NOT EXISTS category_name text;

-- Migrate data from categories table to equipment
UPDATE public.equipment e
SET category_name = c.name
FROM public.categories c
WHERE e.category_id = c.id;

-- Merge Category names
UPDATE public.equipment
SET category_name = 'Camera'
WHERE category_name ILIKE '%cameras%';

UPDATE public.equipment
SET category_name = 'Lens'
WHERE category_name ILIKE '%lenses%';

-- Make category_name NOT NULL if needed? We will leave it nullable for now as some might not have categories.

-- Create equipment history table
CREATE TABLE IF NOT EXISTS public.equipment_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL, -- 'CREATED', 'UPDATED', 'DELETED'
    changes jsonb, -- Record of what changed
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS for equipment_history
ALTER TABLE public.equipment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view equipment history"
    ON public.equipment_history FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert equipment history"
    ON public.equipment_history FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
