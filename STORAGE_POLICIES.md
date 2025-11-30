# Storage Buckets Setup Complete! ✅

## Current Status

Your Supabase Storage buckets are created:
- ✅ **product-videos** (Public) - 0 files
- ✅ **product-images** (Public) - 4 files
- ✅ **payment-proofs** (2 files)

## Next Steps to Enable Video Upload

### 1. Set Up Storage Policies (Required)

The buckets exist, but you need to add RLS (Row Level Security) policies to allow uploads:

#### For `product-videos` bucket:

1. Click on **product-videos** bucket in your Supabase dashboard
2. Go to **Policies** tab
3. Click **New Policy**
4. Add these policies:

   **Policy 1: Allow Public Read**
   - Operation: SELECT
   - Policy name: "Public Access"
   - Target roles: public
   - USING expression: `true`

   **Policy 2: Allow Authenticated Upload**
   - Operation: INSERT
   - Policy name: "Authenticated users can upload"
   - Target roles: authenticated
   - WITH CHECK expression: `true`

   **Policy 3: Allow Authenticated Update**
   - Operation: UPDATE
   - Policy name: "Authenticated users can update"
   - Target roles: authenticated
   - USING expression: `true`

   **Policy 4: Allow Authenticated Delete**
   - Operation: DELETE
   - Policy name: "Authenticated users can delete"
   - Target roles: authenticated
   - USING expression: `true`

#### For `product-images` bucket (verify it has the same):

Repeat the same 4 policies for the `product-images` bucket.

### 2. Quick Way (Using SQL)

Alternatively, go to **SQL Editor** and run:

```sql
-- Policies for product-videos
CREATE POLICY "Public Access for Videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-videos');

CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-videos');

CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-videos');

-- Policies for product-images
CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### 3. Test the Upload

After setting up policies:
1. Refresh your app (already running on port 3000)
2. Go to **Admin → Products → Add New Product**
3. Try uploading a video file
4. It should work now! 🎉

## Troubleshooting

If you still get errors:
- Check that you're logged in as admin (usa@furnitures.com)
- Verify the policies were created successfully
- Check browser console for specific error messages
- The app will automatically fall back to video URL if upload fails
