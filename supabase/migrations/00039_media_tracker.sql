-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA TRACKER — per-client shoot storage/backup/editing tracker.
-- storage_devices: managed inventory of HDD/SSD/CLOUD storage locations.
-- media_records: one row per client shoot/project — where footage lives
-- (primary), where the original backup is, where the backup copy is, who's
-- editing it, and its production status.
-- EMPLOYEE can view both tables; only ADMIN/SUPER_ADMIN can mutate.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Managed storage-device inventory (HDD / SSD / CLOUD)
CREATE TABLE public.storage_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(255) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('HDD', 'SSD', 'CLOUD')),
    capacity VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. One record per client shoot/project
CREATE TABLE public.media_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    photography_booking_id UUID REFERENCES public.photography_bookings(id) ON DELETE SET NULL,
    studio_booking_id UUID REFERENCES public.studio_bookings(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    shoot_date DATE,
    primary_storage_device_id UUID REFERENCES public.storage_devices(id) ON DELETE SET NULL,
    original_backup_device_id UUID REFERENCES public.storage_devices(id) ON DELETE SET NULL,
    backup_copy_device_id UUID REFERENCES public.storage_devices(id) ON DELETE SET NULL,
    assigned_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED'
        CHECK (status IN ('NOT_STARTED', 'EDITING', 'REVIEW', 'PRODUCTION_READY', 'DELIVERED')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX media_records_client_id_idx ON public.media_records(client_id);
CREATE INDEX media_records_status_idx ON public.media_records(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.storage_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_records ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — storage_devices: any staff can view; ADMIN/SUPER_ADMIN mutate
CREATE POLICY "Staff can view storage devices"
ON public.storage_devices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can insert storage devices"
ON public.storage_devices FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can update storage devices"
ON public.storage_devices FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- 5. RLS Policies — media_records: any staff can view; ADMIN/SUPER_ADMIN mutate
CREATE POLICY "Staff can view media records"
ON public.media_records FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can insert media records"
ON public.media_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can update media records"
ON public.media_records FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Admins can delete media records"
ON public.media_records FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);
