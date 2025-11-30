-- ============================================
-- ADD PAYMENT OPTIONS - Half/Full Payment
-- ============================================
-- Run this to add payment option tracking columns

-- Add payment_option column (full or half)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_option TEXT DEFAULT 'full';

-- Add constraint to payment_option
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_payment_option_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_option_check 
    CHECK (payment_option IN ('full', 'half', 'other'));
  END IF;
END $$;

-- Add amount_paid column (the actual amount paid in this transaction)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) DEFAULT 0;

-- Add remaining_balance column (amount still owed)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_balance DECIMAL(10, 2) DEFAULT 0;

-- Create index on payment_option for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_option ON orders(payment_option);

-- Create index on remaining_balance for faster queries (to find orders with balance)
CREATE INDEX IF NOT EXISTS idx_orders_remaining_balance ON orders(remaining_balance);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('payment_option', 'amount_paid', 'remaining_balance')
ORDER BY ordinal_position;
