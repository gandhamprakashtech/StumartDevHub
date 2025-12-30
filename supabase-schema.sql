-- ============================================
-- StumartDevHub Database Schema
-- ============================================
-- 
-- This SQL script creates the required database schema for StumartDevHub.
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
--
-- ============================================

-- Create the students table
CREATE TABLE IF NOT EXISTS students (
  pin_number VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on auth_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students(auth_user_id);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only read their own student record
CREATE POLICY "Students can view their own record"
  ON students
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Policy: Users can only update their own student record
CREATE POLICY "Students can update their own record"
  ON students
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- ============================================
-- Database Function for Student Signup
-- ============================================
-- This function allows inserting student records during signup
-- It runs with SECURITY DEFINER to bypass RLS for this specific operation
-- but still validates that the auth_user_id matches the authenticated user

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
  auth_user_id UUID,
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify that the auth_user_id exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_auth_user_id) THEN
    RAISE EXCEPTION 'Invalid auth_user_id: user does not exist';
  END IF;

  -- Insert the student record
  RETURN QUERY
  INSERT INTO students (pin_number, name, email, auth_user_id, status)
  VALUES (p_pin_number, p_name, p_email, p_auth_user_id, p_status)
  RETURNING students.pin_number, students.name, students.email, 
            students.auth_user_id, students.status, students.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_student_record TO authenticated;
GRANT EXECUTE ON FUNCTION create_student_record TO anon;

-- ============================================
-- Alternative: Simple INSERT Policy (for development)
-- ============================================
-- If the function approach doesn't work, use this simpler policy instead:
-- (Comment out the function above and uncomment this)

-- DROP POLICY IF EXISTS "Students can insert their own record" ON students;
-- CREATE POLICY "Students can insert their own record"
--   ON students
--   FOR INSERT
--   WITH CHECK (true);

-- ============================================
-- IMPORTANT: Supabase Auth Configuration
-- ============================================
--
-- 1. Enable Email Authentication in Supabase Dashboard:
--    Authentication > Providers > Email > Enable
--
-- 2. Enable Email Verification:
--    Authentication > Settings > Enable "Confirm email"
--
-- 3. Configure Email Templates (optional):
--    Authentication > Email Templates > Customize as needed
--
-- 4. Set up SMTP (for production):
--    Authentication > Settings > SMTP Settings
--
-- ============================================

