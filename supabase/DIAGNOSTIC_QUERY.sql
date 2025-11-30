-- ============================================
-- DATABASE DIAGNOSTIC QUERY
-- ============================================
-- Run this in Supabase SQL Editor to check your current database structure

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('products', 'orders', 'order_items', 'payment_methods')
ORDER BY table_name;

-- 2. Check orders table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Check products table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 4. Check existing indexes on orders
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- 5. Check existing policies on orders
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders';

-- 6. Check if payment_methods table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'payment_methods'
) as payment_methods_exists;

-- 7. Check storage buckets
SELECT 
  id,
  name,
  public
FROM storage.buckets
WHERE id IN ('product-images', 'payment-proofs');

-- 8. Count records in each table
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;
