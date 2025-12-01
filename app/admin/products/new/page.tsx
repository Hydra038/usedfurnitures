'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'A+' | 'A' | 'B'>('A');
  const [dimensions, setDimensions] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('1');
  const [shippingCost, setShippingCost] = useState('0');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<'available' | 'reserved' | 'sold'>('available');

  const categories = [
    'Sofas & Couches',
    'Chairs & Recliners',
    'Tables',
    'Beds & Mattresses',
    'Dressers & Wardrobes',
    'Desks',
    'Cabinets & Storage',
    'Bookshelves',
    'Entertainment Centers',
    'Outdoor Furniture',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images (maintaining order - first uploaded = first in array)
      const imageUrls: string[] = [];
      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          // Add index to filename to preserve order
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (error) throw error;
          
          // Store just the filename, not the full URL
          imageUrls.push(fileName);
        }
      }

      // Upload video if provided
      let uploadedVideoUrl: string | null = videoUrl || null;
      if (videoFile) {
        try {
          const fileExt = videoFile.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('product-videos')
            .upload(fileName, videoFile);

          if (error) {
            console.error('Video upload error:', error);
            alert('Failed to upload video. The product-videos bucket may not exist. Please contact admin or use a video URL instead.');
            // Continue without video if upload fails
            uploadedVideoUrl = videoUrl || null;
          } else {
            // Store just the filename, not the full URL
            uploadedVideoUrl = fileName;
          }
        } catch (err) {
          console.error('Video upload exception:', err);
          alert('Failed to upload video. Using URL if provided.');
          uploadedVideoUrl = videoUrl || null;
        }
      }

      // Create product
      const { error } = await supabase.from('products').insert({
        title,
        description,
        price: parseFloat(price),
        condition,
        dimensions,
        category,
        stock: parseInt(stock),
        shipping_cost: parseFloat(shippingCost),
        images: imageUrls,
        video_url: uploadedVideoUrl || null,
        status,
      });

      if (error) throw error;

      router.push('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'A+' | 'A' | 'B')}
                className="input-field"
                required
              >
                <option value="A+">A+ (Excellent)</option>
                <option value="A">A (Very Good)</option>
                <option value="B">B (Good)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'available' | 'reserved' | 'sold')}
                className="input-field"
                required
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Dimensions *</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="input-field"
                placeholder='e.g., 72"W x 36"D x 30"H'
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Stock *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Shipping Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Product Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(e.target.files)}
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload multiple images. The first image will be the main thumbnail displayed in product listings.
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Product Video (Optional)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="input-field"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a video file (MP4, MOV, etc.) or use the URL field below
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Or Video URL (Optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="input-field"
              placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              Paste YouTube embed URL or other video embed link (if not uploading a file)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
