import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AppContext';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import { claimsAPI } from '../services/api';

export default function ClaimDocuments() {
  const { id: claimId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadClaim();
  }, [claimId]);

  const loadClaim = async () => {
    try {
      setLoading(true);
      const data = await claimsAPI.getClaim(claimId);
      console.log('Claim data loaded:', data);
      // Extract the actual claim data from the nested structure
      const claimData = data.claim || data;
      setClaim(claimData);
      
      // Check if user has access to this claim
      if (user && user.role !== 'admin' && claimData.user_id !== user.id) {
        setError('You do not have permission to access this claim.');
        return;
      }
    } catch (error) {
      setError('Failed to load claim details');
      console.error('Error loading claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (result) => {
    // Backend returns { documents: [...] }, not { uploadedFiles: [...] }
    const uploadedCount = result.documents ? result.documents.length : 0;
    setSuccess(`Successfully uploaded ${uploadedCount} document(s)`);
    setError('');
    setRefreshTrigger(prev => prev + 1);
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setSuccess('');
    
    // Clear error message after 10 seconds
    setTimeout(() => setError(''), 10000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading claim...</span>
        </div>
      </div>
    );
  }

  if (!claim || error.includes('permission')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 64 64">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              {error || 'You do not have permission to access this claim.'}
            </p>
            <button
              onClick={() => navigate('/claims')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Claims
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/claims')}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Claims</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Claim Documents
                </h1>
                <p className="text-sm text-gray-600">
                  Claim #{claim.claim_number || 'N/A'} - Vehicle Accident
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                {claim.status ? claim.status.charAt(0).toUpperCase() + claim.status.slice(1).replace('_', ' ') : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccess('')}
                  className="text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Claim Number</p>
              <p className="text-sm text-gray-900">{claim.claim_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Vehicle Type</p>
              <p className="text-sm text-gray-900">{claim.vehicle_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Incident Date</p>
              <p className="text-sm text-gray-900">
                {claim.accident_date ? new Date(claim.accident_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="text-sm text-gray-900">{claim.accident_description || 'No description provided'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <DocumentUpload
              claimId={claimId}
              onUploadComplete={handleUploadComplete}
              onError={handleError}
            />
          </div>

          {/* Documents List */}
          <div>
            <DocumentList
              claimId={claimId}
              refreshTrigger={refreshTrigger}
              onError={handleError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}