# Image URL Fix - Product Images

## Problem
Product images were stored in the database as filenames only (e.g., `"1764454126529.jpg"`) instead of full URLs. This caused Next.js Image component to fail with errors like:
```
Failed to parse src "1764454126529.jpg"
```

The Next.js Image component requires either:
- Absolute URLs (starting with http:// or https://)
- Paths starting with `/` (local public files)

## Solution
Created a centralized utility function to convert image filenames to proper Supabase Storage URLs.

### Files Created
1. **`lib/utils/imageUrl.ts`** - Centralized utility functions
   - `getImageUrl(image)` - Converts single image to full URL
   - `getImageUrls(images)` - Converts array of images to full URLs

### Files Updated
1. **`components/ProductCard.tsx`** - Product grid cards
   - Imported `getImageUrl` utility
   - Removed local getImageUrl function
   - Now uses shared utility

2. **`app/shop/[id]/page.tsx`** - Product detail page
   - Imported `getImageUrl` utility
   - Updated main product image display
   - Updated thumbnail images in grid
   - Updated `handleAddToCart` to save proper URL to cart

3. **`app/admin/products/page.tsx`** - Admin products list
   - Imported `getImageUrl` utility
   - Updated product thumbnail display in table

4. **`public/placeholder-furniture.jpg`** - Fallback image (SVG)
   - Created placeholder for missing images

## How It Works

The `getImageUrl()` function handles three cases:

1. **Already a full URL** (http:// or https://)
   - Returns as-is

2. **Local public file** (starts with /)
   - Returns as-is

3. **Filename only** (e.g., "1764454126529.jpg")
   - Constructs Supabase Storage URL:
   ```typescript
   `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`
   ```

4. **Missing/null image**
   - Returns placeholder: `/placeholder-furniture.jpg`

## Storage Bucket
- **Bucket Name**: `product-images`
- **Access**: Public (anonymous read access)
- **Base URL**: `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`

## Usage Example

```typescript
import { getImageUrl } from '@/lib/utils/imageUrl';

// Single image
const imageUrl = getImageUrl(product.images[0]);
<Image src={imageUrl} alt="Product" />

// Array of images
const imageUrls = getImageUrls(product.images);
```

## Cart Integration
When adding products to cart, the image URL is now properly converted before storage:
```typescript
addItem({
  id: product.id,
  title: product.title,
  price: product.price,
  quantity,
  image: getImageUrl(product.images[0]), // ✅ Proper URL saved to cart
  shippingCost: product.shipping_cost,
});
```

This means cart items already have the correct URLs, so the cart page (`app/cart/page.tsx`) doesn't need any changes.

## Testing Checklist
- ✅ Shop page (product grid) shows images
- ✅ Product detail page shows main image
- ✅ Product detail page shows thumbnail images
- ✅ Add to cart saves proper image URL
- ✅ Cart page shows product images
- ✅ Admin products page shows thumbnails
- ✅ Placeholder shows when image is missing

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

This variable must be set in `.env.local` for the image URL construction to work.

## Future Improvements
1. Add image optimization/resizing
2. Add lazy loading for better performance
3. Consider using Next.js Image loader for Supabase
4. Add image validation on upload
5. Create multiple image sizes (thumbnail, medium, full)
