# Database Migrations Guide

## 🎯 Overview

Your furniture store application requires several database migrations to enable all features. These migrations must be run **in order** in your Supabase SQL Editor.

---

## 📋 Migration List

### ✅ Already Run (Base Schema)
1. **001_initial_schema.sql** - Creates products, orders, order_items tables

### ⚠️ Need to Run (In Order)

2. **002_add_user_id_to_orders.sql** - Links orders to authenticated users
3. **003_update_order_status_constraint.sql** - Updates status field constraints
4. **004_add_payment_options.sql** - Adds payment plan fields
5. **005_create_payment_methods_table.sql** - Creates payment methods table

---

## 🚀 How to Run Migrations

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Each Migration
For each migration file (starting with 002):

1. Click **"New Query"**
2. Copy the entire SQL file content
3. Paste into the SQL editor
4. Click **"Run"** button
5. Wait for "Success" message
6. Proceed to next migration

---

## 📄 Migration Details

### 002_add_user_id_to_orders.sql

**Purpose**: Link orders to authenticated users for better tracking

**Adds:**
- `user_id` column to orders table
- Foreign key reference to auth.users
- Index for fast queries
- RLS policy for users to view their own orders

**Run this if:**
- Users can't see their orders
- Getting error about `user_id` column

---

### 003_update_order_status_constraint.sql

**Purpose**: Expand order status options beyond just 3

**Changes:**
- Removes old constraint (pending, confirmed, rejected)
- Adds new constraint with 7 statuses:
  - pending
  - confirmed
  - processing
  - shipped
  - delivered
  - cancelled
  - rejected

**Run this if:**
- Can't set order status to "processing", "shipped", or "delivered"
- Getting constraint violation errors

---

### 004_add_payment_options.sql

**Purpose**: Enable flexible payment plans (Full/Half/Custom)

**Adds:**
- `payment_option` column ('full', 'half', 'other')
- `amount_paid` column (DECIMAL)
- `remaining_balance` column (DECIMAL)
- Indexes for fast queries
- Constraint to validate payment options

**Run this if:**
- Payment plan options not saving
- Getting error about `payment_option` column
- Invoice not showing payment breakdown

**Example Data:**
```sql
-- Full Payment Order
payment_option: 'full'
amount_paid: 500.00
remaining_balance: 0.00

-- Half Payment Order
payment_option: 'half'
amount_paid: 250.00
remaining_balance: 250.00

-- Custom Payment Order (30%)
payment_option: 'other'
amount_paid: 150.00
remaining_balance: 350.00
```

---

### 005_create_payment_methods_table.sql

**Purpose**: Dynamic payment method management for admins

**Creates:**
- New `payment_methods` table with columns:
  - id (UUID, Primary Key)
  - name (TEXT) - Display name (e.g., "Venmo")
  - method_id (TEXT, Unique) - Technical ID (e.g., "venmo")
  - details (TEXT) - Username/email/phone
  - is_enabled (BOOLEAN) - Enable/disable toggle
  - display_order (INTEGER) - Sort order
  - icon (TEXT, Optional) - Icon name or URL
  - created_at, updated_at

**Inserts Default Data:**
1. Venmo - @username
2. Cash App - $cashtag
3. Zelle - email@example.com
4. Chime - email@example.com
5. Apple Pay - (empty)
6. PayPal - email@example.com

**Enables RLS Policies:**
- Anyone can view enabled methods
- Authenticated users can view all methods
- Authenticated users can add/edit/delete methods

**Run this if:**
- Getting error: "Could not find table 'payment_methods'"
- Payment methods not showing in checkout
- Can't access /admin/payment-methods page

---

## 🔍 Verify Migrations

After running all migrations, verify with this query:

```sql
-- Check orders table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Expected columns:
-- id, created_at, total_price, shipping_address, payment_method, 
-- payment_status, payment_proof_url, transaction_reference, 
-- customer_email, customer_name, customer_phone, notes,
-- user_id, payment_option, amount_paid, remaining_balance

-- Check payment_methods table exists
SELECT * FROM payment_methods ORDER BY display_order;

-- Expected: 6 default payment methods
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Column already exists"
**Cause**: Migration already run or column added manually
**Solution**: Skip that migration or use `IF NOT EXISTS` clause

### Issue 2: "Constraint violation"
**Cause**: Existing data doesn't match new constraints
**Solution**: 
```sql
-- Check existing invalid data
SELECT * FROM orders WHERE payment_option NOT IN ('full', 'half', 'other');

-- Update invalid data
UPDATE orders SET payment_option = 'full' WHERE payment_option IS NULL;
```

### Issue 3: "Policy conflict"
**Cause**: RLS policy with same name exists
**Solution**:
```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Policy Name" ON table_name;

-- Then re-run migration
```

### Issue 4: "Foreign key violation"
**Cause**: Referenced table/column doesn't exist
**Solution**: Ensure migrations run in correct order (002 → 003 → 004 → 005)

---

## 🧪 Test After Migrations

### Test 1: User ID Tracking
1. Log in as user
2. Place an order
3. Go to "My Orders"
4. Verify you see your order

### Test 2: Payment Plans
1. Go to checkout
2. Select "Half Payment"
3. Place order
4. Check database: `SELECT payment_option, amount_paid, remaining_balance FROM orders WHERE id = 'order_id';`
5. Verify: payment_option='half', amount_paid=250.00, remaining_balance=250.00

### Test 3: Payment Methods
1. Go to `/admin/payment-methods`
2. Verify 6 default methods appear
3. Try adding new method
4. Try editing existing method
5. Try toggling enable/disable
6. Try deleting method
7. Go to checkout
8. Verify only enabled methods appear

### Test 4: Order Status
1. Go to admin orders page
2. Try changing status to each of 7 options
3. Verify no constraint errors
4. Check status badge colors update

### Test 5: Invoice Generation
1. Place order (any payment plan)
2. Admin confirms order
3. Go to "My Orders"
4. Verify invoice button is enabled (green)
5. Download invoice
6. Verify PDF shows correct payment breakdown

---

## 📊 Database Schema After All Migrations

### orders table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id), -- ← Migration 002
  total_price DECIMAL(10, 2) NOT NULL,
  payment_option TEXT DEFAULT 'full', -- ← Migration 004
  amount_paid DECIMAL(10, 2) DEFAULT 0, -- ← Migration 004
  remaining_balance DECIMAL(10, 2) DEFAULT 0, -- ← Migration 004
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_proof_url TEXT,
  transaction_reference TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT,
  CONSTRAINT orders_payment_option_check 
    CHECK (payment_option IN ('full', 'half', 'other')),
  CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('pending', 'confirmed', 'processing', 
                               'shipped', 'delivered', 'cancelled', 'rejected'))
);
```

### payment_methods table
```sql
CREATE TABLE payment_methods ( -- ← Migration 005
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  method_id TEXT UNIQUE NOT NULL,
  details TEXT,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔄 Rollback Instructions (If Needed)

### Rollback Migration 005
```sql
DROP TABLE IF EXISTS payment_methods CASCADE;
```

### Rollback Migration 004
```sql
ALTER TABLE orders DROP COLUMN IF EXISTS payment_option;
ALTER TABLE orders DROP COLUMN IF EXISTS amount_paid;
ALTER TABLE orders DROP COLUMN IF EXISTS remaining_balance;
DROP INDEX IF EXISTS idx_orders_payment_option;
DROP INDEX IF EXISTS idx_orders_remaining_balance;
```

### Rollback Migration 003
```sql
-- Drop new constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add back old constraint
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'confirmed', 'rejected'));
```

### Rollback Migration 002
```sql
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP INDEX IF EXISTS idx_orders_user_id;
ALTER TABLE orders DROP COLUMN IF EXISTS user_id;
```

---

## 📝 Migration Checklist

Print this and check off as you complete:

- [ ] Backup database (optional but recommended)
- [ ] Run 002_add_user_id_to_orders.sql
- [ ] Verify user_id column exists
- [ ] Run 003_update_order_status_constraint.sql
- [ ] Test setting different order statuses
- [ ] Run 004_add_payment_options.sql
- [ ] Verify payment columns exist
- [ ] Run 005_create_payment_methods_table.sql
- [ ] Verify 6 default methods inserted
- [ ] Test placing order with half payment
- [ ] Test admin payment methods page
- [ ] Test invoice download feature
- [ ] Restart Next.js dev server

---

## 🎉 Success Criteria

You'll know migrations succeeded when:

1. ✅ No errors when running each migration
2. ✅ All tables and columns exist (verify query above)
3. ✅ Orders link to authenticated users
4. ✅ Can set any of 7 order statuses
5. ✅ Payment plan options save correctly
6. ✅ Payment methods page shows 6 defaults
7. ✅ Can add/edit/delete payment methods
8. ✅ Checkout shows only enabled methods
9. ✅ Invoice downloads with payment breakdown
10. ✅ No console errors in browser or server

---

## 🆘 Need Help?

If migrations fail:

1. **Check Supabase logs**: SQL Editor shows error messages
2. **Verify order**: Migrations must run 002 → 003 → 004 → 005
3. **Check existing data**: Query tables to see current structure
4. **Use IF NOT EXISTS**: Migrations already include this for safety
5. **Check RLS policies**: May need to drop conflicting policies first

Common error patterns:
- `column "xyz" already exists` → Skip or modify migration
- `constraint "abc" already exists` → Drop constraint first
- `relation "table" does not exist` → Run earlier migration first
- `foreign key constraint` → Ensure referenced table exists

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs/guides/database/migrations
- **PostgreSQL Docs**: https://www.postgresql.org/docs/current/sql-altertable.html
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

Good luck with your migrations! 🚀
