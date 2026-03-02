-- ============================================================================
-- IDEMPOTENT MIGRATION v3: Hierarchical OMS Refactor & camelCase Alignment
-- ============================================================================

-- 1. Create Enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EquipmentStatus') THEN
        CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACTIVE', 'RETURNED', 'LATE');
    END IF;
END $$;

-- HELPER FUNCTION FOR IDEMPOTENT RENAMES
DO $$ BEGIN
    CREATE OR REPLACE FUNCTION rename_column_if_exists(t_name text, old_col text, new_col text) RETURNS void AS $func$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t_name AND column_name = old_col) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', t_name, old_col, new_col);
        END IF;
    END;
    $func$ LANGUAGE plpgsql;
END $$;

-- 2. Update profiles table
SELECT rename_column_if_exists('profiles', 'full_name', 'fullName');
SELECT rename_column_if_exists('profiles', 'branch_id', 'branchId');
SELECT rename_column_if_exists('profiles', 'created_at', 'createdAt');
SELECT rename_column_if_exists('profiles', 'updated_at', 'updatedAt');

-- Add managerId if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='managerId') THEN
        ALTER TABLE "profiles" ADD COLUMN "managerId" UUID REFERENCES "profiles"(id);
    END IF;
END $$;

-- Update role column type
DO $$ BEGIN
    IF (SELECT udt_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') <> 'UserRole' THEN
        ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;
        ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "UserRole" 
            USING (CASE 
                WHEN "role"::text = 'STAFF' THEN 'EMPLOYEE'::"UserRole"
                ELSE "role"::text::"UserRole"
            END);
        ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
    END IF;
END $$;

-- 3. Update equipment table
SELECT rename_column_if_exists('equipment', 'serial_number', 'serialNumber');
SELECT rename_column_if_exists('equipment', 'category_id', 'categoryId');
SELECT rename_column_if_exists('equipment', 'branch_id', 'branchId');
SELECT rename_column_if_exists('equipment', 'rental_price', 'rentalPrice');
SELECT rename_column_if_exists('equipment', 'created_at', 'createdAt');
SELECT rename_column_if_exists('equipment', 'updated_at', 'updatedAt');

DO $$ BEGIN
    IF (SELECT udt_name FROM information_schema.columns WHERE table_name='equipment' AND column_name='status') <> 'EquipmentStatus' THEN
        ALTER TABLE "equipment" DROP COLUMN IF EXISTS "status";
        ALTER TABLE "equipment" ADD COLUMN "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE';
    END IF;
END $$;

-- 4. Update other tables for consistency
SELECT rename_column_if_exists('clients', 'govt_id', 'govtId');
SELECT rename_column_if_exists('clients', 'created_at', 'createdAt');
SELECT rename_column_if_exists('clients', 'updated_at', 'updatedAt');

SELECT rename_column_if_exists('branches', 'created_at', 'createdAt');
SELECT rename_column_if_exists('branches', 'updated_at', 'updatedAt');

SELECT rename_column_if_exists('categories', 'created_at', 'createdAt');
SELECT rename_column_if_exists('categories', 'updated_at', 'updatedAt');

-- 5. Create orders table if not exists
CREATE TABLE IF NOT EXISTS "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL REFERENCES "clients"(id) ON DELETE CASCADE,
    "assignedEmployeeId" UUID NOT NULL REFERENCES "profiles"(id),
    "supervisorId" UUID NOT NULL REFERENCES "profiles"(id),
    "usageLocation" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create order_items table if not exists
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
    "equipmentId" UUID NOT NULL REFERENCES "equipment"(id) ON DELETE CASCADE,
    "priceAtRental" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Add unique constraint to equipment
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'equipment_serialNumber_key') THEN
        ALTER TABLE "equipment" ADD CONSTRAINT "equipment_serialNumber_key" UNIQUE ("serialNumber");
    END IF;
END $$;

-- 8. Add indexes
CREATE INDEX IF NOT EXISTS "idx_profiles_managerId" ON "profiles"("managerId");
CREATE INDEX IF NOT EXISTS "idx_orders_clientId" ON "orders"("clientId");
CREATE INDEX IF NOT EXISTS "idx_orders_assignedEmployeeId" ON "orders"("assignedEmployeeId");
CREATE INDEX IF NOT EXISTS "idx_orders_supervisorId" ON "orders"("supervisorId");
CREATE INDEX IF NOT EXISTS "idx_order_items_orderId" ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS "idx_order_items_equipmentId" ON "order_items"("equipmentId");

-- CLEANUP (Optional)
-- DROP FUNCTION rename_column_if_exists(text, text, text);
