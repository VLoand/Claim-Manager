import { useAuth } from '../contexts/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access your insurance claims dashboard and manage your claims.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800 mb-2">What you can do once signed in:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Submit new insurance claims</li>
                  <li>• Track claim status and progress</li>
                  <li>• Upload supporting documents</li>
                  <li>• Review claim history</li>
                  <li>• Receive real-time notifications</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Click the "Sign In" button in the top navigation to get started.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;