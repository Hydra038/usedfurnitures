'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  AlertCircle, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  rejectedOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_price?: number;
  total?: number;
  payment_status?: string;
  status?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    rejectedOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch pending orders count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      // Fetch confirmed orders count
      const { count: confirmedCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'confirmed');

      // Fetch rejected orders count
      const { count: rejectedCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'rejected');

      // Fetch total revenue (handle both old and new column names)
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .or('payment_status.eq.confirmed,status.eq.confirmed');

      const revenue = orders?.reduce((sum, order) => {
        const orderTotal = order.total_price || order.total || 0;
        return sum + orderTotal;
      }, 0) || 0;

      // Fetch users count
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const usersCount = usersData?.users?.length || 0;

      // Fetch recent orders (handle both old and new column names)
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        pendingOrders: pendingCount || 0,
        confirmedOrders: confirmedCount || 0,
        rejectedOrders: rejectedCount || 0,
        totalRevenue: revenue,
        totalUsers: usersCount,
      });

      setRecentOrders(recentOrdersData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confirmed</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1"><Package className="w-3 h-3" />Processing</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold flex items-center gap-1"><Truck className="w-3 h-3" />Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" />Cancelled</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Products */}
        <Link href="/admin/products" className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-primary-100 text-xs sm:text-sm font-medium mb-1">Total Products</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-primary-200" />
          </div>
          <div className="flex items-center text-xs sm:text-sm text-primary-100">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Manage products →
          </div>
        </Link>

        {/* Total Orders */}
        <Link href="/admin/orders" className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Orders</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-blue-200" />
          </div>
          <div className="flex items-center text-xs sm:text-sm text-blue-100">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            View all orders →
          </div>
        </Link>

        {/* Pending Orders */}
        <Link href="/admin/orders" className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-yellow-100 text-xs sm:text-sm font-medium mb-1">Pending Orders</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.pendingOrders}</p>
            </div>
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-200" />
          </div>
          <div className="flex items-center text-xs sm:text-sm text-yellow-100">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Needs attention →
          </div>
        </Link>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-green-200" />
          </div>
          <div className="flex items-center text-xs sm:text-sm text-green-100">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            From confirmed orders
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Confirmed Orders */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Confirmed Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.confirmedOrders}</p>
            </div>
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </div>
        </div>

        {/* Rejected Orders */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Rejected Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.rejectedOrders}</p>
            </div>
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
          </div>
        </div>

        {/* Total Users */}
        <Link href="/admin/users" className="bg-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 font-semibold text-xs sm:text-sm flex items-center gap-1">
            View All →
          </Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Order ID</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Total</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const orderTotal = order.total_price || order.total || 0;
                    const orderStatus = order.payment_status || order.status || 'pending';
                    return (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.customer_name}</td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">${orderTotal.toFixed(2)}</td>
                        <td className="py-3 px-4">{getStatusBadge(orderStatus)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {recentOrders.map((order) => {
                const orderTotal = order.total_price || order.total || 0;
                const orderStatus = order.payment_status || order.status || 'pending';
                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Order ID</p>
                        <p className="font-mono text-sm font-semibold text-gray-700">#{order.id.slice(0, 8)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(orderStatus)}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-bold text-gray-900">${orderTotal.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Date</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
