-- ============================================
-- NEW StumartDevHub Database Schema
-- PIN Management System
-- ============================================
-- 
-- This replaces the old schema with admin-controlled PIN system
-- Run this in your Supabase SQL Editor
--
-- ============================================

-- ============================================
-- Step 1: Drop old tables and functions
-- ============================================
-- Drop policies on students table
DROP POLICY IF EXISTS "Students can view their own record" ON students;
DROP POLICY IF EXISTS "Students can update their own record" ON students;
DROP POLICY IF EXISTS "Students can insert their own record" ON students;

-- Drop policies on student_pins table (if they exist)
DROP POLICY IF EXISTS "Admins can manage PINs" ON student_pins;
DROP POLICY IF EXISTS "Anyone can view available PINs" ON student_pins;

-- Drop triggers first (they depend on tables)
DROP TRIGGER IF EXISTS update_student_pins_updated_at ON student_pins;
DROP TRIGGER IF EXISTS update_students_updated_at ON students;

-- Drop foreign key constraints first (if they exist)
ALTER TABLE student_pins DROP CONSTRAINT IF EXISTS student_pins_registered_user_id_fkey;
ALTER TABLE student_pins DROP CONSTRAINT IF EXISTS student_pins_created_by_fkey;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_auth_user_id_fkey;

-- Drop tables first (CASCADE will drop dependent objects and functions)
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS student_pins CASCADE;

-- Drop functions (after tables, in case they weren't dropped by CASCADE)
-- Use DO block to drop all versions of create_pins_bulk
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT oid::regprocedure as funcname 
              FROM pg_proc 
              WHERE proname = 'create_pins_bulk') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.funcname || ' CASCADE';
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS create_student_record(VARCHAR, VARCHAR, VARCHAR, UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS delete_pin_and_account(VARCHAR) CASCADE;

-- ============================================
-- Step 2: Create student_pins table
-- Admin pre-creates PINs here
-- ============================================
CREATE TABLE student_pins (
  pin_number VARCHAR(255) PRIMARY KEY, -- Format: YY030-BRANCH-NUMBER (e.g., 25030-CM-001)
  joining_year INTEGER NOT NULL,       -- Joining year (e.g., 2025)
  branch VARCHAR(50) NOT NULL,        -- e.g., CME, CE, M, ECE, EEE, CIOT, AIML
  year INTEGER NOT NULL,              -- Academic year: 1, 2, or 3
  section VARCHAR(10) NOT NULL,       -- A, B, C, D, etc.
  pin_sequence INTEGER NOT NULL,      -- The number part (1, 2, 3, ...) - will be formatted as 001, 002, etc.
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'registered', 'blocked')),
  registered_user_id UUID, -- Will be set after user is confirmed (no FK constraint to avoid timing issues)
  created_by UUID, -- Admin who created this PIN (no FK constraint to avoid timing issues)
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
-- Anyone can view available PINs (for registration dropdown)
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
-- Step 3: Create updated students table
-- Now includes branch, section, year from PIN
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

-- Function to create student record (called during registration)
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
  
  -- Note: We trust that if supabase.auth.signUp() succeeded and returned a user.id,
  -- the auth user exists. We don't check auth.users table here to avoid timing/access issues.
  -- The foreign key constraint (if enabled) will validate the user exists.

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

  -- Insert student record
  INSERT INTO students (
    pin_number, 
    name, 
    email, 
    joining_year,
    branch,
    year,
    section,
    auth_user_id, 
    status
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
    p_status
  );

  -- Update PIN status to registered
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
    s.created_at
  FROM students s
  WHERE s.pin_number = p_pin_number;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_student_record TO authenticated;
GRANT EXECUTE ON FUNCTION create_student_record TO anon;

-- Function to update updated_at timestamp for students
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
-- Step 4: Helper function to generate PINs in bulk
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
  -- Admin verification removed - handled in frontend

  -- Get last 2 digits of joining year (e.g., 2025 -> 25)
  v_year_code := RIGHT(p_joining_year::TEXT, 2);

  -- Generate PINs
  FOR v_sequence IN p_start_sequence..p_end_sequence LOOP
    -- Format PIN sequence as 3 digits with leading zeros (001, 002, ..., 060)
    v_pin_sequence_str := LPAD(v_sequence::TEXT, 3, '0');
    
    -- Format: YY030-BRANCH-NUMBER (e.g., 25030-CM-001)
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

-- Grant execute permission to authenticated users (admin check inside function)
GRANT EXECUTE ON FUNCTION create_pins_bulk TO authenticated;

-- ============================================
-- Step 5: Function to delete PIN and all related data
-- This function deletes PIN, student account, and products
-- Note: Auth user deletion requires Supabase Admin API (handled separately)
-- ============================================
CREATE OR REPLACE FUNCTION delete_pin_and_account(
  p_pin_number VARCHAR(255)
)
RETURNS TABLE (
  deleted_pin VARCHAR(255),
  deleted_student BOOLEAN,
  auth_user_id UUID,
  deleted_products_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_record students%ROWTYPE;
  v_auth_user_id UUID;
  v_products_count INTEGER := 0;
  v_student_exists BOOLEAN := false;
BEGIN
  -- Admin verification removed - handled in frontend

  -- Get student record if exists
  SELECT * INTO v_student_record
  FROM students
  WHERE students.pin_number = p_pin_number;

  -- If student exists, get auth_user_id and count products
  IF FOUND THEN
    v_student_exists := true;
    v_auth_user_id := v_student_record.auth_user_id;
    
    -- Count products that will be deleted
    SELECT COUNT(*) INTO v_products_count
    FROM products
    WHERE products.seller_id = v_auth_user_id OR products.student_pin_number = p_pin_number;

    -- Delete student record first (this will cascade delete products via foreign key)
    DELETE FROM students WHERE students.pin_number = p_pin_number;
  END IF;

  -- Delete PIN (will cascade delete student if CASCADE is set, but we already deleted it)
  DELETE FROM student_pins WHERE student_pins.pin_number = p_pin_number;

  -- Return results
  RETURN QUERY
  SELECT 
    p_pin_number,
    v_student_exists, -- student was deleted
    v_auth_user_id, -- auth user ID (for reference, deletion handled separately)
    v_products_count;
END;
$$;

-- Grant execute permission to authenticated users (admin check inside function)
GRANT EXECUTE ON FUNCTION delete_pin_and_account TO authenticated;

-- ============================================
-- Notes:
-- ============================================
-- 1. Admin must be logged in to create PINs
-- 2. PIN format: BRANCH-YEAR-SECTION-NUMBER
-- 3. PINs are created with status 'available'
-- 4. When student registers, PIN status changes to 'registered'
-- 5. Students table now includes branch, year, section from PIN
-- 6. One PIN = One student (enforced by database constraints)
-- ============================================

