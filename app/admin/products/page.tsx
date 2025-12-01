'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/imageUrl';
import BackButton from '@/components/BackButton';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  stock: number;
  images: string[];
  status: 'available' | 'reserved' | 'sold';
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete product');
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update status');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div>
      <BackButton />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-16">
                        <Image
                          src={getImageUrl(product.images[0])}
                          alt={product.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.title}</td>
                    <td className="px-6 py-4">${product.price}</td>
                    <td className="px-6 py-4">{product.condition}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <select
                        value={product.status || 'available'}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-none outline-none ${getStatusColor(product.status || 'available')}`}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                {/* Product Image and Title */}
                <div className="flex gap-3 mb-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-lg font-bold text-primary-600">
                      ${product.price}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Condition:</span>
                    <p className="font-medium text-gray-900">{product.condition}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock:</span>
                    <p className="font-medium text-gray-900">{product.stock}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium text-gray-900">{product.category}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Status:</span>
                    <select
                      value={product.status || 'available'}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-none outline-none w-full ${getStatusColor(product.status || 'available')}`}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="font-medium text-sm">Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium text-sm">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
