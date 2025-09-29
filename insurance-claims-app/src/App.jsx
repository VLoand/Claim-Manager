import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './contexts/AppContext';
import NotificationToast from './components/NotificationToast';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import ClaimSubmission from './pages/ClaimSubmission';
import ClaimsDashboard from './pages/ClaimsDashboard';
import ClaimReview from './pages/ClaimReview';
import ClaimDocuments from './pages/ClaimDocuments';
import About from './pages/About';
import RefreshTokenTest from './components/RefreshTokenTest';

// Login Page Component
const LoginPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Test Credentials:</p>
            <p className="text-xs text-gray-500">Regular User: user@test.com / password123</p>
            <p className="text-xs text-gray-500">Admin User: admin@test.com / admin123</p>
          </div>
        </div>
        <LoginForm
          isLogin={showLogin}
          onToggle={() => setShowLogin(!showLogin)}
          onClose={() => window.location.href = '/'}
        />
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '1px solid #fcc' }}>
          <h1>Something went wrong!</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold text-gray-900">Claims Manager</h1>
                  </div>
                  <div className="flex items-center space-x-8">
                    <a href="/claims" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                      Dashboard
                    </a>
                    <a href="/submit-claim" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                      Submit Claim
                    </a>
                    <a href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                      About
                    </a>
                    <a href="/login" className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm font-medium rounded-md">
                      Login
                    </a>
                    <a href="/test-tokens" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                      🧪 Test Tokens
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<ProtectedRoute><ClaimsDashboard /></ProtectedRoute>} />
                <Route path="/claims" element={<ProtectedRoute><ClaimsDashboard /></ProtectedRoute>} />
                <Route path="/submit-claim" element={<ProtectedRoute><ClaimSubmission /></ProtectedRoute>} />
                <Route path="/claim/:id/documents" element={<ProtectedRoute><ClaimDocuments /></ProtectedRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/test-tokens" element={<RefreshTokenTest />} />
              </Routes>
            </ErrorBoundary>
            {/* Real-time notifications */}
            <NotificationToast />
          </div>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;