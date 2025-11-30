-- ============================================
-- FIX PROFILES TABLE - Add Missing Columns
-- ============================================
-- Run this if you get error: column "email" or "full_name" does not exist

-- First, drop the trigger to prevent errors while we fix the table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Add email column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add full_name column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add phone column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add address column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Add city column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Add state column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Add zip_code column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Add role column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add constraint to role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Update existing records to have email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Update existing admin user to have admin role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'usa@furnitures.com';

-- Set default role for users without one
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Recreate the function with all fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, address, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    CASE 
      WHEN NEW.email = 'usa@furnitures.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    address = COALESCE(EXCLUDED.address, profiles.address),
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the fix
SELECT id, email, full_name, phone, address, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
