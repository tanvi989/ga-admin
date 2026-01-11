'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Product {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  list_price?: number;
  image?: string;
  images?: string[];
  category?: string;
  stock?: number;
  sku?: string;
  skuid?: string;
  brand?: string;
  gender?: string;
  material?: string;
  style?: string;
  order_count?: number;
  total_quantity?: number;
  [key: string]: any;
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
  }, [page, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
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
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Product
            </button>
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

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name, SKU or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && products.length > 0 && <span className="ml-4 text-sm text-gray-500">Updating...</span>}
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
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {product.image || (product.images && product.images.length > 0 && product.images[0]) ? (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={product.image || (product.images && product.images[0]) || ''}
                        alt={product.name || product.title || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {product.name || product.title || 'Unnamed Product'}
                    </h3>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xl font-bold text-blue-600">
                        £{product.list_price || product.price || 0}
                      </span>
                      {product.stock !== undefined && (
                        <span className={`text-sm px-2 py-1 rounded ${
                          product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `In Stock` : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                    
                    {(product.sku || product.skuid) && (
                      <p className="text-xs text-gray-500 mb-2">SKU: {product.sku || product.skuid}</p>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        )
}

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
              <ProductDetails product={selectedProduct} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ProductForm({ formData, setFormData, onSave, onCancel, saving }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          value={formData.name || formData.title || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
          <input
            type="number"
            step="0.01"
            value={formData.list_price || formData.price || ''}
            onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input
            type="number"
            value={formData.stock || ''}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            value={formData.sku || formData.skuid || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value, skuid: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            value={formData.brand || ''}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="url"
          value={formData.image || ''}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}

function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      {product.image || (product.images && product.images.length > 0 && product.images[0]) ? (
        <img
          src={product.image || (product.images && product.images[0]) || ''}
          alt={product.name || product.title || 'Product'}
          className="w-full h-64 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Name</h4>
          <p className="text-gray-900">{product.name || product.title || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Price</h4>
          <p className="text-gray-900 text-lg font-bold">£{product.list_price || product.price || 0}</p>
        </div>
        {product.description && (
          <div className="col-span-2">
            <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
            <p className="text-gray-900">{product.description}</p>
          </div>
        )}
        {product.sku && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">SKU</h4>
            <p className="text-gray-900">{product.sku}</p>
          </div>
        )}
        {product.category && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Category</h4>
            <p className="text-gray-900">{product.category}</p>
          </div>
        )}
        {product.brand && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Brand</h4>
            <p className="text-gray-900">{product.brand}</p>
          </div>
        )}
        {product.gender && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Gender</h4>
            <p className="text-gray-900">{product.gender}</p>
          </div>
        )}
        {product.stock !== undefined && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Stock</h4>
            <p className="text-gray-900">{product.stock}</p>
          </div>
        )}
      </div>
    </div>
  );
}
