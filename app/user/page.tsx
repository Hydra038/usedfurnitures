"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import { getImageUrl } from '@/lib/utils/imageUrl';
import { 
  Package, 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  Heart,
  RefreshCw,
  LogOut,
  Home,
  User as UserIcon,
  Eye,
  X,
  Menu,
  Shield
} from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  total?: number;
  total_price?: number;
  status?: string;
  payment_status?: string;
  items?: any[];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: any;
  payment_option?: string;
  amount_paid?: number;
  remaining_balance?: number;
  payment_method?: string;
  notes?: string;
  payment_proof_url?: string;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscription for orders
    const setupRealtimeSubscription = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Subscribe to changes in orders table
      const ordersSubscription = supabase
        .channel('user_orders')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log('Order change detected:', payload);
            // Refresh dashboard data when orders change
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        ordersSubscription.unsubscribe();
      };
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  async function fetchDashboardData() {
    try {
      // Get user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);

      // If admin, redirect to admin panel
      if (currentUser.email === 'usa@furnitures.com') {
        router.push('/admin');
        return;
      }

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError) {
        console.error('Profile error:', profileError);
      }
      
      if (profileData) {
        setProfile(profileData);
        console.log('Profile loaded:', profileData);
      }

      // Get orders - try both user_id and customer_email for backwards compatibility
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${currentUser.id},customer_email.eq.${currentUser.email}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.error('Orders error:', ordersError);
        console.log('Trying alternative query...');
        
        // Fallback: try just by email if user_id query fails
        const { data: emailOrdersData, error: emailError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', currentUser.email)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (emailError) {
          console.error('Email orders error:', emailError);
        } else {
          setOrders(emailOrdersData || []);
          console.log('Orders found by email:', emailOrdersData);
        }
      } else {
        console.log('Orders data:', ordersData);
        // Set orders even if empty
        setOrders(ordersData || []);
      }
      
      // Helper function to calculate stats
      const calculateStats = (ordersData: any) => {
        if (ordersData && ordersData.length > 0) {
          const totalOrders = ordersData.length;
          // Check both status and payment_status for backwards compatibility
          // Pending includes: pending, processing
          const pendingOrders = ordersData.filter((o: any) => {
            const currentStatus = (o.status || o.payment_status || 'pending').toLowerCase();
            return ['pending', 'processing', 'confirmed'].includes(currentStatus);
          }).length;
          // Shipped orders: currently in transit
          const shippedOrders = ordersData.filter((o: any) => {
            const currentStatus = (o.status || o.payment_status || '').toLowerCase();
            return currentStatus === 'shipped';
          }).length;
          // Completed includes: delivered only
          const completedOrders = ordersData.filter((o: any) => {
            const currentStatus = (o.status || o.payment_status || '').toLowerCase();
            return currentStatus === 'delivered';
          }).length;
          // Check both total and total_price for backwards compatibility
          const totalSpent = ordersData.reduce((sum: number, o: any) => 
            sum + (o.total || o.total_price || 0), 0
          );

          setStats({
            totalOrders,
            pendingOrders,
            shippedOrders,
            completedOrders,
            totalSpent
          });
          console.log('Stats calculated:', { totalOrders, pendingOrders, completedOrders, totalSpent });
        } else {
          // No orders exist, set stats to 0
          setStats({
            totalOrders: 0,
            pendingOrders: 0,
            shippedOrders: 0,
            completedOrders: 0,
            totalSpent: 0
          });
        }
      };
      
      // Calculate stats from ALL orders (not just recent 5)
      // Try both user_id and customer_email
      const { data: allOrdersData, error: allOrdersError } = await supabase
        .from('orders')
        .select('*')
        .or(`user_id.eq.${currentUser.id},customer_email.eq.${currentUser.email}`);

      if (allOrdersError) {
        console.error('All orders error:', allOrdersError);
        
        // Fallback: try just by email with all columns
        const { data: emailAllOrdersData, error: emailAllError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', currentUser.email);
        
        if (emailAllError) {
          console.error('Email all orders error:', emailAllError);
          // Set empty stats if both queries fail
          setStats({
            totalOrders: 0,
            pendingOrders: 0,
            shippedOrders: 0,
            completedOrders: 0,
            totalSpent: 0
          });
        } else {
          calculateStats(emailAllOrdersData);
        }
      } else {
        console.log('All orders data:', allOrdersData);
        calculateStats(allOrdersData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Confirmed' },
      processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package, text: 'Processing' },
      shipped: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, text: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Rejected' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchDashboardData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
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
              className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg font-medium"
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/user/orders" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">My Orders</span>
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
      <div className="flex-1 overflow-auto">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-primary-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name || 'User'}! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening with your orders today.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{stats.totalOrders}</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">Total Orders</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{stats.pendingOrders}</span>
            </div>
            <p className="text-yellow-100 text-sm font-medium">In Progress</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{stats.shippedOrders}</span>
            </div>
            <p className="text-purple-100 text-sm font-medium">Shipped</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{stats.completedOrders}</span>
            </div>
            <p className="text-green-100 text-sm font-medium">Delivered</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">${stats.totalSpent.toFixed(0)}</span>
            </div>
            <p className="text-indigo-100 text-sm font-medium">Total Spent</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Recent Orders
                </h2>
                <Link 
                  href="/user/orders" 
                  className="text-white hover:text-primary-100 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="p-6">
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary-100 p-2 rounded-lg">
                              <ShoppingBag className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(order.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(order.status || order.payment_status || 'pending')}
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-lg font-bold text-gray-900">
                            ${((order.total || order.total_price || 0)).toFixed(2)}
                          </span>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
                      <ShoppingBag className="w-5 h-5" />
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  My Profile
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                    <p className="font-medium text-gray-900 truncate">{profile?.full_name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="font-medium text-gray-900 truncate text-sm">{profile?.email || user?.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="font-medium text-gray-900 truncate">{profile?.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Address</p>
                    <p className="font-medium text-gray-900 text-sm line-clamp-2">{profile?.address || 'Not set'}</p>
                  </div>
                </div>

                <Link 
                  href="/user/profile" 
                  className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              </div>
              
              <div className="p-6 space-y-3">
                <Link 
                  href="/shop" 
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-xl transition-all group"
                >
                  <div className="bg-primary-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Browse Products</span>
                  <ArrowRight className="w-5 h-5 ml-auto text-primary-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link 
                  href="/user/orders" 
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all group"
                >
                  <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">View All Orders</span>
                  <ArrowRight className="w-5 h-5 ml-auto text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link 
                  href="/contact" 
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all group"
                >
                  <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Contact Support</span>
                  <ArrowRight className="w-5 h-5 ml-auto text-green-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-3 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Order ID:</span>
                <p className="text-xs sm:text-sm text-gray-600 font-mono mt-1 break-all">{selectedOrder.id}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Order Date:</span>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Customer Name:</span>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{selectedOrder.customer_name}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Email:</span>
                <p className="text-gray-600 mt-1 text-sm sm:text-base break-all">{selectedOrder.customer_email}</p>
              </div>

              {selectedOrder.customer_phone && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Phone:</span>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{selectedOrder.customer_phone}</p>
                </div>
              )}

              {selectedOrder.shipping_address && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Shipping Address:</span>
                  <div className="mt-2 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm whitespace-pre-line">
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
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Total Amount:</span>
                <p className="text-xl sm:text-2xl font-bold text-primary-600 mt-1">
                  ${((selectedOrder.total || selectedOrder.total_price || 0)).toFixed(2)}
                </p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Payment Method:</span>
                <p className="text-gray-600 mt-1 capitalize text-sm sm:text-base">{selectedOrder.payment_method}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Order Status:</span>
                <div className="mt-2">
                  {getStatusBadge(selectedOrder.status || selectedOrder.payment_status || 'pending')}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Notes:</span>
                  <p className="text-gray-600 mt-1 whitespace-pre-line text-sm sm:text-base">{selectedOrder.notes}</p>
                </div>
              )}
              
              {selectedOrder.payment_proof_url && (
                <div>
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">Payment Proof:</span>
                  <div className="mt-2 relative w-full h-48 sm:h-64 border rounded-lg overflow-hidden bg-gray-50">
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

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 sm:mt-6 w-full btn-secondary py-2 sm:py-3 text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
