-- ============================================
-- FIX: Drop and recreate the constraint
-- ============================================

-- Drop the existing constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_option_check;

-- Recreate the constraint with correct values
ALTER TABLE orders ADD CONSTRAINT orders_payment_option_check 
  CHECK (payment_option IN ('full', 'half', 'other'));

-- Verify the constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders' 
  AND con.conname = 'orders_payment_option_check';
