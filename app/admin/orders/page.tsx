'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { Eye } from 'lucide-react';
import BackButton from '@/components/BackButton';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  total_price?: number; // Old column name
  total?: number; // New column name
  payment_method: string;
  payment_status?: string; // Old column name
  status?: string; // New column name
  payment_proof_url: string | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      // Update both old and new column names for compatibility
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus, // Old column
          status: newStatus // New column
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, payment_status: newStatus }
          : order
      ));
      
      // Update selected order if it's the one being changed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, payment_status: newStatus });
      }
      
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update order status');
    }
  }

  return (
    <div>
      <BackButton />
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm">{order.customer_email}</td>
                  <td className="px-6 py-4 font-semibold">${((order.total || order.total_price || 0)).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm capitalize">{order.payment_method}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status || order.payment_status || 'pending'}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 cursor-pointer ${
                        (order.status || order.payment_status) === 'confirmed' || (order.status || order.payment_status) === 'delivered'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : (order.status || order.payment_status) === 'processing' || (order.status || order.payment_status) === 'shipped'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : (order.status || order.payment_status) === 'rejected' || (order.status || order.payment_status) === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <span className="font-semibold">Order ID:</span>
                <p className="text-sm text-gray-600 font-mono">{selectedOrder.id}</p>
              </div>
              <div>
                <span className="font-semibold">Customer:</span>
                <p>{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
              </div>
              <div>
                <span className="font-semibold">Total:</span>
                <p className="text-xl font-bold text-primary-600">${((selectedOrder.total || selectedOrder.total_price || 0)).toFixed(2)}</p>
              </div>
              <div>
                <span className="font-semibold">Payment Method:</span>
                <p className="capitalize">{selectedOrder.payment_method}</p>
              </div>
              
              {selectedOrder.payment_proof_url && (
                <div>
                  <span className="font-semibold">Payment Proof:</span>
                  <div className="mt-2 relative w-full h-64">
                    <Image
                      src={getImageUrl(selectedOrder.payment_proof_url)}
                      alt="Payment proof"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-2">Update Order Status:</label>
                <select
                  value={selectedOrder.status || selectedOrder.payment_status || 'pending'}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full p-3 border rounded-lg font-semibold"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Current status: <span className="font-semibold">{selectedOrder.status || selectedOrder.payment_status || 'pending'}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
