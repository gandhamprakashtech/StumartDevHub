-- ============================================
-- StumartDevHub Complete Database Schema
-- ============================================
-- 
-- This script creates the complete database schema from scratch.
-- Follows the flow: Admin creates PINs → Students register → Email confirmation → Students can post
--
-- IMPORTANT: This will DROP all existing tables. Run this in Supabase SQL Editor.
-- ============================================

-- ============================================
-- Step 1: Drop all existing tables and functions
-- ============================================
-- Drop tables first (CASCADE will automatically drop policies, triggers, and dependent objects)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS student_pins CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop functions (in case they exist independently)
DROP FUNCTION IF EXISTS create_student_record(VARCHAR, VARCHAR, VARCHAR, UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS create_pins_bulk(INTEGER, VARCHAR, INTEGER, VARCHAR, INTEGER, INTEGER, UUID) CASCADE;
DROP FUNCTION IF EXISTS delete_pin_and_account(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS confirm_student_email(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_available_pin_options() CASCADE;
DROP FUNCTION IF EXISTS get_available_pins(INTEGER, VARCHAR, INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_admin_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_student_pins_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_students_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_products_updated_at() CASCADE;

-- ============================================
-- Step 2: Create admin_users table
-- ============================================
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_admin_users_auth_user_id ON admin_users(auth_user_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own admin record
CREATE POLICY "Users can view their own admin record"
  ON admin_users
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- Policy: Authenticated users can view all admin users (for admin dashboard)
CREATE POLICY "Authenticated users can view all admin users"
  ON admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Service role can manage admin users (for initial setup)
CREATE POLICY "Service role can manage admin users"
  ON admin_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- ============================================
-- Step 3: Create student_pins table (FIRST TABLE)
-- Admin creates PIN numbers here with joining year, branch, section, etc.
-- ============================================
CREATE TABLE student_pins (
  pin_number VARCHAR(255) PRIMARY KEY, -- Format: YY030-BRANCH-NUMBER (e.g., 25030-CME-001)
  joining_year INTEGER NOT NULL,       -- Joining year (e.g., 2025)
  branch VARCHAR(50) NOT NULL,        -- e.g., CME, CE, M, ECE, EEE, CIOT, AIML
  year INTEGER NOT NULL,              -- Academic year: 1, 2, or 3
  section VARCHAR(10) NOT NULL,       -- A, B, C, D, etc.
  pin_sequence INTEGER NOT NULL,      -- The number part (1, 2, 3, ...) - will be formatted as 001, 002, etc.
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'registered', 'blocked')),
  registered_user_id UUID,            -- Will be set after email confirmation
  created_by UUID,                    -- Admin who created this PIN
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(joining_year, branch, pin_sequence) -- Ensure unique PIN per joining_year-branch-sequence
);

-- Create indexes for faster queries
CREATE INDEX idx_student_pins_joining_year ON student_pins(joining_year);
CREATE INDEX idx_student_pins_branch ON student_pins(branch);
CREATE INDEX idx_student_pins_year ON student_pins(year);
CREATE INDEX idx_student_pins_section ON student_pins(section);
CREATE INDEX idx_student_pins_status ON student_pins(status);
CREATE INDEX idx_student_pins_joining_year_branch ON student_pins(joining_year, branch);
CREATE INDEX idx_student_pins_registered_user ON student_pins(registered_user_id);

-- Enable RLS
ALTER TABLE student_pins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_pins
-- Anyone can view available PINs (for registration dropdown - students need to see available options)
CREATE POLICY "Anyone can view available PINs"
  ON student_pins
  FOR SELECT
  USING (status = 'available');

-- Authenticated users can view their own registered PIN
CREATE POLICY "Users can view their own PIN"
  ON student_pins
  FOR SELECT
  USING (auth.uid() = registered_user_id);

-- Authenticated users can view all PINs (admin check handled in frontend)
CREATE POLICY "Authenticated users can view all PINs"
  ON student_pins
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage PINs (admin check handled in frontend)
CREATE POLICY "Authenticated users can insert PINs"
  ON student_pins
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update PINs"
  ON student_pins
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete PINs"
  ON student_pins
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_pins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_pins_updated_at
  BEFORE UPDATE ON student_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_student_pins_updated_at();

-- ============================================
-- Step 4: Create students table (SECOND TABLE)
-- Student details stored here AFTER email confirmation
-- ============================================
CREATE TABLE students (
  pin_number VARCHAR(255) PRIMARY KEY REFERENCES student_pins(pin_number) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  joining_year INTEGER NOT NULL,      -- From PIN
  branch VARCHAR(50) NOT NULL,        -- From PIN
  year INTEGER NOT NULL,              -- Academic year: 1, 2, or 3 (From PIN)
  section VARCHAR(10) NOT NULL,       -- From PIN
  auth_user_id UUID NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  email_confirmed BOOLEAN DEFAULT FALSE, -- Track email confirmation status
  email_confirmed_at TIMESTAMP WITH TIME ZONE, -- When email was confirmed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Foreign key constraint to auth.users is intentionally NOT added here
-- because Supabase Auth creates users asynchronously and they may not be immediately
-- visible in auth.users table, causing foreign key violations.
-- We trust that if supabase.auth.signUp() succeeded, the user exists.

-- Create indexes
CREATE INDEX idx_students_auth_user_id ON students(auth_user_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_joining_year ON students(joining_year);
CREATE INDEX idx_students_branch ON students(branch);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_students_section ON students(section);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_email_confirmed ON students(email_confirmed);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Students can view their own record"
  ON students
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Students can update their own record"
  ON students
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Allow authenticated users to delete student records (admin check handled in frontend)
CREATE POLICY "Authenticated users can delete student records"
  ON students
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_students_updated_at();

-- ============================================
-- Step 5: Create products table (for posts)
-- Students can upload posts after registration and email confirmation
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL, -- References auth.users(id) but no FK constraint (async issue)
  student_pin_number VARCHAR(255) REFERENCES students(pin_number) ON DELETE CASCADE,
  branch VARCHAR(50), -- NULL means "All Branches", specific branch code for branch-specific
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
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_student_pin_number ON products(student_pin_number);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_branch ON products(branch);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- Students can view all active products
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (status = 'active');

-- Students can view their own products (all statuses)
CREATE POLICY "Students can view their own products"
  ON products
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Students can insert their own products (only if email confirmed)
CREATE POLICY "Students can insert their own products"
  ON products
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.auth_user_id = auth.uid()
      AND students.email_confirmed = TRUE
      AND students.status = 'active'
    )
  );

-- Students can update their own products
CREATE POLICY "Students can update their own products"
  ON products
  FOR UPDATE
  USING (auth.uid() = seller_id);

-- Students can delete their own products
CREATE POLICY "Students can delete their own products"
  ON products
  FOR DELETE
  USING (auth.uid() = seller_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- ============================================
-- Step 6: Function to create student record
-- Called AFTER email confirmation during registration
-- ============================================
CREATE OR REPLACE FUNCTION create_student_record(
  p_pin_number VARCHAR(255),
  p_name VARCHAR(255),
  p_email VARCHAR(255),
  p_auth_user_id UUID,
  p_status VARCHAR(50) DEFAULT 'pending'
)
RETURNS TABLE (
  pin_number VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255),
  joining_year INTEGER,
  branch VARCHAR(50),
  year INTEGER,
  section VARCHAR(10),
  auth_user_id UUID,
  status VARCHAR(50),
  email_confirmed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin_record student_pins%ROWTYPE;
BEGIN
  -- Verify auth_user_id is provided
  IF p_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'auth_user_id is required';
  END IF;
  
  -- Get PIN record and verify it's available
  SELECT * INTO v_pin_record
  FROM student_pins
  WHERE student_pins.pin_number = p_pin_number;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PIN number not found';
  END IF;

  IF v_pin_record.status != 'available' THEN
    RAISE EXCEPTION 'PIN is not available (status: %)', v_pin_record.status;
  END IF;

  -- Insert student record (initially with email_confirmed = FALSE)
  INSERT INTO students (
    pin_number, 
    name, 
    email, 
    joining_year,
    branch,
    year,
    section,
    auth_user_id, 
    status,
    email_confirmed
  )
  VALUES (
    p_pin_number,
    p_name,
    p_email,
    v_pin_record.joining_year,
    v_pin_record.branch,
    v_pin_record.year,
    v_pin_record.section,
    p_auth_user_id,
    p_status,
    FALSE -- Email not confirmed yet
  );

  -- Update PIN status to registered (but email not confirmed yet)
  UPDATE student_pins
  SET 
    status = 'registered',
    registered_user_id = p_auth_user_id,
    updated_at = NOW()
  WHERE student_pins.pin_number = p_pin_number;

  -- Return the created student record
  RETURN QUERY
  SELECT 
    s.pin_number,
    s.name,
    s.email,
    s.joining_year,
    s.branch,
    s.year,
    s.section,
    s.auth_user_id,
    s.status,
    s.email_confirmed,
    s.created_at
  FROM students s
  WHERE s.pin_number = p_pin_number;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_student_record TO authenticated;
GRANT EXECUTE ON FUNCTION create_student_record TO anon;

-- ============================================
-- Step 7: Function to confirm email
-- Called when user clicks email confirmation link
-- ============================================
CREATE OR REPLACE FUNCTION confirm_student_email(
  p_auth_user_id UUID
)
RETURNS TABLE (
  pin_number VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255),
  email_confirmed BOOLEAN,
  status VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update student record to mark email as confirmed
  UPDATE students
  SET 
    email_confirmed = TRUE,
    email_confirmed_at = NOW(),
    status = 'active', -- Change status from 'pending' to 'active' after email confirmation
    updated_at = NOW()
  WHERE students.auth_user_id = p_auth_user_id
    AND students.email_confirmed = FALSE;

  -- Return the updated student record
  RETURN QUERY
  SELECT 
    s.pin_number,
    s.name,
    s.email,
    s.email_confirmed,
    s.status
  FROM students s
  WHERE s.auth_user_id = p_auth_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION confirm_student_email TO authenticated;

-- ============================================
-- Step 8: Helper function to generate PINs in bulk
-- Admin can use this to create multiple PINs
-- ============================================
CREATE OR REPLACE FUNCTION create_pins_bulk(
  p_joining_year INTEGER,
  p_branch VARCHAR(50),
  p_year INTEGER,
  p_section VARCHAR(10),
  p_start_sequence INTEGER,
  p_end_sequence INTEGER,
  p_created_by UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pin_number VARCHAR(255);
  v_sequence INTEGER;
  v_count INTEGER := 0;
  v_year_code VARCHAR(2); -- Last 2 digits of joining year (e.g., 25 for 2025)
  v_pin_sequence_str VARCHAR(3); -- Formatted as 001, 002, etc.
BEGIN
  -- Get last 2 digits of joining year (e.g., 2025 -> 25)
  v_year_code := RIGHT(p_joining_year::TEXT, 2);

  -- Generate PINs
  FOR v_sequence IN p_start_sequence..p_end_sequence LOOP
    -- Format PIN sequence as 3 digits with leading zeros (001, 002, ..., 060)
    v_pin_sequence_str := LPAD(v_sequence::TEXT, 3, '0');
    
    -- Format: YY030-BRANCH-NUMBER (e.g., 25030-CME-001)
    v_pin_number := v_year_code || '030-' || p_branch || '-' || v_pin_sequence_str;
    
    -- Check if PIN already exists (by pin_number or unique constraint)
    IF NOT EXISTS (
      SELECT 1 FROM student_pins 
      WHERE pin_number = v_pin_number 
         OR (joining_year = p_joining_year AND branch = p_branch AND pin_sequence = v_sequence)
    ) THEN
      -- Insert PIN (only if it doesn't exist)
      INSERT INTO student_pins (
        pin_number,
        joining_year,
        branch,
        year,
        section,
        pin_sequence,
        created_by,
        status
      )
      VALUES (
        v_pin_number,
        p_joining_year,
        p_branch,
        p_year,
        p_section,
        v_sequence,
        p_created_by,
        'available'
      );
      
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_pins_bulk TO authenticated;

-- ============================================
-- Step 9: Function to get available PIN options for registration
-- Students use this to see available joining_year, branch, section combinations
-- ============================================
CREATE OR REPLACE FUNCTION get_available_pin_options()
RETURNS TABLE (
  joining_year INTEGER,
  branch VARCHAR(50),
  year INTEGER,
  section VARCHAR(10),
  available_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return distinct combinations of joining_year, branch, year, section
  -- with count of available PINs for each combination
  RETURN QUERY
  SELECT 
    sp.joining_year,
    sp.branch,
    sp.year,
    sp.section,
    COUNT(*)::BIGINT as available_count
  FROM student_pins sp
  WHERE sp.status = 'available'
  GROUP BY sp.joining_year, sp.branch, sp.year, sp.section
  ORDER BY sp.joining_year DESC, sp.branch, sp.year, sp.section;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_available_pin_options TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_pin_options TO anon;

-- ============================================
-- Step 10: Function to get available PINs for a specific combination
-- Students use this to get list of available PINs after selecting joining_year, branch, section
-- ============================================
CREATE OR REPLACE FUNCTION get_available_pins(
  p_joining_year INTEGER,
  p_branch VARCHAR(50),
  p_year INTEGER,
  p_section VARCHAR(10)
)
RETURNS TABLE (
  pin_number VARCHAR(255),
  joining_year INTEGER,
  branch VARCHAR(50),
  year INTEGER,
  section VARCHAR(10),
  pin_sequence INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return available PINs matching the criteria
  RETURN QUERY
  SELECT 
    sp.pin_number,
    sp.joining_year,
    sp.branch,
    sp.year,
    sp.section,
    sp.pin_sequence
  FROM student_pins sp
  WHERE sp.status = 'available'
    AND sp.joining_year = p_joining_year
    AND sp.branch = p_branch
    AND sp.year = p_year
    AND sp.section = p_section
  ORDER BY sp.pin_sequence;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_available_pins TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_pins TO anon;

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. ADMIN FLOW:
--    - Admin creates PINs using create_pins_bulk() function
--    - PINs are stored in student_pins table with status 'available'
--
-- 2. STUDENT REGISTRATION FLOW:
--    a. Student selects joining_year, branch, section from available options
--    b. Student sees list of available PINs for that combination
--    c. Student selects a PIN and registers with email/password
--    d. create_student_record() is called - creates record with email_confirmed = FALSE
--    e. Supabase sends email confirmation link
--    f. Student clicks confirmation link
--    g. confirm_student_email() is called - sets email_confirmed = TRUE, status = 'active'
--
-- 3. POST UPLOAD FLOW:
--    - Only students with email_confirmed = TRUE and status = 'active' can upload posts
--    - Posts are stored in products table
--
-- 4. EMAIL CONFIRMATION:
--    - Supabase Auth handles sending confirmation emails
--    - You need to call confirm_student_email() function after email is confirmed
--    - This can be done via a webhook or in your frontend after checking auth.user.email_confirmed_at
--
-- 5. SUPABASE AUTH CONFIGURATION:
--    - Enable Email Authentication: Authentication > Providers > Email > Enable
--    - Enable Email Verification: Authentication > Settings > Enable "Confirm email"
--    - Configure Email Templates: Authentication > Email Templates
--    - Set up SMTP (for production): Authentication > Settings > SMTP Settings
--
-- ============================================

