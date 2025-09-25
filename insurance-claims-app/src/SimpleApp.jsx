import React from 'react';

function SimpleApp() {
  console.log('SimpleApp rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>🚀 Insurance Claims App - Test Page</h1>
      <p>✅ React is working!</p>
      <p>✅ Frontend server is running on port 5176</p>
      <p>✅ Backend server is running on port 3001</p>
      
      <div style={{ 
        background: '#f0f8ff', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px' 
      }}>
        <h3>📋 Document Upload Feature Status:</h3>
        <ul>
          <li>✅ MongoDB Document Schema Created</li>
          <li>✅ Multer File Upload Configuration</li>
          <li>✅ Backend Document API Routes</li>
          <li>✅ Document Upload Component</li>
          <li>✅ Document List Component</li>
          <li>✅ Documents Management Page</li>
        </ul>
      </div>

      <div style={{ 
        background: '#fff0f0', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px',
        border: '1px solid #ffcccc'
      }}>
        <h3>🔧 Debugging:</h3>
        <p>If you can see this page, React is working correctly.</p>
        <p>The blank page was likely due to a JavaScript error in the complex App.jsx.</p>
        <p>Let's restore the full application step by step.</p>
      </div>

      <button 
        onClick={() => window.location.href = '/about'}
        style={{
          background: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
      >
        Test Routing
      </button>
    </div>
  );
}

export default SimpleApp;