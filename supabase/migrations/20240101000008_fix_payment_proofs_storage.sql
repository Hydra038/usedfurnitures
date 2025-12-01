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
