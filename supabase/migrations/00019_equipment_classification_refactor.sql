-- 1. Alter default for is_rental to false (since by default equipment is In-House & No)
ALTER TABLE public.equipment ALTER COLUMN is_rental SET DEFAULT false;

-- 2. Drop the old check constraint on ownership_type
ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_ownership_type_check;

-- 3. Rename ownership_type column to classification
ALTER TABLE public.equipment RENAME COLUMN ownership_type TO classification;

-- 4. Set default value for classification
ALTER TABLE public.equipment ALTER COLUMN classification SET DEFAULT 'IN_HOUSE';

-- 5. Migrate old data to the new classification mapping:
-- Old 'RENTAL' -> classification = 'IN_HOUSE', is_rental = true (External Rental)
-- Old 'IN_HOUSE' and is_rental = true -> classification = 'STUDIO_SPACE', is_rental = false (Studio Space Rental)
-- Old 'IN_HOUSE' and is_rental = false -> classification = 'IN_HOUSE', is_rental = false (In-House Asset)
UPDATE public.equipment
SET 
  classification = CASE 
    WHEN classification = 'RENTAL' THEN 'IN_HOUSE'
    WHEN classification = 'IN_HOUSE' AND is_rental = true THEN 'STUDIO_SPACE'
    ELSE 'IN_HOUSE'
  END,
  is_rental = CASE 
    WHEN classification = 'RENTAL' THEN true
    WHEN classification = 'IN_HOUSE' AND is_rental = true THEN false
    ELSE is_rental
  END;

-- 6. Add new check constraint for classification
ALTER TABLE public.equipment ADD CONSTRAINT equipment_classification_check CHECK (classification IN ('IN_HOUSE', 'STUDIO_SPACE'));

-- 7. Migrate existing JSON audit logs in equipment_history
UPDATE public.equipment_history
SET changes = (
  SELECT jsonb_object_agg(
    CASE 
      WHEN k = 'ownershipType' THEN 'classification'
      WHEN k = 'ownership_type' THEN 'classification'
      ELSE k
    END,
    CASE 
      WHEN k IN ('ownershipType', 'ownership_type') THEN 
        CASE 
          WHEN v::text = '"RENTAL"' THEN '"IN_HOUSE"'::jsonb
          WHEN v::text = '"IN_HOUSE"' AND (changes->>'isRental' = 'true' OR changes->>'is_rental' = 'true') THEN '"STUDIO_SPACE"'::jsonb
          ELSE v
        END
      WHEN k IN ('isRental', 'is_rental') THEN
        CASE 
          WHEN (changes->>'ownershipType' = 'IN_HOUSE' OR changes->>'ownership_type' = 'IN_HOUSE') AND v::text = 'true' THEN 'false'::jsonb
          ELSE v
        END
      ELSE v
    END
  )
  FROM jsonb_each(changes) AS t(k, v)
)
WHERE changes IS NOT NULL;
