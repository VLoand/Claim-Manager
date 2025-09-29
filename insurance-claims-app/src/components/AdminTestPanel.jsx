// Simple Admin Panel for Testing WebSocket Claim Updates
import React, { useState, useEffect } from 'react';
import { claimsAPI } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

const AdminTestPanel = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Fetch claims on component mount
  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await claimsAPI.getClaims();
      setClaims(response.claims || response || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      showError('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId, newStatus) => {
    try {
      await claimsAPI.updateClaimStatus(claimId, newStatus);
      showSuccess(`✅ Claim status updated to ${newStatus}! Check for real-time notification.`);
      
      // Update local state
      setClaims(prev => prev.map(claim => 
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      ));
    } catch (error) {
      console.error('Error updating claim status:', error);
      showError('Failed to update claim status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800', 
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions = ['pending', 'processing', 'approved', 'rejected', 'completed'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 m-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 m-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔧 Admin Test Panel - Real-Time Updates</h3>
        <button
          onClick={fetchClaims}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No claims found. Submit a claim first to test real-time updates!</p>
          <a href="/submit-claim" className="text-blue-600 hover:underline mt-2 inline-block">
            → Go to Submit Claim
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.slice(0, 5).map((claim) => (
            <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Claim #{claim.claim_number || claim.claimNumber || claim.id}
                  </h4>
                  <p className="text-sm text-gray-600">{claim.full_name || claim.fullName}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                  {claim.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 mr-3">Update Status:</span>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateClaimStatus(claim.id, status)}
                    disabled={claim.status === status}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      claim.status === status
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">🧪 How to Test WebSocket:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. <strong>Open two browser tabs</strong> with this page</li>
          <li>2. <strong>Click any status button</strong> above to update a claim</li>
          <li>3. <strong>Watch both tabs</strong> - you should see real-time notifications appear</li>
          <li>4. <strong>Check browser console</strong> for WebSocket event logs</li>
          <li>5. <strong>Try disconnecting internet</strong> to see connection status change</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminTestPanel;