import { useEffect, useState } from 'react';
import { useClaims } from '../contexts/AppContext.jsx';
import ClaimCard from '../components/ClaimCard.jsx';

const ClaimsDashboard = () => {
  const { 
    filteredClaims, 
    claimStats, 
    loading, 
    error, 
    fetchClaims, 
    setFilter, 
    filter,
    clearError 
  } = useClaims();

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch claims on mount
  useEffect(() => {
    const loadClaims = async () => {
      try {
        await fetchClaims();
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    };
    loadClaims();
  }, []);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      try {
        clearError();
      } catch (error) {
        console.error('Error clearing error state:', error);
      }
    };
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Sort claims
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'date':
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
        break;
      case 'amount':
        aVal = parseFloat(a.claim_amount);
        bVal = parseFloat(b.claim_amount);
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'claimNumber':
        aVal = a.claim_number;
        bVal = b.claim_number;
        break;
      default:
        aVal = a[sortBy];
        bVal = b[sortBy];
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Claims Dashboard</h1>
          <p className="mt-2 text-gray-600">Track and manage your insurance claims</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Claims</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
              <div className="ml-auto">
                <button 
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Claims</dt>
                    <dd className="text-lg font-medium text-gray-900">{claimStats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{claimStats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-medium text-gray-900">{claimStats.approved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                    <dd className="text-lg font-medium text-gray-900">{claimStats.rejected}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    filter === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All ({claimStats.total})
                </button>
                <button
                  onClick={() => handleFilterChange('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    filter === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pending ({claimStats.pending})
                </button>
                <button
                  onClick={() => handleFilterChange('approved')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    filter === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Approved ({claimStats.approved})
                </button>
                <button
                  onClick={() => handleFilterChange('rejected')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    filter === 'rejected' 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rejected ({claimStats.rejected})
                </button>
              </div>

              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                  <option value="claimNumber">Claim Number</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        {sortedClaims.length === 0 ? (
          <div className="bg-white shadow rounded-lg">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'Get started by submitting your first claim.' : `No ${filter} claims found.`}
              </p>
              <div className="mt-6">
                <a 
                  href="/submit-claim"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit New Claim
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsDashboard;