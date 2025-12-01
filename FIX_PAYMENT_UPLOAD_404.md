# Fix: 404 Error - Payment Proof Upload Not Working

## 🔴 The Error

```json
{"statusCode":"404","error":"not_found","message":"Object not found"}
```

This means the uploaded image file doesn't exist in Supabase storage.

---

## 🎯 Root Causes

1. **Storage bucket doesn't exist** - `payment-proofs` bucket not created
2. **Storage policies missing** - No permission to upload/view files
3. **Upload failed silently** - File didn't actually upload but no error shown
4. **Wrong bucket configuration** - Bucket set to private but no access policies

---

## ✅ Complete Fix

### **Step 1: Run the Migration in Supabase**

I've created a migration file: `20240101000008_fix_payment_proofs_storage.sql`

**How to run it:**

1. **Go to Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/editor

2. **Copy the SQL from the migration file:**
   Located at: `supabase/migrations/20240101000008_fix_payment_proofs_storage.sql`

3. **Paste and run in SQL Editor**

4. **What it does:**
   - ✅ Creates `payment-proofs` bucket (if not exists)
   - ✅ Sets 10MB file size limit
   - ✅ Makes bucket private (secure)
   - ✅ Adds upload policy for public users (checkout)
   - ✅ Adds upload policy for authenticated users
   - ✅ Adds view policy for authenticated users (admin)
   - ✅ Adds update/delete policies for authenticated users

---

### **Step 2: Verify Bucket Exists**

**Option A: Via Dashboard (Easy)**

1. Go to: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/storage/buckets
2. Look for bucket named: `payment-proofs`
3. If it doesn't exist, click "New bucket"
   - Name: `payment-proofs`
   - Public: **NO** (keep it private)
   - File size limit: 10485760 (10MB)
4. Click "Create bucket"

**Option B: Via SQL**

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'payment-proofs';

-- If empty result, create it:
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('payment-proofs', 'payment-proofs', false, 10485760);
```

---

### **Step 3: Add Storage Policies**

Run this SQL in Supabase:

```sql
-- Allow public users to upload (for checkout)
CREATE POLICY "Public can upload payment proofs"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'payment-proofs');

-- Allow authenticated users to view (for admin)
CREATE POLICY "Authenticated can view payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-proofs');
```

---

### **Step 4: Test the Upload**

**Updated checkout code now includes:**
- ✅ Better error logging
- ✅ File info display
- ✅ Clear error messages
- ✅ Upload options (cacheControl, upsert)

**Test process:**

1. Go to checkout page
2. Upload an image as payment proof
3. Open browser console (F12)
4. Look for logs:
   ```
   Uploading payment proof: {fileName, fileSize, fileType}
   Generated filename: 1234567890.png
   Upload successful: {data}
   ```
5. If error appears, you'll see:
   ```
   Upload error: {error details}
   ```

---

## 🔍 Debugging Steps

### **If upload still fails:**

1. **Check Console Logs**
   - Open browser DevTools (F12) → Console tab
   - Look for error messages
   - Copy and share the error

2. **Check Network Tab**
   - DevTools → Network tab
   - Filter by: "supabase.co"
   - Find the upload request
   - Check response status and body

3. **Verify Supabase Connection**
   ```tsx
   // Add this to checkout page temporarily
   const testUpload = async () => {
     const { data, error } = await supabase.storage
       .from('payment-proofs')
       .list();
     console.log('Bucket test:', { data, error });
   };
   ```

4. **Check Bucket Policies**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT policyname, cmd, qual
   FROM pg_policies 
   WHERE tablename = 'objects' 
     AND policyname LIKE '%payment%';
   ```

---

## 🛠️ Manual Testing in Supabase

### **Test Upload via Dashboard:**

1. Go to: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/storage/buckets/payment-proofs
2. Click "Upload file"
3. Select an image
4. If upload succeeds → policies are correct
5. If upload fails → policies need fixing

---

## 📊 Expected Behavior After Fix

### **During Checkout:**

1. User selects payment proof image
2. Console shows: `Uploading payment proof: {...}`
3. File uploads to Supabase
4. Console shows: `Upload successful: {...}`
5. Order created with `payment_proof_url`
6. Redirect to confirmation page

### **In Admin Dashboard:**

1. Admin views order
2. Payment proof image displays
3. Download button works
4. No 404 errors

---

## 🔐 Security Check

After applying fixes, verify:

- [ ] `payment-proofs` bucket is **private** (not public)
- [ ] Public users CAN upload (for checkout)
- [ ] Public users CANNOT view/list files
- [ ] Authenticated users CAN view/download files
- [ ] Only authenticated users CAN delete files
- [ ] File size limit is set (10MB recommended)

---

## 🎯 Quick Fix Checklist

1. [ ] Run migration SQL in Supabase
2. [ ] Verify `payment-proofs` bucket exists
3. [ ] Check storage policies are created
4. [ ] Test upload from checkout page
5. [ ] Verify admin can view uploaded images
6. [ ] Check console for errors
7. [ ] Test with different image formats (PNG, JPG)
8. [ ] Verify file size limits work

---

## 💡 Common Issues

### **Issue 1: "Bucket not found"**
**Fix:** Create the bucket manually or run the migration

### **Issue 2: "new row violates row-level security policy"**
**Fix:** Add the INSERT policy for public/anon users

### **Issue 3: "File uploads but returns 404 when viewing"**
**Fix:** Add SELECT policy for authenticated users

### **Issue 4: "Permission denied"**
**Fix:** Check if user has correct role (public for upload, authenticated for view)

---

## 📝 After Applying Fix

The upload should work like this:

```
1. User selects image → ✅ File stored in browser
2. User clicks "Place Order" → ✅ Upload starts
3. File sent to Supabase → ✅ Uploaded to payment-proofs bucket
4. Path returned → ✅ "1234567890.png"
5. Order saved → ✅ payment_proof_url = "1234567890.png"
6. Admin views order → ✅ Image loads from storage
```

---

## 🚀 Next Steps

1. **Apply the fix** - Run the migration SQL
2. **Test thoroughly** - Try uploading various image types
3. **Monitor logs** - Check for any errors
4. **Document** - Note any issues for future reference

---

## 📞 If Still Not Working

If the issue persists after applying all fixes:

1. Share the console error logs
2. Share the network request/response
3. Check Supabase storage logs
4. Verify your Supabase plan allows storage
5. Check if storage quota is exceeded

---

**Last Updated**: December 1, 2025
**Files Modified**: 
- `supabase/migrations/20240101000008_fix_payment_proofs_storage.sql`
- `app/checkout/page.tsx` (added better error handling)
