import { useState, useRef } from 'react';
import { documentsAPI } from '../services/api';

export default function DocumentUpload({ claimId, onUploadComplete, onError }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'accident_photos', label: 'Accident Photos' },
    { value: 'documents', label: 'Official Documents' },
    { value: 'receipts', label: 'Receipts & Estimates' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        onError && onError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        onError && onError(`File "${file.name}" has an unsupported format.`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      onError && onError('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await documentsAPI.uploadDocuments(
        claimId,
        selectedFiles,
        category,
        description
      );

      // Reset form
      setSelectedFiles([]);
      setCategory('other');
      setDescription('');

      onUploadComplete && onUploadComplete(result);
    } catch (error) {
      onError && onError(error.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
      
      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for these documents..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </div>

      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to select
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports: JPG, PNG, PDF, DOC, DOCX, TXT (max 10MB per file)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-4 h-4 text-gray-400">
                    {file.type.startsWith('image/') ? (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* Total Size */}
          <div className="mt-2 text-sm text-gray-600">
            Total size: {formatFileSize(getTotalSize())}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUploading && (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}