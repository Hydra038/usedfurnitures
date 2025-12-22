-- ============================================
-- Add Delivery Options to Orders Table
-- ============================================

-- Add delivery_option column (delivery or pickup)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_option'
  ) THEN
    ALTER TABLE orders 
    ADD COLUMN delivery_option TEXT DEFAULT 'delivery' CHECK (delivery_option IN ('delivery', 'pickup'));
    
    COMMENT ON COLUMN orders.delivery_option IS 'Delivery method: delivery (with $50 fee) or pickup (free)';
  END IF;
END $$;

-- Add shipping_fee column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_fee'
  ) THEN
    ALTER TABLE orders 
    ADD COLUMN shipping_fee DECIMAL(10, 2) DEFAULT 0;
    
    COMMENT ON COLUMN orders.shipping_fee IS 'Shipping fee amount ($50 per item for delivery, $0 for pickup)';
  END IF;
END $$;

-- Verify columns were added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('delivery_option', 'shipping_fee')
ORDER BY column_name;
