-- Drop the old check constraint on payment_status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add new check constraint with more status options
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'confirmed', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Also update the status column constraint if it exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add check constraint for status column
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled'));
