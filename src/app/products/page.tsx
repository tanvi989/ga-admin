'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

interface Product {
  _id: string;
  skuid?: string;
  name?: string;
  title?: string;
  brand?: string;
  color_names?: string[];
  comfort?: string[];
  description?: string;
  gender?: string;
  image?: string;
  is_active?: boolean;
  material?: string;
  price?: number;
  list_price?: number;
  primary_category?: string;
  secondary_category?: string;
  size?: string;
  style?: string;
  updated_at?: string;
  images?: string[];
  all_skuids?: string[];
  frame_color?: string;
  variants?: any[];
  naming_system?: string;
  shape?: string;
  features?: string;
  dimensions?: string;
  dimensions_raw?: string;
  dimensions_updated_at?: string;
  stock?: number;
  sku?: string;
  order_count?: number;
  total_quantity?: number;
  [key: string]: any;
}

function ProductImage({ patterns, alt, showPlaceholder = true }: { patterns: string[], alt: string, showPlaceholder?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || currentIndex >= patterns.length) {
    return showPlaceholder ? <div className="text-4xl">📦</div> : null;
  }

  return (
    <img
      src={patterns[currentIndex]}
      alt={alt}
      className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
      onError={() => {
        if (currentIndex + 1 < patterns.length) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [saving, setSaving] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch, genderFilter, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}&gender=${genderFilter}&sort=${sortOrder}`);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`API returned non-JSON response. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
      }
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
          setTotalProducts(data.pagination.total);
        }
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        // Just refresh the current page
        fetchProducts();
        if (selectedProduct?._id === productId) {
          setSelectedProduct(null);
        }
      } else {
        alert('Failed to delete product: ' + data.error);
      }
    } catch (err: any) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setShowEditForm(true);
    setSelectedProduct(null);
  };

  const handleAdd = () => {
    setFormData({});
    setShowAddForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = showEditForm && formData._id 
        ? `/api/products/${formData._id}`
        : '/api/products';
      
      const method = showEditForm ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProducts();
        setShowAddForm(false);
        setShowEditForm(false);
        setFormData({});
      } else {
        alert('Failed to save product: ' + data.error);
      }
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const fetchProductBySku = async (skuid: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${skuid}`);
      const data = await response.json();
      if (data.success) {
        setSelectedProduct(data.data);
      } else {
        alert('Failed to fetch variant: ' + data.error);
      }
    } catch (err: any) {
      alert('Error fetching variant: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading products...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Products ({totalProducts})</h2>
          <div className="flex gap-2">
            <Link
              href="/products/add"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Product
            </Link>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name, SKU, category or naming system..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white font-medium text-sm"
            >
              <option value="">All Genders</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white font-medium text-sm"
            >
              <option value="">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          {loading && products.length > 0 && <span className="flex items-center text-sm text-gray-500">Updating...</span>}
        </div>

        {products.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">{searchTerm ? 'No products match your search' : 'No products found'}</p>
            {!searchTerm && (
              <button
                onClick={handleAdd}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const skuid = product.skuid || product.sku || '';
                // Fix: Ensure all values in the array are strings, not undefined
                const imagePatterns: string[] = [
                  product.image || '',
                  `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}.png`,
                  `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}.png`,
                  `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_1.png`,
                  `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_1.png`,
                  `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_2.png`,
                  `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_2.png`,
                ].filter(Boolean) as string[]; // Type assertion to ensure string[]
                
                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100 group"
                  >
                    <div className="h-56 bg-gray-50 overflow-hidden relative flex items-center justify-center p-4">
                      <ProductImage patterns={imagePatterns} alt={product.name || product.title || 'Product'} />
                      <div className="absolute top-3 right-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-sm ${
                          product.is_active !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {product.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-mono font-black tracking-widest">
                          {skuid}
                        </div>
                        {product.naming_system && (
                          <div className="px-2 py-1 bg-blue-50 rounded text-[10px] font-mono font-bold text-blue-600 truncate max-w-[120px]" title={product.naming_system}>
                            {product.naming_system}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">
                          {product.brand || 'BERG'}
                        </p>
                        <h3 className="font-bold text-base text-gray-900 line-clamp-1 leading-tight">
                          {product.name || product.title || 'Unnamed Product'}
                        </h3>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Retail Price</p>
                          <span className="text-xl font-black text-gray-900 tracking-tighter">
                            £{product.list_price || product.price || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                          DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
                <button onClick={() => { setShowAddForm(false); setFormData({}); }} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              <ProductForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={() => { setShowAddForm(false); setFormData({}); }} saving={saving} />
            </div>
          </div>
        )}

        {/* Edit Product Form */}
        {showEditForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Edit Product</h3>
                <button onClick={() => { setShowEditForm(false); setFormData({}); }} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>
              <ProductForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={() => { setShowEditForm(false); setFormData({}); }} saving={saving} />
            </div>
          </div>
        )}

        {/* View Product Details */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setSelectedProduct(null)}>
            <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Product Details</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(selectedProduct)} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Edit</button>
                  <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                </div>
              </div>
              <ProductDetails product={selectedProduct} onVariantClick={fetchProductBySku} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductForm({ formData, setFormData, onSave, onCancel, saving }: any) {
  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Name *</label>
            <input
              type="text"
              value={formData.name || formData.title || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand</label>
            <input
              type="text"
              value={formData.brand || ''}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Retail Price (£)</label>
              <input
                type="number"
                step="0.01"
                value={formData.list_price || formData.price || ''}
                onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Level</label>
              <input
                type="number"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SKU ID</label>
            <input
              type="text"
              value={formData.skuid || formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, skuid: e.target.value, sku: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Naming System</label>
            <input
              type="text"
              value={formData.naming_system || ''}
              onChange={(e) => setFormData({ ...formData, naming_system: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm appearance-none"
              >
                <option value="">Select...</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
              <select
                value={formData.is_active !== false ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm appearance-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm min-h-[100px]"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Material</label>
          <input
            type="text"
            value={formData.material || ''}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shape</label>
          <input
            type="text"
            value={formData.shape || ''}
            onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dimensions</label>
          <input
            type="text"
            value={formData.dimensions || ''}
            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-sm"
            placeholder="e.g. 51-18-142-41"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Image URL</label>
        <input
          type="url"
          value={formData.image || ''}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs"
          placeholder="https://storage.googleapis.com/..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button onClick={onCancel} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
        <button 
          onClick={onSave} 
          disabled={saving} 
          className="px-8 py-2 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100 transition-all transform active:scale-95"
        >
          {saving ? 'Processing...' : 'Save Product Data'}
        </button>
      </div>
    </div>
  );
}

function ProductDetails({ product, onVariantClick }: { product: Product, onVariantClick: (skuid: string) => void }) {
  const skuid = product.skuid || product.sku || '';
  // Fix: Ensure all values in the array are strings, not undefined
  const imagePatterns: string[] = [
    product.image || '',
    `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}.png`,
    `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}.png`,
    `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_1.png`,
    `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_1.png`,
    `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_2.png`,
    `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_2.png`,
    ...(product.images || [])
  ].filter(Boolean) as string[]; // Type assertion to ensure string[]
  
  // Generate dynamic thumbnails if images array is empty but we have a skuid
  const displayImages: string[] = product.images && product.images.length > 0 
    ? product.images 
    : [
        `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_1.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_1.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_2.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_2.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_3.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_3.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_4.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_4.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${skuid}/${skuid}_5.png`,
        `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${skuid}/${skuid}_5.png`,
      ];

  // Helper to construct variant image URL
  const getVariantImage = (v: any) => {
    if (v.image) return v.image;
    const vSkuid = v.skuid;
    return `https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/${vSkuid}/${vSkuid}.png`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 text-left">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center h-80 overflow-hidden relative">
            <ProductImage patterns={imagePatterns} alt={product.name || product.title || 'Product'} />
            {product.is_active === false && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg">Inactive</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {displayImages.slice(0, 8).map((img, i) => (
              <div key={i} className="aspect-square bg-white border border-gray-100 rounded-xl p-1 hover:border-blue-400 transition-colors cursor-pointer overflow-hidden group">
                <ProductImage 
                  patterns={[img, img.replace('Spexmojo_images/Spexmojo_images', 'Faceaface'), img.replace('Faceaface', 'Spexmojo_images/Spexmojo_images')]} 
                  alt={`thumb-${i}`} 
                  showPlaceholder={false}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">{product.name || product.title || 'N/A'}</h4>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded uppercase tracking-widest">{product.brand || 'BERG'}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase tracking-widest">{product.gender || 'Unisex'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-sm inline-block ${
                  product.is_active !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {product.is_active !== false ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {/* 1. Color Variant Selector (Top Priority) */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-6">
                  <span className="text-xs font-black text-[#8b5e3c] uppercase tracking-[0.2em] shrink-0">Color</span>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v: any, i: number) => {
                      const isSelected = v.skuid === product.skuid;
                      const colorMap: Record<string, string> = {
                        'Black': '#000000',
                        'Brown': '#8b4513',
                        'White': '#ffffff',
                        'Gray': '#808080',
                        'Grey': '#808080',
                        'Blue': '#0000ff',
                        'Red': '#ff0000',
                        'Gold': '#ffd700',
                        'Silver': '#c0c0c0',
                        'Tortoise': '#734822',
                        'Havana': '#5d3a1a',
                      };
                      const colorName = v.color_names?.[0] || '';
                      const colorHex = v.colors?.[0] || colorMap[colorName] || '#f1f5f9';
                      const variantImage = getVariantImage(v);
                      
                      return (
                        <button
                          key={i}
                          onClick={() => !isSelected && onVariantClick(v.skuid)}
                          className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                            isSelected 
                              ? 'ring-2 ring-offset-2 ring-black scale-110 shadow-lg' 
                              : 'hover:scale-110 hover:shadow-md'
                          }`}
                          title={colorName || v.skuid}
                        >
                          <div className="w-full h-full rounded-full border border-gray-200 shadow-inner overflow-hidden">
                            <img 
                              src={variantImage} 
                              alt={colorName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const facePath = `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${v.skuid}/${v.skuid}.png`;
                                if (target.src !== facePath) {
                                  target.src = facePath;
                                } else {
                                  target.style.display = 'none';
                                  if (target.parentElement) {
                                    target.parentElement.style.backgroundColor = colorHex;
                                  }
                                }
                              }}
                            />
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-[#8b5e3c] mt-3 uppercase tracking-tight opacity-70">
                  Selected: {product.color_names?.[0] || product.frame_color || 'Original'}
                </p>
              </div>
            )}

            {/* 2. SKU ID & 3. Naming System */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">SKU Identifier</p>
                <p className="text-base font-mono font-black text-white tracking-tighter">{product.skuid || product.sku}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Naming System</p>
                <p className="text-sm font-mono font-bold text-blue-700 truncate">{product.naming_system || 'N/A'}</p>
              </div>
            </div>

            {/* 4. Price & Categories */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Retail Price</p>
                <p className="text-3xl font-black text-blue-600 tracking-tighter leading-none">£{product.list_price || product.price || 0}</p>
              </div>
              <div className="space-y-2">
                <DataPoint label="Primary Category" value={product.primary_category} />
                <DataPoint label="Secondary Category" value={product.secondary_category} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Product Description</p>
            <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">
              {product.description || 'No description available for this premium frame.'}
            </p>
          </div>
        </div>
      </div>

      {/* Technical Specifications Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            Frame Attributes
          </h5>
          <div className="space-y-4">
            <SpecRow label="Material" value={product.material} />
            <SpecRow label="Style" value={product.style} />
            <SpecRow label="Shape" value={product.shape} />
            <SpecRow label="Size" value={product.size} />
            <SpecRow label="Frame Color" value={product.frame_color || product.framecolor} />
            <SpecRow label="Dimensions" value={product.dimensions || product.dimensions_raw} mono />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-green-600 rounded-full"></span>
            Comfort & Features
          </h5>
          <div className="space-y-4">
            {product.comfort && product.comfort.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comfort Profile</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(product.comfort) ? product.comfort : [product.comfort]).map((c: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-100 uppercase">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Technical Features</p>
              <p className="text-xs text-gray-600 leading-relaxed">{product.features || 'Standard optical features apply.'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-600 rounded-full"></span>
            Inventory & Logistics
          </h5>
          <div className="space-y-4">
            <SpecRow label="Stock Level" value={product.stock} />
            <SpecRow label="Last Updated" value={product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'} />
            <SpecRow label="Dim. Updated" value={product.dimensions_updated_at ? new Date(product.dimensions_updated_at).toLocaleDateString() : 'N/A'} />
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Linked SKU Group</p>
              <div className="flex flex-wrap gap-1">
                {product.all_skuids?.map((id: string, i: number) => (
                  <span key={i} className={`px-2 py-0.5 rounded font-mono text-[9px] border uppercase ${id === product.skuid ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Table */}
      {product.variants && product.variants.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm text-left">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest">Available Variants (Global)</h5>
            <span className="text-[10px] font-bold text-slate-400">{product.variants.length} Options</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 font-black text-gray-400 uppercase tracking-widest">SKU</th>
                  <th className="px-6 py-3 font-black text-gray-400 uppercase tracking-widest">Color Way</th>
                  <th className="px-6 py-3 font-black text-gray-400 uppercase tracking-widest text-right">Visual Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {product.variants.map((v: any, i: number) => (
                  <tr 
                    key={i} 
                    className={`cursor-pointer transition-colors ${v.skuid === product.skuid ? "bg-blue-50/30" : "hover:bg-gray-50/50"}`}
                    onClick={() => v.skuid !== product.skuid && onVariantClick(v.skuid)}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-600 uppercase">{v.skuid}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {v.color_names?.[0]} {v.skuid === product.skuid && <span className="ml-2 text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-sm">CURRENT</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-12 h-8 bg-white border border-gray-100 rounded p-0.5 shadow-sm">
                          <img 
                            src={getVariantImage(v)} 
                            alt={v.skuid} 
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const facePath = `https://storage.googleapis.com/myapp-image-bucket-001/Faceaface/${v.skuid}/${v.skuid}.png`;
                              if (target.src !== facePath) {
                                target.src = facePath;
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                        {v.colors?.[0] && (
                          <div className="w-5 h-5 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: v.colors[0] }} title={v.colors[0]}></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw Metadata Debug View */}
      <details className="group border border-gray-100 rounded-3xl overflow-hidden shadow-sm text-left">
        <summary className="flex items-center justify-between cursor-pointer list-none p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
            <div>
              <p className="text-sm font-black tracking-tighter uppercase">Technical Data Hub</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Raw JSON Protocol Access</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </summary>
        <div className="p-6 bg-slate-950">
          <pre className="text-[10px] text-green-400/80 font-mono leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar p-2">
            {JSON.stringify(product, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

function DataPoint({ label, value, mono }: { label: string, value: any, mono?: boolean }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xs font-bold text-gray-700 truncate ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</p>
    </div>
  );
}

function SpecRow({ label, value, mono }: { label: string, value: any, mono?: boolean }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-xs font-black text-gray-700 ${mono ? 'font-mono' : ''}`}>{value || 'N/A'}</span>
    </div>
  );
}