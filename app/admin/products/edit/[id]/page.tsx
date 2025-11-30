'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  async function fetchProduct() {
    try {
      setFetchingProduct(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
        setCondition(data.condition || 'A');
        setDimensions(data.dimensions || '');
        setCategory(data.category || '');
        setStock(data.stock?.toString() || '1');
        setShippingCost(data.shipping_cost?.toString() || '0');
        setExistingImages(data.images || []);
        setVideoUrl(data.video_url || '');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
    } finally {
      setFetchingProduct(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new images if any
      const newImageUrls: string[] = [];
      if (imageFiles) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (error) throw error;
          
          // Store just the filename, not the full URL
          newImageUrls.push(fileName);
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

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

      // Update product
      const { error } = await supabase
        .from('products')
        .update({
          title,
          description,
          price: parseFloat(price),
          condition,
          dimensions,
          category,
          stock: parseInt(stock),
          shipping_cost: parseFloat(shippingCost),
          images: allImages,
          video_url: uploadedVideoUrl || null,
        })
        .eq('id', productId);

      if (error) throw error;

      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  if (fetchingProduct) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Price *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'A+' | 'A' | 'B')}
                className="w-full p-2 border rounded"
                required
              >
                <option value="A+">A+ (Like New)</option>
                <option value="A">A (Excellent)</option>
                <option value="B">B (Good)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded"
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
              <label className="block mb-2 font-semibold">Stock *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Shipping Cost</label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Dimensions</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., 120cm x 80cm x 75cm"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block mb-2 font-semibold">Current Images</label>
              <div className="grid grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`/images/${image}`}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold">Add New Images</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <input
                type="file"
                onChange={(e) => setImageFiles(e.target.files)}
                className="w-full"
                accept="image/*"
                multiple
              />
              <p className="text-sm text-gray-500 mt-2">Upload product images (multiple allowed)</p>
            </div>
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              placeholder="https://youtube.com/..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Paste YouTube embed URL or other video link (if not uploading a file)
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
