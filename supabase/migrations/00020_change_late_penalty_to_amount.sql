-- Migration 00020: Change late penalty rate to fixed amount

-- 1. Rename default_late_penalty_rate to default_late_penalty_amount in rental_policy_settings and alter its type to DECIMAL(10,2)
ALTER TABLE public.rental_policy_settings 
RENAME COLUMN default_late_penalty_rate TO default_late_penalty_amount;

ALTER TABLE public.rental_policy_settings 
ALTER COLUMN default_late_penalty_amount TYPE DECIMAL(10,2);

-- 2. Rename late_penalty_rate to late_penalty_amount in equipment and alter its type to DECIMAL(10,2)
ALTER TABLE public.equipment 
RENAME COLUMN late_penalty_rate TO late_penalty_amount;

ALTER TABLE public.equipment 
ALTER COLUMN late_penalty_amount TYPE DECIMAL(10,2);

-- 3. Adjust default for late_penalty_amount to 0.00 since it is now a flat amount
ALTER TABLE public.equipment 
ALTER COLUMN late_penalty_amount SET DEFAULT 0.00;

-- 4. Reset existing multipliers/values to 0.00 as standard starting amounts
UPDATE public.rental_policy_settings SET default_late_penalty_amount = 0.00;
UPDATE public.equipment SET late_penalty_amount = 0.00;
