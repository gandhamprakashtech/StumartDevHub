-- ============================================
-- Products Table Schema for StumartDevHub
-- ============================================
-- 
-- This SQL script creates the products table and related infrastructure.
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
--
-- IMPORTANT: This file ONLY creates the products table.
-- The students table should already exist (from supabase-schema.sql).
-- If you get errors about existing policies, that's normal - they will be dropped and recreated.
--
-- ============================================

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_pin_number VARCHAR(255) REFERENCES students(pin_number) ON DELETE CASCADE,
  branch VARCHAR(50), -- NULL means "All Branches", specific branch code (e.g., "CM", "M", "EC") for branch-specific
  category VARCHAR(50) NOT NULL CHECK (category IN ('books', 'stationary', 'electronics', 'others')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_urls TEXT[] NOT NULL DEFAULT '{}', -- Array of Supabase Storage URLs
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_student_pin_number ON products(student_pin_number);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================
-- Note: We drop existing policies first to avoid conflicts if running multiple times

-- Policy: Users can insert their own products
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Policy: Anyone can view active products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (status = 'active');

-- Policy: Users can view their own products (even if inactive)
DROP POLICY IF EXISTS "Users can view their own products" ON products;
CREATE POLICY "Users can view their own products"
  ON products
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Policy: Users can update their own products
DROP POLICY IF EXISTS "Users can update their own products" ON products;
CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Policy: Users can delete their own products
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
CREATE POLICY "Users can delete their own products"
  ON products
  FOR DELETE
  USING (auth.uid() = seller_id);

-- ============================================
-- Storage Bucket Setup (Run in Supabase Dashboard)
-- ============================================
--
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named "product-images"
-- 3. Make it PUBLIC (for read access)
-- 4. Set up the following policies:
--
-- Policy: Authenticated users can upload images
-- INSERT policy: authenticated = true
--
-- Policy: Anyone can view images
-- SELECT policy: true (public read access)
--
-- Policy: Users can delete their own images
-- DELETE policy: bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- ============================================
-- Storage Bucket SQL Policies (Alternative - Run in SQL Editor)
-- ============================================
--
-- Note: These policies assume the bucket is already created in the Storage dashboard
--
-- Allow authenticated users to upload images
-- CREATE POLICY "Authenticated users can upload product images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'product-images');
--
-- Allow public read access to product images
-- CREATE POLICY "Public can view product images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'product-images');
--
-- Allow users to delete their own images
-- CREATE POLICY "Users can delete their own product images"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- ============================================
-- IMPORTANT: Manual Steps Required
-- ============================================
--
-- 1. Create Storage Bucket:
--    - Go to Supabase Dashboard → Storage
--    - Click "New bucket"
--    - Name: "product-images"
--    - Public bucket: YES (for public read access)
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 2. Configure Bucket Policies (in Storage dashboard):
--    - INSERT: Allow authenticated users
--    - SELECT: Allow public (for viewing images)
--    - DELETE: Allow authenticated users (for their own files)
--
-- 3. Test the setup:
--    - Try uploading an image via the app
--    - Verify the image is accessible via public URL
--    - Test RLS policies by creating a product
--
-- ============================================

