'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';
import Invoice from '@/components/Invoice';

interface Order {
  id: string;
  created_at: string;
  total: number; // Fixed: was total_price
  status: string; // Fixed: was payment_status
  payment_option: string;
  payment_method: string; // NEW: Show which payment method was used
  amount_paid: number;
  remaining_balance: number;
  customer_email: string;
  customer_name: string; // Added for Invoice component
  customer_phone: string;
  shipping_address: any;
  items?: any;
}

interface PaymentMethodDetails {
  name: string;
  details: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethodDetails, setPaymentMethodDetails] = useState<PaymentMethodDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);

        // Fetch payment method details
        if (data.payment_method) {
          const { data: methodData, error: methodError } = await supabase
            .from('payment_methods')
            .select('name, details')
            .eq('method_id', data.payment_method)
            .single();

          if (!methodError && methodData) {
            setPaymentMethodDetails(methodData);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Thank You for Your Order!</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-lg mb-2">
            Your order has been received and is being processed.
          </p>
          <p className="text-gray-600">
            We've sent a confirmation email to <strong>{order.customer_email}</strong>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Order Details</h2>
          </div>
          
          <div className="space-y-2 text-left">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Order ID:</span>
              <span className="text-gray-600 font-mono text-sm">{order.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Order Date:</span>
              <span className="text-gray-600">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-primary-600 font-bold text-lg">
                ${order.total?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Payment Plan:</span>
              <span className="text-gray-600">
                {order.payment_option === 'full' ? '💳 Full Payment' : 
                 order.payment_option === 'half' ? '💰 Half Payment (50%)' : 
                 '💵 Custom Payment'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Amount Paid:</span>
              <span className="text-green-600 font-semibold">
                ${order.amount_paid?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Payment Method:</span>
              <div className="text-right">
                <div className="text-gray-600 capitalize font-semibold">
                  {paymentMethodDetails?.name || order.payment_method || 'Not specified'}
                </div>
                {paymentMethodDetails?.details && (
                  <div className="text-sm text-blue-600 font-mono">
                    {paymentMethodDetails.details}
                  </div>
                )}
              </div>
            </div>
            {order.remaining_balance > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Remaining Balance:</span>
                <span className="text-yellow-600 font-semibold">
                  ${order.remaining_balance?.toFixed(2) || '0.00'}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="font-semibold">Payment Status:</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                {order.status === 'pending' ? 'Pending Confirmation' : order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-lg mb-2">What's Next?</h3>
          <ul className="text-left space-y-2 text-gray-700">
            <li>✓ We'll review your payment information</li>
            <li>✓ Once confirmed, we'll prepare your items for shipping</li>
            <li>✓ You'll receive tracking information via email</li>
            <li>✓ Expect delivery within 5-10 business days</li>
          </ul>
        </div>

        {/* Invoice Download Button */}
        <div className="mb-6">
          <Invoice order={order} />
        </div>

        <div className="space-y-3">
          <Link href="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
          <p className="text-gray-600">
            Questions? <Link href="/contact" className="text-primary-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
