"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BackButton from '@/components/BackButton';
import { User as UserIcon, Calendar, Clock, Eye } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      // Note: This requires admin privileges in Supabase
      // You may need to create a custom function or use Supabase Admin API
      const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      setUsers(authUsers as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback: fetch from profiles table if you have one
      const { data } = await supabase.from('profiles').select('*');
      if (data) setUsers(data as any);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4 sm:p-8">
      <BackButton />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">Manage Users</h1>
      <p className="mb-4 text-sm sm:text-base text-gray-500">View and manage registered users.</p>
      
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString() 
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
                {/* User Email with Icon */}
                <div className="flex items-start gap-3 mb-3 pb-3 border-b">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm break-all">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">User ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Registered:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Last Login:</span>
                    <span className="font-medium text-gray-900">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString() 
                        : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium text-sm">View Details</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
