# Supabase RLS (Row-Level Security) Fix

## Error
```
Error creating order: {code: '42501', details: null, hint: null, message: 'new row violates row-level security policy for table "orders"'}
```

## Problem
Supabase has Row-Level Security (RLS) enabled on the `orders` and `order_items` tables, but there are no policies allowing public users to insert data.

## Solution

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the Fix Script
Copy and paste the contents of `supabase/fix_rls_policies.sql` into the SQL Editor and click **Run**.

Or paste this directly:

```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Allow public to insert orders"
ON orders FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public to read orders"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public to update orders"
ON orders FOR UPDATE
TO public
USING (true);

-- Create policies for order_items table
CREATE POLICY "Allow public to insert order_items"
ON order_items FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public to read order_items"
ON order_items FOR SELECT
TO public
USING (true);
```

### Step 3: Verify Policies
After running the script, verify the policies were created:

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. Check that both `orders` and `order_items` tables have policies listed
3. Or run this query to verify:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;
```

### Step 4: Test Checkout
1. Try placing an order on your website
2. The checkout should now work without the RLS error

## What This Does

The SQL script:
- ✅ Enables RLS on `orders` and `order_items` tables
- ✅ Allows **public** users to INSERT new orders
- ✅ Allows **public** users to READ orders (for confirmation page)
- ✅ Allows **public** users to UPDATE orders (for status changes)
- ✅ Allows **public** users to INSERT order items
- ✅ Allows **public** users to READ order items

## Security Note

⚠️ **Important**: This configuration allows **anyone** to create, read, and update orders without authentication. This is fine for a simple store, but for production you should:

1. Add user authentication
2. Restrict policies to authenticated users only
3. Add conditions like: `USING (auth.uid() = user_id)`

## Alternative: Disable RLS (Not Recommended for Production)

If you want to completely disable RLS (easier but less secure):

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

## Date
November 29, 2025
