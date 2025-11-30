'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useState } from 'react';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  category: string;
  description?: string;
  shipping_cost?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getImageUrl(product.images[0]);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const [isAdding, setIsAdding] = useState(false);

  // Check if product is already in cart
  const isInCart = items.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    
    // Don't add if already in cart
    if (isInCart) return;
    
    setIsAdding(true);
    
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: imageUrl,
      quantity: 1,
      shippingCost: product.shipping_cost || 0,
    };
    
    console.log('Adding to cart:', cartItem);
    addItem(cartItem);
    console.log('Cart items after add:', items);

    // Keep button disabled after adding
    // No timeout - once added, stays disabled
  };

  return (
    <div className="card group hover:shadow-xl transition-all duration-300">
      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
              {product.condition}
            </span>
          </div>
          
          {/* Quick View Button on Hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/shop/${product.id}`}>
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
          <p className="text-2xl font-bold text-primary-600">${product.price}</p>
        </Link>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isInCart}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 ${
            isAdding || isInCart
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg'
          }`}
        >
          <ShoppingCart className={`w-5 h-5 ${isAdding ? 'animate-bounce' : ''}`} />
          {isInCart ? 'In Cart' : isAdding ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
