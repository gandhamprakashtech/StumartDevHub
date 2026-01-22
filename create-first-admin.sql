-- ============================================
-- Create First Admin Account
-- ============================================
-- 
-- Instructions:
-- 1. First, create a user account in Supabase Auth:
--    - Go to Authentication > Users > Add User
--    - Enter email: your-admin-email@example.com
--    - Enter password: your-secure-password
--    - Click "Create User"
--    - Copy the User ID (UUID) that is generated
--
-- 2. Then run this SQL script, replacing:
--    - 'YOUR_USER_ID_HERE' with the UUID you copied
--    - 'Admin Name' with your admin's name
--
-- ============================================

-- First, create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'role'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN role VARCHAR(50) DEFAULT 'admin';
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON admin_users(auth_user_id);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admin users
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.auth_user_id = auth.uid()
    )
  );

-- Policy: Service role can manage admin users (for initial setup)
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;
CREATE POLICY "Service role can manage admin users"
  ON admin_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Now insert your first admin (REPLACE THE VALUES BELOW)
-- Step 1: Get your user ID from Supabase Dashboard > Authentication > Users
-- Step 2: Replace 'YOUR_USER_ID_HERE' with that UUID
-- Step 3: Replace 'Admin Name' and 'admin@example.com' with your details

-- Insert admin (handles both with and without role column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'role'
  ) THEN
    -- Insert with role column
    INSERT INTO admin_users (auth_user_id, name, email, role)
    VALUES (
      'YOUR_USER_ID_HERE',  -- Replace with UUID from Supabase Auth > Users
      'Admin Name',          -- Replace with your name
      'admin@example.com',   -- Replace with your email (must match the auth user email)
      'admin'
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
  ELSE
    -- Insert without role column
    INSERT INTO admin_users (auth_user_id, name, email)
    VALUES (
      'YOUR_USER_ID_HERE',  -- Replace with UUID from Supabase Auth > Users
      'Admin Name',          -- Replace with your name
      'admin@example.com'   -- Replace with your email (must match the auth user email)
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
  END IF;
END $$;

-- Verify the admin was created
SELECT * FROM admin_users;

-- ============================================
-- Alternative: Create admin from existing auth user
-- ============================================
-- If you already have a user in auth.users, you can find their ID and insert:
--
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- -- Copy the id (UUID) from the result
-- -- Then use it in the INSERT statement above
--
-- ============================================

