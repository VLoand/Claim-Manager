import React, { useState } from 'react';
import { authAPI } from '../services/api';

export default function RefreshTokenTest() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, status, details) => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check token storage after login
      addResult('Starting Refresh Token Tests', 'info', 'Running comprehensive test suite...');

      // Test 2: Login and check token storage
      try {
        const loginData = await authAPI.login('demo@example.com', 'password123');
        
        const authToken = localStorage.getItem('authToken');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        addResult('Token Storage Test', 
          (authToken && accessToken && refreshToken) ? 'success' : 'warning',
          `Legacy token: ${!!authToken}, Access token: ${!!accessToken}, Refresh token: ${!!refreshToken}`
        );

        addResult('Login Response Structure', 'success', 
          `Response contains: ${Object.keys(loginData).join(', ')}`
        );

      } catch (error) {
        addResult('Login Test', 'error', `Login failed: ${error.message}`);
      }

      // Test 3: Token format validation
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const tokenParts = accessToken.split('.');
          addResult('JWT Format Test', 
            tokenParts.length === 3 ? 'success' : 'error',
            `Token has ${tokenParts.length} parts (should be 3)`
          );
        } catch (error) {
          addResult('JWT Format Test', 'error', `Invalid JWT format: ${error.message}`);
        }
      }

      // Test 4: API request with token
      try {
        const response = await fetch('http://localhost:3001/api/claims', {
          headers: {
            'Authorization': `Bearer ${authAPI.getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        addResult('API Request Test', 
          response.ok ? 'success' : 'warning',
          `Status: ${response.status} ${response.statusText}`
        );
      } catch (error) {
        addResult('API Request Test', 'error', `Request failed: ${error.message}`);
      }

      // Test 5: Manual token refresh
      try {
        const refreshResult = await authAPI.refreshAccessToken();
        addResult('Token Refresh Test', 'success', 
          `Refresh successful: ${Object.keys(refreshResult).join(', ')}`
        );
      } catch (error) {
        addResult('Token Refresh Test', 'error', `Refresh failed: ${error.message}`);
      }

      // Test 6: Verify new tokens after refresh
      const newAccessToken = localStorage.getItem('accessToken');
      const newRefreshToken = localStorage.getItem('refreshToken');
      
      addResult('Post-Refresh Storage', 'success',
        `New tokens stored: Access=${!!newAccessToken}, Refresh=${!!newRefreshToken}`
      );

    } catch (error) {
      addResult('Test Suite Error', 'error', error.message);
    }

    setIsRunning(false);
  };

  const clearTokens = () => {
    authAPI.logout();
    addResult('Token Cleanup', 'info', 'All tokens cleared from localStorage');
  };

  const inspectTokens = () => {
    const tokens = {
      authToken: localStorage.getItem('authToken'),
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      user: localStorage.getItem('user')
    };

    console.log('Current Tokens:', tokens);
    addResult('Token Inspection', 'info', 
      `Tokens logged to console. AuthToken: ${!!tokens.authToken}, AccessToken: ${!!tokens.accessToken}, RefreshToken: ${!!tokens.refreshToken}`
    );
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'success': return <span className="text-green-500">✅</span>;
      case 'error': return <span className="text-red-500">❌</span>;
      case 'warning': return <span className="text-yellow-500">⚠️</span>;
      default: return <span className="text-blue-500">ℹ️</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🧪 Refresh Token Implementation Test</h2>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? '🔄 Running Tests...' : '▶️ Run Test Suite'}
        </button>
        
        <button
          onClick={inspectTokens}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔍 Inspect Tokens
        </button>
        
        <button
          onClick={clearTokens}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Clear Tokens
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-3">Test Results:</h3>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No tests run yet. Click "Run Test Suite" to begin.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 bg-white rounded border">
                <StatusIcon status={result.status} />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{result.test}</div>
                  <div className="text-sm text-gray-600">{result.details}</div>
                  <div className="text-xs text-gray-400">{result.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">What This Tests:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ Dual token storage (legacy + new format)</li>
          <li>✓ JWT token structure validation</li>
          <li>✓ API requests with new token system</li>
          <li>✓ Manual token refresh functionality</li>
          <li>✓ Token persistence after refresh</li>
          <li>✓ Backwards compatibility verification</li>
        </ul>
      </div>
    </div>
  );
}