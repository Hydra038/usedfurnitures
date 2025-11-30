# Video Feature Documentation

## Overview
Your furniture store now supports product videos! Videos will be displayed on the product detail page above the image gallery.

## Database Changes

### Migration File Updated
`supabase/migrations/001_initial_schema.sql` now includes:
```sql
video_url TEXT
```
This optional field stores the video embed URL (YouTube, Vimeo, etc.)

### TypeScript Types Updated
`lib/database.types.ts` now includes `video_url: string | null` in the Product interface.

## Sample Products with Videos
3 products in `sample_products.sql` now have video URLs:
- Modern Gray Sectional Sofa
- Oak Dining Table with 6 Chairs
- Outdoor Wicker Patio Furniture Set

## How to Add Videos

### As Admin (via Admin Panel)
1. Go to `/admin/products/new`
2. Fill in all product details
3. In the "Video URL (Optional)" field, paste a YouTube embed URL
   - Example: `https://www.youtube.com/embed/VIDEO_ID`
   - Get this by clicking "Share" → "Embed" on YouTube and copying the URL from the iframe src

### Supported Platforms
- **YouTube**: `https://www.youtube.com/embed/VIDEO_ID`
- **Vimeo**: `https://player.vimeo.com/video/VIDEO_ID`
- Any iframe-embeddable video URL

## How Videos Display

### Product Detail Page (`/shop/[id]`)
- Video appears at the top of the media section (if available)
- Responsive 16:9 aspect ratio container
- Below the video is the main product image
- Below that are thumbnail images for browsing

### Features
- Fully responsive video player
- Supports autoplay, fullscreen, and all standard video controls
- Only shows if `video_url` is not null

## Migration Steps

When you run the migration in Supabase:
1. The `products` table will get the new `video_url` column
2. Existing products will have `video_url` set to `NULL` (no video)
3. New products can optionally include videos

## All Products Now Have 4+ Images
Every sample product now includes at least 4 high-quality images from Unsplash, giving customers multiple views of each item.

## Next Steps
1. Run `001_initial_schema.sql` in Supabase SQL Editor
2. Run `sample_products.sql` to insert products with videos
3. Test the video feature at `/shop/[product-id]`
4. When adding real products, record short videos showing the furniture from different angles
