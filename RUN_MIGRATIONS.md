# 🚀 Run These Migrations NOW

## Critical Fixes Required

You need to run TWO SQL migrations in your Supabase dashboard to fix:
1. ✅ Payment proof uploads (404 error)
2. ✅ Payment proof display (images not showing)
3. ✅ Order deletion functionality

---

## Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/sql/new

---

## Step 2: Run Storage Migration (Payment Proofs)

**Copy and paste this entire migration:**

```sql
-- ============================================
-- Fix Storage Bucket Policies for Payment Proofs
-- ============================================

-- 1. Check if payment-proofs bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'payment-proofs';

-- 2. If bucket doesn't exist, create it
-- Note: Set to public for easier access (payment proofs don't contain sensitive personal data)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('payment-proofs', 'payment-proofs', true, 10485760)  -- 10MB limit, PUBLIC bucket
ON CONFLICT (id) DO UPDATE SET public = true;  -- Update existing bucket to public

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete payment proofs" ON storage.objects;

-- 4. Create new policies for payment-proofs bucket (public bucket)

-- Allow ANYONE to upload payment proofs (for checkout without login)
CREATE POLICY "Anyone can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs');

-- Allow ANYONE to view payment proofs (public bucket)
CREATE POLICY "Anyone can view payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs');

-- Allow authenticated users (admin) to update payment proofs
CREATE POLICY "Authenticated users can update payment proofs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Allow authenticated users (admin) to update payment proofs
CREATE POLICY "Authenticated users can update payment proofs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Allow authenticated users (admin) to delete payment proofs
CREATE POLICY "Authenticated users can delete payment proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-proofs');

-- 5. Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%payment%'
ORDER BY policyname;

-- 6. Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'payment-proofs';
```

Click **Run** ✅

---

## Step 3: Run Delete Policy Migration

**Copy and paste this migration:**

```sql
-- ============================================
-- Add DELETE policy for orders table
-- ============================================

-- This allows authenticated users (admin) to delete orders
CREATE POLICY IF NOT EXISTS "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'orders' 
  AND cmd = 'DELETE';
```

Click **Run** ✅

---

## Step 4: Verify Everything Works

1. **Test Payment Proof Upload:**
   - Go to checkout page
   - Try uploading a payment proof image
   - Should complete without 404 error

2. **Test Payment Proof Display:**
   - Go to Admin → Orders
   - Click "View Details" on an order with payment proof
   - Image should display correctly

3. **Test Order Deletion:**
   - Go to Admin → Orders
   - Click "Delete" on an order
   - Refresh page - order should be gone

---

## 🎉 After Running Migrations

All these features should now work:
- ✅ Upload payment proofs at checkout
- ✅ View payment proofs in admin panel
- ✅ Download payment proofs as admin
- ✅ Delete orders as admin

---

## Need Help?

If you see any errors when running the migrations, copy the error message and let me know!
