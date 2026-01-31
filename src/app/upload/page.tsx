'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface AssetFile {
  name: string;
  isDirectory: boolean;
  size: number;
  updatedAt: string;
  url: string | null;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState('general');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const [files, setFiles] = useState<AssetFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [viewMode, setViewMode] = useState<'upload' | 'browse'>('upload');
  const [storageSource, setStorageSource] = useState<'gcs' | 'local' | null>(null);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch(`/api/upload?folder=${folder}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
        setStorageSource(data.source);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'browse') {
      fetchFiles();
    }
  }, [folder, viewMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file first.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: `File uploaded successfully to ${folder}/`,
        });
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        if (viewMode === 'browse') fetchFiles();
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Upload failed. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred during upload. Please check your connection.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Global Assets & Buckets
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Manage your images, documents, and cloud storage buckets.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setViewMode('upload')}
              className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                viewMode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Upload Asset
            </button>
            <button
              onClick={() => setViewMode('browse')}
              className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                viewMode === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Browse Buckets
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col">
          <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                {viewMode === 'upload' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{viewMode === 'upload' ? 'Asset Manager' : 'Bucket Browser'}</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                  {viewMode === 'upload' ? 'Multi-Folder Access Enabled' : `Viewing: ${folder}`}
                  {storageSource && (
                    <span className={`px-2 py-0.5 rounded-full text-[8px] ${
                      storageSource === 'gcs' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {storageSource === 'gcs' ? 'Cloud' : 'Local Fallback'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <select 
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="general">General Assets</option>
                <option value="Spexmojo_images">Spexmojo Images</option>
                <option value="Faceaface">Face-a-Face Images</option>
                <option value="prescriptions">User Prescriptions</option>
                <option value="banners">Marketing Banners</option>
                <option value="brands">Brand Logos</option>
              </select>
            </div>
          </div>

          <div className="p-10 flex-1">
            {viewMode === 'upload' ? (
              <form onSubmit={handleUpload} className="space-y-8 max-w-2xl mx-auto">
                {status.type && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                    status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {status.type === 'success' ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    )}
                    <span className="font-bold text-sm">{status.message}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination Folder</label>
                  <p className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-bold">
                    {folder}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Asset</label>
                  <div className="relative group">
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 cursor-pointer group-hover:bg-slate-100 group-hover:border-blue-400 transition-all"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-12 h-12 mb-4 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mb-2 text-base text-slate-600 font-bold">
                          {file ? <span className="text-blue-600">{file.name}</span> : 'Click to select or drag and drop'}
                        </p>
                        <p className="text-xs text-slate-400 uppercase font-black tracking-widest">PNG, JPG, SVG, PDF (MAX. 10MB)</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isUploading || !file}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98]"
                  >
                    {isUploading ? 'UPLOADING...' : 'INITIALIZE ASSET UPLOAD'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Folder Contents: {folder}/</h4>
                  <button 
                    onClick={fetchFiles}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <svg className={`w-5 h-5 ${isLoadingFiles ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                {isLoadingFiles ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning Bucket...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="font-bold">This bucket is empty</p>
                    <button 
                      onClick={() => setViewMode('upload')}
                      className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                    >
                      Upload your first file
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {files.map((file, idx) => (
                      <div 
                        key={idx}
                        className="group bg-slate-50 border border-slate-100 rounded-3xl p-5 hover:border-blue-200 hover:bg-white transition-all hover:shadow-xl hover:shadow-slate-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            file.isDirectory ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {file.isDirectory ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-900 truncate text-sm mb-1">{file.name}</p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>{formatSize(file.size)}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {!file.isDirectory && file.url && (
                          <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-colors text-center"
                            >
                              View
                            </a>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.origin + file.url);
                                // You could add a temporary toast here
                              }}
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-amber-50 rounded-3xl p-6 border border-amber-100">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 17c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-amber-900 uppercase text-xs tracking-widest mb-1">Security & Access</h4>
              <p className="text-amber-800 text-sm font-medium">Bucket browsing is restricted to authorized folders. All uploads are public via CDN once initialized.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
