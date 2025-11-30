-- ============================================
-- ADD USER_ID TO ORDERS TABLE
-- ============================================
-- Links orders to authenticated users

-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster user order queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update RLS policy to allow users to see their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO public
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR
      customer_email = auth.email()
    )
  );

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name = 'user_id'
ORDER BY ordinal_position;
