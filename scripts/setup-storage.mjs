import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymxfzvegppcikyjyedzi.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage Buckets...\n')
  
  // List existing buckets
  console.log('📋 Checking existing buckets...')
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError.message)
    console.log('\n⚠️  You need to create the buckets manually in Supabase Dashboard:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/storage/buckets')
    console.log('   2. Click "New bucket"')
    console.log('   3. Create bucket named: product-images (Public: Yes)')
    console.log('   4. Create bucket named: product-videos (Public: Yes)')
    return
  }
  
  console.log('✅ Found buckets:', buckets.map(b => b.name).join(', ') || 'none')
  
  const hasImages = buckets.some(b => b.name === 'product-images')
  const hasVideos = buckets.some(b => b.name === 'product-videos')
  
  if (!hasImages) {
    console.log('\n❌ Missing: product-images bucket')
  } else {
    console.log('\n✅ product-images bucket exists')
  }
  
  if (!hasVideos) {
    console.log('❌ Missing: product-videos bucket')
  } else {
    console.log('✅ product-videos bucket exists')
  }
  
  if (!hasImages || !hasVideos) {
    console.log('\n⚠️  Please create the missing buckets manually:')
    console.log('\n📝 Steps:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/ymxfzvegppcikyjyedzi/storage/buckets')
    console.log('   2. Click "New bucket" button')
    if (!hasImages) {
      console.log('   3. Create bucket:')
      console.log('      - Name: product-images')
      console.log('      - Public: ✅ Yes')
      console.log('      - Click "Create bucket"')
    }
    if (!hasVideos) {
      console.log('   4. Create another bucket:')
      console.log('      - Name: product-videos')
      console.log('      - Public: ✅ Yes')
      console.log('      - Click "Create bucket"')
    }
    console.log('\n   5. After creating, run this script again to verify')
  } else {
    console.log('\n✨ All storage buckets are ready!')
    console.log('🎉 You can now upload product images and videos!')
  }
}

setupStorage()
