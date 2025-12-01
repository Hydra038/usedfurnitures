-- ============================================
-- Add Status Column to Products Table
-- ============================================

-- Add status column to products table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold'));
    
    -- Add comment to explain the column
    COMMENT ON COLUMN products.status IS 'Product availability status: available, reserved, or sold';
  END IF;
END $$;

-- Update existing products to have 'available' status if NULL
UPDATE products SET status = 'available' WHERE status IS NULL;

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Verify column was added
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name = 'status';
