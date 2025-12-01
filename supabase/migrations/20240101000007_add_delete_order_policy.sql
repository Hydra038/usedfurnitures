-- ============================================
-- Add DELETE policy for orders table
-- ============================================

-- Allow authenticated users (admin) to delete orders
CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);
