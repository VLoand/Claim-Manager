export default function ClaimCard({ claim, onStatusChange }) {
  const getStatusColor = (status) => {
    const colors = {
      'submitted': 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 shadow-amber-100',
      'reviewed': 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-blue-100',
      'in progress': 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200 shadow-purple-100',
      'rejected': 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 shadow-red-100',
      'paid out': 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 shadow-emerald-100'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'reviewed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'in progress':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'paid out':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-purple-100 p-6 mb-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:border-purple-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">{claim.fullName}</h3>
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${getStatusColor(claim.status)}`}>
              {getStatusIcon(claim.status)}
              <span className="capitalize">{claim.status}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gray-600">{claim.insuranceCompany}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600">{new Date(claim.accidentDate).toLocaleDateString()}</span>
            </div>

            {claim.damageAmount && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-gray-600 font-medium">${parseInt(claim.damageAmount).toLocaleString()}</span>
              </div>
            )}

            {claim.claimNumber && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0v14a2 2 0 002 2h6a2 2 0 002-2V4" />
                </svg>
                <span className="text-gray-600 font-mono text-xs">{claim.claimNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Selector */}
        <div className="flex flex-col items-end space-y-2">
          <label className="text-sm font-medium text-gray-700">Update Status:</label>
          <select
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[150px]"
            value={claim.status}
            onChange={e => onStatusChange(claim.id, e.target.value)}
          >
            <option value="submitted">📝 Submitted</option>
            <option value="reviewed">👀 Reviewed</option>
            <option value="in progress">⚡ In Progress</option>
            <option value="rejected">❌ Rejected</option>
            <option value="paid out">✅ Paid Out</option>
          </select>
        </div>
      </div>

      {/* Accident Description Preview */}
      {claim.accidentDescription && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            <span className="font-medium text-gray-700">Description: </span>
            {claim.accidentDescription.length > 100 
              ? claim.accidentDescription.substring(0, 100) + '...' 
              : claim.accidentDescription
            }
          </p>
        </div>
      )}
    </div>
  );
}
