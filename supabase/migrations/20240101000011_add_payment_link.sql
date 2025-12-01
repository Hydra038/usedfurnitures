-- ============================================
-- Add Payment Link Column to Payment Methods Table
-- ============================================

-- Add payment_link column to payment_methods table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_methods' AND column_name = 'payment_link'
  ) THEN
    ALTER TABLE payment_methods 
    ADD COLUMN payment_link TEXT;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN payment_methods.payment_link IS 'Direct payment link (e.g., Venmo deep link: venmo://paycharge?txn=pay&recipients=username)';
  END IF;
END $$;

-- Update Venmo with example deep link format
-- Admin should update this with actual username
UPDATE payment_methods 
SET payment_link = 'venmo://paycharge?txn=pay&recipients=username'
WHERE method_id = 'venmo' AND payment_link IS NULL;

-- Verify column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_methods' 
  AND column_name = 'payment_link';

-- Check current payment methods
SELECT id, name, method_id, details, payment_link
FROM payment_methods
ORDER BY display_order;
