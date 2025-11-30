/**
 * Script to create Supabase Storage buckets for product images and videos
 * Run this with: node scripts/createStorageBuckets.js
 */

import { createClient } from '@supabase/supabase-js';

// Get these from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
  console.log('🚀 Creating storage buckets...\n');

  // Create product-images bucket
  console.log('📦 Creating product-images bucket...');
  const { data: imagesBucket, error: imagesError } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  });

  if (imagesError) {
    if (imagesError.message.includes('already exists')) {
      console.log('✅ product-images bucket already exists');
    } else {
      console.error('❌ Error creating product-images bucket:', imagesError);
    }
  } else {
    console.log('✅ product-images bucket created successfully');
  }

  // Create product-videos bucket
  console.log('\n📦 Creating product-videos bucket...');
  const { data: videosBucket, error: videosError } = await supabase.storage.createBucket('product-videos', {
    public: true,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
  });

  if (videosError) {
    if (videosError.message.includes('already exists')) {
      console.log('✅ product-videos bucket already exists');
    } else {
      console.error('❌ Error creating product-videos bucket:', videosError);
    }
  } else {
    console.log('✅ product-videos bucket created successfully');
  }

  // List all buckets to confirm
  console.log('\n📋 Listing all buckets...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError);
  } else {
    console.log('\n✅ Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  }

  console.log('\n✨ Done! Your storage buckets are ready.');
  console.log('\n📝 Note: You may need to set up RLS policies in the Supabase dashboard');
  console.log('   Go to: Storage > [bucket name] > Policies');
}

createBuckets().catch(console.error);
