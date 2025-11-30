import { supabase } from '@/lib/supabase';

/**
 * Get the public URL for a video file stored in Supabase Storage
 * @param videoPath - The filename or URL of the video
 * @returns The public URL to access the video
 */
export function getVideoUrl(videoPath: string | null | undefined): string {
  if (!videoPath) return '';
  
  // If it's already a full URL (YouTube, Vimeo, etc.), return as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    return videoPath;
  }
  
  // If it's a filename, get the public URL from Supabase Storage
  const { data } = supabase.storage
    .from('product-videos')
    .getPublicUrl(videoPath);
  
  return data.publicUrl;
}
