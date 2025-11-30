-- ============================================
-- DEBUG: Check what constraint exists
-- ============================================

-- Check the actual constraint definition
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders' 
  AND con.conname = 'orders_payment_option_check';

-- Also check if payment_option column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'payment_option';
