/**
 * Utility function to convert image paths to full Supabase storage URLs
 * Handles both relative filenames and absolute URLs
 */
export function getImageUrl(image: string | undefined | null, bucket: 'product-images' | 'payment-proofs' = 'product-images'): string {
  // If no image, return placeholder
  if (!image) return '/placeholder-furniture.jpg';
  
  // If already a full URL (http/https), return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // If it starts with /, it's a local public file
  if (image.startsWith('/')) {
    return image;
  }
  
  // Construct Supabase storage URL for the specified bucket
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${image}`;
  }
  
  // Fallback to placeholder if no Supabase URL configured
  console.warn('No NEXT_PUBLIC_SUPABASE_URL configured, using placeholder');
  return '/placeholder-furniture.jpg';
}

/**
 * Convert array of image paths to full URLs
 */
export function getImageUrls(images: string[] | undefined | null, bucket: 'product-images' | 'payment-proofs' = 'product-images'): string[] {
  if (!images || images.length === 0) {
    return ['/placeholder-furniture.jpg'];
  }
  
  return images.map(img => getImageUrl(img, bucket));
}
