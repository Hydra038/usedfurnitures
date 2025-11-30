# 🔧 Database Error Fix Guide

## ❌ Current Error
```
Could not find the 'total_price' column of 'orders' in the schema cache
```

This means your `orders` table either:
1. Doesn't exist, OR
2. Exists but doesn't have the `total_price` column, OR
3. Has a different structure than expected

---

## 🔍 Step 1: Diagnose the Issue

### Run the Diagnostic Query

1. Open Supabase Dashboard → SQL Editor
2. Open the file: `supabase/DIAGNOSTIC_QUERY.sql`
3. Copy ALL the contents
4. Paste into SQL Editor
5. Click **"Run"**

### Check the Results

Look at the output and answer these questions:

**Question 1**: Does the `orders` table exist?
- ✅ YES → Go to Question 2
- ❌ NO → Go to Solution A

**Question 2**: Does the `orders` table have a `total_price` column?
- ✅ YES → Go to Solution C (cache issue)
- ❌ NO → Go to Solution B

---

## 💡 Solution A: Orders Table Doesn't Exist

**This means the base schema was never created.**

### Steps:

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `001_initial_schema.sql` (updated version)
4. Paste and click "Run"
5. You should see "Success" message

### Then Verify:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'orders';
```

You should see: id, created_at, total_price, shipping_address, payment_method, payment_status, payment_proof_url, transaction_reference, customer_email, customer_name, customer_phone, notes

---

## 💡 Solution B: Orders Table Exists But Missing total_price Column

**This means your table structure is incomplete or different.**

### Option B1: Add Missing Column

Run this query:
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
```

### Option B2: Recreate Table (⚠️ Will delete all orders!)

```sql
-- Backup first!
CREATE TABLE orders_backup AS SELECT * FROM orders;

-- Drop and recreate
DROP TABLE orders CASCADE;

-- Then run 001_initial_schema.sql again
```

---

## 💡 Solution C: Cache Issue (Table and Column Exist)

**Supabase's schema cache might be outdated.**

### Steps:

1. Go to Supabase Dashboard
2. Click Settings → API
3. Click **"Refresh schema cache"** button
4. Wait 10-15 seconds
5. Try your checkout again

---

## 🚀 Complete Fresh Setup (Recommended)

If you want to start clean and ensure everything is correct:

### Step 1: Run Updated 001_initial_schema.sql

This file now has `IF NOT EXISTS` checks, so it's safe to re-run:

```sql
-- Copy entire contents of 001_initial_schema.sql
-- Paste into Supabase SQL Editor
-- Click Run
```

### Step 2: Run Migrations in Order

```sql
-- Run each in a new query:

-- Migration 002: Add user_id to orders
-- (Copy from 002_add_user_id_to_orders.sql)

-- Migration 003: Update status constraint
-- (Copy from 003_update_order_status_constraint.sql)

-- Migration 004: Add payment options
-- (Copy from 004_add_payment_options.sql)

-- Migration 005: Create payment methods table
-- (Copy from 005_create_payment_methods_table.sql)
```

### Step 3: Verify Everything

```sql
-- Check orders table has ALL required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

**Expected columns:**
- id
- created_at
- total_price ✅ **MUST HAVE THIS!**
- user_id (from migration 002)
- payment_option (from migration 004)
- amount_paid (from migration 004)
- remaining_balance (from migration 004)
- shipping_address
- payment_method
- payment_status
- payment_proof_url
- transaction_reference
- customer_email
- customer_name
- customer_phone
- notes

### Step 4: Refresh Schema Cache

1. Supabase Dashboard → Settings → API
2. Click "Refresh schema cache"
3. Wait 10-15 seconds

### Step 5: Test Checkout

1. Go to your app
2. Add item to cart
3. Go to checkout
4. Fill in details
5. Select payment plan
6. Click "Place Order"
7. ✅ Should work!

---

## 🐛 Still Getting Errors?

### Error: "relation already exists"
**Solution**: Already handled with `IF NOT EXISTS` in updated migration

### Error: "policy already exists"
**Solution**: Already handled with conditional checks in updated migration

### Error: "column already exists"
**Solution**: Use `IF NOT EXISTS` or skip that part

### Error: "constraint violation"
**Solution**: Check existing data matches constraints:
```sql
-- Find invalid data
SELECT * FROM orders WHERE payment_status NOT IN ('pending', 'confirmed', 'rejected');

-- Fix invalid data
UPDATE orders SET payment_status = 'pending' WHERE payment_status IS NULL;
```

---

## 📋 Quick Checklist

Run through this checklist:

- [ ] Ran DIAGNOSTIC_QUERY.sql
- [ ] Confirmed `orders` table exists
- [ ] Confirmed `total_price` column exists in orders table
- [ ] Ran 001_initial_schema.sql (updated version)
- [ ] Ran 002_add_user_id_to_orders.sql
- [ ] Ran 004_add_payment_options.sql
- [ ] Ran 005_create_payment_methods_table.sql
- [ ] Refreshed Supabase schema cache
- [ ] Restarted Next.js dev server (`npm run dev`)
- [ ] Tested checkout flow
- [ ] Order created successfully

---

## 🎯 Expected Final State

### Orders Table Should Have:
```sql
orders (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  total_price DECIMAL(10,2) NOT NULL, ← THIS IS CRITICAL
  user_id UUID,
  payment_option TEXT,
  amount_paid DECIMAL(10,2),
  remaining_balance DECIMAL(10,2),
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  payment_proof_url TEXT,
  transaction_reference TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT
)
```

### Checkout Should:
- ✅ Show payment plan dropdown
- ✅ Show payment methods from database
- ✅ Accept full/half/custom payments
- ✅ Create order without errors
- ✅ Redirect to confirmation page

---

## 🆘 Emergency Contact

If nothing works:

1. **Export your products data** (backup):
```sql
COPY (SELECT * FROM products) TO '/tmp/products_backup.csv' CSV HEADER;
```

2. **Drop and recreate all tables** (⚠️ DESTRUCTIVE):
```sql
DROP TABLE order_items CASCADE;
DROP TABLE orders CASCADE;
DROP TABLE products CASCADE;
DROP TABLE payment_methods CASCADE;
```

3. **Run all migrations fresh** (001 → 002 → 004 → 005)

4. **Re-import products** if needed

---

## ✅ Success Signs

You'll know everything is working when:

1. ✅ Diagnostic query shows `total_price` column
2. ✅ No errors in browser console
3. ✅ Order creation succeeds
4. ✅ Order appears in admin dashboard
5. ✅ User can see order in "My Orders"
6. ✅ Invoice button appears (may be disabled if not confirmed)

---

Good luck! 🚀
