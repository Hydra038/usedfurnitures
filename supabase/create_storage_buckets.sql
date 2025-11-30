-- Create product-videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for product-videos bucket
-- Allow public access to read videos
CREATE POLICY IF NOT EXISTS "Public Access for Videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-videos');

-- Allow authenticated users to upload videos
CREATE POLICY IF NOT EXISTS "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-videos');

-- Allow authenticated users to update their videos
CREATE POLICY IF NOT EXISTS "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-videos');

-- Allow authenticated users to delete videos
CREATE POLICY IF NOT EXISTS "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-videos');

-- Ensure product-images bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for product-images bucket
CREATE POLICY IF NOT EXISTS "Public Access for Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
