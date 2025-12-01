"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { getImageUrl } from '@/lib/utils/imageUrl';
import { Package, Eye, X, LogOut, Home, User as UserIcon, ArrowLeft, Menu, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import Invoice from "@/components/Invoice";

interface Order {
  id: string;
  created_at: string;
  total_price?: number; // Optional for backwards compatibility
  total?: number; // New column name
  payment_method: string;
  payment_status?: string; // Optional for backwards compatibility
  status?: string; // New column name
  payment_option?: string; // 'full', 'half', 'other'
  amount_paid?: number; // Amount paid by customer
  remaining_balance?: number; // Amount still owed
  payment_proof_url: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: any;
  notes?: string;
  user_id?: string;
  items?: any;
}

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchOrders(user.email!);
    } else {
      setLoading(false);
    }
  }

  async function fetchOrders(email: string) {
    try {
      // First try to get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by user_id if available, otherwise by customer_email
      if (user?.id) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('customer_email', email);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Orders fetch error:', error);
        throw error;
      }
      
      console.log('Fetched orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800', text: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.text.toUpperCase()}
      </span>
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (!user) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <p className="text-gray-500">Please log in to view your orders.</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-6 lg:block">
            <h2 className="text-xl font-bold text-primary-600">User Dashboard</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {/* Admin Panel Link - Only for admin */}
            {user && user.email === 'usa@furnitures.com' && (
              <Link 
                href="/admin" 
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 rounded-lg font-semibold border border-purple-200 transition-all"
                onClick={() => setSidebarOpen(false)}
              >
                <Shield className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            )}

            <Link 
              href="/user" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/user/orders" 
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              <Package className="w-5 h-5" />
              <span>My Orders</span>
            </Link>
            <Link 
              href="/user/profile" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <UserIcon className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-primary-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
        <BackButton />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Orders</h1>
        <p className="mb-6 text-gray-600 text-sm sm:text-base">View your orders, status, and track shipments/payments.</p>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-xs">{order.id}</p>
                </div>
                {getStatusBadge(order.status || order.payment_status || 'pending')}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-semibold text-primary-600">
                    ${((order.total || order.total_price || 0)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold capitalize">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{order.status || order.payment_status || 'pending'}</p>
                </div>
              </div>

              {/* Payment Plan Summary */}
              {order.payment_option && (
                <div className="flex flex-wrap gap-2 mb-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {order.payment_option === 'full' && '💳 Full Payment'}
                    {order.payment_option === 'half' && '💰 Half Payment'}
                    {order.payment_option === 'other' && '💵 Custom Payment'}
                  </span>
                  {order.amount_paid !== undefined && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      ✅ Paid: ${order.amount_paid.toFixed(2)}
                    </span>
                  )}
                  {order.remaining_balance !== undefined && order.remaining_balance > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                      ⚠️ Balance: ${order.remaining_balance.toFixed(2)}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedOrder(order)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              
              {/* Invoice Download Button */}
              <div className="mt-2">
                <Invoice order={order} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-700">Order ID:</span>
                <p className="text-sm text-gray-600 font-mono mt-1">{selectedOrder.id}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Order Date:</span>
                <p className="text-gray-600 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Customer Name:</span>
                <p className="text-gray-600 mt-1">{selectedOrder.customer_name}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Email:</span>
                <p className="text-gray-600 mt-1">{selectedOrder.customer_email}</p>
              </div>

              {selectedOrder.customer_phone && (
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <p className="text-gray-600 mt-1">{selectedOrder.customer_phone}</p>
                </div>
              )}

              {selectedOrder.shipping_address && (
                <div>
                  <span className="font-semibold text-gray-700">Shipping Address:</span>
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {typeof selectedOrder.shipping_address === 'string' 
                        ? selectedOrder.shipping_address 
                        : (() => {
                            const addr = selectedOrder.shipping_address;
                            return `${addr.address || ''}\n${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
                          })()
                      }
                    </p>
                  </div>
                </div>
              )}

              <div>
                <span className="font-semibold text-gray-700">Total Amount:</span>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  ${((selectedOrder.total || selectedOrder.total_price || 0)).toFixed(2)}
                </p>
              </div>

              {/* Payment Plan Information */}
              {selectedOrder.payment_option && (
                <div>
                  <span className="font-semibold text-gray-700">Payment Plan:</span>
                  <p className="text-gray-600 mt-1 capitalize font-medium">
                    {selectedOrder.payment_option === 'full' && '💳 Full Payment'}
                    {selectedOrder.payment_option === 'half' && '💰 Half Payment (50%)'}
                    {selectedOrder.payment_option === 'other' && '💵 Custom Payment'}
                  </p>
                </div>
              )}

              {/* Amount Paid */}
              {selectedOrder.amount_paid !== undefined && (
                <div>
                  <span className="font-semibold text-gray-700">Amount Paid:</span>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    ${selectedOrder.amount_paid.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Remaining Balance */}
              {selectedOrder.remaining_balance !== undefined && selectedOrder.remaining_balance > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <span className="font-semibold text-yellow-800">Remaining Balance:</span>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    ${selectedOrder.remaining_balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    ⚠️ Please complete payment to avoid order cancellation
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold text-gray-700">Payment Method:</span>
                <p className="text-gray-600 mt-1 capitalize">{selectedOrder.payment_method}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Order Status:</span>
                <div className="mt-2">
                  {getStatusBadge(selectedOrder.status || selectedOrder.payment_status || 'pending')}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <span className="font-semibold text-gray-700">Notes:</span>
                  <p className="text-gray-600 mt-1 whitespace-pre-line">{selectedOrder.notes}</p>
                </div>
              )}
              
              {selectedOrder.payment_proof_url && (
                <div>
                  <span className="font-semibold text-gray-700">Payment Proof:</span>
                  <div className="mt-2 relative w-full h-64 border rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={getImageUrl(selectedOrder.payment_proof_url, 'payment-proofs')}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                      onError={(e) => {
                        console.error('Image load error for:', selectedOrder.payment_proof_url);
                        e.currentTarget.src = '/placeholder-furniture.jpg';
                      }}
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Invoice order={selectedOrder} />
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
    </div>
  );
}
