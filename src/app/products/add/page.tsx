'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'manual' | 'csv'>('manual');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    // MongoDB ObjectId will be generated server-side
    _id: '',
    
    // Core fields
    skuid: '',
    brand: '',
    color_names: [] as string[],
    comfort: [] as string[],
    description: '',
    gender: '',
    image: '',
    is_active: true,
    material: '',
    name: '',
    price: '',
    list_price: '',
    primary_category: 'eyeglasses',
    secondary_category: 'premium-eyeglasses',
    size: 'Medium',
    style: 'Full Frame',
    
    // Additional fields
    frame_color: '',
    lens_material: '',
    lens_color: '',
    weight: '',
    shape: '',
    features: '',
    discount_percentage: '0',
    publish: '1',
    type: '',
    brand_alias: '',
    material_alias: '',
    style_alias: '',
    type_alias: '',
    barcode: '',
    short_description: '',
    rank: '',
    dimensions: '',
    dimensions_raw: '',
    frame_shape_url: '',
    frame_style_url: '',
    brand_url: '',
    segment: '',
    vto: '',
    origin: '',
    mfd_by: '',
    pkg_by: '',
    mktd_by: '',
    rm_source: '',
    mfg_date: '',
    exp_date: '',
    no_of_images: '0',
    is_onsale: false,
    frame_cost: '0',
    deal_of_day: false,
    naming_system: '',
    
    // Array fields
    images: [] as string[],
    all_skuids: [] as string[],
    variants: [] as any[],
    
    // Timestamps (will be set by server)
    created_at: '',
    updated_at: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox for boolean values
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle array fields
    if (name === 'color_names' || name === 'comfort' || name === 'images' || name === 'all_skuids') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.split(',').map(item => item.trim()).filter(Boolean)
      }));
      return;
    }
    
    // Handle regular fields
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Convert string numbers to actual numbers
        price: parseFloat(formData.price) || 0,
        list_price: parseFloat(formData.list_price) || formData.price || 0,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        weight: parseFloat(formData.weight) || 0,
        rank: parseInt(formData.rank) || 0,
        no_of_images: parseInt(formData.no_of_images) || 0,
        frame_cost: parseFloat(formData.frame_cost) || 0,
        
        // Convert publish to boolean
        publish: formData.publish === '1',
        
        // Add timestamps (server will also set these)
        created_at: new Date(),
        updated_at: new Date(),
        
        // Handle dates
        mfg_date: formData.mfg_date ? new Date(formData.mfg_date) : undefined,
        exp_date: formData.exp_date ? new Date(formData.exp_date) : undefined,
        
        // Remove empty values
        ...(formData.mfg_date ? {} : { mfg_date: undefined }),
        ...(formData.exp_date ? {} : { exp_date: undefined }),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Product added successfully! ID: ${data.productId}`);
        // Reset form
        setFormData({
          _id: '',
          skuid: '',
          brand: '',
          color_names: [],
          comfort: [],
          description: '',
          gender: '',
          image: '',
          is_active: true,
          material: '',
          name: '',
          price: '',
          list_price: '',
          primary_category: 'eyeglasses',
          secondary_category: 'premium-eyeglasses',
          size: 'Medium',
          style: 'Full Frame',
          frame_color: '',
          lens_material: '',
          lens_color: '',
          weight: '',
          shape: '',
          features: '',
          discount_percentage: '0',
          publish: '1',
          type: '',
          brand_alias: '',
          material_alias: '',
          style_alias: '',
          type_alias: '',
          barcode: '',
          short_description: '',
          rank: '',
          dimensions: '',
          dimensions_raw: '',
          frame_shape_url: '',
          frame_style_url: '',
          brand_url: '',
          segment: '',
          vto: '',
          origin: '',
          mfd_by: '',
          pkg_by: '',
          mktd_by: '',
          rm_source: '',
          mfg_date: '',
          exp_date: '',
          no_of_images: '0',
          is_onsale: false,
          frame_cost: '0',
          deal_of_day: false,
          naming_system: '',
          images: [],
          all_skuids: [],
          variants: [],
          created_at: '',
          updated_at: ''
        });
        setTimeout(() => router.push('/products'), 2000);
      } else {
        throw new Error(data.error || 'Failed to add product');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('csv', csvFile);

      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Successfully uploaded ${data.count} products!`);
        setCsvFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.error || 'Failed to upload CSV');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    // Updated headers with internal_id
    const headers = [
      'internal_id', 'skuid', 'brand', 'color_names', 'comfort', 'description', 'gender', 'image',
      'is_active', 'material', 'name', 'price', 'list_price', 'primary_category',
      'secondary_category', 'size', 'style', 'frame_color', 'lens_material',
      'lens_color', 'weight', 'shape', 'features', 'discount_percentage',
      'publish', 'type', 'brand_alias', 'material_alias', 'style_alias',
      'type_alias', 'barcode', 'short_description', 'rank', 'dimensions',
      'dimensions_raw', 'frame_shape_url', 'frame_style_url', 'brand_url',
      'segment', 'vto', 'origin', 'mfd_by', 'pkg_by', 'mktd_by', 'rm_source',
      'mfg_date', 'exp_date', 'no_of_images', 'is_onsale', 'frame_cost',
      'deal_of_day', 'naming_system', 'images', 'all_skuids', 'created_at', 'updated_at'
    ];
    
    // Sample data with internal_id (will be generated by MongoDB)
    const sampleData = [
      '', // internal_id - will be generated
      'E19B8501', 'BERG', 'White', 'Hinges,Lightweight,Universal fit',
      'A square frame in a stylish white finish...', 'Men',
      'https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/E19B8501/E19B8501.png',
      'true', 'acetate', 'BERG', '139', '139', 'eyeglasses',
      'premium-eyeglasses', 'Medium', 'Full Frame', 'White', 'Polycarbonate',
      'Transparent', '12', 'Square', 'Square shape ideal for multifocals...',
      '0', '1', '0', 'Berg', 'acetate', 'fullframe',
      '', 'EYEMYEYE-BER010001C1', 'E19B8501 White Full rim Square Eyeglasses for Men',
      '19461', '51-18-142-41', '51-18-142-41', 'square-eyeglasses',
      'full-frame-eyeglasses', '/brands/berg-eyeglasses', 'P', 'FALSE',
      'India', '', '', '', '', '', '', '11', 'TRUE', '3', 'FALSE',
      'M.1001.SQ', 'https://storage.googleapis.com/myapp-image-bucket-001/Spexmojo_images/Spexmojo_images/E19B8501/E19B8501.png',
      'E19B8502,E19B8503,E19B8504,E19B8501', '', ''
    ];

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_sample_sheet.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-600 mt-1">Enter product details manually or upload via CSV</p>
        </div>

        {/* Toggle Buttons */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 mb-6 inline-flex">
          <button 
            onClick={() => setUploadType('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadType === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manual Entry
          </button>
          <button 
            onClick={() => setUploadType('csv')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadType === 'csv' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            CSV Upload
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}

        {uploadType === 'manual' ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <form onSubmit={handleManualSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU ID *</label>
                    <input
                      type="text"
                      name="skuid"
                      value={formData.skuid}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Pricing */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Category & Pricing
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select...</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Category</label>
                    <input
                      type="text"
                      name="primary_category"
                      value={formData.primary_category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Category</label>
                    <input
                      type="text"
                      name="secondary_category"
                      value={formData.secondary_category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (£) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">List Price (£)</label>
                    <input
                      type="number"
                      name="list_price"
                      value={formData.list_price}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Product Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frame Color</label>
                    <input
                      type="text"
                      name="frame_color"
                      value={formData.frame_color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                    <input
                      type="text"
                      name="shape"
                      value={formData.shape}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                    <input
                      type="text"
                      name="style"
                      value={formData.style}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g., 51-18-142-41"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lens Material</label>
                    <input
                      type="text"
                      name="lens_material"
                      value={formData.lens_material}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lens Color</label>
                    <input
                      type="text"
                      name="lens_color"
                      value={formData.lens_color}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Array Fields */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Multiple Values (comma-separated)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Names</label>
                    <input
                      type="text"
                      name="color_names"
                      value={formData.color_names.join(', ')}
                      onChange={handleInputChange}
                      placeholder="e.g., White, Black, Blue"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple values with commas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comfort Features</label>
                    <input
                      type="text"
                      name="comfort"
                      value={formData.comfort.join(', ')}
                      onChange={handleInputChange}
                      placeholder="e.g., Hinges, Lightweight"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple values with commas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
                    <input
                      type="text"
                      name="images"
                      value={formData.images.join(', ')}
                      onChange={handleInputChange}
                      placeholder="e.g., https://..., https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple URLs with commas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">All SKUs</label>
                    <input
                      type="text"
                      name="all_skuids"
                      value={formData.all_skuids.join(', ')}
                      onChange={handleInputChange}
                      placeholder="e.g., E19B8501, E19B8502"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple SKUs with commas</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Additional Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Other Fields */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Status & Other
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_onsale"
                      checked={formData.is_onsale}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">On Sale</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="deal_of_day"
                      checked={formData.deal_of_day}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Deal of Day</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Naming System</label>
                    <input
                      type="text"
                      name="naming_system"
                      value={formData.naming_system}
                      onChange={handleInputChange}
                      placeholder="e.g., M.1001.SQ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Upload CSV File</h2>
              <p className="text-sm text-gray-600 mb-6">Download the sample template and fill in your product data</p>
              
              <button
                onClick={downloadSampleCSV}
                className="mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Download Sample CSV
              </button>

              <form onSubmit={handleCsvUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <p className="text-sm text-gray-600">
                      {csvFile ? csvFile.name : 'Click to select CSV file or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                  </label>
                </div>
                
                {csvFile && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload CSV'}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}