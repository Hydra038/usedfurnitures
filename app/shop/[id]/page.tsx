'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingCart, Package, Truck, Maximize2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { getVideoUrl } from '@/lib/utils/videoUrl';
import FullscreenMediaViewer from '@/components/FullscreenMediaViewer';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  dimensions: string;
  category: string;
  stock: number;
  shipping_cost: number;
  images: string[];
  video_url: string | null;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  // Check if product is already in cart
  const isInCart = product ? items.some(item => item.id === product.id) : false;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product || isInCart) return;

    setIsAdding(true);

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: getImageUrl(product.images[0]),
      shippingCost: product.shipping_cost,
    });

    // Keep button disabled after adding
    // No timeout - once added, stays disabled
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <BackButton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
        {/* Images and Video */}
        <div>
          {/* Main Image - Always show first */}
          <div className="relative h-96 mb-4 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setShowFullscreen(true)}>
            <Image
              src={getImageUrl(product.images[selectedImage])}
              alt={product.title}
              fill
              className="object-cover"
            />
            {/* Fullscreen Button Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3 shadow-lg">
                <Maximize2 className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary-600' : ''
                  }`}
                >
                  <Image src={getImageUrl(image)} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* View Fullscreen Button */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="w-full mb-4 py-2 px-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Maximize2 className="w-5 h-5" />
            View Fullscreen
          </button>

          {/* Video Section (if available) - Below images */}
          {product.video_url && (
            <div className="rounded-lg overflow-hidden bg-black">
              {product.video_url.includes('youtube.com') || product.video_url.includes('youtu.be') || product.video_url.includes('vimeo.com') ? (
                // Embed for YouTube/Vimeo URLs
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={product.video_url}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                // HTML5 video player for uploaded videos
                <video 
                  controls 
                  className="w-full"
                  preload="metadata"
                >
                  <source src={getVideoUrl(product.video_url)} type="video/mp4" />
                  <source src={getVideoUrl(product.video_url)} type="video/webm" />
                  <source src={getVideoUrl(product.video_url)} type="video/quicktime" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold">
              {product.category}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-primary-600">${product.price}</span>
            <span className="bg-gray-100 px-4 py-2 rounded-lg font-semibold">
              Condition: {product.condition}
            </span>
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-line">{product.description}</p>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-5 h-5" />
              <span>Dimensions: {product.dimensions}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Truck className="w-5 h-5" />
              <span>Shipping: ${product.shipping_cost}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="w-5 h-5" />
              <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>
          </div>

          {/* Add to Cart */}
          {product.stock > 0 ? (
            <div className="space-y-4">
              <button 
                onClick={handleAddToCart} 
                disabled={isAdding || isInCart}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  isAdding || isInCart
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg'
                }`}
              >
                <ShoppingCart className={`w-5 h-5 ${isAdding ? 'animate-bounce' : ''}`} />
                {isInCart ? 'In Cart' : isAdding ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-gray-600 font-semibold">Out of Stock</p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Media Viewer */}
      {showFullscreen && (
        <FullscreenMediaViewer
          images={product.images.map(img => getImageUrl(img))}
          videoUrl={product.video_url}
          initialIndex={selectedImage}
          onClose={() => setShowFullscreen(false)}
        />
      )}
    </div>
  );
}
