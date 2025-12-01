-- ============================================
-- Add DELETE Policy for Products Table
-- ============================================

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create DELETE policy for products
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Verify policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'products' 
  AND policyname = 'Authenticated users can delete products';
