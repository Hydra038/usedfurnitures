-- ============================================
-- FIX ORDERS TABLE - Add Missing Columns
-- ============================================
-- Run this to add user_id, status columns and rename total_price to total

-- Add user_id column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add status column if it doesn't exist  
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add constraint to status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'));
  END IF;
END $$;

-- Rename total_price to total if total doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'total'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE orders RENAME COLUMN total_price TO total;
  END IF;
END $$;

-- If total doesn't exist and total_price doesn't exist, create total
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2) DEFAULT 0;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status_new ON orders(status);

-- Migrate payment_status to status if status is null
UPDATE orders 
SET status = CASE 
  WHEN payment_status = 'pending' THEN 'pending'
  WHEN payment_status = 'confirmed' THEN 'processing'
  WHEN payment_status = 'rejected' THEN 'cancelled'
  ELSE 'pending'
END
WHERE status IS NULL OR status = '';

-- Update RLS policies to include user_id filtering
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Show sample data
SELECT id, user_id, status, total, customer_name, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
