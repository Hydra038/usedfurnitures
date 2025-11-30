-- ============================================
-- CREATE PAYMENT METHODS TABLE
-- ============================================
-- Table to store configurable payment methods

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  method_id TEXT UNIQUE NOT NULL, -- e.g., 'venmo', 'cashapp', 'zelle'
  details TEXT, -- e.g., username, email, phone, tag
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon TEXT, -- Optional icon name or URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_methods_enabled ON payment_methods(is_enabled);
CREATE INDEX IF NOT EXISTS idx_payment_methods_order ON payment_methods(display_order);

-- Insert default payment methods
INSERT INTO payment_methods (name, method_id, details, is_enabled, display_order) VALUES
  ('Venmo', 'venmo', '@username', true, 1),
  ('Cash App', 'cashapp', '$cashtag', true, 2),
  ('Zelle', 'zelle', 'email@example.com', true, 3),
  ('Chime', 'chime', 'email@example.com', true, 4),
  ('Apple Pay', 'applepay', '', true, 5),
  ('PayPal', 'paypal', 'email@example.com', true, 6)
ON CONFLICT (method_id) DO NOTHING;

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view enabled payment methods
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Anyone can view enabled payment methods'
  ) THEN
    CREATE POLICY "Anyone can view enabled payment methods"
      ON payment_methods FOR SELECT
      USING (is_enabled = true OR auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Policy: Only authenticated users can view all payment methods (for admin)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Authenticated users can view all payment methods'
  ) THEN
    CREATE POLICY "Authenticated users can view all payment methods"
      ON payment_methods FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Policy: Only authenticated users can insert payment methods
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Authenticated users can insert payment methods'
  ) THEN
    CREATE POLICY "Authenticated users can insert payment methods"
      ON payment_methods FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Policy: Only authenticated users can update payment methods
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Authenticated users can update payment methods'
  ) THEN
    CREATE POLICY "Authenticated users can update payment methods"
      ON payment_methods FOR UPDATE
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Policy: Only authenticated users can delete payment methods
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Authenticated users can delete payment methods'
  ) THEN
    CREATE POLICY "Authenticated users can delete payment methods"
      ON payment_methods FOR DELETE
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Verify the table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'payment_methods'
ORDER BY ordinal_position;

-- Show inserted data
SELECT * FROM payment_methods ORDER BY display_order;
