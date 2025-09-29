import { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';

export default function DocumentList({ claimId, refreshTrigger, onError }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const categoryLabels = {
    accident_photos: 'Accident Photos',
    documents: 'Official Documents',
    receipts: 'Receipts & Estimates',
    other: 'Other'
  };

  useEffect(() => {
    loadDocuments();
    loadCategories();
  }, [claimId, refreshTrigger]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getClaimDocuments(claimId);
      // Backend returns { documents: [...] }, extract the array
      setDocuments(Array.isArray(data) ? data : (data.documents || []));
    } catch (error) {
      onError && onError('Failed to load documents');
      console.error('Error loading documents:', error);
      setDocuments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Calculate category counts from existing documents
      const categoryCounts = {};
      documents.forEach(doc => {
        const category = doc.category || 'other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      setCategories(categoryCounts);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories({});
    }
  };

  const handleDownload = async (document) => {
    try {
      await documentsAPI.downloadDocument(document.id);
    } catch (error) {
      onError && onError(`Failed to download ${document.originalName}`);
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (document) => {
    if (!confirm(`Are you sure you want to delete "${document.originalName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(document.id);
      await documentsAPI.deleteDocument(document.id);
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
      
      // Reload categories to update counts
      loadCategories();
    } catch (error) {
      onError && onError(`Failed to delete ${document.originalName}`);
      console.error('Error deleting document:', error);
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimeType === 'application/pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  const filteredDocuments = filterCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === filterCategory);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Documents ({documents.length})
        </h3>
        
        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories ({documents.length})</option>
            {Object.entries(categories).map(([category, count]) => (
              <option key={category} value={category}>
                {categoryLabels[category] || category} ({count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 64 64">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H8a4 4 0 00-4 4v32a4 4 0 004 4h12m0-40v40m0-40l8-4m-8 4l8 4m-8 32l8 4m-8-4l8-4m8-32a4 4 0 014 4v32a4 4 0 01-4 4" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">
            {filterCategory === 'all' 
              ? 'No documents uploaded yet' 
              : `No documents in "${categoryLabels[filterCategory] || filterCategory}" category`
            }
          </p>
          <p className="text-sm text-gray-400">
            Upload documents to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(document.fileType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {document.originalName}
                      </h4>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="capitalize">
                          {categoryLabels[document.category] || document.category}
                        </span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>Uploaded {formatDate(document.uploadDate)}</span>
                      </div>
                      {document.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {document.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(document)}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Download document"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(document)}
                        disabled={deleting === document.id}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Delete document"
                      >
                        {deleting === document.id ? (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}