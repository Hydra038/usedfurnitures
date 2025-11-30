-- ============================================
-- CHECK ORDERS TABLE STRUCTURE
-- ============================================
-- Run this to see what columns exist in orders table

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
