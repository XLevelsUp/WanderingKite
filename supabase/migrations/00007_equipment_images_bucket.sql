-- ============================================================
-- Create Supabase Storage bucket for equipment images
-- Run this once in the Supabase SQL editor (service-role context)
-- ============================================================

-- 1. Create a public bucket named 'equipment-images'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,                              -- PUBLIC: anyone can read uploaded images
  5242880,                           -- 5 MB per file limit
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];


-- 2. RLS policy: allow authenticated users to upload
DROP POLICY IF EXISTS "Auth users can upload equipment images" ON storage.objects;
CREATE POLICY "Auth users can upload equipment images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'equipment-images'
    AND auth.uid() IS NOT NULL
  );

-- 3. RLS policy: allow authenticated users to update/replace
DROP POLICY IF EXISTS "Auth users can update equipment images" ON storage.objects;
CREATE POLICY "Auth users can update equipment images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'equipment-images'
    AND auth.uid() IS NOT NULL
  );

-- 4. RLS policy: allow authenticated users to delete their uploads
DROP POLICY IF EXISTS "Auth users can delete equipment images" ON storage.objects;
CREATE POLICY "Auth users can delete equipment images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'equipment-images'
    AND auth.uid() IS NOT NULL
  );

-- 5. RLS policy: public read access (images shown on the rentals page)
DROP POLICY IF EXISTS "Public can read equipment images" ON storage.objects;
CREATE POLICY "Public can read equipment images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'equipment-images');

-- Done! The bucket is ready for image uploads.
