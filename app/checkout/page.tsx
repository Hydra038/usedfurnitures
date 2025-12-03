'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { supabase } from '@/lib/supabase';
import { Upload, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import BackButton from '@/components/BackButton';

interface PaymentMethod {
  id: string;
  name: string;
  method_id: string;
  details: string;
  is_enabled: boolean;
  payment_link?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, getTotalShipping, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [paymentOption, setPaymentOption] = useState<'full' | 'half' | 'other'>('full'); // New payment option
  const [customAmount, setCustomAmount] = useState(''); // For "other" option
  const [paymentMethod, setPaymentMethod] = useState(''); // Start with empty to force selection
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not signed in, redirect to login with return URL
        router.push('/login?redirect=/checkout');
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const subtotal = getTotal();
  const shipping = getTotalShipping();
  const fullTotal = subtotal + shipping;
  const halfTotal = (subtotal / 2) + shipping; // Half of items price + full shipping
  const customTotal = customAmount ? parseFloat(customAmount) : 0;
  const total = paymentOption === 'half' ? halfTotal : paymentOption === 'other' ? customTotal : fullTotal;
  
  // Validation for custom payment
  const minCustomAmount = fullTotal * 0.25;
  const isCustomAmountValid = paymentOption !== 'other' || 
    (customAmount && parseFloat(customAmount) >= minCustomAmount && parseFloat(customAmount) <= fullTotal);
  
  // Check if payment method is selected
  const isPaymentMethodSelected = paymentMethod && paymentMethod.trim() !== '';
  
  // Can only submit if custom amount is valid AND payment method is selected
  const canSubmit = isCustomAmountValid && isPaymentMethodSelected && paymentProof !== null;

  // Fetch payment methods from database
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_enabled', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setPaymentMethods(data || []);
        
        // Don't auto-select - force user to choose
        // if (data && data.length > 0) {
        //   setPaymentMethod(data[0].method_id);
        // }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Auto-fill user information from Supabase Auth and Profile
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // First, try to load from profile table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          // Use profile data first (most complete)
          if (profile.full_name) setCustomerName(profile.full_name);
          if (profile.email) setCustomerEmail(profile.email);
          if (profile.phone) setCustomerPhone(profile.phone);
          if (profile.address) setAddress(profile.address);
          if (profile.city) setCity(profile.city);
          if (profile.state) setState(profile.state);
          if (profile.zip_code) setZipCode(profile.zip_code);
        }
        
        // Fallback to auth data if profile fields are empty
        if (!customerEmail && user.email) {
          setCustomerEmail(user.email);
        }
        if (!customerName && (user.user_metadata?.full_name || user.user_metadata?.name)) {
          setCustomerName(user.user_metadata.full_name || user.user_metadata.name);
        }
        if (!customerPhone && (user.phone || user.user_metadata?.phone)) {
          setCustomerPhone(user.phone || user.user_metadata.phone);
        }
      }
    };
    
    loadUserData();
  }, []);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <a href="/shop" className="btn-primary">
          Continue Shopping
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment proof is uploaded
    if (!paymentProof) {
      alert('Please upload a payment proof screenshot before submitting your order.');
      return;
    }
    
    // Validate custom payment amount (minimum 25%)
    if (paymentOption === 'other') {
      const minAmount = fullTotal * 0.25;
      if (!customAmount || parseFloat(customAmount) < minAmount) {
        alert(`Custom payment must be at least $${minAmount.toFixed(2)} (25% of total)`);
        setLoading(false);
        return;
      }
      if (parseFloat(customAmount) > fullTotal) {
        alert(`Payment amount cannot exceed the order total of $${fullTotal.toFixed(2)}`);
        setLoading(false);
        return;
      }
    }
    
    setLoading(true);

    try {
      // Upload payment proof if provided
      let paymentProofUrl = null;
      if (paymentProof) {
        console.log('Uploading payment proof:', {
          fileName: paymentProof.name,
          fileSize: paymentProof.size,
          fileType: paymentProof.type
        });
        
        const fileExt = paymentProof.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Generated filename:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentProof, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload payment proof: ${uploadError.message}. Please try again.`);
          throw uploadError;
        }
        
        console.log('Upload successful:', uploadData);
        paymentProofUrl = uploadData.path;
      }

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();

      // Calculate remaining balance
      const remainingBalance = paymentOption === 'full' ? 0 : 
                               paymentOption === 'half' ? (fullTotal - halfTotal) : 
                               (fullTotal - customTotal);

      // Debug: Log what we're about to send
      console.log('=== ORDER DATA DEBUG ===');
      console.log('paymentOption:', paymentOption);
      console.log('paymentOption type:', typeof paymentOption);
      console.log('paymentMethod:', paymentMethod);
      console.log('total:', fullTotal);
      console.log('amount_paid:', total);
      console.log('remaining_balance:', remainingBalance);
      console.log('=======================');

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null, // Link order to user
          total: fullTotal, // Always store the full order total
          payment_option: paymentOption, // 'full', 'half', or 'other'
          amount_paid: total, // Amount paid in this transaction
          remaining_balance: remainingBalance,
          shipping_address: {
            address,
            city,
            state,
            zipCode,
          },
          payment_method: paymentMethod,
          status: 'pending', // Use 'status' not 'payment_status'
          payment_proof_url: paymentProofUrl,
          transaction_reference: transactionId,
          customer_email: customerEmail,
          customer_name: customerName,
          customer_phone: customerPhone,
          notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        product_title: item.title,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Redirect first, then clear cart to avoid showing empty cart page
      const orderId = orderData.id;
      
      // Use replace instead of push to avoid back button showing checkout with empty cart
      router.replace(`/confirmation?orderId=${orderId}`);
      
      // Clear cart after redirect starts
      setTimeout(() => {
        clearCart();
      }, 100);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      <BackButton />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 font-semibold">Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-sm sm:text-base">Street Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-sm sm:text-base">City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">ZIP Code *</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Option - Half or Full */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Payment Plan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-sm sm:text-base">Select Payment Plan *</label>
                  <select
                    value={paymentOption}
                    onChange={(e) => setPaymentOption(e.target.value as 'full' | 'half' | 'other')}
                    className="input-field text-base"
                    required
                  >
                    <option value="full">Full Payment - ${fullTotal.toFixed(2)} (Pay complete amount now)</option>
                    <option value="half">Half Payment - ${halfTotal.toFixed(2)} (Pay 50% now, ${(fullTotal - halfTotal).toFixed(2)} on delivery)</option>
                    <option value="other">Other - Custom Payment Amount (Negotiate with seller)</option>
                  </select>
                </div>
                
                {/* Custom Amount Input for "Other" option */}
                {paymentOption === 'other' && (
                  <div>
                    <label className="block mb-2 font-semibold text-sm sm:text-base">
                      Enter Amount to Pay Now * (Minimum 25%)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min={fullTotal * 0.25}
                        max={fullTotal}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className={`input-field pl-8 text-base ${
                          customAmount && (parseFloat(customAmount) < minCustomAmount || parseFloat(customAmount) > fullTotal)
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : ''
                        }`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum: ${(fullTotal * 0.25).toFixed(2)} (25%) | Full order total: ${fullTotal.toFixed(2)}
                    </p>
                    {customAmount && parseFloat(customAmount) < minCustomAmount && (
                      <p className="text-sm text-red-600 mt-1 font-semibold">
                        ⚠️ Amount must be at least ${minCustomAmount.toFixed(2)} (25% of total)
                      </p>
                    )}
                    {customAmount && parseFloat(customAmount) > fullTotal && (
                      <p className="text-sm text-red-600 mt-1 font-semibold">
                        ⚠️ Amount cannot exceed the order total of ${fullTotal.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Payment Plan Summary */}
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Amount to Pay Now:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${paymentOption === 'other' && !customAmount ? '0.00' : total.toFixed(2)}
                    </span>
                  </div>
                  {paymentOption === 'half' && (
                    <div className="flex justify-between items-center text-sm text-orange-600">
                      <span>Due on Delivery:</span>
                      <span className="font-bold">${(fullTotal - halfTotal).toFixed(2)}</span>
                    </div>
                  )}
                  {paymentOption === 'other' && customAmount && parseFloat(customAmount) < fullTotal && (
                    <div className="flex justify-between items-center text-sm text-orange-600">
                      <span>Remaining Balance:</span>
                      <span className="font-bold">${(fullTotal - parseFloat(customAmount)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <button
                type="button"
                onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                className="w-full flex items-center justify-between text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  Payment Method
                </span>
                {showPaymentDetails ? (
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>

              {showPaymentDetails && (
                <>
                  <div className="space-y-4">
                    {paymentMethods.length > 0 ? (
                      <>
                        <div>
                          <label className="block mb-2 font-semibold text-sm sm:text-base">Select Payment Method *</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className={`input-field text-base ${!paymentMethod ? 'text-gray-400' : ''}`}
                            required
                          >
                            <option value="" disabled>
                              -- Select a payment method --
                            </option>
                            {paymentMethods.map((method) => (
                              <option key={method.id} value={method.method_id} className="text-gray-900">
                                {method.name}
                                {method.details && ` - ${method.details}`}
                              </option>
                            ))}
                          </select>
                          {!isPaymentMethodSelected && (
                            <p className="text-red-500 text-sm mt-1">
                              ⚠️ Please select a payment method to continue
                            </p>
                          )}
                          
                          {/* Payment Link Button */}
                          {paymentMethod && paymentMethods.find(m => m.method_id === paymentMethod)?.payment_link && (
                            <div className="mt-3">
                              <a
                                href={paymentMethods.find(m => m.method_id === paymentMethod)?.payment_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                              >
                                <CreditCard className="w-5 h-5" />
                                Open {paymentMethods.find(m => m.method_id === paymentMethod)?.name}
                              </a>
                              <p className="text-xs text-gray-500 mt-2">
                                Click to open {paymentMethods.find(m => m.method_id === paymentMethod)?.name} and complete your payment
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          No payment methods available. Please contact support.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 font-semibold">Transaction ID (Optional)</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="input-field"
                        placeholder="Enter your transaction/reference ID"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Payment Proof (Screenshot) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                        className="input-field"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Please upload a screenshot of your payment confirmation
                      </p>
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold">Additional Notes (Optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="input-field"
                        rows={3}
                        placeholder="Any special instructions or requests?"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className={`w-full text-lg py-4 font-semibold rounded-lg transition-colors ${
                !canSubmit
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
              title={
                !isPaymentMethodSelected
                  ? 'Please select a payment method'
                  : !isCustomAmountValid
                  ? 'Please enter a valid payment amount'
                  : !paymentProof
                  ? 'Please upload payment proof screenshot'
                  : ''
              }
            >
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>

            {!canSubmit && (
              <div className="text-center text-sm text-red-500 mt-2">
                {!isPaymentMethodSelected && '⚠️ Please select a payment method above'}
                {isPaymentMethodSelected && !isCustomAmountValid && '⚠️ Please enter a valid custom payment amount'}
                {isPaymentMethodSelected && isCustomAmountValid && !paymentProof && '⚠️ Please upload a payment proof screenshot'}
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-20">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary-600">${item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              {paymentOption === 'half' && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Full Total</span>
                    <span>${fullTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary-600 font-semibold">
                    <span>Paying Now (50%)</span>
                    <span>${halfTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Due on Delivery</span>
                    <span>${(fullTotal - halfTotal).toFixed(2)}</span>
                  </div>
                </>
              )}
              {paymentOption === 'other' && customAmount && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Full Total</span>
                    <span>${fullTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary-600 font-semibold">
                    <span>Custom Payment</span>
                    <span>${parseFloat(customAmount).toFixed(2)}</span>
                  </div>
                  {parseFloat(customAmount) < fullTotal && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Remaining Balance</span>
                      <span>${(fullTotal - parseFloat(customAmount)).toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>{paymentOption !== 'full' ? 'Amount to Pay Now' : 'Total'}</span>
                <span className="text-primary-600">
                  ${paymentOption === 'other' && !customAmount ? '0.00' : total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
