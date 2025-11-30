-- ============================================
-- PROFILES TABLE FOR USER DASHBOARD
-- ============================================
-- This table stores additional user profile information
-- linked to Supabase Auth users

-- Drop existing trigger and function first (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing table if needed (CAUTION: This will delete existing data)
-- If you're getting "column does not exist" errors, uncomment the next line:
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN NEW.email = 'usa@furnitures.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INSTRUCTIONS
-- ============================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This will create the profiles table and set up RLS policies
-- 3. Users will be able to view and edit only their own profiles
-- 4. A profile will be automatically created when a user signs up
-- 5. The admin user (usa@furnitures.com) will automatically get 'admin' role
-- 6. All other users will get 'user' role by default

-- ============================================
-- MANUAL ADMIN SETUP (if needed)
-- ============================================
-- If you need to manually set an existing user as admin, run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'usa@furnitures.com';

-- To check admin users:
-- SELECT id, email, role, full_name FROM profiles WHERE role = 'admin';

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If you get errors creating new users, try these:

-- 1. Check if trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Check if function exists:
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- 3. Manually create profile for existing users:
-- INSERT INTO profiles (id, email, role)
-- SELECT id, email, 
--   CASE WHEN email = 'usa@furnitures.com' THEN 'admin' ELSE 'user' END as role
-- FROM auth.users
-- ON CONFLICT (id) DO UPDATE SET 
--   email = EXCLUDED.email,
--   role = EXCLUDED.role;

-- 4. View all profiles:
-- SELECT * FROM profiles;

-- 5. Delete a specific profile (if needed):
-- DELETE FROM profiles WHERE email = 'example@email.com';
