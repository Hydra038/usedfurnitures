'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Power, PowerOff, GripVertical } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  method_id: string;
  details: string;
  is_enabled: boolean;
  display_order: number;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formMethodId, setFormMethodId] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setFormName('');
    setFormMethodId('');
    setFormDetails('');
    setFormEnabled(true);
    setShowModal(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormName(method.name);
    setFormMethodId(method.method_id);
    setFormDetails(method.details);
    setFormEnabled(method.is_enabled);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMethod) {
        // Update existing method
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name: formName,
            method_id: formMethodId,
            details: formDetails,
            is_enabled: formEnabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMethod.id);

        if (error) throw error;
        alert('Payment method updated successfully!');
      } else {
        // Add new method
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            name: formName,
            method_id: formMethodId,
            details: formDetails,
            is_enabled: formEnabled,
            display_order: methods.length + 1,
          });

        if (error) throw error;
        alert('Payment method added successfully!');
      }

      setShowModal(false);
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert(error.message || 'Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };

  const toggleEnabled = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ 
          is_enabled: !method.is_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', method.id);

      if (error) throw error;
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error toggling payment method:', error);
      alert('Failed to toggle payment method');
    }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Payment method deleted successfully!');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method');
    }
  };

  if (loading && methods.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-gray-600 mt-1">Manage available payment methods for customers</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>

      {/* Payment Methods List */}
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {methods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{method.display_order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{method.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{method.method_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{method.details || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        method.is_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {method.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleEnabled(method)}
                        className={`p-2 rounded-lg transition-colors ${
                          method.is_enabled
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={method.is_enabled ? 'Disable' : 'Enable'}
                      >
                        {method.is_enabled ? (
                          <PowerOff className="w-5 h-5" />
                        ) : (
                          <Power className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(method)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteMethod(method.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {methods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-md p-4">
            {/* Header with Order and Status */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Order #{method.display_order}</span>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  method.is_enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {method.is_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Payment Method Name */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
              <p className="text-sm text-gray-500">{method.method_id}</p>
            </div>

            {/* Details */}
            {method.details && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Details</p>
                <p className="text-sm text-gray-700">{method.details}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t">
              <button
                onClick={() => toggleEnabled(method)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                  method.is_enabled
                    ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {method.is_enabled ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => openEditModal(method)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => deleteMethod(method.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Venmo, PayPal"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">Method ID *</label>
                <input
                  type="text"
                  value={formMethodId}
                  onChange={(e) => setFormMethodId(e.target.value)}
                  className="input-field"
                  placeholder="e.g., venmo, paypal (lowercase, no spaces)"
                  required
                  disabled={!!editingMethod}
                />
                {editingMethod && (
                  <p className="text-xs text-gray-500 mt-1">Method ID cannot be changed</p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm sm:text-base">Details</label>
                <input
                  type="text"
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  className="input-field"
                  placeholder="e.g., @username, email@example.com, $cashtag"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username, email, phone, or other identifier
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="enabled" className="font-semibold text-sm sm:text-base">
                  Enabled (visible to customers)
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-3 sm:py-2"
                >
                  {loading ? 'Saving...' : editingMethod ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
