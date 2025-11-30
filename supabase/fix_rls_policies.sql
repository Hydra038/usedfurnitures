-- ============================================
-- FIX ROW-LEVEL SECURITY POLICIES
-- ============================================
-- Run this in your Supabase SQL Editor to allow public access to orders and order_items

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow public to read orders" ON orders;
DROP POLICY IF EXISTS "Allow public to update orders" ON orders;
DROP POLICY IF EXISTS "Allow public to insert order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public to read order_items" ON order_items;

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Allow public to insert orders"
ON orders FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public to read orders"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public to update orders"
ON orders FOR UPDATE
TO public
USING (true);

-- Create policies for order_items table
CREATE POLICY "Allow public to insert order_items"
ON order_items FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public to read order_items"
ON order_items FOR SELECT
TO public
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
