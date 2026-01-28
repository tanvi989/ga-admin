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
  metadata?: {
    customer_id?: string;
    address?: string;
    pres_0?: string;
    pres_1?: string;
    pres_2?: string;
    pres_3?: string;
    [key: string]: any;
  };
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

  // Function to get prescription for a specific cart item by index
  const getPrescriptionForItem = (order: Order, itemIndex: number) => {
    try {
      // Get the prescription by index (pres_0, pres_1, etc.)
      const prescriptionKey = `pres_${itemIndex}`;
      if (order.metadata?.[prescriptionKey]) {
        return JSON.parse(order.metadata[prescriptionKey]);
      }
      return null;
    } catch (e) {
      return null;
    }
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4 lg:p-8" onClick={() => setSelectedOrder(null)}>
            <div className="relative mx-auto bg-[#f8fafc] w-full max-w-[1400px] shadow-2xl rounded-xl overflow-hidden flex flex-col min-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              
              {/* HEADER */}
              <header className="px-8 py-6 bg-white border-b-2 border-[#e2e8f0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                  <h1 className="text-2xl font-bold text-[#0f172a]">
                    Order Details: <span className="font-mono text-blue-600 tracking-tighter">{selectedOrder.order_id || selectedOrder._id}</span>
                  </h1>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 rounded bg-[#dcfce7] text-[#166534] text-[10px] font-bold uppercase tracking-wider">{selectedOrder.order_status || 'Confirmed'}</span>
                    <span className="px-2 py-1 rounded bg-[#fef3c7] text-[#92400e] text-[10px] font-bold uppercase tracking-wider">Payment: {selectedOrder.payment_status || 'Pending'}</span>
                  </div>
                </div>
                <div className="text-left md:text-right space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Customer Email</p>
                  <p className="font-mono font-bold text-[#0f172a] text-sm">{selectedOrder.customer_email || 'N/A'}</p>
                  <p className="text-xs text-slate-500">Created: {formatDate(selectedOrder.created)} (UTC)</p>
                    </div>
                <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 md:static w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </header>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* LEFT COLUMN: PRODUCTS (3fr equivalent) */}
                  <div className="lg:col-span-3 space-y-6">
                    {selectedOrder.cart?.map((item: any, idx: number) => {
                      const productData = item.product?.products || {};
                      const lensData = item.lens || {};
                      const prescription = getPrescriptionForItem(selectedOrder, idx);
                      
                      return (
                        <div key={idx} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                          <div className="bg-[#f1f5f9] px-6 py-3 border-b border-[#e2e8f0] flex justify-between items-center">
                            <span className="text-sm font-semibold text-[#0f172a]">Item {idx + 1} of {selectedOrder.cart?.length}: <strong className="ml-1">{item.name || productData.name} ({productData.brand || 'Multifolks'})</strong></span>
                            <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">SKU: {productData.skuid || item.product_id}</span>
                          </div>
                          <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                              {/* Images */}
                              <div className="md:col-span-4 lg:col-span-3 text-center space-y-4">
                                <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                                  <img src={item.image || productData.image} alt="Main" className="w-full h-40 object-contain drop-shadow-lg mx-auto" />
                                </div>
                                <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
                                  {productData.images?.slice(0, 4).map((img: string, i: number) => (
                                    <img key={i} src={img} className="w-10 h-10 object-contain border border-[#e2e8f0] rounded-md bg-white p-1" alt={`thumb-${i}`} />
                                  ))}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-4">Added: {item.added_at || 'N/A'}</div>
                              </div>

                              {/* Specs */}
                              <div className="md:col-span-8 lg:col-span-9 space-y-8 text-left">
                                <div>
                                  <h3 className="text-lg font-bold text-[#0f172a] mb-4 border-b border-slate-100 pb-2">Physical Specifications</h3>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <SpecItem label="Brand" value={productData.brand || 'Multifolks'} />
                                    <SpecItem label="Frame Color" value={`${productData.frame_color || productData.framecolor || 'N/A'}`} />
                                    <SpecItem label="Shape" value={productData.shape || 'Square'} />
                                    <SpecItem label="Size" value={productData.size || 'M (Medium)'} />
                                    <SpecItem label="Style" value={productData.style || 'Standard'} />
                                    <SpecItem label="Material" value={productData.material || 'Acetate'} />
                                    <SpecItem label="Gender" value={productData.gender || 'Unisex'} />
                                    <SpecItem label="Naming System" value={productData.naming_system} mono />
                                  </div>
                                </div>

                                {productData.comfort && (
                                  <div>
                                    <h3 className="text-lg font-bold text-[#0f172a] mb-3 border-b border-slate-100 pb-2">Comfort & Features</h3>
                                    <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600 list-disc list-inside">
                                      {Array.isArray(productData.comfort) ? productData.comfort.map((c: string, i: number) => <li key={i}>{c}</li>) : <li>{productData.comfort}</li>}
                                    </ul>
                                  </div>
                                )}

                                {productData.variants && productData.variants.length > 0 && (
                                  <div>
                                    <h3 className="text-lg font-bold text-[#0f172a] mb-3 border-b border-slate-100 pb-2">Available Variants (Global)</h3>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full text-xs text-left">
                                        <thead className="bg-[#f8fafc]">
                                          <tr>
                                            <th className="px-4 py-2 border-b border-[#e2e8f0]">SKU</th>
                                            <th className="px-4 py-2 border-b border-[#e2e8f0]">Color Name</th>
                                            <th className="px-4 py-2 border-b border-[#e2e8f0]">Hex</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {productData.variants.map((v: any, i: number) => (
                                            <tr key={i} className={v.skuid === productData.skuid ? "bg-[#f0fdf4]" : ""}>
                                              <td className="px-4 py-2 border-b border-slate-50 font-mono">{v.skuid}</td>
                                              <td className="px-4 py-2 border-b border-slate-50">{v.color_names?.[0]} {v.skuid === productData.skuid && "(Selected)"}</td>
                                              <td className="px-4 py-2 border-b border-slate-50">{v.colors?.[0] || 'N/A'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* PRESCRIPTION DETAILS - NEW SECTION */}
                                {prescription && (
                                  <div className="bg-[#f3e8ff] border border-[#d8b4fe] rounded-xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                      <svg className="w-24 h-24 text-[#9333ea]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                    </div>
                                    <h4 className="text-[#7e22ce] font-bold mb-4 flex items-center gap-2">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      Prescription Details
                                      <span className="px-2 py-1 rounded-full bg-[#9333ea] text-white text-xs">#{idx + 1}</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <p className="text-xs text-slate-500 mb-2">Type:</p>
                                        <p className="font-medium capitalize">{prescription.type}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 mb-2">Product Name:</p>
                                        <p className="font-medium">{prescription.name}</p>
                                      </div>
                                    </div>
                                    
                                    {prescription.type === 'upload' && prescription.url ? (
                                      <div className="mt-4 space-y-4">
                                        <div className="p-3 bg-white rounded-lg border border-[#e9d5ff]">
                                          <p className="text-xs text-slate-500 mb-2">Uploaded Prescription:</p>
                                          <a 
                                            href={prescription.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block"
                                          >
                                            <img 
                                              src={prescription.url} 
                                              alt={`Prescription for ${prescription.name}`} 
                                              className="w-full h-32 object-contain border border-slate-200 rounded bg-white"
                                            />
                                          </a>
                                          <p className="text-xs text-slate-600 mt-2">
                                            Click image to view full size
                                          </p>
                                          <p className="text-xs text-slate-500 mt-1">
                                            Cart ID: {item.cart_id}
                                          </p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="mt-4 p-3 bg-white rounded-lg border border-[#e9d5ff]">
                                        <p className="text-xs text-slate-500 mb-2">Prescription Data:</p>
                                        <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                                          {JSON.stringify(prescription, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Lens Breakdown */}
                                <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-6 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                  </div>
                                  <h4 className="text-[#1e40af] font-bold mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    Lens Configuration
                                  </h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                                    <SpecItem label="Lens Category" value={lensData.main_category || 'N/A'} />
                                    <SpecItem label="Package Index" value={lensData.lens_package || '1.56'} />
                                    <SpecItem label="Type" value={lensData.sub_category || 'N/A'} />
                                    <SpecItem label="Coating" value={lensData.coating || 'Standard'} />
                                  </div>
                                  <div className="space-y-2 border-t border-blue-200 pt-4">
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 italic">Lens Base Price:</span> <span className="font-bold text-[#1e3a8a]">£{lensData.price || lensData.selling_price || 0}.00</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-500 italic">Coating Price:</span> <span className="font-bold text-[#1e3a8a]">£{lensData.coating_price || 0}.00</span></div>
                                    <div className="flex justify-between pt-2 border-t border-blue-200 font-bold text-[#1e3a8a]">
                                      <span>Item Total (Qty {item.quantity || 1}):</span> 
                                      <span className="text-lg tracking-tighter">£{(item.price || productData.price || 0) + (lensData.selling_price || 0)}.00</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* RIGHT COLUMN: FINANCIAL & META (1fr equivalent) */}
                  <div className="lg:col-span-1 space-y-6 text-left">
                    
                    {/* Financials */}
                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] font-bold text-[#0f172a] text-sm">Financial Breakdown</div>
                      <div className="p-6">
                        <table className="w-full text-xs">
                          <tbody className="space-y-3">
                            <FinancialRow label="Subtotal" value={`£${selectedOrder.subtotal || 0}.00`} />
                            <FinancialRow label="Discount Amount" value={`-£${selectedOrder.discount_amount || 0}.00`} success />
                            <FinancialRow label="Shipping Cost" value={`£${selectedOrder.shipping_cost || 0}.00`} />
                            <FinancialRow label="Lens Discount" value={`£${selectedOrder.lens_discount || 0}.00`} />
                            <FinancialRow label="Retailer Lens Disc." value={`£${selectedOrder.retailer_lens_discount || 0}.00`} />
                            <tr className="bg-[#f1f5f9] font-bold"><td className="px-3 py-2 rounded-l-lg">Total Payable</td><td className="px-3 py-2 rounded-r-lg text-right font-mono">£{selectedOrder.order_total || selectedOrder.total || 0}.00</td></tr>
                          </tbody>
                        </table>
                        <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
                          <SpecItem label="Payment Mode" value={selectedOrder.pay_mode || 'Stripe / Online'} />
                          <SpecItem label="Trans. ID" value={selectedOrder.transaction_id} mono muted />
                          <SpecItem label="Intent ID" value={selectedOrder.payment_intent_id} mono muted />
                        </div>
                      </div>
                    </div>

                    {/* Address & Meta */}
                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] font-bold text-[#0f172a] text-sm">Shipping & Billing</div>
                      <div className="p-6 space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shipping Destination</p>
                          <div className="p-4 bg-[#f8fafc] border border-slate-100 rounded-lg text-xs font-mono leading-relaxed text-[#0f172a]">
                            {selectedOrder.shipping_address || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billing Address</p>
                          <div className="p-4 bg-[#f8fafc] border border-slate-100 rounded-lg text-xs font-mono leading-relaxed text-[#0f172a]">
                            {selectedOrder.billing_address || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DETAILED METADATA */}
                    <div className="bg-white border border-l-4 border-l-[#3b82f6] border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] flex justify-between items-center">
                        <span className="font-bold text-[#0f172a] text-sm">Customer Metadata</span>
                        <span className="px-2 py-0.5 rounded bg-[#dbeafe] text-[#1e40af] text-[9px] font-bold uppercase">Parsed</span>
                      </div>
                      <div className="p-6 space-y-6">
                        {(() => {
                          try {
                            const meta = selectedOrder.metadata || {};
                            const addr = JSON.parse(meta.address || '{}');
                            return (
                              <>
                                <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                                  <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-100">
                                    {addr.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'JS'}
                                  </div>
                                  <div className="text-left">
                                    <div className="text-sm font-bold text-[#0f172a] leading-none mb-1">{addr.fullName || 'João Souza Silva'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{addr.addressType || 'Home Address'}</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2 text-xs">
                                  <p className="flex justify-between"><strong>Mobile:</strong> <span className="font-mono">{addr.mobile || 'N/A'}</span></p>
                                  <p className="flex justify-between border-t border-slate-50 pt-2"><strong className="text-slate-400">Email:</strong> <span className="text-slate-400 italic">Not provided in meta</span></p>
                                  <p className="border-t border-slate-50 pt-2"><strong>Street:</strong> <br/><span className="text-slate-600 inline-block mt-1">{addr.addressLine}</span></p>
                                  <p className="border-t border-slate-50 pt-2"><strong>City/State/Zip:</strong> <br/><span className="text-slate-600 inline-block mt-1">{addr.city}, {addr.state}, {addr.zip}</span></p>
                                  <p className="flex justify-between border-t border-slate-50 pt-2"><strong>Country:</strong> <span>{addr.country}</span></p>
                                  <p className="flex justify-between border-t border-slate-50 pt-2"><strong>Is Default:</strong> <span className="uppercase font-bold text-[10px]">{String(addr.isDefaultAddress)}</span></p>
                                </div>

                                <div className="mt-6 pt-6 border-t-2 border-slate-100">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-left">Prescription Mapping</h4>
                                  <div className="space-y-2">
                                    {(() => {
                                      const prescriptions = [];
                                      let index = 0;
                                      while (selectedOrder.metadata?.[`pres_${index}`]) {
                                        const presData = JSON.parse(selectedOrder.metadata[`pres_${index}`]);
                                        const cartItem = selectedOrder.cart?.[index];
                                        prescriptions.push(
                                          <div key={index} className="p-2 bg-slate-50 rounded text-xs">
                                            <p className="font-medium">pres_{index} → {presData.name}</p>
                                            <p className="text-slate-500">Type: {presData.type}</p>
                                            {cartItem && <p className="text-slate-500">Cart ID: {cartItem.cart_id}</p>}
                                          </div>
                                        );
                                        index++;
                                      }
                                      return prescriptions.length > 0 ? prescriptions : <p className="text-xs text-slate-400 italic">No prescriptions found</p>;
                                    })()}
                                  </div>
                                </div>
                              </>
                            );
                          } catch (e) { return <p className="text-xs text-red-400 italic">Parsing Error: {String(e)}</p>; }
                        })()}
                      </div>
                    </div>

                    {/* Technical IDs */}
                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] font-bold text-[#0f172a] text-sm">System Data</div>
                      <div className="p-6 space-y-4">
                        <SpecItem label="Order ID" value={selectedOrder.order_id} mono />
                        <SpecItem label="Database _id" value={selectedOrder._id} mono small />
                        <SpecItem label="User Internal ID" value={selectedOrder.user_id} mono small />
                        <SpecItem label="Is Partial Order" value={String(selectedOrder.is_partial)} />
                        <SpecItem label="Customer Ref (Meta)" value={selectedOrder.metadata?.customer_id} mono muted />
                        <SpecItem label="Updated Record" value={formatDate(selectedOrder.updated)} small />
                      </div>
                    </div>

                    {/* Raw Metadata View */}
                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-[#f1f5f9] px-4 py-3 border-b border-[#e2e8f0] font-bold text-[#0f172a] text-sm">Technical Data Hub</div>
                      <div className="p-4">
                        <div className="bg-[#1e293b] text-[#e2e8f0] p-4 rounded-lg text-[10px] font-mono whitespace-pre-wrap border border-[#334155] shadow-inner max-h-[300px] overflow-y-auto custom-scrollbar text-left">
                          {JSON.stringify(selectedOrder, null, 2)}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SpecItem({ label, value, mono, muted, small }: any) {
  return (
    <div className="spec-item">
      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-bold">{label}</label>
      <span className={`${mono ? 'font-mono' : 'font-medium'} ${muted ? 'text-slate-400' : 'text-[#0f172a]'} ${small ? 'text-xs' : 'text-sm'} block truncate`}>
        {value || (muted ? 'null' : 'N/A')}
      </span>
    </div>
  );
}

function FinancialRow({ label, value, success, plain }: any) {
  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="py-3 text-slate-500 text-xs">{label}</td>
      <td className={`py-3 text-right font-mono text-xs ${success ? 'text-green-600 font-bold' : plain ? 'text-slate-700' : 'text-[#0f172a] font-semibold'}`}>
        {value}
      </td>
    </tr>
  );
}

function DataPoint({ label, value, mono }: { label: string, value: any, mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold text-gray-700 truncate ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</p>
    </div>
  );
}

function Badge({ label, value, color }: { label: string, value: string, color?: string }) {
  if (!value) return null;
  return (
    <div className={`px-3 py-1 rounded-xl border border-gray-100 flex flex-col ${color || 'bg-white'}`}>
      <span className="text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5">{label}</span>
      <span className="text-xs font-bold truncate">{value}</span>
    </div>
  );
}

function DetailBlock({ label, value, primary, highlight, color, mono, small }: any) {
  
  return (
    <div className={`p-4 rounded-2xl border border-gray-100 ${highlight ? color : 'bg-gray-50'}`}>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-current opacity-70' : 'text-gray-400'}`}>{label}</p>
      <p className={`font-bold truncate ${primary ? 'text-blue-600 text-sm' : highlight ? 'text-current text-xs' : 'text-gray-700 text-xs'} ${mono ? 'font-mono' : ''} ${small ? 'text-[10px]' : ''}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}