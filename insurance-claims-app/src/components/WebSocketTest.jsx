// WebSocket Test Component - For Development Testing
import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import socketService from '../services/socket';

const WebSocketTest = () => {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showClaimUpdate,
    connectionStatus 
  } = useNotifications();

  const testNotifications = () => {
    showSuccess('✅ WebSocket connection successful!');
    showInfo('ℹ️ This is an info notification');
    showWarning('⚠️ This is a warning notification');
    showError('❌ This is an error notification');
    
    // Test claim update notification
    setTimeout(() => {
      showClaimUpdate({
        id: 'TEST-123',
        claimNumber: 'CLM-20251229-1234',
        status: 'approved'
      });
    }, 1000);
  };

  const testConnection = () => {
    const status = socketService.getConnectionStatus();
    showInfo(`Connection Status: ${status.connected ? 'Connected' : 'Disconnected'} (ID: ${status.socketId || 'None'})`);
  };

  const simulateClaimUpdate = () => {
    // Simulate a real claim status update event (like from backend)
    if (socketService.socket) {
      // Manually trigger the event handler to simulate server emission
      socketService.emit('claim-status-updated', {
        claimId: 'DEMO-123',
        claimNumber: 'CLM-20251229-DEMO',
        status: 'approved',
        message: 'Demo claim status updated!'
      });
      showInfo('🧪 Simulated WebSocket event triggered!');
    } else {
      showError('❌ WebSocket not connected!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 m-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">WebSocket Testing Panel</h3>
      
      {/* Connection Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {connectionStatus.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Socket ID: {socketService.getConnectionStatus().socketId || 'None'}
        </p>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2">
        <button
          onClick={testNotifications}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🧪 Test All Notifications
        </button>
        
        <button
          onClick={testConnection}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          🌐 Check Connection Status
        </button>
        
        <button
          onClick={simulateClaimUpdate}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          📋 Simulate Claim Update
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Instructions:</strong> Use these buttons to test WebSocket functionality. 
          Check the browser console for detailed WebSocket event logs.
        </p>
      </div>
    </div>
  );
};

export default WebSocketTest;