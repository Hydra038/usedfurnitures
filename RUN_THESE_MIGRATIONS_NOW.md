# 🚨 URGENT: Run These Migrations Now!

## Error You're Seeing
```
Error creating order: {code: '23514', details: null, hint: null, message: 'new row for relation "orders" violates check constraint "orders_payment_option_check"'}
```

## Why This Happens
The `payment_option` column doesn't exist in your database yet! You need to run the migrations.

## ✅ Quick Fix - Run These 3 Migrations

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration 002
1. Click **New Query**
2. Open file: `supabase/migrations/002_add_user_id_to_orders.sql`
3. Copy the ENTIRE contents
4. Paste into Supabase SQL Editor
5. Click **RUN** button
6. Wait for "Success. No rows returned"

### Step 3: Run Migration 004
1. Click **New Query** again
2. Open file: `supabase/migrations/004_add_payment_options.sql`
3. Copy the ENTIRE contents
4. Paste into Supabase SQL Editor
5. Click **RUN** button
6. Wait for success message (should show table with 3 columns)

### Step 4: Run Migration 005
1. Click **New Query** again
2. Open file: `supabase/migrations/005_create_payment_methods_table.sql`
3. Copy the ENTIRE contents
4. Paste into Supabase SQL Editor
5. Click **RUN** button
6. Wait for success message

### Step 5: Refresh Schema Cache
1. Go to **Settings** → **API** in Supabase
2. Click **"Refresh schema cache"** button
3. Wait 15 seconds

### Step 6: Test Your App
1. Go to checkout page
2. Try placing an order
3. Should work now! ✅

## What Each Migration Does

**Migration 002**: Adds `user_id` column to link orders to authenticated users
**Migration 004**: Adds `payment_option`, `amount_paid`, `remaining_balance` columns
**Migration 005**: Creates `payment_methods` table for dynamic payment options

## Need Help?
If you still see errors after running these migrations:
1. Check the error message carefully
2. Verify all 3 migrations ran successfully
3. Make sure schema cache was refreshed
4. Try restarting your dev server: `npm run dev`
