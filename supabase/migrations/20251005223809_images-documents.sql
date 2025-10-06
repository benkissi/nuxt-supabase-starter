-- ===============================================
-- Migration: Storage Buckets + Access Policies (Final Simplified)
-- Description:
--   Creates buckets and access policies for users and organizations.
--   Clean version without COMMENTs or RLS enable statements.
-- ===============================================

-- ===============================================
-- 0️⃣ Ensure private schema + helper function
-- ===============================================

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.uuid_or_null(str text)
RETURNS uuid
LANGUAGE plpgsql
AS $fn$
BEGIN
  RETURN str::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$fn$;

-- ===============================================
-- 1️⃣ Create storage buckets (idempotent)
-- ===============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('user-images', 'user-images', false),
  ('user-documents', 'user-documents', false),
  ('organization-images', 'organization-images', false),
  ('organization-documents', 'organization-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- ⚙️ NOTE:
-- RLS is already enabled by default on storage.objects in Supabase.
-- No ALTER TABLE statement needed.
-- ===============================================

-- ===============================================
-- 2️⃣ USER IMAGES BUCKET
-- Path format: user-id/filename
-- ===============================================

CREATE POLICY "User can manage their own images"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'user-images'
    AND private.uuid_or_null(path_tokens[1]) = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'user-images'
    AND private.uuid_or_null(path_tokens[1]) = auth.uid()
  );

-- ===============================================
-- 3️⃣ USER DOCUMENTS BUCKET
-- Path format: user-id/filename
-- ===============================================

CREATE POLICY "User can manage their own documents"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'user-documents'
    AND private.uuid_or_null(path_tokens[1]) = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'user-documents'
    AND private.uuid_or_null(path_tokens[1]) = auth.uid()
  );

-- ===============================================
-- 4️⃣ ORGANIZATION IMAGES BUCKET
-- Path format: org-id/filename
-- ===============================================

-- Members can view images
CREATE POLICY "Org members can view org images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'organization-images'
    AND private.uuid_or_null(path_tokens[1]) IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Members can upload images
CREATE POLICY "Org members can upload org images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'organization-images'
    AND private.uuid_or_null(path_tokens[1]) IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- ===============================================
-- 5️⃣ ORGANIZATION DOCUMENTS BUCKET
-- Path format: org-id/filename
-- ===============================================

-- Allow everyone in org to view documents
CREATE POLICY "Org members can view org documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'organization-documents'
    AND private.uuid_or_null(path_tokens[1]) IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow only admins and owners to manage (insert/update/delete)
CREATE POLICY "Only org admins can manage org documents"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'organization-documents'
    AND private.uuid_or_null(path_tokens[1]) IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    bucket_id = 'organization-documents'
    AND private.uuid_or_null(path_tokens[1]) IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- ===============================================
-- 6️⃣ Validation Trigger (enforce id/filename structure)
-- ===============================================

CREATE OR REPLACE FUNCTION public.validate_file_path()
RETURNS TRIGGER AS $$
BEGIN
  IF array_length(NEW.path_tokens, 1) < 2 THEN
    RAISE EXCEPTION 'Invalid file path: expected format id/filename';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_file_path_trigger ON storage.objects;

CREATE TRIGGER validate_file_path_trigger
BEFORE INSERT OR UPDATE ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.validate_file_path();

-- ===============================================
-- ✅ End of Migration
-- ===============================================
