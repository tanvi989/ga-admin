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

  const [formData, setFormData] = useState({
    id: '',
    skuid: '',
    gender: '',
    primarycategory: 'eyeglasses',
    brand: '',
    framecolor: '',
    lensmaterial: '',
    lenscolor: '',
    material: 'acetate',
    shape: '',
    weight: '',
    size: 'Medium',
    price: '',
    style: 'Full Frame',
    features: '',
    description: '',
    name: '',
    discount_percentage: '',
    publish: '1',
    type: '',
    secondarycategory: 'premium-eyeglasses',
    brandalias: '',
    materialalias: '',
    stylealias: '',
    typealias: '',
    barcode: '',
    shortdescription: '',
    gender2: '',
    update_time: '',
    rank: '',
    dimensions: '',
    frameshapeurl: '',
    framestyleurl: '',
    brandurl: '',
    segment: '',
    vto: '',
    origin: '',
    mfd_by: '',
    pkg_by: '',
    mktd_by: '',
    rm_source: '',
    mfg_date: '',
    exp_date: '',
    no_of_images: '',
    is_onsale: '',
    created_time: '',
    frame_cost: '',
    deal_of_day: '',
    comfort: '',
    naming_system: '',
    is_active: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          publish: parseInt(formData.publish) || 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Product added successfully!');
        // Reset form or redirect
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

  const downloadSampleCSV = () => {
    const headers = [
      'id', 'skuid', 'gender', 'primarycategory', 'brand', 'framecolor', 'lensmaterial', 
      'lenscolor', 'material', 'shape', 'weight', 'size', 'price', 'style', 'features', 
      'description', 'name', 'discount percentage', 'publish', 'type', 'secondarycategory', 
      'brandalias', 'materialalias', 'stylealias', 'typealias', 'barcode', 'shortdescription', 
      'gender2', 'update time', 'rank', 'dimensions', 'frameshapeurl', 'framestyleurl', 
      'brandurl', 'segment', 'vto', 'origin', 'mfd_by', 'pkg_by', 'mktd_by', 'rm_source', 
      'mfg_date', 'exp_date', 'no_of_images', 'is_onsale', 'Created time', 'frame_cost', 
      'Deal of Day', 'comfort', 'naming_system'
    ];
    
    const sampleData = [
      '54800', 'E19B8501', 'Men', 'eyeglasses', 'BERG', 'White', 'Polycarbonate', 
      'Transparent', 'acetate', 'Square', '12', 'Medium', '139', 'Full Frame', 
      'Square shape ideal for multifocals...', 'A square frame in a stylish white finish...', 
      'BERG', '139', '1', '0', 'premium-eyeglasses', 'Berg', 'acetate', 'fullframe', 
      '', 'EYEMYEYE-BER010001C1', 'E19B8501 White Full rim Square Eyeglasses for Men', 
      'Women', '2023-03-10', '19461', '51-18-142-41', 'square-eyeglasses', 
      'full-frame-eyeglasses', '/brands/berg-eyeglasses', 'P', 'FALSE', 'India', 
      '', '', '', '', '', '', '11', 'TRUE', '2024-02-28', '3', 'FALSE', 
      'Hinges,Lightweight,Universal fit', 'M.1001.SQ'
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
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ADD NEW PRODUCTS</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Expand your catalog manually or via bulk import.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setUploadType('manual')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${uploadType === 'manual' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              MANUAL ENTRY
            </button>
            <button 
              onClick={() => setUploadType('csv')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${uploadType === 'csv' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              BULK IMPORT (CSV)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm font-bold flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}

        {uploadType === 'manual' ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <form onSubmit={handleManualSubmit} className="p-10 space-y-8">
              {/* Basic Info */}
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Core Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <InputField label="Internal ID" name="id" value={formData.id} onChange={handleInputChange} placeholder="e.g. 54800" />
                  <InputField label="SKU ID" name="skuid" value={formData.skuid} onChange={handleInputChange} placeholder="e.g. E19B8501" required />
                  <InputField label="Product Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. BERG" required />
                  <InputField label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g. BERG" />
                </div>
              </section>

              {/* Categorization */}
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                  Categorization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={['Men', 'Women', 'Unisex', 'Kids']} />
                  <InputField label="Primary Category" name="primarycategory" value={formData.primarycategory} onChange={handleInputChange} />
                  <InputField label="Secondary Category" name="secondarycategory" value={formData.secondarycategory} onChange={handleInputChange} />
                  <InputField label="Type" name="type" value={formData.type} onChange={handleInputChange} placeholder="e.g. 0" />
                </div>
              </section>

              {/* Technical Specs */}
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <InputField label="Frame Color" name="framecolor" value={formData.framecolor} onChange={handleInputChange} />
                  <InputField label="Material" name="material" value={formData.material} onChange={handleInputChange} />
                  <InputField label="Shape" name="shape" value={formData.shape} onChange={handleInputChange} />
                  <InputField label="Size" name="size" value={formData.size} onChange={handleInputChange} />
                  <InputField label="Style" name="style" value={formData.style} onChange={handleInputChange} />
                  <InputField label="Dimensions" name="dimensions" value={formData.dimensions} onChange={handleInputChange} placeholder="51-18-142-41" />
                  <InputField label="Naming System" name="naming_system" value={formData.naming_system} onChange={handleInputChange} placeholder="M.1001.SQ" />
                  <InputField label="Retail Price (£)" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
                  <InputField label="Weight (g)" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="e.g. 12" />
                  <InputField label="Lens Material" name="lensmaterial" value={formData.lensmaterial} onChange={handleInputChange} placeholder="Polycarbonate" />
                  <InputField label="Lens Color" name="lenscolor" value={formData.lenscolor} onChange={handleInputChange} placeholder="Transparent" />
                  <InputField label="Barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} />
                </div>
              </section>

              {/* Aliases & URLs */}
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  Aliases & Digital Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <InputField label="Brand Alias" name="brandalias" value={formData.brandalias} onChange={handleInputChange} />
                  <InputField label="Material Alias" name="materialalias" value={formData.materialalias} onChange={handleInputChange} />
                  <InputField label="Style Alias" name="stylealias" value={formData.stylealias} onChange={handleInputChange} />
                  <InputField label="Brand URL" name="brandurl" value={formData.brandurl} onChange={handleInputChange} />
                  <InputField label="Shape URL" name="frameshapeurl" value={formData.frameshapeurl} onChange={handleInputChange} />
                  <InputField label="Style URL" name="framestyleurl" value={formData.framestyleurl} onChange={handleInputChange} />
                </div>
              </section>

              {/* Manufacturing & Logistics */}
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-cyan-600 rounded-full"></span>
                  Manufacturing & Logistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <InputField label="Origin" name="origin" value={formData.origin} onChange={handleInputChange} placeholder="India" />
                  <InputField label="Manufactured By" name="mfd_by" value={formData.mfd_by} onChange={handleInputChange} />
                  <InputField label="Marketed By" name="mktd_by" value={formData.mktd_by} onChange={handleInputChange} />
                  <InputField label="MFG Date" name="mfg_date" value={formData.mfg_date} onChange={handleInputChange} type="date" />
                  <InputField label="Frame Cost" name="frame_cost" value={formData.frame_cost} onChange={handleInputChange} type="number" />
                  <InputField label="On Sale" name="is_onsale" value={formData.is_onsale} onChange={handleInputChange} placeholder="TRUE/FALSE" />
                  <InputField label="VTO" name="vto" value={formData.vto} onChange={handleInputChange} placeholder="FALSE" />
                </div>
              </section>

              {/* Content */}
              <section>
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  Marketing Content
                </h3>
                <div className="space-y-6">
                  <TextareaField label="Description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                  <TextareaField label="Short Description" name="shortdescription" value={formData.shortdescription} onChange={handleInputChange} rows={2} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextareaField label="Features" name="features" value={formData.features} onChange={handleInputChange} rows={2} placeholder="Comma separated features..." />
                    <TextareaField label="Comfort Profile" name="comfort" value={formData.comfort} onChange={handleInputChange} rows={2} placeholder="Hinges, Lightweight..." />
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => router.back()}
                  className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors"
                >
                  DISCARD
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-12 py-3 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-100 transition-all transform active:scale-95"
                >
                  {loading ? 'SAVING...' : 'PUBLISH PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Upload via CSV</h2>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Upload your product spreadsheet to add hundreds of items at once. Ensure your columns match our required format.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 text-sm font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                DOWNLOAD SAMPLE SHEET
              </button>

              {/* Sample Sheet Preview */}
              <div className="w-full overflow-x-auto bg-slate-50 rounded-3xl border border-slate-100 p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-left ml-2">Sample Sheet Preview</p>
                <table className="min-w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-200/50">
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">id</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">skuid</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">gender</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">primarycategory</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">brand</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">framecolor</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">price</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap">naming_system</th>
                      <th className="px-3 py-2 border border-slate-200 whitespace-nowrap text-slate-400 italic">...and more</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="px-3 py-2 border border-slate-100">54800</td>
                      <td className="px-3 py-2 border border-slate-100 font-mono">E19B8501</td>
                      <td className="px-3 py-2 border border-slate-100">Men</td>
                      <td className="px-3 py-2 border border-slate-100">eyeglasses</td>
                      <td className="px-3 py-2 border border-slate-100">BERG</td>
                      <td className="px-3 py-2 border border-slate-100">White</td>
                      <td className="px-3 py-2 border border-slate-100">139</td>
                      <td className="px-3 py-2 border border-slate-100 font-mono">M.1001.SQ</td>
                      <td className="px-3 py-2 border border-slate-100 text-slate-300">...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="w-full max-w-md p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 transition-colors cursor-pointer group bg-slate-50/50">
                <input type="file" className="hidden" id="csv-upload" accept=".csv" />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <p className="text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">Click to select or drag & drop CSV file</p>
                  <p className="text-[10px] text-slate-300 font-black uppercase mt-2 tracking-widest">Maximum file size: 10MB</p>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function InputField({ label, name, type = 'text', value, onChange, placeholder, required = false }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label} {required && '*'}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cbd5e1%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
      >
        <option value="">Select...</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({ label, name, value, onChange, rows, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm text-slate-700 placeholder:text-slate-300"
      />
    </div>
  );
}
