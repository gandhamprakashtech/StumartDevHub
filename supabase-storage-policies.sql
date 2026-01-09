-- ============================================
-- Storage Bucket Policies for product-images
-- ============================================
-- 
-- This SQL script sets up Row Level Security policies for the product-images storage bucket.
-- Run this AFTER creating the bucket in Supabase Dashboard.
--
-- IMPORTANT: First create the bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: "product-images"
-- 4. Make it PUBLIC (toggle ON)
-- 5. Click "Create"
--
-- Then run this SQL script to set up the policies.
--
-- ============================================

-- ============================================
-- Policy 1: Allow authenticated users to upload images
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- ============================================
-- Policy 2: Allow public read access to images
-- ============================================
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- ============================================
-- Policy 3: Allow users to delete their own images
-- ============================================
-- This policy ensures users can only delete images in their own folder
-- Images are stored as: {userId}/{filename}
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Policy 4: Allow users to update their own images (optional)
-- ============================================
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verify Policies
-- ============================================
-- After running, you can verify the policies by:
-- 1. Go to Storage → product-images → Policies tab
-- 2. You should see 4 policies listed
--
-- ============================================

