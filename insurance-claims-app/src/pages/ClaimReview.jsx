import { useState, useMemo, useEffect } from 'react';
import { useClaims } from '../contexts/AppContext';
import ClaimCard from '../components/ClaimCard';

export default function ClaimReview() {
  const { 
    claims, 
    filteredClaims, 
    claimStats, 
    loading, 
    error, 
    fetchClaims, 
    updateClaimStatus, 
    setFilter, 
    filter,
    clearError 
  } = useClaims();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Load claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  // Handle status change
  const handleStatusChange = async (id, status) => {
    try {
      await updateClaimStatus(id, status);
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  // Filter and sort claims locally (in addition to context filtering)
  const displayClaims = useMemo(() => {
    let filtered = filteredClaims.filter(claim => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        claim.full_name?.toLowerCase().includes(searchLower) ||
        claim.insurance_company?.toLowerCase().includes(searchLower) ||
        claim.claim_number?.toLowerCase().includes(searchLower) ||
        claim.accident_location?.toLowerCase().includes(searchLower)
      );
    });

    // Sort claims
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.accident_date || b.created_at || 0) - new Date(a.accident_date || a.created_at || 0);
        case 'oldest':
          return new Date(a.accident_date || a.created_at || 0) - new Date(b.accident_date || b.created_at || 0);
        case 'amount-high':
          return (parseFloat(b.damage_amount) || 0) - (parseFloat(a.damage_amount) || 0);
        case 'amount-low':
          return (parseFloat(a.damage_amount) || 0) - (parseFloat(b.damage_amount) || 0);
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [filteredClaims, searchTerm, sortBy]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">Claims Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage and review all submitted insurance claims
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-xl border border-blue-100 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{claimStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl border border-orange-100 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{claimStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl border border-green-100 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{claimStats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl border border-red-100 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{claimStats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Claims</label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, company, or claim number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="in progress">In Progress</option>
              <option value="rejected">Rejected</option>
              <option value="paid out">Paid Out</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-red-800">Error loading claims</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading claims...</span>
        </div>
      )}

      {/* Results Info */}
      {!loading && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {displayClaims.length} of {claims.length} claims
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear search</span>
            </button>
          )}
        </div>
      )}

      {/* Claims List */}
      {!loading && displayClaims.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {claims.length === 0 ? 'No claims submitted yet' : 'No claims match your filters'}
          </h3>
          <p className="text-gray-600">
            {claims.length === 0 
              ? 'Claims will appear here once they are submitted.' 
              : 'Try adjusting your search terms or filters to find what you\'re looking for.'
            }
          </p>
        </div>
      ) : (
        !loading && (
          <div className="space-y-6">
            {displayClaims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
