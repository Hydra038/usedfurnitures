'use client';

import { useState } from 'react';
import ProductGrid from '@/components/ProductGrid';

const categories = [
  'All',
  'Sofas',
  'Tables',
  'Chairs',
  'Recliners',
  'Outdoor',
  'Dressers',
  'Beds',
  'Storage'
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Shop Furniture</h1>
      
      {/* Category Filter */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 py-2 rounded-full font-semibold transition-colors text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid category={selectedCategory === 'All' ? undefined : selectedCategory} />
    </div>
  );
}
