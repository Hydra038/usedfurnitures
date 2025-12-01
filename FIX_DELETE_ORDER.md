# Fix Order Delete Issue - Quick Guide

## Problem
Delete button shows "Order deleted successfully" but the order remains in the database when you refresh the page.

## Root Cause
The `orders` table in Supabase is missing a DELETE policy for authenticated users. Without this policy, Row Level Security (RLS) blocks all delete operations.

## Solution
Run the migration file: `20240101000007_add_delete_order_policy.sql`

### Method 1: Using Supabase Dashboard (RECOMMENDED)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard
   - Select your project: **usedfurnitures**
   - Click on "SQL Editor" in the left sidebar

2. **Run the Migration**
   - Open the file: `supabase/migrations/20240101000007_add_delete_order_policy.sql`
   - Copy all the SQL code:
     ```sql
     CREATE POLICY "Authenticated users can delete orders"
       ON orders FOR DELETE
       TO authenticated
       USING (true);
     ```
   
3. **Paste and Execute**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter
   - You should see: "Success. No rows returned"

4. **Verify**
   - Refresh your admin orders page
   - Try deleting an order
   - Refresh the page - the order should now be gone!

### Method 2: Using Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
supabase db push
```

This will apply all pending migrations.

---

## What This Migration Does

The migration adds a new RLS policy to the `orders` table:

- **Policy Name**: "Authenticated users can delete orders"
- **Operation**: DELETE
- **Allowed Users**: authenticated (logged-in users, i.e., admins)
- **Condition**: true (allows all authenticated users to delete any order)

This matches the existing pattern where authenticated users can:
- ✅ SELECT (view) all orders
- ✅ UPDATE orders
- ✅ DELETE orders (NEW - this fixes the issue)

---

## Testing After Fix

1. Log in as admin (usa@furnitures.com)
2. Go to Admin Dashboard → Orders
3. Click delete button on any order
4. Confirm the deletion
5. **Refresh the page** - the order should be gone
6. Check Supabase dashboard → Table Editor → orders table to confirm

---

## Technical Details

**Before Fix:**
- Frontend: Delete button calls `supabase.from('orders').delete()`
- Backend: RLS blocks the delete (no DELETE policy exists)
- Result: No error returned, but nothing deleted
- UI: Shows success message, but data persists

**After Fix:**
- Frontend: Same delete call
- Backend: RLS allows delete (new policy in place)
- Result: Order actually deleted from database
- UI: Shows success message, data is gone

---

## Related Files

- Migration: `supabase/migrations/20240101000007_add_delete_order_policy.sql`
- Admin Page: `app/admin/orders/page.tsx` (deleteOrder function)
- Original Schema: `supabase/migrations/001_initial_schema.sql`

---

## Questions?

If you have issues:
1. Make sure you're logged in as admin
2. Check browser console for errors
3. Verify the policy was created in Supabase Dashboard → Database → Policies
