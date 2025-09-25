import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './contexts/AppContext';
import ClaimSubmission from './pages/ClaimSubmission';
import ClaimsDashboard from './pages/ClaimsDashboard';
import About from './pages/About';

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
                  </div>
                </div>
              </div>
            </nav>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<ClaimsDashboard />} />
                <Route path="/claims" element={<ClaimsDashboard />} />
                <Route path="/submit-claim" element={<ClaimSubmission />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;