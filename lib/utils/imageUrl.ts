/**
 * Utility function to convert product image paths to full URLs
 * Handles both relative filenames and absolute URLs
 */
export function getImageUrl(image: string | undefined | null): string {
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
  
  // If it's just a filename, construct Supabase storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/product-images/${image}`;
  }
  
  // Fallback to placeholder if no Supabase URL configured
  console.warn('No NEXT_PUBLIC_SUPABASE_URL configured, using placeholder');
  return '/placeholder-furniture.jpg';
}

/**
 * Convert array of image paths to full URLs
 */
export function getImageUrls(images: string[] | undefined | null): string[] {
  if (!images || images.length === 0) {
    return ['/placeholder-furniture.jpg'];
  }
  
  return images.map(getImageUrl);
}
