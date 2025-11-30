# How to Create Storage Buckets in Supabase

## Error You're Seeing
```
StorageApiError: Bucket not found
Failed to load resource: the server responded with a status of 400
```

This means the `product-videos` bucket doesn't exist in your Supabase Storage.

## Solution: Create the Storage Buckets

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `FurnitureStore`

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click "Create a new bucket"

3. **Create product-videos bucket**
   - Bucket name: `product-videos`
   - Public bucket: ✅ Yes (check this box)
   - Click "Create bucket"

4. **Create product-images bucket** (if not exists)
   - Click "Create a new bucket" again
   - Bucket name: `product-images`
   - Public bucket: ✅ Yes (check this box)
   - Click "Create bucket"

5. **Set up Policies (Important!)**
   - Click on the `product-videos` bucket
   - Go to "Policies" tab
   - Click "New Policy"
   - Select "For full customization" or use templates:
     - **SELECT (Read)**: Allow public access
     - **INSERT (Create)**: Allow authenticated users
     - **UPDATE**: Allow authenticated users
     - **DELETE**: Allow authenticated users

6. **Repeat policies for product-images bucket**

### Option 2: Using SQL Editor

1. **Go to SQL Editor in Supabase Dashboard**
   - Click on "SQL Editor" in the left sidebar

2. **Run the SQL script**
   - Copy the contents of `supabase/create_storage_buckets.sql`
   - Paste into the SQL Editor
   - Click "Run"

3. **Verify**
   - Go to Storage section
   - You should see both `product-images` and `product-videos` buckets

## What the Buckets Are For

- **product-images**: Stores product photos uploaded by admins
- **product-videos**: Stores product videos uploaded by admins

Both buckets need to be PUBLIC so that customers can view the images and videos on the website.

## After Creating Buckets

1. Refresh your application: `npm start` or reload the page
2. Try uploading a product with a video again
3. The error should be resolved

## Notes

- The code now has error handling, so if video upload fails, it will use the video URL instead (if provided)
- You can always use YouTube/Vimeo URLs instead of uploading videos directly
- Uploaded videos are stored with just the filename (like images) for consistency
