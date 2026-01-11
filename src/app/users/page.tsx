'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface User {
  _id: string;
  [key: string]: any;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`API returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getFieldValue = (user: User, field: string) => {
    return user[field] || 'N/A';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  // Get all unique keys from users to create dynamic table
  const allKeys = new Set<string>();
  users.forEach(user => {
    Object.keys(user).forEach(key => {
      if (key !== '_id' && typeof user[key] !== 'object') {
        allKeys.add(key);
      }
    });
  });
  const displayKeys = Array.from(allKeys).slice(0, 6); // Show first 6 fields

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  {displayKeys.map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={displayKeys.length + 2} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {String(user._id).substring(0, 8)}...
                      </td>
                      {displayKeys.map((key) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {String(getFieldValue(user, key)).substring(0, 50)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setSelectedUser(null)}>
            <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedUser).map(([key, value]) => {
                      if (key === '_id' || typeof value === 'object') return null;
                      return (
                        <div key={key}>
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-medium text-gray-900 break-words">{String(value) || 'N/A'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Additional User Fields - Structured */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Full Profile Metadata
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedUser).map(([key, value]) => {
                      if (key === '_id' || typeof value === 'object') return null;
                      return (
                        <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-bold text-gray-900 break-words">{String(value) || 'N/A'}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Complex objects like addresses or prescriptions */}
                  {Object.entries(selectedUser).map(([key, value]) => {
                    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
                    return (
                      <div key={key} className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{key.replace(/_/g, ' ')}</p>
                        <pre className="text-xs text-blue-900 font-medium whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

