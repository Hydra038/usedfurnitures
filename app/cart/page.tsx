'use client';

import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function CartPage() {
  const { items, removeItem, getTotal, clearCart } = useCartStore();

  const subtotal = getTotal();
  const total = subtotal; // Shipping fee will be added at checkout based on delivery option

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <BackButton />
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some furniture to get started!</p>
          <Link href="/shop" className="btn-primary">
            Browse Furniture
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <BackButton />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md flex gap-3 sm:gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{item.title}</h3>
                <p className="text-primary-600 font-bold text-sm sm:text-base">${item.price}</p>
              </div>

              <div className="flex flex-col items-end justify-center flex-shrink-0">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 font-semibold"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Shipping fee will be calculated at checkout based on delivery option
            </p>

            <Link href="/checkout" className="btn-primary w-full block text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
