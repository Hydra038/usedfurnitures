"use client";

import { useState } from "react";
import BackButton from '@/components/BackButton';

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  details: string;
}

export default function AdminPaymentsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Bank Transfer', enabled: true, details: 'Bank: ABC Bank, Account: 1234567890' },
    { id: '2', name: 'Cash on Pickup', enabled: true, details: 'Pay when you pick up the item' },
    { id: '3', name: 'Mobile Money', enabled: false, details: 'MTN/Airtel Mobile Money' },
  ]);

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  return (
    <main className="p-8">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6">Manage Payment Methods</h1>
      <p className="mb-4 text-gray-500">Add, edit, or disable payment methods.</p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paymentMethods.map((method) => (
              <tr key={method.id}>
                <td className="px-6 py-4 font-semibold">{method.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{method.details}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      method.enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {method.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`text-sm font-semibold ${
                      method.enabled
                        ? 'text-red-600 hover:text-red-800'
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {method.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button className="btn btn-primary">Add New Payment Method</button>
      </div>
    </main>
  );
}
