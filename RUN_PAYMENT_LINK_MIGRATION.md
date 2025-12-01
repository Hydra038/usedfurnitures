# 🚨 URGENT: Run Database Migration for Payment Link Feature

## Error You're Seeing:
```
Could not find the 'payment_link' column of 'payment_methods' in the schema cache
```

## Why This Happens:
The code is trying to use the `payment_link` column, but it doesn't exist in your database yet. You need to run the migration to create it.

## ✅ Fix: Run the Migration in Supabase

### Step 1: Go to Supabase SQL Editor
Navigate to: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/sql/new

### Step 2: Copy the Migration SQL
Open the file: `supabase/migrations/20240101000011_add_payment_link.sql`

Copy this SQL:

```sql
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
```

### Step 3: Paste and Run
1. Paste the SQL into the editor
2. Click the **"Run"** button
3. Wait for success message

### Step 4: Verify
You should see output showing:
- The `payment_link` column was added
- Your current payment methods with the new column

## 📝 After Running Migration

### Update Your Venmo Payment Link
1. Go to your admin dashboard: `/admin/payment-methods`
2. Click "Edit" on Venmo payment method
3. In the "Payment Link" field, enter your Venmo link:
   - **Format**: `venmo://paycharge?txn=pay&recipients=YOUR_USERNAME`
   - **Example**: `venmo://paycharge?txn=pay&recipients=johnsmith`
   - Replace `YOUR_USERNAME` with your actual Venmo username
4. Click "Update"

### How It Works for Customers
When customers select Venmo at checkout:
1. They'll see a blue **"Open Venmo"** button
2. Clicking it opens the Venmo app directly
3. The payment screen is pre-filled with your username
4. They just need to enter the amount and confirm

### Venmo Link Format
- **Deep Link**: `venmo://paycharge?txn=pay&recipients=USERNAME`
  - Opens Venmo app on mobile
  - Works on iOS and Android
  
- **Web Fallback**: `https://venmo.com/USERNAME`
  - Opens Venmo website on desktop
  - Use this if you want web users to access it too

## 🎯 Other Migrations to Run (If Not Already Done)

While you're in the SQL editor, you should also run these if you haven't:

1. **Product Status** (for available/reserved/sold feature):
   - File: `supabase/migrations/20240101000010_add_product_status.sql`

2. **Product Deletion** (to fix delete button):
   - File: `supabase/migrations/20240101000009_add_products_delete_policy.sql`

3. **Payment Proofs Storage** (if uploads aren't working):
   - File: `supabase/migrations/20240101000008_fix_payment_proofs_storage.sql`

## ✅ Checklist
- [ ] Opened Supabase SQL Editor
- [ ] Copied migration SQL
- [ ] Ran migration successfully
- [ ] Verified payment_link column exists
- [ ] Updated Venmo payment method with actual username
- [ ] Tested "Open Venmo" button on checkout page
- [ ] Verified it opens Venmo app/website correctly

## 💡 Pro Tips
1. Use your actual Venmo username in the link
2. Test the link before going live
3. You can also add payment links for other methods (Cash App, Zelle, etc.)
4. The payment link is optional - methods without links still work normally

## Need Help?
If you see any errors after running the migration, let me know the exact error message!
