'use client';

import AdminLayout from '@/components/AdminLayout';

export default function ShippingPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shipping</h2>
          <p className="text-gray-500">Configure shipping methods and zones.</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Shipping Configuration</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">Shipping and carrier integrations are coming soon. You will be able to manage BlueDart and other shipping partners here.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
