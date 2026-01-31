'use client';

import AdminLayout from '@/components/AdminLayout';

export default function ReturnsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Returns & RMA</h2>
          <p className="text-gray-500">Manage customer returns and refund requests.</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Returns Management</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">The return processing module is being developed. Customer RMA requests will appear here once active.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
