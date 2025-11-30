import Link from 'next/link';
import { Sofa, Sparkles } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80"
            alt="Modern furniture"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Sofa className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
              Quality Second-Hand Furniture
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 drop-shadow-md px-4">
              Discover beautiful, pre-loved furniture for your home. 
              Sustainable, affordable, and delivered across the United States.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-4">
              <Link href="/shop" className="btn-primary bg-white text-gray-900 hover:bg-gray-100 shadow-lg text-sm sm:text-base">
                Browse Furniture
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 shadow-lg text-sm sm:text-base">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-8 sm:mb-12">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">Featured Furniture</h2>
          </div>
          <ProductGrid limit={6} />
          <div className="text-center mt-12">
            <Link href="/shop" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Every piece is carefully inspected and graded for condition.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Nationwide Shipping</h3>
              <p className="text-gray-600">
                We deliver across the United States with care.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Payment</h3>
              <p className="text-gray-600">
                Venmo, Cash App, Zelle, PayPal, and more accepted.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
