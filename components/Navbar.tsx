'use client';

import Link from 'next/link';
import { ShoppingCart, Sofa, Menu, X, Phone } from 'lucide-react';

import { useCartStore } from '@/lib/store/cartStore';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:grid md:grid-cols-3">
          {/* Left: Mobile Menu Button + Desktop Navigation */}
          <div className="flex items-center gap-6">
            {/* Mobile Menu Button - Left Side */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Desktop Navigation Links */}
            <Link href="/shop" className="hidden md:block hover:text-primary-600 transition-colors font-medium">
              Shop
            </Link>
            <Link href="/contact" className="hidden md:block hover:text-primary-600 transition-colors font-medium">
              Contact
            </Link>
            {user && (
              <Link href="/user" className="hidden md:block hover:text-primary-600 transition-colors font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Center: Logo - Centered on Mobile and Desktop */}
          <Link href="/" className="flex items-center justify-center gap-2 text-xl font-bold text-primary-700 absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none pointer-events-none md:pointer-events-auto">
            <Sofa className="w-8 h-8 pointer-events-auto" />
            <span className="hidden sm:inline pointer-events-auto">Best Used Furniture</span>
            <span className="sm:hidden pointer-events-auto">Best Used</span>
          </Link>

          {/* Right: Utilities & Actions */}
          <div className="flex items-center justify-end gap-4 relative z-10">
            <a href="tel:2352001489" className="hidden lg:flex items-center gap-1 hover:text-primary-600 transition-colors">
              <Phone className="w-4 h-4" />
              <span className="text-sm">(235) 200-1489</span>
            </a>
            <Link href="/cart" className="relative hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {!user && (
              <Link href="/login" className="hidden md:inline-block btn btn-primary">Login</Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Slide-in Menu from Left */}
            <div className="fixed left-0 top-0 bottom-0 w-56 sm:w-64 bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Sofa className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-base">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                <Link
                  href="/shop"
                  className="block px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                {user && (
                  <Link
                    href="/user"
                    className="block px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                
                {/* Phone Link */}
                <a
                  href="tel:2352001489"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Phone className="w-5 h-5" />
                  <span>(235) 200-1489</span>
                </a>
                
                {/* Cart Link */}
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  {mounted && itemCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                      {itemCount}
                    </span>
                  )}
                </Link>
                
                {/* Login Button */}
                {!user && (
                  <Link 
                    href="/login" 
                    className="block mt-4 btn btn-primary text-center" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
