'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Order {
  _id: string;
  order_id?: string;
  user_id?: string;
  payment_status?: string;
  order_status?: string;
  order_total?: number;
  total?: number;
  created?: string | Date;
  cart?: any[];
  [key: string]: any;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?page=${page}&limit=${limit}&status=${statusFilter}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`API returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
          setTotalOrders(data.pagination.total);
        }
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
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

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const s = status.toLowerCase();
    if (s.includes('success') || s.includes('completed') || s.includes('paid')) {
      return 'bg-green-100 text-green-800';
    }
    if (s.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (s.includes('failed') || s.includes('cancelled')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Orders ({totalOrders})</h2>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Succeeded">Succeeded</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Processing">Processing</option>
            </select>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
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
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 relative">
                {loading && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-blue-600">Loading...</div>
                  </div>
                )}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {statusFilter ? `No ${statusFilter} orders found` : 'No orders found'}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id || order.order_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.order_id || (order._id && order._id.substring(0, 8) + '...') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        £{order.order_total || order.total || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 text-sm"
            >
              Next
            </button>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setSelectedOrder(null)}>
            <div className="relative top-5 mx-auto p-0 border w-11/12 md:w-5/6 lg:w-3/4 shadow-2xl rounded-3xl bg-white max-h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter">ORDER DETAILS</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedOrder.order_id || selectedOrder._id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(selectedOrder.order_status)}`}>
                      {selectedOrder.order_status || 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                {/* 1. Top Section: Customer & Financial Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Customer Info Card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div className="relative z-10">
                      <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-4">Customer Information</p>
                      <h4 className="text-3xl font-bold truncate mb-2">
                        {(() => {
                          try {
                            const addr = JSON.parse(selectedOrder.metadata?.address || '{}');
                            return addr.fullName || selectedOrder.user_id || 'Guest User';
                          } catch { return 'Guest User'; }
                        })()}
                      </h4>
                      <div className="space-y-2 text-blue-100 font-medium">
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          {selectedOrder.customer_email || 'No email provided'}
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          {(() => {
                            try {
                              const addr = JSON.parse(selectedOrder.metadata?.address || '{}');
                              return addr.mobile || 'No mobile provided';
                            } catch { return 'No mobile provided'; }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary Card */}
                  <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between border border-gray-800">
                    <div>
                      <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-6">Payment Summary</p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="font-bold">£{selectedOrder.subtotal || selectedOrder.order_total || 0}</span>
                        </div>
                        {selectedOrder.discount_amount > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-400 font-medium">Discount Applied</span>
                            <span className="text-green-400 font-bold">- £{selectedOrder.discount_amount}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Shipping</span>
                          <span className="font-bold">{selectedOrder.shipping_cost > 0 ? `£${selectedOrder.shipping_cost}` : 'FREE'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-800 mt-6">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-gray-500 uppercase">Total Paid</span>
                        <span className="text-4xl font-black text-blue-500 tracking-tighter">£{selectedOrder.order_total || selectedOrder.total || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detailed Cart Items */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-black text-gray-900 tracking-tight">SHOPPING CART ({selectedOrder.cart?.length || 0})</h4>
                    <span className="h-px flex-1 bg-gray-100 mx-6"></span>
                  </div>
                  
                  <div className="space-y-6">
                    {selectedOrder.cart?.map((item: any, idx: number) => {
                      const productData = item.product?.products || {};
                      const lensData = item.lens || {};
                      
                      return (
                        <div key={idx} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                          <div className="flex flex-col md:flex-row">
                            {/* Product Image Gallery */}
                            <div className="md:w-72 bg-gray-50 p-6 flex items-center justify-center relative group-hover:bg-blue-50/30 transition-colors">
                              <img 
                                src={item.image || productData.image} 
                                alt={item.name} 
                                className="w-full h-48 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute bottom-4 left-4 flex gap-1">
                                <span className="px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-gray-600 shadow-sm border border-gray-100">
                                  {productData.skuid || item.product_id}
                                </span>
                              </div>
                            </div>

                            {/* Product & Lens Technical Specs */}
                            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="text-2xl font-black text-gray-900 leading-none">{item.name || productData.name}</h5>
                                  <span className="text-lg font-black text-blue-600 tracking-tighter">£{item.price || productData.price}</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed line-clamp-2">
                                  {productData.description || 'Premium quality frame with customized lens configuration.'}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Material</p>
                                    <p className="text-xs font-bold text-gray-700">{productData.material || 'Premium Acetate'}</p>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Frame Style</p>
                                    <p className="text-xs font-bold text-gray-700">{productData.style || 'Standard'}</p>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Color Way</p>
                                    <p className="text-xs font-bold text-gray-700">{productData.framecolor || 'Original'}</p>
                                  </div>
                                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Frame Size</p>
                                    <p className="text-xs font-bold text-gray-700 uppercase">{productData.size || 'Medium'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Lens Configuration Detail */}
                              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50 relative">
                                <div className="absolute -top-3 -right-3 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                                <h6 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">Lens Configuration</h6>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-blue-400 uppercase">Category</span>
                                    <span className="text-sm font-black text-blue-900">{lensData.main_category || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-blue-400 uppercase">Type</span>
                                    <span className="text-sm font-black text-blue-900">{lensData.sub_category || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-blue-400 uppercase">Coating</span>
                                    <span className="text-sm font-black text-blue-900">{lensData.coating || 'Standard'}</span>
                                  </div>
                                  <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-blue-600 uppercase">Configuration Cost</span>
                                    <span className="text-lg font-black text-blue-600 tracking-tighter">£{lensData.selling_price || 0}</span>
                                  </div>
                                </div>
                                {item.flag === 'instant' && (
                                  <div className="mt-4 px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter inline-block shadow-md">
                                    ⚡ Instant Buy Enabled
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Logistics & Technical View */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Shipping & Logistics</h4>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                          <p className="text-sm font-bold text-gray-700 leading-relaxed italic">{selectedOrder.shipping_address || 'Av. dos Andradas, 3000, Belo Horizonte, MG'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Logistics Partner</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-blue-900">BlueDart Global Express</p>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded uppercase">Active</span>
                          </div>
                          {selectedOrder.awb_number && (
                            <div className="mt-2 pt-2 border-t border-blue-100">
                              <p className="text-xs font-mono font-bold text-blue-600 tracking-tighter">AWB: {selectedOrder.awb_number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">System Metadata</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pay Mode</p>
                        <p className="text-xs font-bold text-gray-700">{selectedOrder.pay_mode || 'Online Payment'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Partial Paid</p>
                        <p className="text-xs font-bold text-gray-700">{selectedOrder.is_partial ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                        <p className="text-xs font-bold text-gray-700">{formatDate(selectedOrder.created)}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
                        <p className="text-xs font-bold text-gray-700">{formatDate(selectedOrder.updated)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Raw Metadata Debug View */}
                <div className="border-t border-dashed border-gray-200 pt-10 pb-4">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-6 bg-gray-900 rounded-[2rem] text-white hover:bg-black transition-all shadow-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </div>
                        <div>
                          <p className="text-lg font-black tracking-tighter">TECHNICAL DATA HUB</p>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Advanced Raw JSON Access</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-open:rotate-180 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </summary>
                    <div className="mt-4 p-8 bg-gray-950 rounded-[2.5rem] overflow-x-auto shadow-inner border border-white/5">
                      <pre className="text-[12px] text-green-400/80 font-mono leading-relaxed custom-scrollbar">
                        {JSON.stringify(selectedOrder, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

