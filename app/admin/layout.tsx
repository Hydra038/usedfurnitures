'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, ChevronDown, Settings, CreditCard, Package, ShoppingBag, Users, LayoutDashboard, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/admin/login');
      return;
    }
    
    setUser(user);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm lg:text-base">Menu</span>
                  <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 py-2 text-gray-900">
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5 text-gray-600" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        href="/admin/products"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <Package className="w-5 h-5 text-gray-600" />
                        <span>Manage Products</span>
                      </Link>
                      
                      <Link
                        href="/admin/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5 text-gray-600" />
                        <span>View Orders</span>
                      </Link>
                      
                      <Link
                        href="/admin/users"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <Users className="w-5 h-5 text-gray-600" />
                        <span>Manage Users</span>
                      </Link>
                      
                      <Link
                        href="/admin/messages"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span>Contact Messages</span>
                      </Link>
                      
                      <div className="border-t my-2"></div>
                      
                      <Link
                        href="/admin/payment-methods"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors"
                      >
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">Payment Methods</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              <span className="text-xs sm:text-sm text-gray-300 hidden md:inline truncate max-w-[150px] lg:max-w-none">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 hover:text-gray-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm lg:text-base">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - No sidebar wrapper */}
      {children}
    </div>
  );
}
